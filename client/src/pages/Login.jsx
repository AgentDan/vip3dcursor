import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      await authService.login({ username, password });
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
        <h2 className="mb-8 text-center text-gray-800 text-2xl font-semibold">Login</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-5 text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-5">
          <label className="block mb-2 text-gray-800 text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded text-base outline-none focus:border-blue-500"
            placeholder="Enter your username"
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="mt-5 text-center text-sm text-gray-600">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-blue-600 no-underline hover:underline">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;

