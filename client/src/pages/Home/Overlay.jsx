import {Scroll} from "@react-three/drei";

const Overlay = () => {
    return (
        <Scroll html>
            <div className="absolute inset-0 w-screen pointer-events-none">

                {/* Hero Section - Section 1 */}
                <section className="relative h-screen w-screen overflow-hidden flex items-start justify-center px-4 pt-[10vh]">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/50 backdrop-blur-sm px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">1</span>
                            <span>Hero</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl mt-10 md:text-5xl font-light text-gray-900 tracking-tight mb-4" style={{textShadow: '0 0 15px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.7), 0 2px 6px rgba(255,255,255,0.5)'}}>
                                OUR PHILOSOPHY
                            </h2>
                            <p className="text-xl font-light text-gray-800 italic" style={{textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 1px 4px rgba(255,255,255,0.4)'}}>Precision Through Pre-Modeling</p>
                        </div>

                        <div className="backdrop-blur-[3px] rounded-2xl border border-white/10 p1 md:p-12 mb-4">
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-1 text-center" style={{textShadow: '0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.6), 0 2px 5px rgba(255,255,255,0.4)'}}>
                                    The Art of Pre-Modeling in Yacht Design
                                </h3>
                                <p className="text-base md:text-lg font-light text-gray-800 leading-relaxed mb-6 text-center" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5), 0 1px 3px rgba(255,255,255,0.3)'}}>
                                    At Vicenzo BOATS, we believe that exceptional yacht design begins long before the first 
                                    piece of steel is cut or the first fiber is laid. Our commitment to pre-modeling is the 
                                    cornerstone of our design philosophy, ensuring that every vessel we create is a masterpiece 
                                    of precision, functionality, and aesthetic excellence.
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-800 leading-relaxed mb-6 text-center" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5), 0 1px 3px rgba(255,255,255,0.3)'}}>
                                    Through advanced 3D modeling and digital prototyping, we explore every curve, every angle, 
                                    and every detail in a virtual environment. This meticulous pre-modeling process allows us 
                                    to visualize the yacht's performance, optimize its structure, and refine its design before 
                                    construction begins.
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-800 leading-relaxed text-center" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5), 0 1px 3px rgba(255,255,255,0.3)'}}>
                                    This approach not only reduces material waste and construction time but also ensures that 
                                    our clients receive a yacht that exceeds their expectations in every aspect—from hydrodynamic 
                                    efficiency to interior comfort and visual appeal.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="bg-white/5 backdrop-blur-[50px] rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4 backdrop-blur-[50px]">
                                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-light text-gray-900 mb-2" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5)'}}>3D Visualization</h4>
                                <p className="text-sm font-light text-gray-800 leading-relaxed" style={{textShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5)'}}>
                                    Immersive digital models that bring your vision to life before construction begins.
                                </p>
                            </div>

                            <div className=" backdrop-blur-[3px] rounded-lg p-6 border border-white/10 transition-all">
                                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4 backdrop-blur-[50px]">
                                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-light text-gray-900 mb-2" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5)'}}>Performance Analysis</h4>
                                <p className="text-sm font-light text-gray-800 leading-relaxed" style={{textShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5)'}}>
                                    Computational fluid dynamics and structural analysis for optimal performance.
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-[50px] rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4 backdrop-blur-[50px]">
                                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-light text-gray-900 mb-2" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5)'}}>Iterative Refinement</h4>
                                <p className="text-sm font-light text-gray-800 leading-relaxed" style={{textShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5)'}}>
                                    Continuous improvement through virtual testing and design optimization.
                                </p>
                            </div>
                        </div>
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

                {/* Section 3 - Control Panel */}
                <section className="relative h-screen flex items-center justify-center px-4">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/30 backdrop-blur-[1px] px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">3</span>
                            <span>Control Panel</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="bg-white/10 backdrop-blur-[3px] rounded-3xl border border-white/20 p-8 md:p-12">
                            <div className="max-w-4xl mx-auto text-center">
                                <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-6" style={{textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 2px 4px rgba(255,255,255,0.4)'}}>
                                    CONTROL PANEL
                                </h2>
                                <p className="text-xl font-light text-gray-800 italic mb-8" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5), 0 1px 3px rgba(255,255,255,0.3)'}}>
                                    Advanced Control Systems
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-800 leading-relaxed" style={{textShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5), 0 1px 2px rgba(255,255,255,0.3)'}}>
                                    State-of-the-art control panel designed for intuitive operation and seamless integration 
                                    with all onboard systems. Experience precision control at your fingertips.
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

                {/* Section 5 - Roof */}
                <section className="relative h-screen flex items-start justify-center px-4 pt-[10vh]">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/30 backdrop-blur-[1px] px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">5</span>
                            <span>Roof</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="bg-white/10 backdrop-blur-[3px] rounded-3xl border border-white/20 p-8 md:p-12">
                            <div className="max-w-4xl mx-auto text-center">
                                <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-6" style={{textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 2px 4px rgba(255,255,255,0.4)'}}>
                                    ROOF
                                </h2>
                                <p className="text-xl font-light text-gray-800 italic mb-8" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5), 0 1px 3px rgba(255,255,255,0.3)'}}>
                                    Elegant Design & Protection
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-800 leading-relaxed" style={{textShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5), 0 1px 2px rgba(255,255,255,0.3)'}}>
                                    Premium roof design combining aesthetic elegance with superior weather protection. 
                                    Crafted to enhance both form and function of your vessel.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6 - Benches */}
                <section className="relative h-screen flex items-center justify-center px-4">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/30 backdrop-blur-[1px] px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">6</span>
                            <span>Benches</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="bg-white/10 backdrop-blur-[3px] rounded-3xl border border-white/20 p-8 md:p-12">
                            <div className="max-w-4xl mx-auto text-center">
                                <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-6" style={{textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 2px 4px rgba(255,255,255,0.4)'}}>
                                    BENCHES
                                </h2>
                                <p className="text-xl font-light text-gray-800 italic mb-8" style={{textShadow: '0 0 8px rgba(255,255,255,0.7), 0 0 16px rgba(255,255,255,0.5), 0 1px 3px rgba(255,255,255,0.3)'}}>
                                    Comfort & Style
                                </p>
                                <p className="text-base md:text-lg font-light text-gray-800 leading-relaxed" style={{textShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5), 0 1px 2px rgba(255,255,255,0.3)'}}>
                                    Luxuriously designed benches offering exceptional comfort and sophisticated styling. 
                                    Perfect for relaxation and social gatherings on deck.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Empty Section 7 */}
                <section className="relative h-screen w-screen">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-gray-700/90 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-4 py-2 rounded border border-gray-300/50">
                            <span className="font-bold text-gray-900 text-sm mr-2">7</span>
                            <span>Empty</span>
                        </span>
                    </div>
                </section>

                {/* Contact Section - Section 8 */}
                <section className="relative h-screen w-screen flex items-end justify-center px-4 pb-16">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/50 backdrop-blur-sm px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">8</span>
                            <span>Contact</span>
                        </span>
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-2xl">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-white mb-4">Email</h3>
                                <p className="text-base font-light text-white/90 mb-2">General Inquiries</p>
                                <a href="mailto:info@vicenzoboats.com" className="text-sm font-light text-white hover:text-white/80 transition-colors pointer-events-auto block mb-6">
                                    info@vicenzoboats.com
                                </a>
                                <p className="text-base font-light text-white/90 mb-2">Design Consultations</p>
                                <a href="mailto:design@vicenzoboats.com" className="text-sm font-light text-white hover:text-white/80 transition-colors pointer-events-auto block">
                                    design@vicenzoboats.com
                                </a>
                            </div>

                            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-2xl">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-white mb-4">Phone</h3>
                                <p className="text-base font-light text-white/90 mb-2">Main Office</p>
                                <a href="tel:+37797980000" className="text-sm font-light text-white hover:text-white/80 transition-colors pointer-events-auto block mb-6">
                                    +377 97 98 00 00
                                </a>
                                <p className="text-base font-light text-white/90 mb-2">24/7 Emergency</p>
                                <a href="tel:+37797980001" className="text-sm font-light text-white hover:text-white/80 transition-colors pointer-events-auto block">
                                    +377 97 98 00 01
                                </a>
                            </div>
                        </div>

                        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-2xl">
                            <div className="max-w-2xl mx-auto text-center">
                                <h3 className="text-2xl font-light text-white mb-4">Schedule a Consultation</h3>
                                <p className="text-base font-light text-white/90 leading-relaxed mb-6">
                                    Whether you're envisioning a custom superyacht or seeking design expertise for your next 
                                    project, we're here to bring your vision to life. Contact us to schedule a private consultation 
                                    at our Monaco facility or arrange a virtual meeting.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a 
                                        href="mailto:info@vicenzoboats.com?subject=Consultation Request" 
                                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-light uppercase tracking-wider hover:bg-white/30 transition-all cursor-pointer pointer-events-auto border border-white/30"
                                    >
                                        Request Consultation
                                    </a>
                                    <a 
                                        href="tel:+37797980000" 
                                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-light uppercase tracking-wider border border-white/30 hover:bg-white/30 transition-all cursor-pointer pointer-events-auto"
                                    >
                                        Call Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Video Section - Section 9 */}
                <section className="relative h-screen w-screen overflow-hidden">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <span className="text-xs font-light text-white/90 uppercase tracking-wider bg-black/50 backdrop-blur-sm px-4 py-2 rounded border border-white/20">
                            <span className="font-bold text-white text-sm mr-2">9</span>
                            <span>Video</span>
                        </span>
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
