import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home/Home';
import Admin from './pages/Admin';
import Constructor from './pages/Constructor/Construcror';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/model" element={<Constructor />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

