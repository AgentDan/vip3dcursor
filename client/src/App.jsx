import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LayoutMain from './pages/HomeTwo/LayoutMain';
import Admin from './pages/Admin';
import Model3D from './pages/Model3D';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<LayoutMain />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/model" element={<Model3D />} />
        <Route path="/" element={<LayoutMain />} />
      </Routes>
    </Router>
  );
}

export default App;

