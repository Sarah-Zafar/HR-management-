import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import { initialEmployees } from '../../data/employees';
import logoUrl from '../../assets/logo.png';
import {
    Users, Building2, Plane, CheckSquare,
    LayoutDashboard, Megaphone, Calendar, Search, Bell, Menu, X, LogOut
} from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Fixed Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-teal-800 bg-white/10">
                    <div className="bg-white p-2 rounded-lg flex items-center justify-center w-full shadow-inner">
                        <img src={logoUrl} alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-200 hover:text-white ml-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6">
                    <nav className="space-y-2 px-4">
                        <a href="#" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <LayoutDashboard className="mr-3" size={20} />
                            <span>Dashboard</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/directory'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Users className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Employee Directory</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/leave'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Plane className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Leave Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <CheckSquare className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Attendance</span>
                        </a>
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-20">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 mr-4 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:flex items-center max-w-md w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 border-2 border-transparent focus-within:border-brand-green dark:focus-within:border-brand-yellow transition-all">
                            <Search className="text-gray-400 mr-2" size={20} />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                className="bg-transparent border-none outline-none w-full text-brand-black dark:text-white placeholder-gray-400"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-400 hover:text-brand-green dark:hover:text-brand-yellow transition-colors group">
                            <Bell size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 shadow-sm animate-pulse"></span>
                        </button>
                        <div className="flex items-center cursor-pointer group">
                            <div className="h-10 w-10 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center font-bold text-lg shadow-sm border border-yellow-500 group-hover:scale-105 transition-transform">A</div>
                            <div className="ml-3 hidden md:block">
                                <p className="text-sm font-bold text-brand-black dark:text-white group-hover:text-brand-green dark:group-hover:text-brand-yellow transition-colors">Admin User</p>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Management</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">

                        <div className="animate-fade-in-up">
                            <h1 className="text-3xl font-extrabold text-brand-black dark:text-white tracking-tight">Organization Overview</h1>
                            <p className="mt-2 text-base text-gray-500 dark:text-gray-400 font-medium">Global metrics and recent activity across all departments.</p>
                        </div>

                        {/* Top Section - Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                            <StatCard title="Total Employees" value={initialEmployees.length.toString()} icon={Users} theme="green" />
                            <StatCard title="Teams" value="8" icon={Building2} theme="green" />
                            <StatCard title="On Leave" value="12" icon={Plane} theme="green" />
                            <StatCard title="Present Today" value="130" icon={CheckSquare} theme="green" />
                        </div>

                        {/* Bottom Section - Informational */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Column: Announcements */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <h2 className="text-xl font-bold text-brand-black dark:text-white flex items-center tracking-tight">
                                        <Megaphone className="mr-3 text-brand-green dark:text-brand-yellow" size={24} /> Company Announcements
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group">
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-xs font-bold rounded mb-2 uppercase tracking-widest shadow-sm">Policy</span>
                                        <h3 className="font-bold text-brand-black dark:text-white text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">New Policy Update</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">Please review the updated remote work guidelines effective next month inside the HR portal.</p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer group">
                                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 text-xs font-bold rounded mb-2 uppercase tracking-widest shadow-sm">Facility</span>
                                        <h3 className="font-bold text-brand-black dark:text-white text-lg group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">Office Maintenance</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">The main HVAC system will be undergoing scheduled maintenance this weekend. The physical office will be closed.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Upcoming Events */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <h2 className="text-xl font-bold text-brand-black dark:text-white flex items-center tracking-tight">
                                        <Calendar className="mr-3 text-brand-green dark:text-brand-yellow" size={24} /> Upcoming Events
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Event 1 */}
                                    <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer group">
                                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 rounded-xl p-3 min-w-[76px] text-center shadow-sm group-hover:border-brand-green transition-colors">
                                            <span className="block text-2xl font-extrabold text-brand-green dark:text-brand-yellow leading-none mb-1">12</span>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Oct</span>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="font-bold text-brand-black dark:text-white text-lg group-hover:text-brand-green dark:group-hover:text-brand-yellow transition-colors">Team Meeting</h3>
                                            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">10:00 AM - All Staff</p>
                                        </div>
                                    </div>

                                    {/* Event 2 */}
                                    <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer group">
                                        <div className="bg-white dark:bg-gray-800 border-2 border-brand-yellow/30 dark:border-brand-yellow/20 rounded-xl p-3 min-w-[76px] text-center shadow-sm group-hover:border-brand-yellow transition-colors">
                                            <span className="block text-2xl font-extrabold text-brand-green dark:text-brand-yellow leading-none mb-1">15</span>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Oct</span>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="font-bold text-brand-black dark:text-white text-lg group-hover:text-brand-yellow transition-colors">Project Deadline</h3>
                                            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider text-orange-600 dark:text-orange-400">Q3 Financials Due</p>
                                        </div>
                                    </div>

                                    {/* Event 3 */}
                                    <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer group">
                                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 rounded-xl p-3 min-w-[76px] text-center shadow-sm group-hover:border-brand-green transition-colors">
                                            <span className="block text-2xl font-extrabold text-brand-green dark:text-brand-yellow leading-none mb-1">20</span>
                                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Oct</span>
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="font-bold text-brand-black dark:text-white text-lg group-hover:text-brand-green dark:group-hover:text-brand-yellow transition-colors">Client Visit</h3>
                                            <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">2:00 PM - Boardroom A</p>
                                        </div>
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

export default AdminDashboard;
