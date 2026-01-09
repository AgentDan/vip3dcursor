import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home/Home';
import Admin from './pages/Admin';
import AdminChat from './pages/AdminChat/AdminChat';
import Constructor from './pages/Constructor/Construcror';
import SupportChat from './components/SupportChat/SupportChat';

function App() {
  return (
    <Router>
      <SupportChat />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/chat" element={<AdminChat />} />
        <Route path="/model" element={<Constructor />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

