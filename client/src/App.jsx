import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home/Home';
import Admin from './pages/Admin';
import Model3D from './pages/Model3D';
import Constructor from './pages/Constructor/Construcror';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        {/* <Route path="/model" element={<Model3D />} /> */}
        <Route path="/model" element={<Constructor />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

