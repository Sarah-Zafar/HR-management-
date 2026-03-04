import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, CheckCircle, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const EmployeeLoginPage = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => navigate('/');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userCredential;
            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            if (onAuthSuccess) onAuthSuccess(userCredential.user);
            navigate('/employee/dashboard');
        } catch (error) {
            console.error("Auth Error:", error);
            setError('Email or password is incorrect');
        } finally {
            setLoading(false);
        }
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
                            <li className="flex items-center text-white text-lg"><CheckCircle className="text-brand-yellow mr-3" size={24} /> Personal Leave Balances</li>
                            <li className="flex items-center text-white text-lg"><CheckCircle className="text-brand-yellow mr-3" size={24} /> Company Calendar</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="md:w-1/2 w-full bg-white dark:bg-gray-800 flex justify-center items-center p-8 transition-colors">
                <div className="max-w-md w-full animate-[fadeIn_0.5s_ease-out]">
                    <h2 className="text-4xl font-extrabold text-brand-black dark:text-white mb-2 tracking-tight">
                        {isSignUp ? "Employee Registration" : "Welcome Back"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">
                        {isSignUp ? "Create your account to start managing your portal." : "Please sign in to access your employee dashboard."}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm font-bold flex items-center shadow-sm rounded-r-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email" required placeholder="staff@octa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl outline-none transition-all text-brand-black dark:text-white placeholder-gray-400 focus:border-brand-yellow dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-gray-700 shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full font-bold text-lg py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-yellow/20 transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center transition-all duration-300 ease-out bg-brand-yellow text-brand-black hover:bg-[#ffe033] mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-brand-black/20 border-t-brand-black rounded-full animate-spin"></div>
                            ) : (
                                <span className="flex items-center">
                                    {isSignUp ? <UserPlus className="mr-2" size={20} /> : <LogIn className="mr-2" size={20} />}
                                    {isSignUp ? "Create Account" : "Sign In Securely"}
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {isSignUp ? "Already have an account?" : "New to OCTA HR?"}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                className="ml-2 text-brand-yellow font-bold hover:underline"
                            >
                                {isSignUp ? "Sign In" : "Register Now"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLoginPage;
