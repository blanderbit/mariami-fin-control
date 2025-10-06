import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const [showBubble, setShowBubble] = useState(false);
    const [showTyping, setShowTyping] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowBubble(true), 300);
        setTimeout(() => setShowTyping(true), 700);
        setTimeout(() => {
            setShowTyping(false);
            setShowButtons(true);
        }, 1900);
    }, []);

    const handleNewUser = () => {
        navigate('/welcome-video', { state: { isNewUser: true } });
    };

    const handleExistingUser = () => {
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to bottom, #0B0E1A 0%, #0F1626 100%)'
                }}
            />

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                <div className="relative mb-8">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(37,97,229,0.22) 0%, transparent 70%)',
                            filter: 'blur(200px)',
                            width: '130%',
                            height: '130%',
                            left: '-15%',
                            top: '-15%'
                        }}
                    />

                    <div
                        className="relative rounded-[20px] w-full max-w-[640px] p-8"
                        style={{
                            backgroundColor: '#E3E3E3',
                            boxShadow: '0px 6px 24px rgba(37, 97, 229, 0.25), inset 0px 1px 3px rgba(0,0,0,0.06)',
                            animation: 'cardEnter 420ms cubic-bezier(0.22,1,0.36,1) forwards',
                            opacity: 0
                        }}
                    >
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-10 h-10">
                                <Brain className="w-6 h-6 text-[#BDBDBD]" />
                            </div>
                        </div>

                        <div
                            className={`transition-all duration-400 ${
                                showBubble ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                            }`}
                        >
                            <div
                                className="bg-white rounded-[14px] p-5 mb-6"
                                style={{ boxShadow: '0px 2px 6px rgba(0,0,0,0.04)' }}
                            >
                                <p className="text-gray-800 text-base leading-relaxed">
                                    Hello! How can we help you today? Are you visiting us for the first time, or do you already have an account?
                                </p>
                            </div>
                        </div>

                        {showTyping && (
                            <div className="flex items-center space-x-2 mb-6 ml-5">
                                <div className="flex space-x-1">
                                    <div
                                        className="w-2 h-2 bg-[#BDBDBD] rounded-full animate-bounce"
                                        style={{ animationDelay: '0ms', animationDuration: '1000ms' }}
                                    />
                                    <div
                                        className="w-2 h-2 bg-[#BDBDBD] rounded-full animate-bounce"
                                        style={{ animationDelay: '200ms', animationDuration: '1000ms' }}
                                    />
                                    <div
                                        className="w-2 h-2 bg-[#BDBDBD] rounded-full animate-bounce"
                                        style={{ animationDelay: '400ms', animationDuration: '1000ms' }}
                                    />
                                </div>
                            </div>
                        )}

                        {showButtons && (
                            <div className="space-y-3">
                                <button
                                    onClick={handleNewUser}
                                    className="w-full py-4 px-6 rounded-xl text-white font-medium text-base transition-all duration-300"
                                    style={{
                                        background: 'linear-gradient(to bottom, #3A75F2, #1E4FCC)',
                                        animation: 'buttonEnter 300ms cubic-bezier(0.22,1,0.36,1) forwards',
                                        animationDelay: '0ms',
                                        opacity: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0px 0px 12px rgba(37, 97, 229, 0.7)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    I'm new here →
                                </button>

                                <button
                                    onClick={handleExistingUser}
                                    className="w-full py-4 px-6 rounded-xl text-white font-medium text-base transition-all duration-300"
                                    style={{
                                        background: 'linear-gradient(to bottom, #3A75F2, #1E4FCC)',
                                        animation: 'buttonEnter 300ms cubic-bezier(0.22,1,0.36,1) forwards',
                                        animationDelay: '120ms',
                                        opacity: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0px 0px 12px rgba(37, 97, 229, 0.7)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    I already have an account
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                        <Brain className="w-5 h-5 text-[#BDBDBD]" />
                        <span className="text-white text-lg font-medium">FinCl AI</span>
                    </div>
                    <p className="text-[#6F7D99] text-sm">Protecting profits. Driving growth.</p>
                </div>
            </div>

            <style>{`
        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes buttonEnter {
          from {
            opacity: 0;
            transform: translateY(-6px);
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

export default Welcome;
