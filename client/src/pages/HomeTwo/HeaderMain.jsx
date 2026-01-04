import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, getUsername, isAuthenticated } from '../../utils/jwt.utils';

const HeaderMain = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const username = getUsername();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-[50px] border-b border-white/20">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-light text-black tracking-tight">Vicenzo BOATS</h1>
            {authenticated && username && (
              <p className="text-white/80 text-xs font-light">Logged in as {username}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <button
              onClick={() => navigate('/model')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg hover:bg-white/20 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/20 cursor-pointer flex-shrink-0"
            >
              <span className="flex items-center whitespace-nowrap">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="hidden sm:inline">3D Viewer</span>
                <span className="sm:hidden">3D</span>
              </span>
            </button>
            {authenticated && userIsAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg hover:bg-white/20 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/20 cursor-pointer flex-shrink-0"
              >
                Admin
              </button>
            )}
            {authenticated ? (
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md text-black rounded-lg hover:bg-white/30 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/30 cursor-pointer flex-shrink-0 whitespace-nowrap"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md text-black rounded-lg hover:bg-white/30 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/30 cursor-pointer flex-shrink-0 whitespace-nowrap"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMain;

