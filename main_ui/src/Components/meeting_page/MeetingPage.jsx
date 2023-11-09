import React, { useEffect, useState, useRef } from 'react';
import './styles.css';

export const MeetingPage = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [camStatus, setCamStatus] = useState('Hide Cam');
  const [micStatus, setMicStatus] = useState('Mute Mic');
  const [screenStatus, setScreenStatus] = useState('Share Screen');
  const [screenShareStream, setScreenShareStream] = useState(null);

  // FIX THE FUCKING TOGGLE SHIT PAG NAKA ON YUNG CAM PWEDE MAMUTE YUNG MIC
  // PAG NAKA ON YUNG MIC BAWAL MA OFF CAM
  // PAG NAKAOFF YUNG CAM BAWAL MA OFF YUNG MIC

  // Function to toggle the camera stream
  function toggleCamera() {
    // setIsCameraEnabled(prevState => !prevState);
    if (stream) {
      const videoTrack = stream.getTracks().find(track => track.kind === 'video');
      if (micStatus == "Mute Mic") { // mic on
        if (!videoTrack.enabled) {
          videoTrack.enabled = true;
          setCamStatus('Hide Cam');
        } else {
          console.log("mic on -- u cant off cam")
        }
      }
      else {
        videoTrack.enabled = false;
        setCamStatus('Show Cam');
        toggleMic();
      }
    }
  }

    // Function to toggle the microphone stream
  function toggleMic() {
    // setIsMicEnabled(prevState => !prevState);
    if (stream) {
      const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
      if (camStatus == "Hide Cam") { // cam on
        if (audioTrack.enabled) {
          audioTrack.enabled = false;
          setMicStatus('Unmute Mic');
        } else {
          audioTrack.enabled = true;
          setMicStatus('Mute Mic');
        }
      } else { // cam off
        console.log("cam off -- u cant off mic")
      }
    }
  }

  async function endStream() {
    setScreenShareStream(null);
    setScreenStatus("Share Screen");
    let screen_con = await document.getElementById("screenShare");
    screen_con.remove();
  }

  async function toggleScreenShare() {
    
    // paresize nalang tenks
    
    try {
      if (screenShareStream == null) {
        const userScreen = await navigator.mediaDevices.getDisplayMedia({
          cursor:true,
          video: true,
          audio: true
        })

        await setScreenShareStream(userScreen);
        await setScreenStatus("Stop Sharing");

        let vid_con = document.getElementById("video-container");
        let screen_vid_con = document.createElement("video");
        screen_vid_con.setAttribute('id', 'screenShare');
        screen_vid_con.setAttribute('playsInline', 'playsInline');
        screen_vid_con.setAttribute('autoPlay', "autoPlay");
        screen_vid_con.className = "video-element";
        screen_vid_con.srcObject = userScreen;
        vid_con.appendChild(screen_vid_con);
      } else {
        var tracks = await screenShareStream.getVideoTracks();
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].stop();
        }
        endStream();  
      }

    } catch (error) {
      console.log("Error: ", error);
    }
  }

  if (screenShareStream != null) {
    screenShareStream.getVideoTracks()[0].addEventListener('ended', async () => {
      endStream();  
    });
  }

  useEffect(() => {
    // Function to handle resizing video elements
    function resizeVideoElements() {
      if (videoRef.current && audioRef.current) {
          const videoContainerWidth = videoRef.current.offsetWidth;
          const videoContainerHeight = videoRef.current.offsetHeight;
          const aspectRatio = 4 / 3; // You can adjust this based on your desired aspect ratio

          // Calculate the width and height for the video elements
          let videoWidth = videoContainerWidth;
          let videoHeight = videoContainerWidth / aspectRatio;

          // Check if the calculated video height exceeds the container height
          if (videoHeight > videoContainerHeight) {
              videoHeight = videoContainerHeight;
              videoWidth = videoContainerHeight * aspectRatio;
          }

          // Set the width and height for video elements
          videoRef.current.style.width = `${videoWidth}px`;
          videoRef.current.style.height = `${videoHeight}px`;
          audioRef.current.style.width = `${videoWidth}px`;
          audioRef.current.style.height = `${videoHeight}px`;
      }
  }

    // Call the resize function when the window is resized
    window.addEventListener('resize', resizeVideoElements);

    // Call the resize function on initial render
    resizeVideoElements();

    // Function to start the video and audio streams
    async function startStream() {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: true,
          echoCancellation: true
        });
        setStream(userMediaStream);
        // Attach video stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = userMediaStream;
        }

        // Attach audio stream to the audio element
        if (audioRef.current) {
          audioRef.current.srcObject = userMediaStream;
        }

        // Create an offer and send it to the backend
        const pc = new RTCPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send the offer to the backend
        const response = await fetch('http://localhost:8000/offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdp: pc.localDescription.sdp,
            type: pc.localDescription.type,
          }),
        });

        const data = await response.json();
        // Set the remote description of the peer connection with the received answer
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      } catch (error) {
        console.error('Error accessing media devices: ', error);
      }
    }

    startStream();
    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', resizeVideoElements);
    };
  }, []);

  return (
    <div className="container">
      <header className="meeting-header">
        <h1>Asterisk - Video Meeting App</h1>
        <div id="video-container" className="video-container">
          {/* Add video elements here */}
          <video ref={videoRef} autoPlay playsInline className="video-element"></video>
          <audio ref={audioRef} autoPlay playsInline className="audio-element"></audio>
        </div>
        <div className="toggle-buttons">
            <button onClick={toggleCamera}>{camStatus}</button>
            <button onClick={toggleMic}>{micStatus}</button>
            <button onClick={toggleScreenShare}>{screenStatus}</button>
        </div>
      </header>
    </div>
  );
};