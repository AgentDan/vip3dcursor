import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/jwt.utils';

function Home() {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Welcome Home</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
            
            <div className="mt-8">
              <p className="text-gray-600 text-lg">
                You have successfully registered and logged in!
              </p>
              <p className="text-gray-500 mt-4">
                This is your home page. You can add more content here later.
              </p>
              
              {userIsAdmin && (
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
                  >
                    Go to Admin Panel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

