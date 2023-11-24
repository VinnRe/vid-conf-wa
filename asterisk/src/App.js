// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { HomePage } from './Components/Pages/home_page/home';
import { MeetingPage } from './Components/Pages/meeting_page/MeetingPage';
import { LoginSignup } from './Components/Pages/loginsignup_page/LoginSignup';

function App() {
  return (
    <Router>
      <Routes> 
        <Route path='/login-signup' element={<LoginSignup />} />
        {/* Protected Routes */}
        <Route path='/' element={<HomePage />} />
        {/* <Route path='/create/:room' element={<MeetingPage />} /> */}
        <Route path='/room/:roomName' element={<MeetingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
