import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import logoUrl from '../../assets/logo.png';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import {
    Users, Plane, CheckSquare, Network, LayoutDashboard, Menu, LogOut,
    Search, Bell, Megaphone, Calendar, X, Clock, DollarSign, Trash2, Edit2, Plus
} from 'lucide-react';

const AdminDashboard = ({ onLogout, employeesData = [], leaveRequests = [], attendanceData = [], announcements = [], setAnnouncements }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [events, setEvents] = useState([]);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '', category: 'Meeting' });
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnnouncement.trim()) return;
        setIsPosting(true);
        try {
            await addDoc(collection(db, 'notifications'), {
                text: newAnnouncement,
                sender: "Admin",
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            setNewAnnouncement('');
        } catch (err) {
            console.error("Error posting announcement:", err);
        } finally {
            setIsPosting(false);
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
                    // Handle Firestore timestamps for local sorting/rendering if needed
                    startDate: data.start?.toDate ? data.start.toDate() : new Date(),
                    endDate: data.end?.toDate ? data.end.toDate() : new Date()
                };
            });
            setEvents(list);
        });
        return () => unsubscribe();
    }, []);

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        try {
            const eventDoc = {
                title: newEvent.title,
                start: Timestamp.fromDate(new Date(newEvent.start)),
                end: Timestamp.fromDate(new Date(newEvent.end)),
                description: newEvent.description,
                category: newEvent.category
            };
            await addDoc(collection(db, 'official_calendar_events'), eventDoc);
            setIsEventModalOpen(false);
            setNewEvent({ title: '', start: '', end: '', description: '', category: 'Meeting' });
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm("Remove this event from the official calendar?")) return;
        try {
            await deleteDoc(doc(db, 'official_calendar_events', id));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleDeleteAnnouncement = (id) => {
        setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const onLeaveToday = (leaveRequests || []).filter(req =>
        req?.status === 'Approved' &&
        req?.startDate && req?.endDate &&
        todayStr >= req.startDate &&
        todayStr <= req.endDate
    ).length;

    const pendingLeaves = (leaveRequests || []).filter(r => r?.status === 'Pending').length;

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
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/hr-calendar'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Calendar className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">HR Calendar</span>
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

                <div className="p-4 border-t border-teal-800 space-y-2">
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
                            <StatCard
                                title="Total Employees"
                                value={employeesData?.length || 0}
                                icon={Users}
                                trend="+2 this month"
                                theme="green"
                            />
                            <StatCard
                                title="Total Monthly Payroll"
                                value={`Rs. ${new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0 }).format((employeesData || []).reduce((acc, emp) => acc + (emp.baseSalary || 0), 0))}`}
                                icon={DollarSign}
                                trend="Estimated Total"
                                theme="yellow"
                            />
                            <StatCard
                                title="On Leave Today"
                                value={onLeaveToday}
                                icon={Plane}
                                trend="Updated now"
                                theme="default"
                            />
                            <StatCard
                                title="Pending Requests"
                                value={pendingLeaves}
                                icon={CheckSquare}
                                trend="Action required"
                                theme="default"
                            />
                        </div>

                        {/* Announcements & Upcoming Events */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Announcements */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-brand-black dark:text-white uppercase tracking-wider flex items-center">
                                        <Megaphone className="mr-3 text-brand-yellow" size={20} /> Announcements
                                    </h3>
                                </div>

                                <form onSubmit={handlePostAnnouncement} className="mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newAnnouncement}
                                            onChange={(e) => setNewAnnouncement(e.target.value)}
                                            placeholder="Post a new announcement..."
                                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-yellow transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isPosting}
                                            className="bg-brand-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {isPosting ? '...' : 'Post'}
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(announcements || []).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map((ann) => (
                                        <div key={ann.id || Math.random()} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 group relative">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">{ann?.text || ann?.message || ''}</p>
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>{ann?.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : ann?.timestamp?.toDate ? ann.timestamp.toDate().toLocaleDateString() : 'Official Broadcast'}</span>
                                                <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                    {(announcements || []).length === 0 && (
                                        <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No announcements yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Events Widget */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-brand-black dark:text-white uppercase tracking-wider flex items-center">
                                        <Calendar className="mr-3 text-brand-green dark:text-brand-yellow" size={20} /> HR Calendar
                                    </h3>
                                    <button 
                                        onClick={() => setIsEventModalOpen(true)}
                                        className="p-2 bg-brand-yellow text-brand-black rounded-xl hover:scale-105 transition-all shadow-sm flex items-center text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <Plus size={16} className="mr-1" /> Add Event
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {(events || []).map((evt) => (
                                        <div key={evt.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 group transition-all hover:border-brand-yellow">
                                            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 rounded-xl p-3 min-w-[76px] text-center shadow-sm">
                                                <span className="block text-2xl font-extrabold text-brand-green dark:text-brand-yellow leading-none mb-1">
                                                    {evt.startDate.getDate()}
                                                </span>
                                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                    {evt.startDate.toLocaleDateString('en-PK', { month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="ml-5 flex-1 min-w-0">
                                                <h3 className="font-bold text-brand-black dark:text-white text-md truncate">{evt.title}</h3>
                                                <p className="text-[10px] font-semibold text-gray-500 mt-1 uppercase tracking-wider truncate">
                                                    {evt.category} • {evt.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteEvent(evt.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete Event"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {events.length === 0 && (
                                        <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">No upcoming events scheduled</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Logout & Logic helper */}
                        <div className="hidden">
                            <button onClick={handleLogout}>Logout</button>
                        </div>

                        {/* Add Event Modal */}
                        {isEventModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all">
                                    <div className="bg-brand-green p-8 text-white flex justify-between items-center border-b border-teal-800">
                                        <h3 className="text-2xl font-black flex items-center tracking-tighter uppercase">
                                            <Calendar className="mr-3 text-brand-yellow" size={28} /> Add Official Event
                                        </h3>
                                        <button onClick={() => setIsEventModalOpen(false)} className="text-white/60 hover:text-white transition-transform hover:rotate-90"><X size={28} /></button>
                                    </div>
                                    <form onSubmit={handleSaveEvent} className="p-10 space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Event Title</label>
                                            <input 
                                                type="text" required placeholder="e.g. Q1 Budget Sync"
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Start Time</label>
                                                <input 
                                                    type="datetime-local" required
                                                    value={newEvent.start}
                                                    onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">End Time</label>
                                                <input 
                                                    type="datetime-local" required
                                                    value={newEvent.end}
                                                    onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Category</label>
                                                <select 
                                                    value={newEvent.category}
                                                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green appearance-none cursor-pointer"
                                                >
                                                    <option value="Meeting">Personnel Meeting</option>
                                                    <option value="Deadline">Project Deadline</option>
                                                    <option value="Holiday">Company Holiday</option>
                                                    <option value="Training">Training Session</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
                                                <input 
                                                    type="text" placeholder="Short memo..."
                                                    value={newEvent.description}
                                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-brand-black dark:text-white font-bold outline-none focus:border-brand-green transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex space-x-6 pt-4">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsEventModalOpen(false)}
                                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-400 font-black py-5 rounded-2xl transition-all hover:bg-gray-200 uppercase tracking-widest text-[10px]"
                                            >
                                                Discard
                                            </button>
                                            <button 
                                                type="submit"
                                                className="flex-1 bg-brand-yellow hover:bg-yellow-400 text-brand-black font-black py-5 rounded-2xl shadow-xl transition-all flex justify-center items-center group uppercase tracking-widest text-[10px]"
                                            >
                                                Save Official Event
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
