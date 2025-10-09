import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Upload, TrendingUp, BarChart3, Sparkles } from 'lucide-react';

import Logo from '../assets/FinclAI Logo Blue.png';
import {motion} from "framer-motion";

const WelcomeUser: React.FC = () => {
    const navigate = useNavigate();
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const hasData = company.dataImport && Object.keys(company.dataImport).length > 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center fade-in">
                {/*<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2561E5] to-[#1e4db8] rounded-full mb-6 royal-blue-glow">*/}
                {/*    <Brain className="w-10 h-10 text-white" />*/}
                {/*</div>*/}
                <motion.div
                    initial={{scale: 0.8, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{duration: 0.5}} className="flex justify-center">
                    <img src={Logo} alt="FinclAI Logo" className="w-20 h-20 object-contain"/>
                </motion.div>

                <h1 className="text-4xl font-bold text-[#12141A] mb-4">
                    Welcome to FinCl AI
                </h1>
                <p className="text-lg text-[#6F7D99] max-w-2xl mx-auto">
                    Your intelligent financial partner that helps you see your business clearly and grow with confidence.
                </p>
            </div>

            <div className="bg-[#F8FAFF] rounded-2xl card-glow p-8 border border-gray-100 fade-in hover-lift">
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#2561E5] to-[#1e4db8] rounded-xl flex items-center justify-center royal-blue-glow">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#12141A] mb-3">
                            Let's get started — your first insight is just one upload away
                        </h2>
                        <p className="text-[#6F7D99] mb-6 leading-relaxed">
                            Once you import your first P&L, FinCl AI will start reading your numbers, finding trends, and giving you personalized recommendations.
                        </p>
                        <button
                            onClick={() => navigate('/data-import')}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#2561E5] to-[#1e4db8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 royal-blue-glow"
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Upload your first P&L file → Get your first insights within seconds
                        </button>
                    </div>
                </div>
            </div>

            {hasData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#F8FAFF] rounded-2xl card-glow p-6 border border-gray-100 text-left hover-lift group"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2561E5] to-[#1e4db8] rounded-lg flex items-center justify-center mb-4 group-hover:royal-blue-glow transition-all">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#12141A] mb-2">View Dashboard</h3>
                        <p className="text-sm text-[#6F7D99]">
                            Explore your business metrics and insights
                        </p>
                    </button>

                    <button
                        onClick={() => navigate('/benchmark')}
                        className="bg-[#F8FAFF] rounded-2xl card-glow p-6 border border-gray-100 text-left hover-lift group"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2561E5] to-[#1e4db8] rounded-lg flex items-center justify-center mb-4 group-hover:royal-blue-glow transition-all">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#12141A] mb-2">Benchmark Data</h3>
                        <p className="text-sm text-[#6F7D99]">
                            Compare your performance against industry standards
                        </p>
                    </button>

                    <button
                        onClick={() => navigate('/assistant')}
                        className="bg-[#F8FAFF] rounded-2xl card-glow p-6 border border-gray-100 text-left hover-lift group relative overflow-hidden"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2561E5] to-[#1e4db8] rounded-lg flex items-center justify-center mb-4 group-hover:royal-blue-glow transition-all">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#12141A] mb-2">AI Assistant</h3>
                        <p className="text-sm text-[#6F7D99]">
                            Get personalized insights and recommendations
                        </p>
                        <span className="absolute top-4 right-4 w-2 h-2 bg-[#2561E5] rounded-full ai-pulse"></span>
                    </button>
                </div>
            )}

            <div className="bg-white/50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-[#12141A] mb-3">What you'll unlock:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <p className="text-sm text-[#6F7D99]">Real-time view of profit, cash, and runway</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <p className="text-sm text-[#6F7D99]">Instant AI insights and recommendations</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <p className="text-sm text-[#6F7D99]">Benchmarks vs. peers in your industry</p>
                    </div>
                    <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <p className="text-sm text-[#6F7D99]">Smart alerts on risks and opportunities</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeUser;
