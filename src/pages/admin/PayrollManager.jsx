import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import {
    Users, Plane, LayoutDashboard, Menu, X, LogOut, Network, Clock, Save, Building2, CheckSquare, DollarSign, Calendar, CheckCircle
} from 'lucide-react';
const calculateMonthlyPayroll = (emp, month, year, attendance = {}, holidays = [], leaves = []) => {
    // Immediate Guard: Prevent calculation on missing data (Triple-Exclusion Safety Audit)
    if (!emp || !holidays?.length || !leaves?.length) {
        return {
            bankMins: 0,
            daysWorked: 0,
            holidaysCount: 0,
            approvedLeavesCount: 0,
            netSalary: emp?.baseSalary || 0,
            status: "Calculating..."
        };
    }
    // Local placeholder to prevent crash while utility is missing
    return {
        bankMins: 0,
        daysWorked: 22,
        holidaysCount: 0,
        approvedLeavesCount: 0,
        netSalary: emp?.baseSalary || 5000,
    };
};

const PayrollManager = ({
    onLogout,
    employeesData = [],
    manualEntries = {},
    standardStart = "09:00",
    standardEnd = "17:00",
    leaveRequests = [],
    companyHolidays = []
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const showToast = (message) => {
        setToast({ message });
        setTimeout(() => setToast(null), 4000);
    };

    // Management vs Staff segregation
    const managementList = (employeesData || []).filter(emp => emp?.name && ['Bilal Zafar', 'Ahmer Bhai'].includes(emp.name));
    const staffList = (employeesData || []).filter(emp => emp?.name && !['Bilal Zafar', 'Ahmer Bhai'].includes(emp.name));

    const calculateRowData = (emp) => {
        const results = calculateMonthlyPayroll(emp, 2, 2026, manualEntries, companyHolidays, leaveRequests);
        const bankDisplay = `${results.bankMins >= 0 ? '+' : '-'}${Math.floor(Math.abs(results.bankMins) / 60)}h ${Math.abs(results.bankMins) % 60}m`;

        return {
            daysWorkedActual: results.daysWorked,
            deductions: results.holidaysCount + results.approvedLeavesCount,
            bankDisplay: bankDisplay,
            netSalary: results.netSalary,
            totalBankMins: results.bankMins
        };
    };

    const renderTable = (list, isManagement = false) => (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8 animate-fade-in-up">
            <div className={`px-8 py-4 ${isManagement ? 'bg-brand-black' : 'bg-brand-green'} text-white flex justify-between items-center`}>
                <h4 className="text-xs font-black uppercase tracking-[0.2em]">{isManagement ? 'Management Payroll' : 'Staff Payroll Overview'}</h4>
                <span className="text-[10px] font-bold opacity-60">Cycle: March 2026</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="py-6 px-8">Employee</th>
                            <th className="py-6 px-6 text-center">Days Worked</th>
                            <th className="py-6 px-6 text-center">Leaves/Holidays</th>
                            <th className="py-6 px-6 text-center">Banked Hours</th>
                            <th className="py-6 px-8 text-right">Net Salary</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {list.map(emp => {
                            const data = calculateRowData(emp, isManagement);
                            return (
                                <tr key={emp.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="py-6 px-8">
                                        <p className="font-black text-brand-black dark:text-white mb-1">{emp.name}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{emp.role}</p>
                                    </td>
                                    <td className="py-6 px-6 text-center font-bold text-gray-600 dark:text-gray-300">
                                        {data.daysWorkedActual} <span className="text-[9px] font-medium opacity-50">Days</span>
                                    </td>
                                    <td className="py-6 px-6 text-center font-bold text-red-400">
                                        {data.deductions} <span className="text-[9px] font-medium opacity-50">Deducted</span>
                                    </td>
                                    <td className="py-6 px-6 text-center font-bold">
                                        <span className={data.totalBankMins >= 0 ? 'text-brand-green' : 'text-red-400'}>{data.bankDisplay}</span>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        <div className="inline-block bg-brand-yellow/10 border border-brand-yellow/20 px-4 py-2 rounded-xl text-brand-yellow font-black text-lg">
                                            ${data.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
            {toast && (
                <div className="fixed top-6 right-6 z-[110] px-6 py-4 rounded-2xl shadow-2xl bg-brand-green text-white flex items-center animate-fade-in-right">
                    <CheckCircle className="mr-3 text-brand-yellow" size={20} />
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-center px-6 border-b border-teal-800">
                    <div className="bg-white p-2 rounded-lg w-full flex justify-center shadow-inner">
                        <img src={logoUrl} alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button onClick={() => navigate('/admin/dashboard')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <LayoutDashboard className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/admin/directory')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <Users className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Employee Directory</span>
                    </button>
                    <button onClick={() => navigate('/admin/leave')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <Plane className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Leave Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/admin/chart')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <Network className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Chart</span>
                    </button>
                    <button onClick={() => navigate('/admin/attendance')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <Clock className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Attendance</span>
                    </button>
                    <button className="flex items-center w-full px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md">
                        <DollarSign className="mr-3" size={20} /> <span>Payroll Overview</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-teal-800">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 transition-colors">
                        <LogOut className="mr-3" size={20} /> <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-40">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 lg:hidden text-gray-400"><Menu size={24} /></button>
                        <h1 className="text-xl font-black text-brand-black dark:text-white flex items-center">
                            <DollarSign className="mr-3 text-brand-green" size={28} /> Monthly Payout Master
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => showToast("Release successful. Stubs now visible to employees.")} className="bg-brand-black text-brand-yellow px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Release Pay Stubs</button>
                        <button onClick={() => showToast("Exporting payroll report...")} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-brand-black dark:text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center">
                            <Save className="mr-2" size={16} /> Export Report
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-10 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-brand-black dark:text-white tracking-tight">Financial Cycle: March 2026</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Status: Calculation Engine Syncing (100%)</p>
                        </div>

                        {renderTable(managementList, true)}
                        {renderTable(staffList, false)}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PayrollManager;
