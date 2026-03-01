import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialEmployees } from '../../data/employees';
import logoUrl from '../../assets/logo.png';
import {
    Users, Plane, CheckSquare, LayoutDashboard, Search, Bell, Menu, X, LogOut,
    Download, Calendar, AlertCircle
} from 'lucide-react';

const LeaveDashboard = ({ onLogout, leaveRequests = [], setLeaveRequests, employeesData = [], setEmployeesData }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modals state
    const [showOnLeaveModal, setShowOnLeaveModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);

    const navigate = useNavigate();

    const totalEmployees = employeesData.length;
    // Just looking for logic where sick/casual/annual taken > 0 for On Leave (mocked visualization for prompt requirement)
    const onLeaveToday = employeesData.filter(emp => emp.sick.taken > 0 || emp.casual.taken > 0 || emp.annual.taken > 0).length;

    // Dynamically calculate pending requests from the global store
    const pendingRequests = leaveRequests.filter(req => req.status === 'Pending').length;

    const handleDownloadReport = () => {
        // Step 1: Create CSV headers
        const headers = ['ID', 'Name', 'Role', 'Email', 'Sick Leave (Taken/Total)', 'Casual Leave (Taken/Total)', 'Annual Leave (Taken/Total)'];

        // Step 2: Create CSV rows
        const csvRows = employeesData.map(emp => {
            return [
                emp.id,
                `"${emp.name}"`,
                `"${emp.role}"`,
                `"${emp.email}"`,
                `"${emp.sick.taken}/${emp.sick.total}"`,
                `"${emp.casual.taken}/${emp.casual.total}"`,
                `"${emp.annual.taken}/${emp.annual.total}"`
            ].join(',');
        });

        // Step 3: Combine and create Blob
        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

        // Step 4: Download via dummy link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "monthly_leave_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleApprove = (reqId) => {
        const reqToApprove = leaveRequests.find(r => r.id === reqId);
        if (!reqToApprove) return;

        // 1. Mark request as Approved
        const updatedReqs = leaveRequests.map(req =>
            req.id === reqId ? { ...req, status: 'Approved' } : req
        );
        setLeaveRequests(updatedReqs);

        // 2. Deduct logically from employees remaining balance 
        // Note: our global state tracks "taken" natively, so we ADD to "taken".
        setEmployeesData(prevData => {
            return prevData.map(emp => {
                if (emp.name === reqToApprove.employeeName) {
                    const clonedEmp = { ...emp };
                    if (reqToApprove.leaveType === 'Sick Leave') { clonedEmp.sick.taken += 1; }
                    else if (reqToApprove.leaveType === 'Casual Leave') { clonedEmp.casual.taken += 1; }
                    else if (reqToApprove.leaveType === 'Annual Leave') { clonedEmp.annual.taken += 1; }
                    return clonedEmp;
                }
                return emp;
            });
        });
    };

    const handleReject = (reqId) => {
        const updatedReqs = leaveRequests.map(req =>
            req.id === reqId ? { ...req, status: 'Rejected' } : req
        );
        setLeaveRequests(updatedReqs);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">

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
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <LayoutDashboard className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Dashboard</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/directory'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Users className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Employee Directory</span>
                        </a>
                        <a href="#" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <Plane className="mr-3" size={20} />
                            <span>Leave Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <CheckSquare className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Attendance</span>
                        </a>
                    </nav>
                </div>

                <div className="p-4 border-t border-teal-800">
                    <button onClick={() => { if (onLogout) onLogout(); navigate('/'); }} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-colors group">
                        <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Header */}
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-20">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 mr-4 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-black dark:text-white tracking-tight flex items-center shadow-sm">
                            <Plane className="text-brand-yellow mr-3" size={28} />
                            Leave Management
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={handleDownloadReport} className="hidden sm:flex items-center px-4 py-2.5 bg-brand-green hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg hover:shadow-brand-green/20 transition-all border border-teal-600">
                            <Download size={18} className="mr-2" /> Download Monthly Report
                        </button>
                        <button onClick={handleDownloadReport} className="sm:hidden p-2 bg-brand-green text-white rounded-lg shadow-md">
                            <Download size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

                        {/* Top Statistics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="bg-brand-yellow rounded-2xl p-6 shadow-xl flex items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                                    <Users size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-green font-extrabold uppercase tracking-widest text-sm mb-1 opacity-80">Total Employees</p>
                                    <h3 className="text-5xl font-black text-brand-black">{totalEmployees}</h3>
                                </div>
                            </div>

                            <div
                                onClick={() => setShowOnLeaveModal(true)}
                                className="bg-brand-yellow rounded-2xl p-6 shadow-xl flex items-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                                    <Plane size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-green font-extrabold uppercase tracking-widest text-sm mb-1 opacity-80">On Leave Today</p>
                                    <h3 className="text-5xl font-black text-brand-black">{onLeaveToday}</h3>
                                </div>
                            </div>

                            <div
                                onClick={() => setShowPendingModal(true)}
                                className="bg-brand-yellow rounded-2xl p-6 shadow-xl flex items-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-green font-extrabold uppercase tracking-widest text-sm mb-1 opacity-80">Pending Requests</p>
                                    <h3 className="text-5xl font-black text-brand-black">{pendingRequests}</h3>
                                </div>
                            </div>

                        </div>

                        {/* Leave Tracking Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-brand-green text-brand-yellow text-sm uppercase tracking-widest border-b border-teal-900">
                                            <th className="py-4 px-6 font-extrabold whitespace-nowrap">Employee</th>
                                            <th className="py-4 px-6 font-extrabold whitespace-nowrap">Role</th>
                                            <th className="py-4 px-6 font-extrabold whitespace-nowrap w-48">Sick Leave</th>
                                            <th className="py-4 px-6 font-extrabold whitespace-nowrap w-48">Casual Leave</th>
                                            <th className="py-4 px-6 font-extrabold whitespace-nowrap w-48">Annual Leave</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {employeesData.map((emp) => (
                                            <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="py-4 px-6 text-brand-black dark:text-white font-bold whitespace-nowrap">
                                                    {emp.name}
                                                </td>
                                                <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                                                    {emp.role}
                                                </td>

                                                {/* Sick Leave Cell */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                                                            <span>{emp.sick.taken} / {emp.sick.total}</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-brand-green rounded-full"
                                                                style={{ width: `${(emp.sick.taken / emp.sick.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Casual Leave Cell */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                                                            <span>{emp.casual.taken} / {emp.casual.total}</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-brand-green rounded-full"
                                                                style={{ width: `${(emp.casual.taken / emp.casual.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Annual Leave Cell */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                                                            <span>{emp.annual.taken} / {emp.annual.total}</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-brand-green rounded-full"
                                                                style={{ width: `${(emp.annual.taken / emp.annual.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* New Leave Requests Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-brand-black dark:text-white flex items-center">
                                    <AlertCircle className="mr-3 text-brand-yellow" size={24} /> New Leave Requests
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                            <th className="py-4 px-6 font-bold">Employee</th>
                                            <th className="py-4 px-6 font-bold">Type</th>
                                            <th className="py-4 px-6 font-bold">Duration</th>
                                            <th className="py-4 px-6 font-bold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {leaveRequests.filter(r => r.status === 'Pending').length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-400 font-medium">No pending requests at this time.</td>
                                            </tr>
                                        ) : (
                                            leaveRequests.filter(r => r.status === 'Pending').map(req => (
                                                <tr key={req.id} className="hover:bg-brand-yellow/5 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-brand-black dark:text-white">{req.employeeName}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-bold rounded-full">{req.leaveType}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">{req.startDate} to {req.endDate}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => handleApprove(req.id)} className="bg-brand-green hover:bg-teal-700 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded shadow transition-all">
                                                                Approve
                                                            </button>
                                                            <button onClick={() => handleReject(req.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded shadow transition-all">
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modals placed outside main document flow */}
                        {showOnLeaveModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                                        <h3 className="text-xl font-extrabold text-brand-black dark:text-white flex items-center">
                                            <Plane className="mr-3 text-brand-green dark:text-brand-yellow" size={24} />
                                            On Leave Today
                                        </h3>
                                        <button onClick={() => setShowOnLeaveModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <ul className="space-y-4">
                                            {/* Since we mocked index 0 as on leave */}
                                            <li className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                                                        {employeesData[0].name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-brand-black dark:text-white">{employeesData[0].name}</p>
                                                        <p className="text-sm font-medium text-gray-500">{employeesData[0].role}</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full tracking-wider">Sick Leave</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
                                        <button onClick={() => setShowOnLeaveModal(false)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-brand-black dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showPendingModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                                        <h3 className="text-xl font-extrabold text-brand-black dark:text-white flex items-center">
                                            <AlertCircle className="mr-3 text-brand-green dark:text-brand-yellow" size={24} />
                                            Pending Requests
                                        </h3>
                                        <button onClick={() => setShowPendingModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                            <CheckSquare size={32} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-brand-black dark:text-white mb-1">Status Notification</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">There are currently {pendingRequests} pending leave requests requiring your review.</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
                                        <button onClick={() => setShowPendingModal(false)} className="px-5 py-2.5 bg-brand-yellow text-brand-black font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-sm">
                                            Acknowledge
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default LeaveDashboard;
