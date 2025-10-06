import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const WelcomeVideo: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [videoLoaded, setVideoLoaded] = useState(false);

    const isNewUser = location.state?.isNewUser ?? true;

    const handleContinue = () => {
        if (isNewUser) {
            navigate('/signup');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to bottom, #0F0F10 0%, #1A1F35 50%, #EBF0FA 100%)'
                }}
            />

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-5xl">
                    <div className="relative mb-12">
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle, rgba(37,97,229,0.14) 0%, transparent 70%)',
                                filter: 'blur(220px)',
                                width: '120%',
                                height: '120%',
                                left: '-10%',
                                top: '-10%'
                            }}
                        />

                        <div
                            className="relative rounded-2xl overflow-hidden"
                            style={{
                                backgroundColor: 'rgba(14,27,51,0.85)',
                                animation: 'fadeIn 420ms ease-out forwards',
                                opacity: 0
                            }}
                        >
                            <div className="aspect-video w-full flex items-center justify-center bg-[#0E1B33] relative">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0"
                                    title="Welcome to FinCl AI"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onLoad={() => setVideoLoaded(true)}
                                />
                                {!videoLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 border-4 border-[#2561E5] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="text-center space-y-6"
                        style={{
                            animation: 'fadeInUp 520ms ease-out forwards',
                            animationDelay: '200ms',
                            opacity: 0
                        }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Welcome to FinCl AI — Where your data becomes clarity.
                        </h1>

                        <p className="text-lg md:text-xl text-[#C9D2E3] max-w-2xl mx-auto leading-relaxed">
                            Transform your financial operations with intelligent insights, automated reporting, and real-time decision support.
                        </p>

                        <div className="pt-6">
                            <button
                                onClick={handleContinue}
                                className="inline-flex items-center px-8 py-4 rounded-xl text-white font-medium text-base transition-all duration-300 hover:shadow-[0_0_12px_rgba(37,97,229,0.6)] hover:scale-105"
                                style={{
                                    background: 'linear-gradient(to bottom, #3A75F2, #1E4FCC)'
                                }}
                            >
                                Continue
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default WelcomeVideo;
