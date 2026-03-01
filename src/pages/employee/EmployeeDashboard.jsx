import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
    Clock, Plane, Calendar, Send, Building2, CheckSquare, X, Menu, LogOut, LayoutDashboard, DollarSign, Briefcase, Calendar as CalendarIcon
} from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { getUpcomingEvents } from '../../utils/calendarEvents';

const EmployeeDashboard = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const upcomingEvents = getUpcomingEvents(3);

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
        setStartDate('');
        setEndDate('');
        setLeaveType('Sick Leave');
    };

    return (
        <div className="flex h-screen bg-brand-black dark:bg-gray-900 transition-colors font-sans overflow-hidden">

            {/* Mobile Sidebar Overlay (Local implementation if strictly preferred over shared component logic) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Local Fixed Sidebar for 'Employee' side to match strict styling requests */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green flex flex-col transition-transform duration-300 ease-in-out border-r border-teal-900 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-teal-800 bg-white/5">
                    <div className="bg-white p-2 rounded-lg flex items-center justify-center w-full shadow-inner">
                        <img src={logoUrl} alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-200 hover:text-white ml-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6">
                    <nav className="space-y-2 px-4">
                        <Link to="/employee/dashboard" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <LayoutDashboard className="mr-3" size={20} />
                            <span>My Dashboard</span>
                        </Link>
                        <Link to="/employee/request-leave" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Send className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Request Leave</span>
                        </Link>
                        <Link to="/employee/calendar" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <CalendarIcon className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">My Calendar</span>
                        </Link>
                        <Link to="#" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Plane className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">My Time Off</span>
                        </Link>
                        <Link to="#" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <DollarSign className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Paystubs</span>
                        </Link>
                    </nav>
                </div>

                <div className="p-4 border-t border-teal-800">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-colors group">
                        <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* Header */}
                <header className="h-20 bg-brand-black border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-20">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 mr-4 rounded-md text-gray-400 hover:bg-gray-800 lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center shadow-sm">
                            <LayoutDashboard className="text-brand-yellow mr-3" size={28} />
                            Employee Portal
                        </h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">

                        {/* 1. Performance Overview Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up">

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-brand-green flex flex-col justify-between group hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between">
                                    <p className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs mb-2">Hours Worked This Month</p>
                                    <div className="p-2.5 bg-brand-green/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <Clock className="text-brand-green" size={22} />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-brand-black dark:text-white mt-4">164 <span className="text-lg text-gray-400 font-bold">hrs</span></h3>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-brand-green flex flex-col justify-between group hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between">
                                    <p className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs mb-2">Overtime Hours</p>
                                    <div className="p-2.5 bg-brand-green/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <Clock className="text-brand-green" size={22} />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-brand-black dark:text-white mt-4">12 <span className="text-lg text-gray-400 font-bold">hrs</span></h3>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-brand-green flex flex-col justify-between group hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <p className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs">Remaining Leave Balance</p>
                                    <div className="p-2.5 bg-brand-green/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <Plane className="text-brand-green" size={22} />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Sick</span>
                                        <span className="text-brand-green dark:text-brand-yellow bg-brand-green/10 px-2 py-0.5 rounded">8</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Casual</span>
                                        <span className="text-brand-green dark:text-brand-yellow bg-brand-green/10 px-2 py-0.5 rounded">5</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Annual</span>
                                        <span className="text-brand-green dark:text-brand-yellow bg-brand-green/10 px-2 py-0.5 rounded">10</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Removed: Request Leave is now a separate page accessible via Sidebar */}


                        {/* 3. Events & Meetings Calendar Row */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl sm:text-2xl font-black text-brand-black dark:text-white flex items-center">
                                    <Calendar className="text-brand-green dark:text-brand-yellow mr-3" size={24} /> Events & Meetings
                                </h2>
                                <span className="bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest hidden sm:block">Full Calendar</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-50 dark:divide-gray-700">

                                {upcomingEvents.map((evt, idx) => {
                                    let badgeColor = "bg-brand-yellow";
                                    let badgeText = "text-brand-black";
                                    let borderHover = "hover:border-l-brand-yellow";
                                    let textHover = "group-hover:text-brand-yellow";
                                    let containerBgHover = "hover:bg-brand-yellow/5 dark:hover:bg-brand-yellow/10";

                                    if (evt.type === 'holiday') {
                                        badgeColor = "bg-brand-green dark:bg-teal-600";
                                        badgeText = "text-white";
                                        borderHover = "hover:border-l-brand-green";
                                        textHover = "group-hover:text-brand-green dark:group-hover:text-teal-400";
                                        containerBgHover = "hover:bg-brand-green/5 dark:hover:bg-brand-green/10";
                                    } else if (evt.type === 'deadline') {
                                        badgeColor = "bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800";
                                        badgeText = "text-red-600 dark:text-red-400";
                                        borderHover = "hover:border-l-red-500";
                                        textHover = "group-hover:text-red-500";
                                        containerBgHover = "hover:bg-red-500/5 dark:hover:bg-red-500/10";
                                    }

                                    return (
                                        <div key={idx} className={`p-8 transition-colors cursor-pointer group flex flex-col h-full border-l-4 border-l-transparent ${containerBgHover} ${borderHover}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`${badgeColor} px-3 py-1 rounded-md shadow-sm`}>
                                                    <span className={`text-xs font-black uppercase tracking-widest ${badgeText}`}>{evt.type}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-400">{evt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <h3 className={`text-xl font-bold text-brand-black dark:text-white mb-2 transition-colors ${textHover}`}>{evt.title}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6 leading-relaxed">{evt.description}</p>
                                            <div className="mt-auto flex items-center text-sm font-bold text-gray-500">
                                                <Clock size={16} className="mr-2 border-transparent" /> {evt.time}
                                            </div>
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
