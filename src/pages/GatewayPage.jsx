import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ArrowRight } from 'lucide-react';
import logoUrl from '../assets/logo.png';

const GatewayPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-green flex flex-col items-center justify-center p-6 transition-colors">
            <div className="mb-12 text-center animate-fade-in-up">
                {/* We reference the imported logoUrl */}
                <img src={logoUrl} alt="Octa Accountants Logo" className="w-64 max-w-full mx-auto drop-shadow-md mb-6 hover:scale-105 transition-transform duration-300" />
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">HR Management System</h1>
                <p className="text-gray-200 mt-3 text-lg font-medium opacity-90">Select your portal to continue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Admin Card */}
                <div
                    onClick={() => navigate('/admin/login')}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-brand-green p-8 cursor-pointer transition-all transform hover:-translate-y-2 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-green transition-colors duration-300 shadow-sm">
                            <Building2 className="text-brand-green group-hover:text-brand-yellow transition-colors duration-300" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-3 tracking-tight">Admin Portal</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Manage organization records, process payroll, approve leave requests, and oversee employee directories seamlessly.
                        </p>
                    </div>
                    <div className="flex items-center text-brand-green font-bold text-lg">
                        Login as Admin <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={20} />
                    </div>
                </div>

                {/* Employee Card */}
                <div
                    onClick={() => navigate('/employee/login')}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-brand-green p-8 cursor-pointer transition-all transform hover:-translate-y-2 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-green transition-colors duration-300 shadow-sm">
                            <Users className="text-brand-green group-hover:text-brand-yellow transition-colors duration-300" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-black dark:text-white mb-3 tracking-tight">Employee Portal</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Access your personal records, check leave balances, and view paystubs via self-service.
                        </p>
                    </div>
                    <div className="flex items-center text-brand-green font-bold text-lg">
                        Login as Employee <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={20} />
                    </div>
                </div>
            </div>

            <div className="mt-16 text-white/50 text-sm font-medium tracking-wide">
                &copy; {new Date().getFullYear()} Octa Accountants. All rights reserved.
            </div>
        </div>
    );
};

export default GatewayPage;
