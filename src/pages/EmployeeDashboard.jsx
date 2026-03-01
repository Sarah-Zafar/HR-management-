import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { Clock, CheckSquare, Plane, DollarSign, Calendar, Send } from 'lucide-react';

const EmployeeDashboard = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const navigate = useNavigate();

    // Leave Form State
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    const handleSubmitLeave = (e) => {
        e.preventDefault();
        alert(`Leave Request Submitted!\nType: ${leaveType}\nFrom: ${startDate}\nTo: ${endDate}`);
        // Reset form
        setStartDate('');
        setEndDate('');
        setLeaveType('Sick Leave');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors font-sans overflow-hidden">
            <Sidebar
                role="employee"
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Header
                    role="employee"
                    isClockedIn={isClockedIn}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between animate-fade-in-up">
                            <div>
                                <h1 className="text-3xl font-extrabold text-brand-black dark:text-white tracking-tight">Welcome Back, Talha!</h1>
                                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 font-medium">Here's your performance snapshot.</p>
                            </div>

                            <div className="mt-6 sm:mt-0">
                                <button
                                    onClick={() => setIsClockedIn(!isClockedIn)}
                                    className={`flex items-center justify-center px-8 py-4 rounded-xl font-extrabold text-lg text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto overflow-hidden relative group ${isClockedIn
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-brand-green hover:bg-teal-700'
                                        }`}
                                >
                                    <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                    <Clock size={24} className={`mr-3 ${isClockedIn ? 'animate-pulse' : ''}`} />
                                    {isClockedIn ? 'Clock Out Now' : 'Clock In Now'}
                                </button>
                            </div>
                        </div>

                        {/* 1. Performance Overview Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {/* Accent explicitly forced to brand-green via borders and icons */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-brand-green flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <p className="font-bold text-gray-500 dark:text-gray-400">Hours Worked This Month</p>
                                    <div className="p-2 bg-brand-green/10 rounded-lg">
                                        <Clock className="text-brand-green" size={20} />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-brand-black dark:text-white mt-4">164 <span className="text-lg text-gray-400 font-bold">hrs</span></h3>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-brand-green flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <p className="font-bold text-gray-500 dark:text-gray-400">Overtime Hours</p>
                                    <div className="p-2 bg-brand-green/10 rounded-lg">
                                        <Clock className="text-brand-green" size={20} />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-brand-black dark:text-white mt-4">12 <span className="text-lg text-gray-400 font-bold">hrs</span></h3>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-brand-green flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <p className="font-bold text-gray-500 dark:text-gray-400 mb-4">Remaining Leave Balance</p>
                                    <div className="p-2 bg-brand-green/10 rounded-lg">
                                        <Plane className="text-brand-green" size={20} />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Sick</span>
                                        <span className="text-brand-green dark:text-brand-yellow">8 remaining</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Casual</span>
                                        <span className="text-brand-green dark:text-brand-yellow">5 remaining</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Annual</span>
                                        <span className="text-brand-green dark:text-brand-yellow">10 remaining</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mid Section Grid: Action Form / Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                            {/* 2. Leave Request Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
                                <h2 className="text-2xl font-black text-brand-black dark:text-white mb-6 relative z-10 flex items-center">
                                    <Plane className="text-brand-yellow mr-3" size={24} /> Request Leave
                                </h2>

                                <form onSubmit={handleSubmitLeave} className="flex-1 flex flex-col space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-widest">Leave Type</label>
                                        <select
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Sick Leave">Sick Leave</option>
                                            <option value="Casual Leave">Casual Leave</option>
                                            <option value="Annual Leave">Annual Leave</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-widest">Start Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all cursor-pointer"
                                                />
                                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-widest">End Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all cursor-pointer"
                                                />
                                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto">
                                        <button
                                            type="submit"
                                            className="w-full bg-brand-yellow hover:bg-yellow-400 text-brand-black font-extrabold text-lg flex items-center justify-center px-6 py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-yellow/20 hover:-translate-y-1 transition-all"
                                        >
                                            <Send size={20} className="mr-2" /> Submit Request
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Additional Info / Profile Context Area (Optional side-by-side filler) */}
                            <div className="bg-brand-green rounded-2xl shadow-xl p-8 flex flex-col justify-center relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                                <h3 className="text-2xl font-black mb-4 relative z-10">Quick Guidelines</h3>
                                <ul className="space-y-4 relative z-10">
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-1.5 rounded-full mr-3 mt-0.5"><CheckSquare size={14} /></div>
                                        <p className="font-medium text-white/90">All leave requests must be submitted at least 48 hours prior to the requested start date for routine approvals.</p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-1.5 rounded-full mr-3 mt-0.5"><CheckSquare size={14} /></div>
                                        <p className="font-medium text-white/90">Medical certificates are required for sick leaves extending beyond 3 consecutive days.</p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-1.5 rounded-full mr-3 mt-0.5"><CheckSquare size={14} /></div>
                                        <p className="font-medium text-white/90">Approval notifications will be sent directly to your registered work email.</p>
                                    </li>
                                </ul>
                            </div>

                        </div>

                        {/* 3. Events & Meetings Calendar Row */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-brand-black dark:text-white flex items-center">
                                    <Calendar className="text-brand-green dark:text-brand-yellow mr-3" size={24} /> Events & Meetings
                                </h2>
                                <span className="bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest hidden sm:block">Full Schedule</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-50 dark:divide-gray-700">

                                {/* Yellow Meeting */}
                                <div className="p-6 sm:p-8 hover:bg-brand-yellow/5 dark:hover:bg-brand-yellow/10 transition-colors cursor-pointer group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-brand-yellow px-3 py-1 rounded-md">
                                            <span className="text-xs font-black text-brand-black uppercase tracking-widest">Meeting</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400">Oct 18</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2 group-hover:text-brand-yellow transition-colors">Team Standup</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-4">Monthly review of all active finance modules and FRS performance metrics.</p>
                                    <div className="mt-auto flex items-center text-sm font-bold text-gray-500">
                                        <Clock size={16} className="mr-2" /> 09:00 AM - 10:30 AM
                                    </div>
                                </div>

                                {/* Teal Holiday */}
                                <div className="p-6 sm:p-8 hover:bg-brand-green/5 dark:hover:bg-brand-green/10 transition-colors cursor-pointer group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-brand-green dark:bg-teal-600 px-3 py-1 rounded-md">
                                            <span className="text-xs font-black text-white uppercase tracking-widest">Holiday</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400">Oct 25</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2 group-hover:text-brand-green dark:group-hover:text-teal-400 transition-colors">Company Retreat</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-4">Annual organization-wide wellness retreat. All operations suspended.</p>
                                    <div className="mt-auto flex items-center text-sm font-bold text-gray-500">
                                        <Clock size={16} className="mr-2" /> All Day Event
                                    </div>
                                </div>

                                {/* Red Deadline */}
                                <div className="p-6 sm:p-8 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors cursor-pointer group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded-md border border-red-200 dark:border-red-800">
                                            <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Deadline</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400">Oct 31</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-black dark:text-white mb-2 group-hover:text-red-500 transition-colors">Q3 Tax Filings</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-4">Final submission date for all corporate quarter 3 documentation.</p>
                                    <div className="mt-auto flex items-center text-sm font-bold text-gray-500">
                                        <Clock size={16} className="mr-2" /> Closes at 05:00 PM
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
