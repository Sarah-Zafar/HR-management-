import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Clock, Plane, Calendar, Send, Building2, CheckSquare, X, Menu, LogOut, LayoutDashboard, DollarSign, Briefcase, Calendar as CalendarIcon
} from 'lucide-react';
import logoUrl from '../../assets/logo.png';

const RequestLeave = ({ onLogout, leaveRequests = [], setLeaveRequests, employeesData = [] }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
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

        const newReq = {
            id: Math.random().toString(36).substr(2, 9),
            employeeName: employeesData.length > 0 ? employeesData[0].name : 'Current Employee',
            leaveType,
            startDate,
            endDate,
            status: 'Pending'
        };

        if (setLeaveRequests) {
            setLeaveRequests([newReq, ...leaveRequests]);
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        setStartDate('');
        setEndDate('');
        setLeaveType('Sick Leave');
    };

    return (
        <div className="flex h-screen bg-brand-black dark:bg-gray-900 transition-colors font-sans overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Fixed Sidebar */}
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
                        <Link to="/employee/dashboard" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <LayoutDashboard className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>My Dashboard</span>
                        </Link>
                        <Link to="/employee/request-leave" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <Send className="mr-3" size={20} />
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
                            <Send className="text-brand-yellow mr-3" size={28} />
                            Request Leave
                        </h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-5xl mx-auto space-y-8 pb-10">
                        {/* Action Form / Context Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">

                            {/* 2. Leave Request Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
                                <h2 className="text-2xl font-black text-brand-black dark:text-white mb-6 relative z-10 flex items-center">
                                    <Plane className="text-brand-yellow mr-3" size={24} /> File Request
                                </h2>

                                {showSuccess && (
                                    <div className="bg-brand-green text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-between mb-4 border border-teal-600 animate-fade-in relative z-10">
                                        <span>Success! Request submitted to admin.</span>
                                        <button onClick={() => setShowSuccess(false)}><X size={16} /></button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitLeave} className="flex-1 flex flex-col space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Leave Type</label>
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
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Start Date</label>
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
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">End Date</label>
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
                                <h3 className="text-2xl font-black mb-6 relative z-10 border-b border-teal-700 pb-4">Guidelines & Policy</h3>
                                <ul className="space-y-6 relative z-10">
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-2 rounded-xl mr-4 mt-0.5"><CheckSquare size={16} /></div>
                                        <p className="font-medium text-white/90 leading-relaxed">All leave requests must be submitted at least <strong className="text-brand-yellow">48 hours</strong> prior to the requested start date for routine approvals.</p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-2 rounded-xl mr-4 mt-0.5"><CheckSquare size={16} /></div>
                                        <p className="font-medium text-white/90 leading-relaxed">Medical certificates are strictly required for sick leaves extending beyond 3 consecutive days securely uploaded.</p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-2 rounded-xl mr-4 mt-0.5"><CheckSquare size={16} /></div>
                                        <p className="font-medium text-white/90 leading-relaxed">Approval notifications will be sent directly to your registered work email upon management review.</p>
                                    </li>
                                </ul>
                            </div>

                        </div>

                        {/* Recent Requests Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up delay-100">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-brand-black dark:text-white flex items-center">
                                    <CheckSquare className="mr-3 text-brand-yellow" size={24} /> My Recent Requests
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                            <th className="py-4 px-6 font-bold">Type</th>
                                            <th className="py-4 px-6 font-bold">Duration</th>
                                            <th className="py-4 px-6 font-bold text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {leaveRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-gray-400 font-medium tracking-wide">
                                                    You don't have any recent leave requests.
                                                </td>
                                            </tr>
                                        ) : (
                                            leaveRequests.map(req => {
                                                let badgeClass = "bg-brand-yellow/20 text-yellow-700 dark:text-brand-yellow";
                                                if (req.status === "Approved") badgeClass = "bg-brand-green text-white";
                                                if (req.status === "Rejected") badgeClass = "bg-red-500 text-white";

                                                return (
                                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="py-4 px-6 font-bold text-brand-black dark:text-white">
                                                            {req.leaveType}
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium">
                                                            {req.startDate} to {req.endDate}
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${badgeClass}`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default RequestLeave;
