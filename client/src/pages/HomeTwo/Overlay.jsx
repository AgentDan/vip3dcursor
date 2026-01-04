import React from 'react';
import {Scroll} from "@react-three/drei";

const Overlay = () => {
    return (
        <Scroll html>
            <div className="absolute inset-0 w-screen pointer-events-none">

                {/* Hero Section with Video - Section 1 */}
                <section className="relative h-screen w-screen overflow-hidden">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/50 backdrop-blur-sm px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">1</span>
                            <span>Hero</span>
                        </span>
                    </div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <h2 className="text-[10vw] text-white font-light tracking-tight text-center drop-shadow-lg">
                            Vicenzo BOATS
                        </h2>
                    </div>

                    <div className="absolute inset-0 z-0">
                        <video
                            className="hidden md:block w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/assets/videos/videoYacht.mp4" type="video/mp4" />
                            Ваш браузер не поддерживает видео.
                        </video>

                        <video
                            className="md:hidden w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/assets/videos/videoYachtMin.mp4" type="video/mp4" />
                            Ваш браузер не поддерживает видео.
                        </video>
                    </div>
                </section>

                {/* Empty Section 2 */}
                <section className="relative h-screen w-screen">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">2</span>
                            <span>Empty</span>
                        </span>
                    </div>
                </section>

                {/* Concept Section - Предварительное моделирование - Section 3 */}
                <section className="relative h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50/60 via-gray-50/60 to-slate-100/60 backdrop-blur-sm">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">3</span>
                            <span>Philosophy</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
                                OUR PHILOSOPHY
                            </h2>
                            <p className="text-xl font-light text-gray-600 italic">Precision Through Pre-Modeling</p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 md:p-12 mb-8">
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-6 text-center">
                                    The Art of Pre-Modeling in Yacht Design
                                </h3>
                                <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed mb-6 text-center">
                                    At Vicenzo BOATS, we believe that exceptional yacht design begins long before the first 
                                    piece of steel is cut or the first fiber is laid. Our commitment to pre-modeling is the 
                                    cornerstone of our design philosophy, ensuring that every vessel we create is a masterpiece 
                                    of precision, functionality, and aesthetic excellence.
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed mb-6 text-center">
                                    Through advanced 3D modeling and digital prototyping, we explore every curve, every angle, 
                                    and every detail in a virtual environment. This meticulous pre-modeling process allows us 
                                    to visualize the yacht's performance, optimize its structure, and refine its design before 
                                    construction begins.
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed text-center">
                                    This approach not only reduces material waste and construction time but also ensures that 
                                    our clients receive a yacht that exceeds their expectations in every aspect—from hydrodynamic 
                                    efficiency to interior comfort and visual appeal.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-6 border border-gray-200/30 hover:bg-white/80 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-light text-gray-900 mb-2">3D Visualization</h4>
                                <p className="text-sm font-light text-gray-600 leading-relaxed">
                                    Immersive digital models that bring your vision to life before construction begins.
                                </p>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-6 border border-gray-200/30 hover:bg-white/80 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-light text-gray-900 mb-2">Performance Analysis</h4>
                                <p className="text-sm font-light text-gray-600 leading-relaxed">
                                    Computational fluid dynamics and structural analysis for optimal performance.
                                </p>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-6 border border-gray-200/30 hover:bg-white/80 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-light text-gray-900 mb-2">Iterative Refinement</h4>
                                <p className="text-sm font-light text-gray-600 leading-relaxed">
                                    Continuous improvement through virtual testing and design optimization.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Empty Section 4 */}
                <section className="relative h-screen w-screen">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">4</span>
                            <span>Empty</span>
                        </span>
                    </div>
                </section>

                {/* Location Section - Section 5 */}
                <section className="relative h-screen flex items-center justify-center px-4 bg-white/30 backdrop-blur-sm">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">5</span>
                            <span>Location</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
                                OUR LOCATION
                            </h2>
                            <p className="text-xl font-light text-gray-600 italic">Where Excellence Meets the Sea</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
                                <div className="w-16 h-16 bg-gray-900/5 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-light text-gray-900 mb-4">Design & Engineering Center</h3>
                                <p className="text-base font-light text-gray-700 leading-relaxed mb-4">
                                    Our state-of-the-art facility is strategically located to serve our international clientele 
                                    while maintaining close proximity to premier shipyards and marine suppliers.
                                </p>
                                <div className="space-y-3 text-sm font-light text-gray-600">
                                    <p className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                        <span>Monaco Yacht Design District<br />Port Hercule, Monaco</span>
                                    </p>
                                    <p className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                        <span>Accessible by land, sea, and air</span>
                                    </p>
                                    <p className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                        <span>Private marina access for client visits</span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
                                <div className="w-16 h-16 bg-gray-900/5 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-light text-gray-900 mb-4">Global Presence</h3>
                                <p className="text-base font-light text-gray-700 leading-relaxed mb-4">
                                    While our design center is in Monaco, we collaborate with shipyards and clients worldwide, 
                                    bringing our expertise to projects across all major yachting destinations.
                                </p>
                                <div className="space-y-3 text-sm font-light text-gray-600">
                                    <p className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                        <span>European shipyard partnerships</span>
                                    </p>
                                    <p className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                        <span>Remote design consultations available</span>
                                    </p>
                                    <p className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                        <span>On-site project management worldwide</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Empty Section 6 */}
                <section className="relative h-screen w-screen">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">6</span>
                            <span>Empty</span>
                        </span>
                    </div>
                </section>

                {/* Contact Section - Section 7 */}
                <section className="relative h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50/60 via-gray-50/60 to-slate-100/60 backdrop-blur-sm">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">7</span>
                            <span>Contact</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
                                GET IN TOUCH
                            </h2>
                            <p className="text-xl font-light text-gray-600 italic">Let's Build Your Dream Together</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
                                <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-900 mb-4">Email</h3>
                                <p className="text-base font-light text-gray-700 mb-2">General Inquiries</p>
                                <a href="mailto:info@vicenzoboats.com" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors pointer-events-auto">
                                    info@vicenzoboats.com
                                </a>
                                <p className="text-base font-light text-gray-700 mb-2 mt-6">Design Consultations</p>
                                <a href="mailto:design@vicenzoboats.com" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors pointer-events-auto">
                                    design@vicenzoboats.com
                                </a>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
                                <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-900 mb-4">Phone</h3>
                                <p className="text-base font-light text-gray-700 mb-2">Main Office</p>
                                <a href="tel:+37797980000" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors pointer-events-auto">
                                    +377 97 98 00 00
                                </a>
                                <p className="text-base font-light text-gray-700 mb-2 mt-6">24/7 Emergency</p>
                                <a href="tel:+37797980001" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors pointer-events-auto">
                                    +377 97 98 00 01
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl rounded-lg p-8 border border-gray-200/30">
                            <div className="max-w-2xl mx-auto text-center">
                                <h3 className="text-2xl font-light text-gray-900 mb-4">Schedule a Consultation</h3>
                                <p className="text-base font-light text-gray-700 leading-relaxed mb-6">
                                    Whether you're envisioning a custom superyacht or seeking design expertise for your next 
                                    project, we're here to bring your vision to life. Contact us to schedule a private consultation 
                                    at our Monaco facility or arrange a virtual meeting.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a 
                                        href="mailto:info@vicenzoboats.com?subject=Consultation Request" 
                                        className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-light uppercase tracking-wider hover:bg-gray-800 transition-all cursor-pointer pointer-events-auto"
                                    >
                                        Request Consultation
                                    </a>
                                    <a 
                                        href="tel:+37797980000" 
                                        className="px-6 py-3 bg-white/70 backdrop-blur-md text-gray-900 rounded-lg text-sm font-light uppercase tracking-wider border border-gray-300/30 hover:bg-white/90 transition-all cursor-pointer pointer-events-auto"
                                    >
                                        Call Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Empty Section 8 */}
                <section className="relative h-screen w-screen">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">8</span>
                            <span>Empty</span>
                        </span>
                    </div>
                </section>

                {/* Final Video Section - Section 9 */}
                <section className="relative h-screen w-screen overflow-hidden">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/50 backdrop-blur-sm px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">9</span>
                            <span>Final Video</span>
                        </span>
                    </div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <h2 className="text-[10vw] text-white font-light tracking-tight text-center drop-shadow-lg">
                            Vicenzo 39 WA
                        </h2>
                    </div>

                    <div className="absolute inset-0 z-0">
                        <video
                            className="hidden md:block w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/assets/videos/video1.mp4" type="video/mp4" />
                            Ваш браузер не поддерживает видео.
                        </video>

                        <video
                            className="md:hidden w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/assets/videos/video2.mp4" type="video/mp4" />
                            Ваш браузер не поддерживает видео.
                        </video>
                    </div>
                </section>

                {/* Empty Section 10 */}
                <section className="relative h-screen w-screen">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">10</span>
                            <span>Empty</span>
                        </span>
                    </div>
                </section>

            </div>
        </Scroll>
    );
};

export default Overlay;
