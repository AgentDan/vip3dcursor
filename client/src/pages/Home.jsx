import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, getUsername, isAuthenticated } from '../utils/jwt.utils';
import uploadService from '../services/upload.service';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, MeshDistortMaterial } from '@react-three/drei';
import { gsap } from 'gsap';

// 3D Model Component
function AnimatedBox() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <MeshDistortMaterial
        color="#4a5568"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

function Home() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const username = getUsername();
  const [hasModels, setHasModels] = useState(false);
  const [checkingModels, setCheckingModels] = useState(false);
  
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const checkUserModels = async () => {
      if (!authenticated || !username) {
        setHasModels(false);
        return;
      }

      try {
        setCheckingModels(true);
        const allFiles = await uploadService.getAllFilesWithOwners();
        const userModels = allFiles.filter(file => 
          file.username === username && 
          (file.filename.endsWith('.gltf') || file.filename.endsWith('.glb'))
        );
        setHasModels(userModels.length > 0);
      } catch (err) {
        console.error('Error checking models:', err);
        setHasModels(false);
      } finally {
        setCheckingModels(false);
      }
    };

    checkUserModels();
  }, [authenticated, username]);

  // GSAP Animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Hero text animation
    if (heroTitleRef.current) {
      const lines = Array.from(heroTitleRef.current.children);
      if (lines.length > 0) {
        tl.from(lines, {
          y: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.2
        });
      }
    }

    // Subtitle animation
    if (heroSubtitleRef.current) {
      tl.from(heroSubtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8
      }, '-=0.5');
    }

    // Stats animation
    if (statsRef.current) {
      const stats = Array.from(statsRef.current.children);
      if (stats.length > 0) {
        tl.from(stats, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1
        }, '-=0.3');
      }
    }

    // Features animation
    if (featuresRef.current) {
      const features = Array.from(featuresRef.current.children);
      if (features.length > 0) {
        tl.from(features, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15
        }, '-=0.3');
      }
    }

    return () => {
      tl.kill();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handle3DViewerClick = () => {
    if (authenticated) {
      navigate('/model');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-[5px] border-b border-gray-200/30 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-light text-gray-900 tracking-tight">Welcome Home</h1>
                <p className="text-gray-600 text-xs font-light">
                  {authenticated && username ? (
                    <span>Logged in as <span className="font-normal text-gray-900">{username}</span></span>
                  ) : (
                    "Welcome, Guest"
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <button
                  onClick={handle3DViewerClick}
                  disabled={!authenticated || !hasModels}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 backdrop-blur-md rounded-lg transition-all font-light text-xs sm:text-sm uppercase tracking-wider border flex-shrink-0 ${
                    authenticated && hasModels
                      ? 'bg-white/70 text-gray-900 hover:bg-white/90 hover:shadow-md border-gray-300/30 cursor-pointer'
                      : 'bg-gray-100/70 text-gray-400 border-gray-200/30 cursor-not-allowed'
                  }`}
                  title={!authenticated ? "Login Required" : !hasModels ? "No 3D models available" : "View 3D Models"}
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
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white/70 backdrop-blur-md text-gray-900 rounded-lg hover:bg-white/90 hover:shadow-md transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-gray-300/30 cursor-pointer flex-shrink-0"
                    title="Go to Admin Panel"
                  >
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin
                    </span>
                  </button>
                )}
                {authenticated ? (
                  <button
                    onClick={handleLogout}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-900/90 backdrop-blur-md text-white rounded-lg hover:bg-gray-900 hover:shadow-md transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-gray-800/50 cursor-pointer flex-shrink-0"
                    title="Logout"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-900/90 backdrop-blur-md text-white rounded-lg hover:bg-gray-900 hover:shadow-md transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-gray-800/50 cursor-pointer flex-shrink-0"
                    title="Login"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with 3D Model */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            {/* 3D Model */}
            <div className="h-96 md:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 shadow-2xl ring-1 ring-gray-200/50 hover:shadow-3xl transition-shadow duration-500">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                <AnimatedBox />
                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3}
                  maxDistance={8}
                  autoRotate
                  autoRotateSpeed={0.5}
                />
                <Environment preset="sunset" />
              </Canvas>
            </div>

            {/* Hero Text */}
            <div className="text-center md:text-left">
              <div ref={heroTitleRef}>
                <p className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 italic mb-4 leading-tight">
                  THE REAL VOYAGE OF DISCOVERY
                </p>
                <p className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 italic mb-4 leading-tight">
                  CONSISTS, NOT
                </p>
                <p className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 italic mb-4 leading-tight">
                  IN SEEKING NEW LANDSCAPES
                </p>
                <p className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 italic leading-tight">
                  BUT, IN HAVING NEW EYES
                </p>
              </div>
            </div>
          </div>
          
          <div ref={heroSubtitleRef} className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 p-12 mb-16 ring-1 ring-white/50 hover:shadow-3xl transition-all duration-500">
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
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-light text-gray-900 mb-2 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">18</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Years in the Making</div>
              <div className="text-xs font-light text-gray-500 mt-1">That's how young is our team</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-light text-gray-900 mb-2 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">113</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Team Strong</div>
              <div className="text-xs font-light text-gray-500 mt-1">That's how big our team is</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-light text-gray-900 mb-2 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">241</div>
              <div className="text-xs font-light text-gray-600 uppercase tracking-wider">Different Projects</div>
              <div className="text-xs font-light text-gray-500 mt-1">Design & Engineered</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-light text-gray-900 mb-2 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">83</div>
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

          <div ref={featuresRef} className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-gray-200/50 shadow-xl hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900/10 to-gray-700/10 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">3D Model Viewer</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Experience your 3D models in an immersive environment. View, rotate, and explore your .gltf and .glb files with precision.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-gray-200/50 shadow-xl hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900/10 to-gray-700/10 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">Admin Panel</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Comprehensive administration tools for managing users, files, and system settings with elegant simplicity.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-gray-200/50 shadow-xl hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900/10 to-gray-700/10 rounded-xl flex items-center justify-center mb-6 shadow-inner">
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
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-10 border border-gray-200/50 shadow-2xl ring-1 ring-white/50 mb-12 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900/10 to-gray-700/10 rounded-full flex items-center justify-center shadow-inner ring-1 ring-gray-200/50">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-light text-gray-900 mb-2">Account Status</h2>
                <p className="text-base text-gray-600 font-light mb-6">Your account is active and ready to use</p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-900/10 to-gray-700/10 rounded-lg flex items-center justify-center mr-4 shadow-inner">
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
                  
                  <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 hover:bg-white/80 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-900/10 to-gray-700/10 rounded-lg flex items-center justify-center mr-4 shadow-inner">
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

          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-12 border border-gray-200/50 shadow-2xl ring-1 ring-white/50 hover:shadow-3xl transition-all duration-500">
            <p className="text-base font-light text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              The old grey-bearded sailor sat on a stone outside the church and watched the people walking past home. 
              He had a strange, mad look in his eyes, and suddenly he stopped one of the guests and asked him: 
              do you mind if I tell you a story about my boats? Oh, do I have a story for you, my friend.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-white/50 via-white/40 to-white/30 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12 tracking-tight">Our Services</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-gray-200/50 shadow-xl hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/50">
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

            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-8 border border-gray-200/50 shadow-xl hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/50">
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

