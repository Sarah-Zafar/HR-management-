import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
    Clock, Plane, Calendar, Send, Building2, CheckSquare, X, Menu, LogOut, LayoutDashboard, DollarSign, Bell, UserCheck, Briefcase, Shield
} from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import TodoList from '../../components/TodoList';
import PersonalCalendar from '../../components/PersonalCalendar';

const calculateMonthlyPayroll = (emp, attendance = [], holidays = []) => {
    // Immediate Guard: Prevent calculation on missing data (Triple-Exclusion Safety Audit)
    if (!emp || !attendance?.length || !holidays?.length) {
        return {
            bankMins: 0,
            daysWorked: 0,
            holidaysCount: 0,
            approvedLeavesCount: 0,
            netSalary: emp?.baseSalary || 0,
            status: "Calculating..."
        };
    }

    // Basic dynamic calculation based on attendance docs
    const filteredAtt = (attendance || []).filter(a => a?.userId === String(emp?.id));
    const bankMins = filteredAtt.reduce((acc, curr) => {
        if (!curr?.in || !curr?.out) return acc;
        const [hIn, mIn] = curr.in.split(':').map(Number);
        const [hOut, mOut] = curr.out.split(':').map(Number);
        const diff = (hOut * 60 + mOut) - (hIn * 60 + mIn);
        return acc + diff;
    }, 0);

    return {
        bankMins,
        daysWorked: filteredAtt.length,
        holidaysCount: 0,
        approvedLeavesCount: 0,
        netSalary: (emp?.baseSalary || 0) + (bankMins > 0 ? (bankMins / 60) * 50 : 0),
        bankValue: (bankMins / 60) * 50
    };
};

const EmployeeDashboard = ({ onLogout, user, leaveRequests = [], employeesData = [], companyHolidays = [], attendanceData = [], announcements = [] }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [unreadNotifications, setUnreadNotifications] = useState(false);
    const [notifList, setNotifList] = useState([]);
    const [events, setEvents] = useState([]);

    const navigate = useNavigate();
    const upcomingEvents = events.slice(0, 3);

    // Identity Link: Find employee matching the firebase user email
    const me = useMemo(() => {
        return employeesData.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase()) ||
            employeesData.find(e => e.name === 'Talha Arif') || // Fallback for seeding/demo
            employeesData[0];
    }, [employeesData, user]);

    const currentEmployeeName = me?.name || 'Employee';
    const sick = me?.sick || { taken: 0, total: 8 };
    const annual = me?.annual || { taken: 0, total: 10 };
    const casual = me?.casual || { taken: 0, total: 5 };

    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const unread = list.filter(n => !n.isRead).length;
            setUnreadCount(unread);
            setUnreadNotifications(unread > 0);
            setNotifList(list);
        });
        return () => unsubscribe();
    }, []);

    const markAsRead = async (notifId) => {
        try {
            await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'official_calendar_events'), orderBy('start', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.start?.toDate ? data.start.toDate() : new Date(),
                    type: data.category?.toLowerCase() || 'meeting'
                };
            });
            setEvents(list);
        });
        return () => unsubscribe();
    }, []);

    // Payroll Data for current month
    const payrollData = useMemo(() => {
        if (!me) return null;
        return calculateMonthlyPayroll(me, attendanceData);
    }, [me, attendanceData]);

    // Leave Form State
    const [leaveType, setLeaveType] = useState('Sick');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const renderLeaveBoxes = (quota, taken, fillClass) => {
        const boxes = [];
        for (let i = 0; i < quota; i++) {
            if (i < taken) {
                boxes.push(<div key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] shadow-sm ${fillClass}`}></div>);
            } else {
                boxes.push(<div key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] border border-gray-400 dark:border-gray-500 bg-[#1A1A1A] bg-opacity-70"></div>);
            }
        }
        return <div className="flex flex-wrap gap-1.5 mt-2">{boxes}</div>;
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

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

    const handleSubmitLeave = (e) => {
        e.preventDefault();

        const daysRequested = getWorkdaysCount(startDate, endDate);
        if (daysRequested > (me?.remainingQuota || 0)) {
            alert("Insufficient leave balance.");
            return;
        }

        const newReq = {
            id: Date.now(),
            employeeName: me?.name || 'Employee',
            userId: String(me?.id),
            leaveType: leaveType + ' Leave',
            startDate,
            endDate,
            reason,
            emergencyContact,
            status: 'Pending',
            createdAt: new Date().toISOString()
        };

        setLeaveRequests(prev => [...prev, newReq]);
        setIsLeaveModalOpen(false);
        alert("Leave request submitted successfully!");
        setStartDate('');
        setEndDate('');
        setReason('');
        setEmergencyContact('');
        setLeaveType('Sick');
    };

    const NavItem = ({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
            <button
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-brand-yellow text-brand-black font-bold shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
                <Icon className={`mr-3 ${isActive ? '' : 'text-brand-yellow group-hover:scale-110 transition-transform'}`} size={20} />
                <span className="font-medium">{label}</span>
            </button>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                const pendingRequestsCount = leaveRequests.filter(r => r.employeeName === currentEmployeeName && r.status === 'Pending').length;

                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-2xl font-black text-brand-black dark:text-white">My Dashboard</h2>
                            <button
                                onClick={() => setIsLeaveModalOpen(true)}
                                className="bg-brand-green hover:bg-teal-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-md transition-colors flex items-center text-sm md:text-base"
                            >
                                <Send size={18} className="mr-2" /> Request Leave
                            </button>
                        </div>

                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div
                                onClick={() => setActiveTab('request-leave')}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-t-4 border-amber-500 cursor-pointer hover:shadow-md transition-all relative group"
                            >
                                <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-brand-yellow group-hover:scale-110 transition-transform"><CheckSquare size={20} /></div>
                                <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2 tracking-tighter">My Pending Requests</h3>
                                <p className="text-4xl font-black text-brand-black dark:text-white transition-colors">{pendingRequestsCount}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-t-4 border-blue-500 relative transition-colors">
                                <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                                <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2 tracking-tighter">Banked In Hours</h3>
                                <p className="text-4xl font-black text-brand-black dark:text-white transition-colors">
                                    {(payrollData?.bankMins / 60).toFixed(1)} <span className="text-lg font-medium text-gray-500 uppercase">hrs</span>
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-t-4 border-green-500 relative transition-colors">
                                <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-brand-green group-hover:scale-110 transition-transform"><Plane size={20} /></div>
                                <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2 tracking-tighter">Leave Quota (Used)</h3>
                                <p className="text-4xl font-black text-brand-black dark:text-white transition-colors">{(sick?.taken || 0) + (annual?.taken || 0) + (casual?.taken || 0)} <span className="text-lg font-medium text-gray-500 uppercase">Days</span></p>
                            </div>
                        </div>

                        {/* Salary & Leave Summary Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-brand-black border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-all flex flex-col justify-between cursor-pointer" onClick={() => setActiveTab('pay-stubs')}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mr-4 shadow-inner">
                                        <DollarSign className="text-brand-yellow" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Salary Preview</h3>
                                </div>
                                <div className="mt-8">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Net Pay (March)</p>
                                    <p className="text-4xl font-black text-white">
                                        Rs. {payrollData ? new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payrollData.netSalary) : '0.00'}
                                    </p>
                                    <p className="text-xs text-brand-green mt-4 font-bold flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-brand-green mr-2 animate-pulse"></div> Live Projection
                                    </p>
                                </div>
                            </div>

                            <div className="bg-brand-black border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center mr-4 shadow-inner">
                                            <Plane className="text-brand-green" size={28} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">Leave Balance</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em] mb-1">Remaining</div>
                                        <div className="text-3xl font-black text-brand-yellow tracking-tighter shadow-sm">
                                            {(sick.total - sick.taken) + (annual.total - annual.taken) + (casual.total - casual.taken)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-2">
                                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-xs font-bold text-white mb-2">
                                            <span className="uppercase tracking-widest">Sick Leave</span>
                                            <span className="text-brand-yellow font-black">{sick.total - sick.taken} LEFT</span>
                                        </div>
                                        {renderLeaveBoxes(sick.total, sick.taken, "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]")}
                                    </div>
                                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-xs font-bold text-white mb-2">
                                            <span className="uppercase tracking-widest">Annual Leave</span>
                                            <span className="text-brand-yellow font-black">{annual.total - annual.taken} LEFT</span>
                                        </div>
                                        {renderLeaveBoxes(annual.total, annual.taken, "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]")}
                                    </div>
                                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-xs font-bold text-white mb-2">
                                            <span className="uppercase tracking-widest">Casual Leave</span>
                                            <span className="text-brand-yellow font-black">{casual.total - casual.taken} LEFT</span>
                                        </div>
                                        {renderLeaveBoxes(casual.total, casual.taken, "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meetings Feed */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center">
                                <Building2 className="mr-3 text-brand-green" size={24} />
                                <h3 className="text-xl font-black text-brand-black dark:text-white uppercase tracking-tight">Upcoming Events</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {upcomingEvents.map((evt, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center space-x-4">
                                                <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${evt.type === 'holiday' ? 'bg-brand-green text-white' : 'bg-brand-yellow text-brand-black'}`}>
                                                    {evt.type}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-brand-black dark:text-white truncate max-w-[150px] sm:max-w-none">{evt.title}</h4>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none">{evt.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{evt.date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{evt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {upcomingEvents.length === 0 && (
                                        <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No upcoming events</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'request-leave':
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
                                <h2 className="text-2xl font-black text-brand-black dark:text-white mb-6 relative z-10 flex items-center">
                                    <Plane className="text-brand-yellow mr-3" size={24} /> File Request
                                </h2>

                                <form onSubmit={handleSubmitLeave} className="flex-1 flex flex-col space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Leave Type</label>
                                        <select
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all"
                                        >
                                            <option value="Sick">Sick Leave</option>
                                            <option value="Casual">Casual Leave</option>
                                            <option value="Annual">Annual Leave</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Start Date</label>
                                            <input
                                                type="date" required value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">End Date</label>
                                            <input
                                                type="date" required value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-6 w-full bg-brand-yellow hover:bg-yellow-400 text-brand-black font-extrabold text-lg flex items-center justify-center px-6 py-4 rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                                    >
                                        <Send size={20} className="mr-2" /> Submit Request
                                    </button>
                                </form>
                            </div>

                            <div className="bg-brand-green rounded-2xl shadow-xl p-8 flex flex-col justify-center relative overflow-hidden text-white">
                                <h3 className="text-2xl font-black mb-6 relative z-10 border-b border-teal-700 pb-4 tracking-tighter uppercase">Policies</h3>
                                <ul className="space-y-6 relative z-10 font-bold text-sm">
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-2 rounded-xl mr-4"><CheckSquare size={16} /></div>
                                        <p>Submit requests at least <span className="text-brand-yellow italic">48 hours</span> in advance.</p>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-white/20 p-2 rounded-xl mr-4"><Calendar size={16} /></div>
                                        <p>Weekends are automatically excluded from leave deductions.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 font-black text-xl tracking-tight uppercase">Sent Requests</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="py-4 px-6">Type</th>
                                            <th className="py-4 px-6">Timeline</th>
                                            <th className="py-4 px-6 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {leaveRequests.filter(r => r.employeeName === currentEmployeeName).map(req => (
                                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="py-5 px-6 font-bold text-brand-black dark:text-white">{req.leaveType}</td>
                                                <td className="py-5 px-6 text-gray-500 dark:text-gray-400 font-medium">{req.startDate} to {req.endDate}</td>
                                                <td className="py-5 px-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${req.status === "Approved" ? "bg-brand-green text-white" :
                                                        req.status === "Rejected" ? "bg-red-500 text-white" :
                                                            "bg-brand-yellow/20 text-yellow-700"
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'pay-stubs': {
                const pd = payrollData;
                const bankStatus = pd ? (pd.bankMins >= 0 ? '+' : '-') : '+';
                const bankHours = pd ? Math.floor(Math.abs(pd.bankMins) / 60) : 0;
                const bankMins = pd ? Math.abs(pd.bankMins) % 60 : 0;
                const bankDisplay = `${bankStatus}${bankHours}h ${bankMins}m`;

                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-brand-black dark:text-white mb-2 tracking-tight">March 2026 Pay Stub</h2>
                                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Reference: OCTA-PAY-MAR26-{Math.floor(Math.random() * 10000)}</p>
                            </div>
                            <button onClick={() => window.print()} className="bg-brand-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center">
                                <DollarSign size={18} className="mr-2 text-brand-yellow" /> Print Statement
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-brand-green p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
                                <div className="z-10 mb-6 md:mb-0">
                                    <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-xl">
                                        <img src={logoUrl} alt="Octa Accountants" className="h-10 object-contain" />
                                    </div>
                                    <h3 className="text-4xl font-black tracking-tighter mb-1">Pay Statement</h3>
                                    <p className="text-white/60 font-medium uppercase tracking-widest text-[10px]">Employee: {currentEmployeeName}</p>
                                </div>
                                <div className="text-right z-10">
                                    <p className="text-brand-yellow font-black text-6xl tracking-tighter">
                                        Rs. {pd ? new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pd.netSalary) : '0.00'}
                                    </p>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2 border-t border-white/20 pt-2 text-center">Net Distributed Carry</p>
                                </div>
                            </div>

                            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="group">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                            <div className="w-4 h-[1px] bg-gray-200 mr-2"></div> Earnings Breakdown
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center mr-4"><Calendar size={20} className="text-brand-green" /></div>
                                                    <div>
                                                        <p className="font-bold text-brand-black dark:text-white text-lg">Base Salary</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Standard Monthly Rate</p>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-black text-brand-black dark:text-white">
                                                    Rs. {new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(me?.baseSalary || 0)}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center mr-4"><Clock size={20} className="text-brand-yellow" /></div>
                                                    <div>
                                                        <p className="font-bold text-brand-black dark:text-white text-lg">Banked Hours</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Volume: {bankDisplay}</p>
                                                    </div>
                                                </div>
                                                <p className={`text-xl font-black ${pd?.bankValue >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                                                    {pd?.bankValue >= 0 ? '+' : '-'}Rs. {new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(pd?.bankValue || 0))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                            <div className="w-4 h-[1px] bg-gray-200 mr-2"></div> Attendance Summary
                                        </h4>
                                        <div className="bg-brand-black p-8 rounded-[2.5rem] shadow-xl text-white space-y-4 border border-gray-800 transition-transform hover:scale-[1.02]">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                                                <span>Workdays Logged</span>
                                                <span>{pd?.daysWorked || 0} Days</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-red-400">
                                                <span>Approved Absences</span>
                                                <span>-{pd?.approvedLeavesCount || 0} Days</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-brand-yellow">
                                                <span>Public Holidays</span>
                                                <span>-{pd?.holidaysCount || 0} Days</span>
                                            </div>
                                            <div className="h-px bg-white/10 my-4"></div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">Performance Tag</p>
                                                    <p className="text-3xl font-black text-white">{pd?.bankMins >= 0 ? 'Surplus' : 'Deficit'}</p>
                                                </div>
                                                <div className="bg-brand-yellow/10 border border-brand-yellow/20 px-4 py-2 rounded-xl text-brand-yellow font-black text-xs">
                                                    ID: {me?.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                            <div className="w-4 h-[1px] bg-gray-200 mr-2"></div> Company Broadcasts
                                        </h4>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {announcements.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map((ann) => (
                                                <div key={ann.id} className="p-5 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-yellow/5 rounded-full -mr-8 -mt-8"></div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-bold mb-3 leading-relaxed">{ann.text}</p>
                                                    <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                        <Clock size={12} className="mr-2" />
                                                        <span>{ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Official'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {announcements.length === 0 && (
                                                <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No active broadcasts</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-brand-green mr-3 animate-ping"></div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                        Calculated using the "Triple-Exclusion Rule" (Weekends, Leaves, Holidays). <br /> Valid for Octa Accountants internal compliance.
                                    </p>
                                </div>
                                <div className="flex -space-x-2">
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg"><Briefcase size={16} /></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-green flex items-center justify-center shadow-lg"><UserCheck size={16} className="text-white" /></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-yellow flex items-center justify-center shadow-lg"><DollarSign size={16} className="text-brand-black" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'company-calendar': {
                const currDate = new Date();
                const daysInMonth = new Date(currDate.getFullYear(), currDate.getMonth() + 1, 0).getDate();
                const startDayOfWeek = new Date(currDate.getFullYear(), currDate.getMonth(), 1).getDay();
                const monthName = currDate.toLocaleString('default', { month: 'long', year: 'numeric' });

                const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => i);
                const monthDays = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-t-4 border-t-brand-green border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 bg-brand-green/5 text-center">
                                <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tighter">Official Company Calendar</h2>
                            </div>

                            <div className="p-10">
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-black text-brand-black dark:text-white">{monthName}</h3>
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="text-center text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">{day}</div>)}
                                    {blanks.map(blank => <div key={`blank-${blank}`} className="p-4 bg-gray-50/20 dark:bg-gray-900/10 rounded-xl"></div>)}
                                    {monthDays.map(day => {
                                        const isToday = day === currDate.getDate() && currDate.getMonth() === new Date().getMonth() && currDate.getFullYear() === new Date().getFullYear();
                                        const year = currDate.getFullYear();
                                        const month = String(currDate.getMonth() + 1).padStart(2, '0');
                                        const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
                                        const holiday = (companyHolidays || []).find(h => h.date === dateStr);
                                        const dObj = new Date(year, currDate.getMonth(), day);
                                        const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
                                        const cellDateStr = dObj.toDateString();
                                        const officialEvts = (events || []).filter(e => {
                                            const eDate = e.date instanceof Date ? e.date : (e.date?.toDate ? e.date.toDate() : new Date(e.date));
                                            return eDate.toDateString() === cellDateStr;
                                        });

                                        return (
                                            <div key={day} className={`min-h-[110px] p-4 rounded-xl border transition-all ${isToday ? 'border-brand-green bg-brand-green/10 ring-2 ring-brand-green/20' :
                                                isWeekend ? 'bg-gray-50/50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800' :
                                                    'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/40'
                                                } relative group hover:shadow-lg`}>
                                                <div className={`text-sm font-black ${isToday ? 'text-brand-green' : isWeekend ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>{day}</div>
                                                <div className="mt-2 space-y-1">
                                                    {holiday && (
                                                        <div className="text-[8px] bg-brand-green text-white px-2 py-1 rounded font-black truncate shadow-sm animate-fade-in uppercase tracking-widest">
                                                            {holiday.title}
                                                        </div>
                                                    )}
                                                    {officialEvts.map((evt, idx) => (
                                                        <div key={idx} className={`text-[8px] px-2 py-1 rounded font-black truncate shadow-sm animate-fade-in uppercase tracking-widest ${evt.type === 'meeting' ? 'bg-brand-yellow text-brand-black' : 'bg-red-500 text-white'}`}>
                                                            {evt.title}
                                                        </div>
                                                    ))}
                                                </div>
                                                {isToday && <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-green"></div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'my-calendar':
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-full">
                                <PersonalCalendar
                                    leaveRequests={leaveRequests}
                                    companyHolidays={companyHolidays}
                                    currentEmployeeName={currentEmployeeName}
                                />
                            </div>
                            <div className="h-full">
                                <TodoList />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors font-sans overflow-hidden">

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-black flex flex-col transition-transform duration-300 ease-in-out border-r border-gray-800 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-white/5">
                    <div className="bg-white p-2 rounded-xl flex items-center justify-center w-full shadow-lg border border-white/10">
                        <img src={logoUrl} alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-8">
                    <nav className="space-y-3 px-4">
                        <NavItem id="dashboard" icon={LayoutDashboard} label="My Dashboard" />
                        <NavItem id="request-leave" icon={Send} label="Request Leave" />
                        <NavItem id="company-calendar" icon={Building2} label="Official Calendar" />
                        <NavItem id="my-calendar" icon={Calendar} label="Personal Planner" />
                        <NavItem id="pay-stubs" icon={DollarSign} label="Financial Stubs" />
                    </nav>
                </div>

                <div className="p-6 border-t border-gray-800 bg-white/5">
                    <button onClick={handleLogout} className="flex items-center w-full px-5 py-4 rounded-2xl text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all group font-black uppercase text-[10px] tracking-widest">
                        <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-20 bg-brand-green border-b border-teal-900 flex items-center justify-between px-6 sm:px-10 shadow-lg z-20">
                    <div className="flex items-center flex-1">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 rounded-xl text-white/80 hover:bg-teal-800 lg:hidden shadow-inner"><Menu size={24} /></button>
                        <div className="flex flex-col">
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter flex items-center">
                                <Shield className="text-brand-yellow mr-3" size={26} /> EMPLOYEE PORTAL
                            </h1>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mt-0.5 ml-9">Secure Management Access</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center space-x-6">
                        <div className="h-10 w-px bg-white/10"></div>
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                                className="relative p-2 text-white/80 hover:text-brand-yellow transition-all group"
                            >
                                <Bell size={24} className={`group-hover:scale-110 transition-transform ${unreadCount > 0 ? 'text-brand-yellow' : 'text-white'}`} style={{ color: '#FBC02D' }} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-brand-black text-[10px] font-black shadow-lg border-2 border-brand-green animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotifDropdownOpen && (
                                <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[150] animate-fade-in-down">
                                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inbox Activity</h4>
                                        {unreadCount > 0 && <div className="bg-brand-yellow/10 text-brand-yellow text-[8px] font-black px-2 py-0.5 rounded">LIVE</div>}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifList.length > 0 ? notifList.slice(0, 5).map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => markAsRead(notif.id)}
                                                className={`p-5 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors relative ${!notif.isRead ? 'bg-brand-yellow/5' : ''}`}
                                            >
                                                {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow"></div>}
                                                <p className={`text-xs font-bold ${!notif.isRead ? 'text-brand-black dark:text-white' : 'text-gray-400'}`}>{notif.text || notif.title}</p>
                                                <p className="text-[9px] text-gray-300 mt-2 font-black uppercase tracking-widest">{notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleTimeString() : 'Recently'}</p>
                                            </div>
                                        )) : (
                                            <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No notifications</div>
                                        )}
                                    </div>
                                    <div className="bg-brand-green p-3 text-center">
                                        <button onClick={() => setIsNotifDropdownOpen(false)} className="text-[10px] font-black text-white hover:text-brand-yellow uppercase tracking-widest">Close Panel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-white tracking-tight">{currentEmployeeName}</p>
                            <p className="text-[9px] font-bold text-brand-yellow uppercase tracking-widest opacity-80">{me?.role || 'Personnel'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-inner group cursor-pointer hover:bg-white/20 transition-all">
                            <UserCheck className="text-white group-hover:scale-110 transition-transform" size={24} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 scroll-smooth bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto pb-20">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {isLeaveModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-left">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all relative">
                        <div className="bg-brand-green p-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-10 -translate-y-10"></div>
                            <h3 className="text-2xl font-black flex items-center relative z-10 tracking-tighter uppercase"><Plane className="mr-3 text-brand-yellow" size={28} /> New Absence Request</h3>
                            <button onClick={() => setIsLeaveModalOpen(false)} className="text-white/60 hover:text-white relative z-10 transition-transform hover:rotate-90"><X size={28} /></button>
                        </div>
                        <form onSubmit={handleSubmitLeave} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Leave Category</label>
                                    <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-black outline-none focus:border-brand-green appearance-none cursor-pointer transition-all shadow-sm">
                                        <option value="Casual">Casual Engagement</option>
                                        <option value="Sick">Medical / Emergency</option>
                                        <option value="Annual">Annual Privilege</option>
                                        <option value="Bereavement">Compassionate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Emergency Line</label>
                                    <div className="relative">
                                        <input type="tel" required value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="+92 XXX XXXXXXX" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-black outline-none focus:border-brand-green transition-all shadow-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Commencement Date</label>
                                    <div className="relative">
                                        <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 pl-12 text-brand-black dark:text-white font-black outline-none focus:border-brand-green transition-all shadow-sm cursor-pointer" />
                                        <Calendar className="absolute left-4 top-4.5 text-gray-300" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Conclusion Date</label>
                                    <div className="relative">
                                        <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 pl-12 text-brand-black dark:text-white font-black outline-none focus:border-brand-green transition-all shadow-sm cursor-pointer" />
                                        <Calendar className="absolute left-4 top-4.5 text-gray-300" size={18} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Professional Reason</label>
                                <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows="3" placeholder="Please provide clear context for management review..." className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green resize-none transition-all shadow-sm"></textarea>
                            </div>
                            <div className="flex space-x-6 pt-4">
                                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-400 font-black py-5 rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500 uppercase tracking-widest text-[10px]">Cancel Submission</button>
                                <button type="submit" className="flex-1 bg-brand-green hover:bg-teal-900 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex justify-center items-center group uppercase tracking-widest text-[10px]">
                                    <Send size={18} className="mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-brand-yellow" /> Transmit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
