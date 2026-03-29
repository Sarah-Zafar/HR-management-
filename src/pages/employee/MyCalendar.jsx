import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Clock, Plane, Calendar as CalendarIcon, Send, Building2, CheckSquare, X, Menu, LogOut, LayoutDashboard, DollarSign, Briefcase, ChevronLeft, ChevronRight
} from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const MyCalendar = ({ onLogout, leaveRequests = [], companyHolidays = [], employeesData = [], user }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [selectedDateFormatted, setSelectedDateFormatted] = useState('');
    const [officialEvents, setOfficialEvents] = useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const q = query(collection(db, 'official_calendar_events'), orderBy('start', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.start?.toDate ? data.start.toDate() : new Date(),
                    endDate: data.end?.toDate ? data.end.toDate() : new Date()
                };
            });
            setOfficialEvents(list);
        });
        return () => unsubscribe();
    }, []);

    // The current logged-in employee name (mocked as the first employee for this demo session)
    const me = (employeesData || []).find(e => e.id === user?.uid || e.id === 1) || (employeesData || [])[0];
    const currentEmployeeName = me?.name || '';

    const getMergedEventsForDay = (day, m, y) => {
        const year = y || currentDate.getFullYear();
        const month = (m !== undefined) ? m : currentDate.getMonth();
        const cellDate = new Date(year, month, day);
        const cellDateStr = cellDate.toDateString();
        const dateKeyStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 1. Get Official Firestore Events
        const official = officialEvents.filter(evt => {
            if (!evt.startDate) return false;
            return evt.startDate.toDateString() === cellDateStr;
        }).map(evt => ({
            id: evt.id,
            title: evt.title,
            type: evt.category?.toLowerCase() || 'meeting',
            time: evt.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: evt.description
        }));

        // 2. Get company holidays (legacy support if still used)
        const holidayEvents = (companyHolidays || [])
            .filter(h => h?.date === dateKeyStr)
            .map(h => ({ title: h?.title || 'Holiday', type: 'holiday', time: 'All Day' }));

        // 3. Get approved leaves for THIS employee
        const leaveEvents = (leaveRequests || [])
            .filter(req =>
                req?.employeeName === currentEmployeeName &&
                req?.status === 'Approved' &&
                dateStr >= req?.startDate &&
                dateStr <= req?.endDate
            )
            .map(req => ({ title: `Member Leave: ${req?.leaveType || 'General'}`, type: 'leave', time: 'All Day' }));

        return [...official, ...holidayEvents, ...leaveEvents];
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        const events = getMergedEventsForDay(today.getDate(), today.getMonth(), today.getFullYear());
        setSelectedDayEvents(events);
        setSelectedDateFormatted(today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
        setShowModal(true);
    };

    const handleDayClick = (day) => {
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const events = getMergedEventsForDay(day, currentDate.getMonth(), currentDate.getFullYear());
        setSelectedDayEvents(events);
        setSelectedDateFormatted(dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
        setShowModal(true);
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Generating calendar days with strict 42-cell grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const allCells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        allCells.push({ type: 'blank', key: `blank-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        allCells.push({ type: 'day', day: d, key: `day-${d}` });
    }
    const remaining = 42 - allCells.length;
    for (let i = 0; i < remaining; i++) {
        allCells.push({ type: 'blank', key: `next-${i}` });
    }

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
                        <Link to="/employee/request-leave" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Send className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Request Leave</span>
                        </Link>
                        <Link to="/employee/calendar" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <CalendarIcon className="mr-3" size={20} />
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
                            <CalendarIcon className="text-brand-yellow mr-3" size={28} />
                            My Calendar
                        </h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto pb-10 flex flex-col h-full animate-fade-in-up">

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden min-h-[600px]">
                            {/* Calendar Header Controls */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <h2 className="text-2xl font-black text-brand-black dark:text-white w-56 text-center">{monthName}</h2>
                                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-3 h-3 bg-brand-yellow rounded-full mr-2"></div> Meetings
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-3 h-3 bg-brand-green rounded-full mr-2"></div> Holidays
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Deadlines
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> Approved Leaves
                                    </div>
                                    <button onClick={handleToday} className="ml-4 px-4 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-md">
                                        Today
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Days Header */}
                            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                {days.map(day => (
                                    <div key={day} className="py-3 text-center text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-r border-gray-100 dark:border-gray-700 last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid (6 rows ensure 31-day months render fully) */}
                            <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                {allCells.map(cell => {
                                    if (cell.type === 'blank') {
                                        return <div key={cell.key} className="border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 p-2 min-h-[120px]"></div>;
                                    }

                                    const day = cell.day;
                                    const events = getMergedEventsForDay(day, currentDate.getMonth(), currentDate.getFullYear());
                                    const today = new Date();
                                    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                                    return (
                                        <div
                                            key={cell.key}
                                            onClick={() => handleDayClick(day)}
                                            className={`border-r border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-2 min-h-[120px] transition-colors relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${isToday ? 'bg-brand-yellow/5 dark:bg-brand-yellow/10 ring-2 ring-inset ring-brand-yellow' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-brand-yellow text-brand-black shadow-md' : 'text-gray-500 dark:text-gray-400 group-hover:text-brand-black dark:group-hover:text-white'}`}>
                                                    {day}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                {(events || []).map((evt, idx) => {
                                                    let colorClasses = "";
                                                    if (evt.type === 'meeting') colorClasses = "bg-brand-yellow/20 text-yellow-800 dark:text-brand-yellow border border-brand-yellow/30";
                                                    if (evt.type === 'holiday') colorClasses = "bg-brand-green text-white border border-teal-600 shadow-sm";
                                                    if (evt.type === 'deadline') colorClasses = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50";
                                                    if (evt.type === 'leave') colorClasses = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50";

                                                    return (
                                                        <div key={idx} className={`px-2 py-1.5 rounded text-xs font-bold truncate transition-all hover:scale-[1.02] hover:shadow-md ${colorClasses}`} title={`${evt.time} - ${evt.title}`}>
                                                            <div className="hidden sm:inline-block opacity-75 mr-1 font-medium text-[10px] uppercase">
                                                                {evt?.time?.split(' ')[0] || ''}
                                                            </div>
                                                            {evt.title}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Today / Day Details Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                                    <h3 className="text-xl font-black text-brand-black dark:text-white flex items-center">
                                        <CalendarIcon className="text-brand-yellow mr-3" size={24} />
                                        {selectedDateFormatted}
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors bg-white dark:bg-gray-700 rounded-full p-1 shadow-sm">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {selectedDayEvents.length > 0 ? (
                                        <ul className="space-y-4">
                                            {selectedDayEvents.map((evt, i) => {
                                                let badgeClass = "bg-brand-yellow/10 text-brand-black dark:text-brand-yellow border-brand-yellow/20";
                                                let icon = <Clock size={16} />;

                                                if (evt.type === 'holiday') {
                                                    badgeClass = "bg-brand-green text-white border-teal-600";
                                                    icon = <Plane size={16} />;
                                                }
                                                if (evt.type === 'deadline') {
                                                    badgeClass = "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/50";
                                                    icon = <CheckSquare size={16} />;
                                                }
                                                if (evt.type === 'leave') {
                                                    badgeClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
                                                    icon = <Briefcase size={16} />;
                                                }

                                                return (
                                                    <li key={i} className="flex items-start">
                                                        <div className={`p-3 rounded-xl border flex-shrink-0 ${badgeClass} shadow-sm mr-4 mt-1`}>
                                                            {icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{evt.title}</h4>
                                                            <div className="flex items-center text-sm font-medium text-gray-500 mt-1">
                                                                <Clock size={14} className="mr-1.5 opacity-70" /> {evt.time}
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700/50 mb-4 text-gray-300 dark:text-gray-600">
                                                <CheckSquare size={32} />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-500 dark:text-gray-400">No events today</h4>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium">Enjoy your free time!</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-brand-black text-white dark:bg-brand-yellow dark:text-brand-black font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyCalendar;
