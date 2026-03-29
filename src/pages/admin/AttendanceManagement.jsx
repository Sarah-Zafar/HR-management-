import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import {
    Users, Plane, LayoutDashboard, Menu, X, LogOut, Network, Clock, Settings, Calendar, ChevronDown, CheckCircle, AlertCircle, FileText, Save, DollarSign
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

const AttendanceManagement = ({
    onLogout,
    employeesData = [],
    manualEntries = {},
    setManualEntries,
    standardStart,
    setStandardStart,
    standardEnd,
    setStandardEnd,
    leaveRequests = []
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
    const [filterEmployee, setFilterEmployee] = useState('All Employees');
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const weekOptions = [
        'March 1 - March 7, 2026',
        'February 22 - February 28, 2026',
        'February 15 - February 21, 2026',
    ];
    const monthOptions = [
        'March 2026',
        'February 2026',
        'January 2026',
    ];
    const [selectedRange, setSelectedRange] = useState(weekOptions[0]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Helper: Parse HH:mm to minutes
    const parseTime = (t) => {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    // New Helper: Format 24h (HH:mm) to 12h (hh:mm AM/PM)
    const formatTime12 = (t) => {
        if (!t) return '--';
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Helper: Convert 'hh:mm AM/PM' to decimal hours
    const calculateHours = (timeStr) => {
        if (!timeStr) return 0;
        const [time, period] = timeStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h + (m / 60);
    };

    // Helper: Calculate Banking Hours based on Duration (Decimal)
    const calculateBanking = (clockIn, clockOut) => {
        if (!clockIn || !clockOut) return { display: '--', value: 0, label: 'MISSING' };

        const workedH = calculateHours(clockOut) - calculateHours(clockIn);
        const standardH = calculateHours(standardEnd) - calculateHours(standardStart);
        const diffH = workedH - standardH;

        const sign = diffH >= 0 ? '+' : '-';
        const absMins = Math.round(Math.abs(diffH) * 60);
        const h = Math.floor(absMins / 60);
        const m = absMins % 60;

        const display = `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        return { display, value: diffH * 60, label: diffH < 0 ? 'Bank Out' : 'Bank In' };
    };

    // Staff vs Management
    const staffList = (employeesData || []).filter(emp => emp?.name && !['Bilal Zafar', 'Ahmer Bhai'].includes(emp.name));

    // Filtered Employee List for Logs (Exclude Bilal and Ahmer)
    const filteredEmployees = useMemo(() => {
        const list = staffList || [];
        if (filterEmployee !== 'All Employees') {
            return list.filter(emp => emp?.name === filterEmployee);
        }
        return list;
    }, [staffList, filterEmployee]);

    // Dropdown options
    const employeeDropdownList = useMemo(() => {
        const names = (staffList || []).map(emp => emp?.name).filter(Boolean);
        return ['All Employees', ...names];
    }, [staffList]);

    const generateDateGrid = useMemo(() => {
        const days = [];
        const monthMap = { 'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11 };

        if (!selectedRange) return days;

        if (viewMode === 'monthly') {
            const [monthName, year] = selectedRange.split(' ');
            const m = monthMap[monthName] ?? 2;
            const y = parseInt(year) || 2026;
            const date = new Date(y, m, 1);
            while (date.getMonth() === m) {
                days.push({
                    day: date.toLocaleDateString('en-PK', { weekday: 'long' }),
                    dateStr: `${monthName} ${date.getDate()}`,
                    key: `${y}-${(m + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
                });
                date.setDate(date.getDate() + 1);
            }
        } else {
            const parts = selectedRange.split(' - ');
            const [mName, startDay] = parts[0]?.split(' ') || ['March', '1'];
            const yearPart = selectedRange.split(', ')[1] || '2026';
            const startD = parseInt(startDay) || 1;
            const m = monthMap[mName] ?? 2;
            for (let i = 0; i < 7; i++) {
                const d = startD + i;
                const dummyDate = new Date(parseInt(yearPart), m, d);
                days.push({
                    day: dummyDate.toLocaleDateString('en-PK', { weekday: 'long' }),
                    dateStr: `${mName} ${d}`,
                    key: `${yearPart}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                });
            }
        }
        return days;
    }, [viewMode, selectedRange]);

    const handleEntryChange = (empId, dateKey, field, value) => {
        setManualEntries(prev => {
            const empData = prev[empId] || {};
            const entryData = empData[dateKey] || { in: '', out: '' };
            return {
                ...prev,
                [empId]: {
                    ...empData,
                    [dateKey]: { ...entryData, [field]: value }
                }
            };
        });
    };

    const handleSaveData = async () => {
        setIsLoadingLocal(true);
        console.log("Syncing Attendance to Firebase...");
        try {
            // 1. Sync Standard Shift Settings
            await setDoc(doc(db, 'settings', 'attendance_config'), {
                standardStart,
                standardEnd,
                updatedAt: new Date()
            }, { merge: true });

            // 2. Sync Manual Entries
            await setDoc(doc(db, 'attendance', 'manual_logs'), {
                entries: manualEntries,
                updatedAt: new Date()
            }, { merge: true });

            showToast("Cloud Sync Successful!");
        } catch (error) {
            console.error("Firebase Sync Error:", error);
            showToast("Sync Failed: Database Error", "error");
        } finally {
            setIsLoadingLocal(false);
        }
    };

    const [isLoadingLocal, setIsLoadingLocal] = useState(false);

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
                    <button onClick={() => navigate('/hr-calendar')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <Calendar className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">HR Calendar</span>
                    </button>
                    <button onClick={() => navigate('/admin/chart')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <Network className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Chart</span>
                    </button>
                    <button className="flex items-center w-full px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md">
                        <Clock className="mr-3" size={20} /> <span>Attendance</span>
                    </button>
                    <button onClick={() => navigate('/admin/payroll')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
                        <DollarSign className="mr-3 text-brand-yellow" size={20} /> <span className="font-medium">Payroll Overview</span>
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
                            <Clock className="mr-3 text-brand-green" size={28} /> Dynamic Attendance Management
                        </h1>
                    </div>
                    <button onClick={handleSaveData} disabled={isLoadingLocal} className="bg-brand-yellow text-brand-black px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-yellow/10 disabled:opacity-50">
                        {isLoadingLocal ? 'Syncing...' : <><Save className="mr-2 inline" size={16} /> Save Data</>}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-10 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Editable Standard Shift Header */}
                        <div className="bg-brand-black p-6 rounded-[2.5rem] text-white flex flex-wrap gap-10 items-center justify-start border border-gray-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <div className="z-10 flex gap-12">
                                <div>
                                    <p className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.3em] mb-3 flex items-center">
                                        <div className="w-4 h-[1px] bg-brand-yellow mr-2"></div> Standard Start
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center group/input focus-within:border-brand-yellow/50 transition-all">
                                            <input
                                                type="text"
                                                value={(standardStart || "03:00 AM").split(' ')[0]}
                                                onChange={(e) => setStandardStart(`${e.target.value} ${(standardStart || "AM").split(' ')[1]}`)}
                                                className="bg-transparent border-none text-2xl font-black text-white w-20 outline-none text-center"
                                                placeholder="00:00"
                                            />
                                            <select 
                                                value={(standardStart || "AM").split(' ')[1]}
                                                onChange={(e) => setStandardStart(`${(standardStart || "03:00").split(' ')[0]} ${e.target.value}`)}
                                                className="bg-transparent border-none text-brand-yellow font-black text-sm outline-none cursor-pointer appearance-none px-2"
                                            >
                                                <option className="bg-brand-black" value="AM">AM</option>
                                                <option className="bg-brand-black" value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-16 w-[1px] bg-gray-700/50"></div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.3em] mb-3 flex items-center">
                                        <div className="w-4 h-[1px] bg-brand-yellow mr-2"></div> Standard End
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center group/input focus-within:border-brand-yellow/50 transition-all">
                                            <input
                                                type="text"
                                                value={(standardEnd || "05:00 PM").split(' ')[0]}
                                                onChange={(e) => setStandardEnd(`${e.target.value} ${(standardEnd || "PM").split(' ')[1]}`)}
                                                className="bg-transparent border-none text-2xl font-black text-white w-20 outline-none text-center"
                                                placeholder="00:00"
                                            />
                                            <select 
                                                value={(standardEnd || "PM").split(' ')[1]}
                                                onChange={(e) => setStandardEnd(`${(standardEnd || "05:00").split(' ')[0]} ${e.target.value}`)}
                                                className="bg-transparent border-none text-brand-yellow font-black text-sm outline-none cursor-pointer appearance-none px-2"
                                            >
                                                <option className="bg-brand-black" value="AM">AM</option>
                                                <option className="bg-brand-black" value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center ml-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                    <AlertCircle className="text-brand-yellow mr-3" size={20} />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Changes globally re-calculate <br /> all banking hours instantly.</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-6 items-end animate-fade-in-up">
                            <div className="w-full md:w-64">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">View Mode</label>
                                <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                                    <button onClick={() => setViewMode('weekly')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'weekly' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Weekly</button>
                                    <button onClick={() => setViewMode('monthly')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-brand-green text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Monthly</button>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Range Selector</label>
                                <div className="relative">
                                    <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold text-gray-700 dark:text-white outline-none appearance-none cursor-pointer focus:border-brand-green">
                                        {(viewMode === 'weekly' ? weekOptions : monthOptions).map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Filter Employee</label>
                                <div className="relative">
                                    <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold text-gray-700 dark:text-white outline-none appearance-none cursor-pointer focus:border-brand-green">
                                        {employeeDropdownList.map(name => <option key={name}>{name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Entry Table */}
                        <div className="space-y-12 animate-fade-in-up">
                            {(filteredEmployees || []).map(emp => {
                                let totalMins = 0;
                                const grid = (generateDateGrid || []).map(day => {
                                    const entry = (manualEntries || {})[emp?.name]?.[day?.key] || { clockIn: '', clockOut: '' };

                                    // Check if this date is an approved leave
                                    const approvedLeave = (leaveRequests || []).find(req =>
                                        req?.status === 'Approved' &&
                                        req?.employeeName === emp?.name &&
                                        day?.key >= req?.startDate &&
                                        day?.key <= req?.endDate
                                    );

                                    const banking = calculateBanking(entry?.clockIn, entry?.clockOut);
                                    totalMins += (banking?.value || 0);
                                    return { ...day, ...entry, ...banking, approvedLeave };
                                });

                                const totalSign = totalMins >= 0 ? '+' : '-';
                                const absMins = Math.abs(totalMins);
                                const totalH = Math.floor(absMins / 60);
                                const totalM = absMins % 60;
                                const totalDisplay = `${totalSign}${totalH.toString().padStart(2, '0')}:${totalM.toString().padStart(2, '0')}`;

                                return (
                                    <div key={emp?.name || Math.random()} className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group/card hover:shadow-brand-green/5 transition-all">
                                        <div className="bg-brand-green px-10 py-8 text-white flex justify-between items-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover/card:scale-110"></div>
                                            <div className="flex items-center z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mr-6 shadow-inner border border-white/5 backdrop-blur-sm transition-transform hover:rotate-6">
                                                    <FileText className="text-brand-yellow" size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black tracking-tight">{emp?.name || 'Unknown'}</h3>
                                                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em]">{emp?.role || 'Personnel'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right z-10 bg-black/10 px-6 py-4 rounded-[2rem] border border-white/5">
                                                <p className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em] mb-2">Aggregated Bank Hours</p>
                                                <div className="flex items-center justify-end">
                                                    <p className={`text-3xl font-black tracking-tighter ${totalMins >= 0 ? 'text-brand-yellow' : 'text-red-400'}`}>
                                                        {totalDisplay}
                                                    </p>
                                                    <div className={`w-2 h-2 rounded-full ml-4 animate-pulse ${totalMins >= 0 ? 'bg-brand-yellow' : 'bg-red-500'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700">
                                                        <th className="py-8 px-10 text-left">Timeline</th>
                                                        <th className="py-8 px-8 text-center">Clock In</th>
                                                        <th className="py-8 px-8 text-center">Clock Out</th>
                                                        <th className="py-8 px-10 text-right">Daily Bank Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {(grid || []).map(row => {
                                                        const isWeekend = row?.day === 'Saturday' || row?.day === 'Sunday';
                                                        const isOnLeave = row?.approvedLeave;

                                                        return (
                                                            <tr key={row?.key} className={`hover:bg-teal-50/20 dark:hover:bg-teal-900/10 transition-all group/row ${isWeekend ? 'bg-gray-50/30' : ''}`}>
                                                                <td className="py-7 px-10">
                                                                    <div className="flex items-center">
                                                                        <div>
                                                                            <p className={`font-bold transition-colors ${isWeekend ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200 group-hover/row:text-brand-black'}`}>{row?.day}</p>
                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{row?.dateStr}</p>
                                                                        </div>
                                                                        {isWeekend && <span className="ml-4 px-2 py-0.5 bg-gray-100 text-gray-400 text-[8px] font-black uppercase rounded">Weekend</span>}
                                                                        {isOnLeave && !isWeekend && <span className="ml-4 px-2 py-0.5 bg-brand-yellow/20 text-brand-yellow text-[8px] font-black uppercase rounded animate-pulse">On Leave</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="py-7 px-8 text-center">
                                                                    {isOnLeave || isWeekend ? (
                                                                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{isWeekend ? 'Rest Day' : 'Leave Active'}</div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 group/time hover:shadow-md transition-all">
                                                                            <input
                                                                                type="text"
                                                                                value={(row?.clockIn || "09:00 AM").split(' ')[0]}
                                                                                onChange={(e) => handleEntryChange(emp?.name, row?.key, 'clockIn', `${e.target.value} ${(row?.clockIn || "AM").split(' ')[1]}`)}
                                                                                className="bg-transparent border-none text-sm font-black text-brand-yellow w-12 outline-none text-center"
                                                                            />
                                                                            <select 
                                                                                value={(row?.clockIn || "AM").split(' ')[1]}
                                                                                onChange={(e) => handleEntryChange(emp?.name, row?.key, 'clockIn', `${(row?.clockIn || "09:00").split(' ')[0]} ${e.target.value}`)}
                                                                                className="bg-transparent border-none text-[10px] font-black text-gray-400 outline-none cursor-pointer uppercase"
                                                                            >
                                                                                <option value="AM">AM</option>
                                                                                <option value="PM">PM</option>
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="py-7 px-8 text-center">
                                                                    {isOnLeave || isWeekend ? (
                                                                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">-- : --</div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 group/time hover:shadow-md transition-all">
                                                                            <input
                                                                                type="text"
                                                                                value={(row?.clockOut || "05:00 PM").split(' ')[0]}
                                                                                onChange={(e) => handleEntryChange(emp?.name, row?.key, 'clockOut', `${e.target.value} ${(row?.clockOut || "PM").split(' ')[1]}`)}
                                                                                className="bg-transparent border-none text-sm font-black text-brand-yellow w-12 outline-none text-center"
                                                                            />
                                                                            <select 
                                                                                value={(row?.clockOut || "PM").split(' ')[1]}
                                                                                onChange={(e) => handleEntryChange(emp?.name, row?.key, 'clockOut', `${(row?.clockOut || "05:00").split(' ')[0]} ${e.target.value}`)}
                                                                                className="bg-transparent border-none text-[10px] font-black text-gray-400 outline-none cursor-pointer uppercase"
                                                                            >
                                                                                <option value="AM">AM</option>
                                                                                <option value="PM">PM</option>
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="py-7 px-10 text-right">
                                                                    <div className="flex flex-col items-end">
                                                                        <span className={`text-xl font-black group-hover/row:scale-110 transition-transform ${row?.display?.startsWith('+') ? 'text-brand-yellow' : row?.display?.startsWith('-') ? 'text-red-400' : 'text-gray-300'}`}>
                                                                            {isOnLeave || isWeekend ? '+00:00' : row?.display}
                                                                        </span>
                                                                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">{isOnLeave ? 'LEAVE' : isWeekend ? 'OFF' : row?.label}</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AttendanceManagement;
