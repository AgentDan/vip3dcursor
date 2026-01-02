import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ email, password });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-5">
      <form 
        className="bg-white p-10 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="mb-8 text-center text-gray-800 text-2xl font-semibold">Register</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-5 text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-5">
          <label className="block mb-2 text-gray-800 text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded text-base outline-none focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
        
        <div className="mb-5">
          <label className="block mb-2 text-gray-800 text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded text-base outline-none focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 bg-blue-600 text-white rounded text-base font-medium cursor-pointer mt-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <div className="mt-5 text-center text-sm text-gray-600">
          <span>Already have an account? </span>
          <Link to="/login" className="text-blue-600 no-underline hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;

