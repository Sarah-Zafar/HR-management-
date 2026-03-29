import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Clock, Plane, Calendar as CalendarIcon, Send, Building2, CheckSquare, X, Menu, LogOut, LayoutDashboard, DollarSign, Briefcase, ChevronLeft, ChevronRight, Plus, Trash2, Network, Users
} from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';

const CalendarManager = ({ onLogout, employeesData = [], leaveRequests = [], companyHolidays = [] }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [selectedDateFormatted, setSelectedDateFormatted] = useState('');
    const [officialEvents, setOfficialEvents] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '', category: 'Meeting' });
    const navigate = useNavigate();

    useEffect(() => {
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

    const getMergedEventsForDay = (day, m, y) => {
        const cellDate = new Date(y, m, day);
        const cellDateStr = cellDate.toDateString();
        const dateKeyStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 1. Official Events (Firestore)
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

        // 2. Company Holidays (Props/State)
        const holidayEvents = (companyHolidays || [])
            .filter(h => h?.date === dateKeyStr)
            .map(h => ({ title: h?.title || 'Holiday', type: 'holiday', time: 'All Day' }));

        return [...official, ...holidayEvents];
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        const eventDoc = {
            title: newEvent.title,
            start: Timestamp.fromDate(new Date(newEvent.start)),
            end: Timestamp.fromDate(new Date(newEvent.end)),
            description: newEvent.description,
            category: newEvent.category
        };
        console.log("Saving Event...", eventDoc);
        try {
            await addDoc(collection(db, 'official_calendar_events'), eventDoc);
            console.log("Success!");
            setIsAddModalOpen(false);
            setNewEvent({ title: '', start: '', end: '', description: '', category: 'Meeting' });
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm("Are you sure you want to delete this official event?")) return;
        console.log("Deleting Event ID:", id);
        try {
            await deleteDoc(doc(db, 'official_calendar_events', id));
            console.log("Delete Success!");
            setShowModal(false); // Close modal automatically as requested
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const handleDayClick = (day) => {
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const events = getMergedEventsForDay(day, currentDate.getMonth(), currentDate.getFullYear());
        setSelectedDayEvents(events);
        setSelectedDateFormatted(dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
        setShowModal(true);
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    // Accurate Date Logic for Grid Generation
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Generate 42 cells to ensure a consistent 6-row layout
    const allCells = [];
    // 1. Previous month blanks
    for (let i = 0; i < firstDayOfMonth; i++) {
        allCells.push({ type: 'blank', key: `blank-${i}` });
    }
    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        allCells.push({ type: 'day', day: d, key: `day-${d}` });
    }
    // 3. Next month blanks to fill up to 42
    const remaining = 42 - allCells.length;
    for (let i = 0; i < remaining; i++) {
        allCells.push({ type: 'blank', key: `next-${i}` });
    }

    console.log(`[Calendar] ${monthName}: ${daysInMonth} days, starts on index ${firstDayOfMonth}. Grid slots: ${allCells.length}`);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors font-sans overflow-hidden">
            
            {/* Sidebar Overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-teal-800 bg-white/10">
                    <div className="bg-white p-2 rounded-lg flex items-center justify-center w-full shadow-inner">
                        <img src={logoUrl} alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-6">
                    <nav className="space-y-2 px-4">
                        <Link to="/admin/dashboard" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <LayoutDashboard className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/admin/directory" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Users className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>Employee Directory</span>
                        </Link>
                        <Link to="/admin/leave" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Plane className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>Leave Dashboard</span>
                        </Link>
                        <Link to="/hr-calendar" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <CalendarIcon className="mr-3" size={20} />
                            <span>HR Calendar</span>
                        </Link>
                        <Link to="/admin/chart" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Network className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>Chart</span>
                        </Link>
                        <Link to="/admin/attendance" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Clock className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>Attendance</span>
                        </Link>
                        <Link to="/admin/payroll" className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <DollarSign className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span>Payroll Overview</span>
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-8 shadow-sm z-20">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
                            <Menu size={24} />
                        </button>
                        <h1 className="text-2xl font-extrabold text-brand-black dark:text-white tracking-tight flex items-center">
                            <CalendarIcon className="text-brand-green mr-3" size={28} /> HR Calendar Manager
                        </h1>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-yellow text-brand-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center"
                    >
                        <Plus size={18} className="mr-2" /> Schedule Event
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth bg-gray-50 dark:bg-gray-900 text-left">
                    <div className="max-w-7xl mx-auto flex flex-col h-full animate-fade-in-up">
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col min-h-[850px]">
                            {/* Calendar Header */}
                            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                                    <button onClick={handlePrevMonth} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors shadow-sm bg-white dark:bg-gray-800"><ChevronLeft size={24} /></button>
                                    <h2 className="text-3xl font-black text-brand-black dark:text-white min-w-[280px] text-center tracking-tighter uppercase">{monthName}</h2>
                                    <button onClick={handleNextMonth} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors shadow-sm bg-white dark:bg-gray-800"><ChevronRight size={24} /></button>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={handleToday} className="px-6 py-2.5 bg-brand-green text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-md uppercase text-[10px] tracking-widest">Today</button>
                                </div>
                            </div>

                            {/* Weekdays */}
                            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                {days.map(day => <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{day}</div>)}
                            </div>

                            {/* Grid (Force 6 rows to prevent cutoff) */}
                            <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-gray-50 dark:bg-gray-900 border-l border-t border-gray-100 dark:border-gray-800">
                                {allCells.map((cell) => {
                                    if (cell.type === 'blank') {
                                        return <div key={cell.key} className="border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-2 min-h-[140px]"></div>;
                                    }

                                    const day = cell.day;
                                    const evts = getMergedEventsForDay(day, currentDate.getMonth(), currentDate.getFullYear());
                                    const today = new Date();
                                    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                                    return (
                                        <div 
                                            key={cell.key} 
                                            onClick={() => handleDayClick(day)}
                                            className={`border-r border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-3 min-h-[140px] transition-all relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${isToday ? 'bg-brand-yellow/5 dark:bg-brand-yellow/10 ring-2 ring-inset ring-brand-yellow/50' : ''}`}
                                        >
                                            <span className={`text-sm font-black flex items-center justify-center w-8 h-8 rounded-full mb-2 ${isToday ? 'bg-brand-yellow text-brand-black border border-yellow-500 shadow-md' : 'text-gray-400 dark:text-gray-500'}`}>{day}</span>
                                            <div className="space-y-1.5 mt-1">
                                                {(evts || []).map((e, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        title={e?.title}
                                                        className={`px-2 py-1 rounded text-[10px] font-black truncate border shadow-sm flex items-center justify-between group/evt ${e?.type === 'holiday' ? 'bg-brand-green text-white border-teal-600' : 'bg-brand-yellow/20 text-brand-black dark:text-brand-yellow border-brand-yellow/30'}`}
                                                    >
                                                        <span className="truncate">{e?.title || 'Event'}</span>
                                                        {e.id && (
                                                            <button 
                                                                onClick={(evt) => {
                                                                    evt.stopPropagation();
                                                                    handleDeleteEvent(e.id);
                                                                }}
                                                                className="ml-1 text-white hover:text-red-300 opacity-0 group-hover/evt:opacity-100 transition-all p-0.5"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-fade-in" text-left>
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md relative overflow-hidden text-left">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-xl font-black text-brand-black dark:text-white uppercase tracking-tighter">{selectedDateFormatted}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">
                            {selectedDayEvents.length > 0 ? selectedDayEvents.map((e, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 group">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${e.type === 'holiday' ? 'bg-brand-green text-white' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                                            {e.type === 'holiday' ? <Plane size={16} /> : <Clock size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-black dark:text-white text-sm">{e.title}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{e.time}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs tracking-widest">No scheduled activities</p>}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t">
                            {selectedDayEvents.length > 0 && (
                                <button 
                                    onClick={() => handleDeleteEvent(selectedDayEvents[0].id)} 
                                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                    DELETE EVENT
                                </button>
                            )}
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-black"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-md animate-fade-in text-left">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-700 text-left">
                        <div className="bg-brand-green p-10 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
                            <h3 className="text-2xl font-black flex items-center tracking-tighter uppercase relative z-10"><CalendarIcon className="mr-3 text-brand-yellow" size={28} /> Add Official Event</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white/60 hover:text-white transition-transform hover:rotate-90 relative z-10"><X size={28} /></button>
                        </div>
                        <form onSubmit={handleSaveEvent} className="p-10 space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Event Title</label>
                                <input type="text" required placeholder="e.g. Eid-ul-Fitr Celebration" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Start Time</label>
                                    <input type="datetime-local" required value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">End Time</label>
                                    <input type="datetime-local" required value={newEvent.end} onChange={e => setNewEvent({...newEvent, end: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Category</label>
                                    <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-brand-black dark:text-white font-black outline-none focus:border-brand-green cursor-pointer shadow-sm">
                                        <option value="Meeting">Personnel Meeting</option>
                                        <option value="Deadline">Project Deadline</option>
                                        <option value="Holiday">Company Holiday</option>
                                        <option value="Training">Training Session</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
                                    <input type="text" placeholder="Short memo..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="flex space-x-6 pt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-400 font-black py-5 rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500 uppercase tracking-widest text-[10px]">Discard</button>
                                <button type="submit" className="flex-1 bg-brand-yellow hover:bg-yellow-400 text-brand-black font-black py-5 rounded-2xl shadow-xl transition-all flex justify-center items-center group uppercase tracking-widest text-[10px]">
                                    <CalendarIcon size={18} className="mr-3 group-hover:scale-110 transition-transform" /> Save Official Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarManager;
