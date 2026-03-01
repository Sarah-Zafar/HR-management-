import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, CheckCircle, ArrowLeft } from 'lucide-react';
import logoUrl from '../assets/logo.png';

const EmployeeLoginPage = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => navigate('/');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            onLogin();
            navigate('/employee/dashboard');
        }, 1000);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="md:w-1/2 w-full bg-brand-green flex flex-col justify-center items-center p-8 relative overflow-hidden transition-colors">
                <div className="absolute top-[-100px] left-[-100px] w-64 h-64 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
                <div className="absolute bottom-[-150px] right-[-50px] w-96 h-96 rounded-full bg-brand-yellow opacity-10 mix-blend-overlay"></div>

                <div className="max-w-md w-full z-10 text-center md:text-left">
                    <button
                        onClick={handleBack}
                        className="flex items-center mb-12 font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-colors text-white border border-white/20 hover:border-white/40 shadow-sm"
                    >
                        <ArrowLeft className="mr-2" size={16} /> Back to Gateway
                    </button>

                    <img src={logoUrl} alt="Octa Accountants Logo" className="w-64 max-w-full mb-8 mx-auto md:mx-0 drop-shadow-lg" />
                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        Employee Portal
                    </h1>
                    <p className="text-gray-200 text-lg mb-8 leading-relaxed font-medium">
                        Access your self-service dashboard to manage your daily tasks.
                    </p>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                        <h3 className="text-brand-yellow font-bold text-lg mb-5 uppercase tracking-wider">Your Self-Service Tools</h3>
                        <ul className="space-y-4 font-medium opacity-90">
                            <li className="flex items-center text-white text-lg"><CheckCircle className="text-brand-yellow mr-3" size={24} /> Clock In / Clock Out</li>
                            <li className="flex items-center text-white text-lg"><CheckCircle className="text-brand-yellow mr-3" size={24} /> Personal Attendance</li>
                            <li className="flex items-center text-white text-lg"><CheckCircle className="text-brand-yellow mr-3" size={24} /> Leave Balance</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="md:w-1/2 w-full bg-white dark:bg-gray-800 flex justify-center items-center p-8 transition-colors">
                <div className="max-w-md w-full animate-[fadeIn_0.5s_ease-out]">
                    <h2 className="text-4xl font-extrabold text-brand-black dark:text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">Please sign in to access your employee dashboard.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Staff ID</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text" required placeholder="e.g. OCT-1025"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl outline-none transition-all text-brand-black dark:text-white placeholder-gray-400 focus:border-brand-yellow dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-gray-700 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password" required placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl outline-none transition-all text-brand-black dark:text-white placeholder-gray-400 focus:border-brand-yellow dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-gray-700 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center space-x-3 cursor-pointer select-none group">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow transition-colors cursor-pointer" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-bold hover:underline text-brand-yellow">Forgot password?</a>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full font-bold text-lg py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-yellow/20 transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center transition-all duration-300 ease-out bg-brand-yellow text-brand-black hover:bg-[#ffe033] mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-brand-black/20 border-t-brand-black rounded-full animate-spin"></div>
                            ) : "Sign In Securely"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLoginPage;
