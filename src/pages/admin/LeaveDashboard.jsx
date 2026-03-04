import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import {
    Users, Plane, LayoutDashboard, Menu, X, LogOut, Network, Clock, Download, Plus, CheckCircle, AlertCircle, Trash2, Calendar, Edit2, DollarSign, CheckSquare
} from 'lucide-react';
const LeaveDashboard = ({ onLogout, leaveRequests = [], setLeaveRequests, employeesData = [], setEmployeesData, companyHolidays = [], setCompanyHolidays }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [holidayTitle, setHolidayTitle] = useState('');
    const [holidayDate, setHolidayDate] = useState('');

    // Modals state
    const [showOnLeaveModal, setShowOnLeaveModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeesData[0]?.id || '');

    const navigate = useNavigate();

    const totalEmployees = (employeesData || []).length;
    // Calculate actual people on leave based on approved requests covering today's date
    const todayStr = new Date().toISOString().split('T')[0];
    const onLeaveToday = (leaveRequests || []).filter(req =>
        req?.status === 'Approved' &&
        req?.startDate && req?.endDate &&
        todayStr >= req.startDate &&
        todayStr <= req.endDate
    ).length;

    // Filter for approved today (mocking by just showing total approved for now or adding a session flag)
    const approvedTotal = (leaveRequests || []).filter(req => req?.status === 'Approved').length;

    // Selected Employee Quota
    const selectedEmp = (employeesData || []).find(e => e?.id === selectedEmployeeId) || (employeesData || [])[0];
    const remainingQuota = selectedEmp?.remainingQuota || 0;

    // Dynamically calculate pending requests from the global store
    const pendingRequests = (leaveRequests || []).filter(req => req?.status === 'Pending').length;

    const handleDownloadReport = () => {
        // ... (existing download logic)
    };

    // Helper: Calculate workdays excluding weekends
    const getWorkdaysCount = (start, end) => {
        if (!start || !end) return 0;
        let count = 0;
        let curr = new Date(start);
        let last = new Date(end);
        while (curr <= last) {
            const day = curr.getDay();
            if (day !== 0 && day !== 6) count++;
            curr.setDate(curr.getDate() + 1);
        }
        return count;
    };

    const handleApprove = (reqId) => {
        const reqToApprove = leaveRequests.find(r => r.id === reqId);
        if (!reqToApprove) return;

        const emp = employeesData.find(e => e.name === reqToApprove.employeeName);
        if (emp) {
            const daysToDeduct = getWorkdaysCount(reqToApprove.startDate, reqToApprove.endDate);

            if (emp.remainingQuota < daysToDeduct) {
                setToast({ message: "Insufficient leave balance.", type: 'error' });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            const category = reqToApprove.leaveType === 'Sick Leave' ? 'sick' : reqToApprove.leaveType === 'Casual Leave' ? 'casual' : 'annual';

            // 1. Update User Quota Local
            setEmployeesData(prev => prev.map(e => e.id === emp.id ? {
                ...e,
                remainingQuota: e.remainingQuota - daysToDeduct,
                [category]: { ...e[category], taken: (e[category]?.taken || 0) + daysToDeduct }
            } : e));

            // 2. Update Request Status Local
            setLeaveRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r));

            setToast({ message: "Leave approved successfully!" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleReject = (reqId) => {
        setLeaveRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Rejected' } : r));
    };

    const handleAddHoliday = (e) => {
        e.preventDefault();
        if (!holidayTitle || !holidayDate) return;

        const newHoliday = {
            id: Date.now(),
            title: holidayTitle,
            date: holidayDate,
            type: 'holiday'
        };
        setCompanyHolidays(prev => [...prev, newHoliday]);
        setHolidayTitle('');
        setHolidayDate('');
    };

    const handleDeleteHoliday = (id) => {
        setCompanyHolidays(prev => prev.filter(h => h.id !== id));
    };

    const toggleLeave = (empId, leaveCategory, boxIndex, currentTaken) => {
        const newTaken = (boxIndex < currentTaken) ? boxIndex : boxIndex + 1;
        setEmployeesData(prev => prev.map(e => e.id === empId ? {
            ...e,
            [leaveCategory]: { ...e[leaveCategory], taken: newTaken }
        } : e));
    };

    const renderAdminLeaveBoxes = (empId, category, quota, taken, fillClass) => {
        const boxes = [];
        for (let i = 0; i < quota; i++) {
            const isFilled = i < taken;
            boxes.push(
                <div
                    key={i}
                    onClick={() => toggleLeave(empId, category, i, taken)}
                    className={`w-3 h-3 rounded-[3px] cursor-pointer transition-colors ${isFilled
                        ? `${fillClass} shadow-sm`
                        : 'border border-gray-400 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                        } `}
                ></div>
            );
        }
        return <div className="flex flex-wrap gap-1 mt-1">{boxes}</div>;
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
            {toast && (
                <div className={`fixed top-6 right-6 z-[110] px-6 py-4 rounded-2xl shadow-2xl ${toast.type === 'error' ? 'bg-red-500' : 'bg-brand-green'} text-white flex items-center animate-fade-in-right`}>
                    {toast.type === 'error' ? <AlertCircle className="mr-3 text-white" size={20} /> : <CheckCircle className="mr-3 text-brand-yellow" size={20} />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Fixed Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green flex flex-col transition-transform duration-300 ease-in-out border-r border-teal-900 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}>
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
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/leave'); }} className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <Plane className="mr-3" size={20} />
                            <span>Leave Dashboard</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/chart'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Network className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Chart</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/attendance'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Clock className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Attendance</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/payroll'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <DollarSign className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Payroll Overview</span>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div className="bg-brand-yellow rounded-2xl p-6 shadow-xl flex items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-green font-extrabold uppercase tracking-widest text-[10px] mb-1 opacity-80">Total Pending</p>
                                    <h3 className="text-4xl font-black text-brand-black">{pendingRequests}</h3>
                                </div>
                            </div>

                            <div className="bg-brand-yellow rounded-2xl p-6 shadow-xl flex items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-green font-extrabold uppercase tracking-widest text-[10px] mb-1 opacity-80">Approved Today</p>
                                    <h3 className="text-4xl font-black text-brand-black">{approvedTotal}</h3>
                                </div>
                            </div>

                            <div className="bg-brand-green text-white rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform border border-teal-800">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform text-white">
                                    <Calendar size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-yellow font-extrabold uppercase tracking-widest text-[10px] mb-1 opacity-80">Remaining Quota</p>
                                    <h3 className="text-4xl font-black text-white">
                                        <span className="text-brand-yellow">{remainingQuota}</span>
                                        <span className="text-xs font-bold opacity-60 ml-2">Days Left</span>
                                    </h3>

                                    <select
                                        value={selectedEmployeeId}
                                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        className="mt-2 w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[10px] font-bold text-white outline-none focus:border-brand-yellow transition-all cursor-pointer"
                                    >
                                        {employeesData.map(e => (
                                            <option key={e.id} value={e.id} className="text-brand-black">{e.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-brand-black text-white rounded-2xl p-6 shadow-2xl flex items-center relative overflow-hidden group hover:-translate-y-1 transition-all border border-gray-800">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform text-brand-yellow">
                                    <DollarSign size={100} />
                                </div>
                                <div className="relative z-10 w-full">
                                    <p className="text-brand-yellow font-extrabold uppercase tracking-widest text-[10px] mb-1">Payroll Impact</p>
                                    <h3 className="text-4xl font-black text-white">
                                        {leaveRequests.filter(req =>
                                            req.status === 'Approved' &&
                                            req.startDate.startsWith('2026-03')
                                        ).length}
                                        <span className="text-sm font-bold text-gray-500 ml-2 uppercase">Deductions</span>
                                    </h3>
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
                                        {(employeesData || []).map((emp) => (
                                            <tr key={emp?.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="py-4 px-6 text-brand-black dark:text-white font-bold whitespace-nowrap">
                                                    {emp?.name || 'Unknown'}
                                                </td>
                                                <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                                                    {emp?.role || 'Personnel'}
                                                </td>

                                                {/* Sick Leave Cell */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                            <span>{emp?.sick?.taken || 0} / {emp?.sick?.total || 0}</span>
                                                        </div>
                                                        {renderAdminLeaveBoxes(emp?.id, 'sick', emp?.sick?.total || 0, emp?.sick?.taken || 0, 'bg-amber-500')}
                                                    </div>
                                                </td>

                                                {/* Casual Leave Cell */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                            <span>{emp?.casual?.taken || 0} / {emp?.casual?.total || 0}</span>
                                                        </div>
                                                        {renderAdminLeaveBoxes(emp?.id, 'casual', emp?.casual?.total || 0, emp?.casual?.taken || 0, 'bg-blue-500')}
                                                    </div>
                                                </td>

                                                {/* Annual Leave Cell */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                            <span>{emp?.annual?.taken || 0} / {emp?.annual?.total || 0}</span>
                                                        </div>
                                                        {renderAdminLeaveBoxes(emp?.id, 'annual', emp?.annual?.total || 0, emp?.annual?.taken || 0, 'bg-brand-green')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Company Holidays Management Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up delay-100 mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                                <h3 className="text-xl font-bold text-brand-black dark:text-white mb-6 flex items-center">
                                    <Calendar className="text-brand-yellow mr-3" size={24} /> Post Public Holiday
                                </h3>
                                <form onSubmit={handleAddHoliday} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Holiday Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Independence Day"
                                            value={holidayTitle}
                                            onChange={(e) => setHolidayTitle(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={holidayDate}
                                            onChange={(e) => setHolidayDate(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-brand-green text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-brand-green/20 hover:-translate-y-0.5 transition-all">
                                        Post Holiday Globally
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                                <h3 className="text-xl font-bold text-brand-black dark:text-white mb-6 flex items-center">
                                    <CheckSquare className="text-brand-yellow mr-3" size={24} /> Scheduled Holidays
                                </h3>
                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                                    {companyHolidays.length === 0 ? (
                                        <p className="text-center text-gray-400 py-10 font-medium">No holidays posted yet.</p>
                                    ) : (
                                        companyHolidays.map(h => (
                                            <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <h4 className="font-bold text-brand-black dark:text-white">{h.title}</h4>
                                                    <p className="text-xs font-medium text-gray-500">{h.date}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteHoliday(h.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Leave Requests Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-brand-black dark:text-white flex items-center">
                                    <AlertCircle className="mr-3 text-brand-yellow" size={24} /> Leave Requests Management
                                </h3>
                                <div className="flex space-x-2">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-400 text-[10px] font-black rounded uppercase">Total: {leaveRequests.length}</span>
                                </div>
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
                                        {leaveRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-400 font-medium">No leave requests found in the system.</td>
                                            </tr>
                                        ) : (
                                            leaveRequests.map(req => {
                                                const isPending = req.status === 'Pending';
                                                let statusColor = "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
                                                if (req.status === 'Approved') statusColor = "bg-brand-green text-white";
                                                if (req.status === 'Rejected') statusColor = "bg-red-500 text-white";

                                                return (
                                                    <tr key={req.id} className="hover:bg-brand-yellow/5 transition-colors">
                                                        <td className="py-4 px-6 font-bold text-brand-black dark:text-white">{req.employeeName}</td>
                                                        <td className="py-4 px-6">
                                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-bold rounded-full">{req.leaveType}</span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-500 font-medium">{req.startDate} to {req.endDate}</td>
                                                        <td className="py-4 px-6 text-center">
                                                            {isPending ? (
                                                                <div className="flex items-center justify-center space-x-3">
                                                                    <button onClick={() => handleApprove(req.id)} className="bg-brand-green hover:bg-teal-700 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded shadow transition-all">
                                                                        Approve
                                                                    </button>
                                                                    <button onClick={() => handleReject(req.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded shadow transition-all">
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColor}`}>
                                                                    {req.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
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
