import { useNavigate } from 'react-router-dom';
import { isAdmin, getUsername } from '../utils/jwt.utils';

function Home() {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();
  const username = getUsername();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light text-gray-900 tracking-tight">Welcome Home</h1>
              <p className="text-gray-600 text-xs font-light">
                {username ? (
                  <span>Logged in as <span className="font-normal text-gray-900">{username}</span></span>
                ) : (
                  "You're successfully logged in"
                )}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => navigate('/model')}
                className="px-5 py-2.5 bg-white/70 backdrop-blur-md text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-sm uppercase tracking-wider border border-gray-300/30 cursor-pointer"
                title="View 3D Models"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  3D Models
                </span>
              </button>
              {userIsAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-5 py-2.5 bg-white/70 backdrop-blur-md text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-sm uppercase tracking-wider border border-gray-300/30 cursor-pointer"
                  title="Go to Admin Panel"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin
                  </span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-gray-900/90 backdrop-blur-md text-white rounded-lg hover:bg-gray-900 hover:shadow-md transition-all font-light text-sm uppercase tracking-wider border border-gray-800/50 cursor-pointer"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <p className="text-5xl md:text-6xl font-light text-gray-900 italic mb-4 leading-tight">
              THE REAL VOYAGE OF DISCOVERY
            </p>
            <p className="text-5xl md:text-6xl font-light text-gray-900 italic mb-4 leading-tight">
              CONSISTS, NOT
            </p>
            <p className="text-5xl md:text-6xl font-light text-gray-900 italic mb-4 leading-tight">
              IN SEEKING NEW LANDSCAPES
            </p>
            <p className="text-5xl md:text-6xl font-light text-gray-900 italic leading-tight">
              BUT, IN HAVING NEW EYES
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-12 mb-16">
            <p className="text-lg font-light text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              Our platform has seen considerable evolution in recent years, but the ethos to produce 
              immaculate digital experiences and innovative solutions has been our compass ever since we started.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-light text-gray-900 mb-2">18</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Years in the Making</div>
              <div className="text-xs font-light text-gray-500 mt-1">That's how young is our team</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-light text-gray-900 mb-2">113</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Team Strong</div>
              <div className="text-xs font-light text-gray-500 mt-1">That's how big our team is</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-light text-gray-900 mb-2">241</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Different Projects</div>
              <div className="text-xs font-light text-gray-500 mt-1">Design & Engineered</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-light text-gray-900 mb-2">83</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Bespoke Vessels</div>
              <div className="text-xs font-light text-gray-500 mt-1">Design & Engineered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 tracking-tight mb-4">THE BEAUTY IS IN THE EYE</h2>
            <p className="text-xl font-light text-gray-600 italic">OF THE BEHOLDER</p>
            <p className="text-sm font-light text-gray-500 mt-2">MARGARET W. HUNGERFORD</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30 hover:bg-white/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">3D Model Viewer</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Experience your 3D models in an immersive environment. View, rotate, and explore your .gltf and .glb files with precision.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30 hover:bg-white/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">Admin Panel</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Comprehensive administration tools for managing users, files, and system settings with elegant simplicity.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30 hover:bg-white/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">File Management</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Secure file upload and organization system with user-specific directories and comprehensive file tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Account Status Section */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white/60 backdrop-blur-xl rounded-lg p-10 border border-gray-200/30 mb-12">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-900/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-light text-gray-900 mb-2">Account Status</h2>
                <p className="text-base text-gray-600 font-light mb-6">Your account is active and ready to use</p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/40 backdrop-blur-sm border border-gray-200/30 rounded-lg p-6 hover:bg-white/60 hover:shadow-md transition-all">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-gray-900/5 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-light text-gray-900 mb-1">Profile</h3>
                        <p className="text-xs text-gray-600 font-light">Manage your account settings and preferences</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-sm border border-gray-200/30 rounded-lg p-6 hover:bg-white/60 hover:shadow-md transition-all">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-gray-900/5 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-light text-gray-900 mb-1">Security</h3>
                        <p className="text-xs text-gray-600 font-light">Update your password and security settings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-3xl font-light text-gray-700 italic mb-8 leading-relaxed">
              "KEEP LOOKING FOR THINGS<br />
              IN PLACES WHERE THERE IS<br />
              NOTHING"
            </p>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wider">Philosophy</p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-lg p-12 border border-gray-200/30">
            <p className="text-base font-light text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              The old grey-bearded sailor sat on a stone outside the church and watched the people walking past home. 
              He had a strange, mad look in his eyes, and suddenly he stopped one of the guests and asked him: 
              do you mind if I tell you a story about my boats? Oh, do I have a story for you, my friend.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12 tracking-tight">Our Services</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
              <h3 className="text-xl font-light text-gray-900 mb-4">Design & Engineering</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed mb-4">
                We offer comprehensive design and engineering services, bringing together creativity and technical excellence 
                to deliver exceptional results.
              </p>
              <ul className="space-y-2 text-sm font-light text-gray-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                  R&D Services
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                  Prototyping
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                  Production Services
                </li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
              <h3 className="text-xl font-light text-gray-900 mb-4">Digital Solutions</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed mb-4">
                Modern digital platforms and tools designed to enhance productivity and streamline workflows 
                for teams of all sizes.
              </p>
              <ul className="space-y-2 text-sm font-light text-gray-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                  3D Visualization
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                  File Management
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                  User Administration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 px-4 border-t border-gray-200/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-light text-gray-600 mb-4">
              Copyright 2024 © All rights Reserved.
            </p>
            <p className="text-xs font-light text-gray-500">
              Built with precision and care
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

