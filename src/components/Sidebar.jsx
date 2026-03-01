import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    Plane,
    CheckSquare,
    LayoutDashboard,
    LogOut,
    X,
    Briefcase,
    DollarSign
} from 'lucide-react';

const Sidebar = ({ role, isOpen, onToggle, onLogout }) => {
    const isAdmin = role === 'admin';

    const activeColorClass = isAdmin ? 'border-brand-yellow group-hover:bg-brand-green' : 'border-brand-yellow group-hover:bg-brand-black/20';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onToggle}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-black flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 shadow-xl lg:shadow-none'}`}>

                {/* Branding header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-white/5">
                    <div className="bg-white p-2 rounded-lg flex items-center justify-center w-full shadow-inner">
                        <img src="/src/assets/logo.png" alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                    <button
                        onClick={onToggle}
                        className="lg:hidden text-gray-400 hover:text-white ml-2 transition-colors p-1"
                        aria-label="Close sidebar"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6">
                    <div className="px-6 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest select-none">
                        {isAdmin ? 'Management' : 'Self-Service'}
                    </div>

                    <nav className="space-y-1 px-3">
                        <NavLink
                            to={isAdmin ? "/admin/dashboard" : "/employee/dashboard"}
                            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? (isAdmin ? 'bg-brand-green text-white border-brand-yellow' : 'bg-brand-black/20 text-white border-brand-yellow') : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}
                        >
                            <LayoutDashboard className="mr-3 group-[.active]:text-brand-yellow" size={20} />
                            <span className="font-medium">Dashboard</span>
                        </NavLink>

                        {isAdmin ? (
                            // Admin Links
                            <>
                                <NavLink to="/admin/directory" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? 'bg-brand-green text-white border-brand-yellow' : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}>
                                    <Users className="mr-3 group-hover:text-brand-yellow transition-colors group-[.active]:text-brand-yellow" size={20} />
                                    <span className="font-medium">Employee Directory</span>
                                </NavLink>
                                <NavLink to="/admin/leave" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? 'bg-brand-green text-white border-brand-yellow' : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}>
                                    <Plane className="mr-3 group-hover:text-brand-yellow transition-colors group-[.active]:text-brand-yellow" size={20} />
                                    <span className="font-medium">Leave Dashboard</span>
                                </NavLink>
                                <NavLink to="/admin/attendance" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? 'bg-brand-green text-white border-brand-yellow' : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}>
                                    <CheckSquare className="mr-3 group-hover:text-brand-yellow transition-colors group-[.active]:text-brand-yellow" size={20} />
                                    <span className="font-medium">Attendance Records</span>
                                </NavLink>
                            </>
                        ) : (
                            // Employee Links
                            <>
                                <NavLink to="/employee/schedule" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? 'bg-brand-black/20 text-white border-brand-yellow' : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}>
                                    <Briefcase className="mr-3 group-hover:text-brand-yellow transition-colors group-[.active]:text-brand-yellow" size={20} />
                                    <span className="font-medium">My Schedule</span>
                                </NavLink>
                                <NavLink to="/employee/timeoff" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? 'bg-brand-black/20 text-white border-brand-yellow' : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}>
                                    <Plane className="mr-3 group-hover:text-brand-yellow transition-colors group-[.active]:text-brand-yellow" size={20} />
                                    <span className="font-medium">My Time Off</span>
                                </NavLink>
                                <NavLink to="/employee/paystubs" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg border-l-4 transition-all group ${isActive ? 'bg-brand-black/20 text-white border-brand-yellow' : `text-gray-400 border-transparent hover:text-white hover:${activeColorClass}`}`}>
                                    <DollarSign className="mr-3 group-hover:text-brand-yellow transition-colors group-[.active]:text-brand-yellow" size={20} />
                                    <span className="font-medium">Paystubs</span>
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>

                {/* Logout Footer */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
                    >
                        <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
