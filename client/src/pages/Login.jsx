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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/5 via-gray-800/5 to-slate-800/5 backdrop-blur-sm border-b border-gray-200/30 px-8 py-8">
            <h2 className="text-4xl font-light text-gray-900 text-center tracking-tight">Welcome Back</h2>
            <p className="text-gray-600 text-center mt-3 text-sm font-light">Sign in to your account</p>
          </div>
          
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg text-base outline-none transition-all focus:border-gray-400 focus:bg-white/80 font-light text-gray-900 placeholder:text-gray-400"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg text-base outline-none transition-all focus:border-gray-400 focus:bg-white/80 font-light text-gray-900 placeholder:text-gray-400"
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gray-900 text-white rounded-lg text-sm font-light uppercase tracking-wider shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
            
            <div className="text-center pt-6 border-t border-gray-200/50">
              <p className="text-xs text-gray-500 font-light">
                Don't have an account?{' '}
                <Link to="/register" className="text-gray-900 font-normal hover:underline transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

