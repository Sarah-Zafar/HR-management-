import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import {
    Users, UserPlus, FileText, CheckCircle, Plane, CheckSquare,
    LayoutDashboard, Search, Bell, Menu, X, LogOut, Network, Clock, DollarSign,
    Mail, Phone, MapPin, Briefcase, Calendar, ChevronRight, Filter, Download, Save, Edit, FileCode2, Trash2
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
const EmployeeDirectory = ({ onLogout, employees = initialEmployees, setEmployees }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editPreviewForm, setEditPreviewForm] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New Employee Form State
    const [newEmp, setNewEmp] = useState({ name: '', role: '', email: '', joiningDate: '', age: '', qualification: '' });

    const navigate = useNavigate();

    const getTierForRole = (role) => {
        if (role === 'Director') return 1;
        if (['Manager', 'HR Specialist', 'HR Manager'].includes(role)) return 2;
        if (role === 'Supervisor') return 3;
        return 4;
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm("Permanently delete employee and all related logs?")) return;
        try {
            await deleteDoc(doc(db, "employees", employeeId));
            // Cascade delete to relevant metadata collections
            await deleteDoc(doc(db, "payroll", employeeId));
            await deleteDoc(doc(db, "leaves", employeeId));
            console.log(`Synchronization: Employee ${employeeId} removed from Cloud Roster.`);
        } catch (error) {
            console.error("Firebase Deletion Error:", error);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();

        const addedEmp = {
            ...newEmp,
            status: 'Active',
            tier: getTierForRole(newEmp.role),
            sick: { total: 8, taken: 0 },
            casual: { total: 5, taken: 0 },
            annual: { total: 10, taken: 0 },
            baseSalary: 5000,
            remainingQuota: 23,
            hoursWorked: 164,
            overtimeWorked: 0,
            supervisorId: 'direct', // Default placement for hierarchy
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, 'employees'), addedEmp);
            setNewEmp({ name: '', role: '', email: '', joiningDate: '', age: '', qualification: '' });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Firebase Add Error:", error);
        }
    };

    const handleSavePreview = () => {
        const updatedEmp = {
            ...editPreviewForm,
            tier: getTierForRole(editPreviewForm.role)
        };

        setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
        setSelectedEmp(updatedEmp);
        setIsEditingPreview(false);
    };

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
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <LayoutDashboard className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <Users className="mr-3" size={20} />
                            <span>Employee Directory</span>
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

                <div className="p-4 border-t border-teal-800">
                    <button onClick={() => { onLogout(); navigate('/'); }} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-colors group">
                        <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Light Header */}
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
                                placeholder="Search staff members..."
                                className="bg-transparent border-none outline-none w-full text-brand-black dark:text-white placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-400 hover:text-brand-green dark:hover:text-brand-yellow transition-colors group">
                            <Bell size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <div className="flex items-center cursor-pointer group">
                            <div className="h-10 w-10 rounded-full bg-brand-yellow text-brand-black flex items-center justify-center font-bold text-lg shadow-sm border border-yellow-500 group-hover:scale-105 transition-transform">A</div>
                        </div>
                    </div>
                </header>

                {/* Directory Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-10">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 animate-fade-in-up">
                            <div>
                                <h1 className="text-3xl font-extrabold text-brand-black dark:text-white tracking-tight">Organization Roster</h1>
                                <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Manage and review {employees.length} active team members.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-4 sm:mt-0 flex items-center justify-center px-6 py-3 bg-brand-yellow text-brand-black font-extrabold rounded-xl shadow-lg shadow-brand-yellow/10 hover:bg-yellow-400 hover:shadow-brand-yellow/20 hover:-translate-y-1 transition-all"
                            >
                                <UserPlus size={20} className="mr-2" /> Add Employee
                            </button>
                        </div>

                        {/* CSS Grid Directory view */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                            {employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.role.toLowerCase().includes(searchQuery.toLowerCase())).map(emp => (
                                <div key={emp.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-brand-green/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center group transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-green/5 shadow-sm">
                                    <div className="w-20 h-20 bg-brand-green/10 dark:bg-brand-green/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-brand-green/20 dark:border-brand-green/30 relative">
                                        <Users size={32} className="text-brand-green group-hover:text-teal-700 dark:group-hover:text-brand-yellow transition-colors" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }}
                                            className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-black dark:text-white mb-1 group-hover:text-brand-green dark:group-hover:text-brand-yellow transition-colors">{emp.name}</h3>
                                    <p className="text-brand-green font-bold text-sm tracking-widest uppercase mb-4">{emp.role}</p>

                                    <div className="flex items-center space-x-2 mb-6 px-4 py-1.5 bg-brand-green/5 rounded-full border border-teal-500/10">
                                        <Plane size={14} className="text-brand-green" />
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                            Quota: <span className="text-brand-yellow font-black ml-1 text-xs">{emp.remainingQuota || 0} Days</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const activeEmp = { ...emp, hoursWorked: emp.hoursWorked || 164, overtimeWorked: emp.overtimeWorked || 12 };
                                            setSelectedEmp(activeEmp);
                                            setEditPreviewForm(activeEmp);
                                            setIsEditingPreview(false);
                                        }}
                                        className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-black dark:hover:text-white transition-colors flex items-center justify-center"
                                    >
                                        <FileText size={16} className="mr-2" /> Preview
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>
                </main>

                {/* ---- Preview Modal ---- */}
                {selectedEmp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 shrink-0">
                                <h2 className="text-2xl font-bold text-brand-black dark:text-white flex items-center flex-1">
                                    <Users className="text-brand-green dark:text-brand-yellow mr-3 shrink-0" size={28} />
                                    {isEditingPreview ? (
                                        <input type="text" value={editPreviewForm.name} onChange={e => setEditPreviewForm({ ...editPreviewForm, name: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-black dark:text-white outline-none focus:border-brand-green w-full max-w-sm font-bold text-2xl" />
                                    ) : selectedEmp.name}
                                </h2>
                                <button onClick={() => setSelectedEmp(null)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 sm:p-8 space-y-8 bg-white dark:bg-gray-900 overflow-y-auto">

                                {/* Employee Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Assigned Role</p>
                                        {isEditingPreview ? (
                                            <select value={editPreviewForm.role} onChange={e => setEditPreviewForm({ ...editPreviewForm, role: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold">
                                                <option value="Director">Director (Tier 1)</option>
                                                <option value="Manager">Manager (Tier 2)</option>
                                                <option value="HR Specialist">HR Specialist (Tier 2)</option>
                                                <option value="Supervisor">Supervisor (Tier 3)</option>
                                                <option value="FRS II">FRS II (Tier 4)</option>
                                                <option value="FRS I">FRS I (Tier 4)</option>
                                                <option value="FRA">FRA (Tier 4)</option>
                                            </select>
                                        ) : (
                                            <p className="text-lg font-bold text-brand-green dark:text-brand-yellow">{selectedEmp.role}</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Supervisor</p>
                                        {isEditingPreview ? (
                                            <select value={editPreviewForm.supervisorId || ''} onChange={e => setEditPreviewForm({ ...editPreviewForm, supervisorId: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold">
                                                <option value="">No Reporting Head</option>
                                                {employees
                                                    .filter(e => e.id !== editPreviewForm.id)
                                                    .filter(e => e.role === 'Supervisor')
                                                    .map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <p className="text-lg font-bold text-brand-black dark:text-white truncate">
                                                {employees.find(e => String(e.id) === String(selectedEmp.supervisorId))?.name || 'Directorate'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email Roster</p>
                                        {isEditingPreview ? (
                                            <input type="email" value={editPreviewForm.email} onChange={e => setEditPreviewForm({ ...editPreviewForm, email: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold" />
                                        ) : (
                                            <p className="text-lg font-bold text-brand-black dark:text-white truncate" title={selectedEmp.email}>{selectedEmp.email}</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Joining Date</p>
                                        {isEditingPreview ? (
                                            <input type="date" value={editPreviewForm.joiningDate} onChange={e => setEditPreviewForm({ ...editPreviewForm, joiningDate: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold" />
                                        ) : (
                                            <p className="text-lg font-bold text-brand-black dark:text-white">{selectedEmp.joiningDate}</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Remaining Quota</p>
                                        {isEditingPreview ? (
                                            <input type="number" value={editPreviewForm.remainingQuota} onChange={e => setEditPreviewForm({ ...editPreviewForm, remainingQuota: parseInt(e.target.value) || 0 })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold" />
                                        ) : (
                                            <p className="text-lg font-bold text-brand-yellow">{selectedEmp.remainingQuota || 0} Days</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">System Status</p>
                                        {isEditingPreview ? (
                                            <select value={editPreviewForm.status} onChange={e => setEditPreviewForm({ ...editPreviewForm, status: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold">
                                                <option value="Active">Active</option>
                                                <option value="On Leave">On Leave</option>
                                                <option value="Terminated">Terminated</option>
                                            </select>
                                        ) : (
                                            <p className="text-lg font-bold text-green-600 dark:text-green-500 flex items-center"><CheckCircle size={16} className="mr-2" /> {selectedEmp.status}</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Age</p>
                                        {isEditingPreview ? (
                                            <input type="number" value={editPreviewForm.age} onChange={e => setEditPreviewForm({ ...editPreviewForm, age: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold" />
                                        ) : (
                                            <p className="text-lg font-bold text-brand-black dark:text-white">{selectedEmp.age} Years</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Academics</p>
                                        {isEditingPreview ? (
                                            <input type="text" value={editPreviewForm.qualification} onChange={e => setEditPreviewForm({ ...editPreviewForm, qualification: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold" />
                                        ) : (
                                            <p className="text-lg font-bold text-brand-black dark:text-white">{selectedEmp.qualification}</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 md:col-span-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Hours Logged (Mtd)</p>
                                        {isEditingPreview ? (
                                            <div className="flex items-center space-x-2 w-full">
                                                <input type="number" value={editPreviewForm.hoursWorked} onChange={e => setEditPreviewForm({ ...editPreviewForm, hoursWorked: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold flex-1" />
                                                <span className="text-sm text-gray-400 font-medium shrink-0">hrs</span>
                                            </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-brand-green dark:text-brand-yellow">{selectedEmp.hoursWorked} <span className="text-sm text-gray-400 font-medium">hrs</span></p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 md:col-span-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Overtime Logged</p>
                                        {isEditingPreview ? (
                                            <div className="flex items-center space-x-2 w-full">
                                                <input type="number" value={editPreviewForm.overtimeWorked} onChange={e => setEditPreviewForm({ ...editPreviewForm, overtimeWorked: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-1 text-brand-black dark:text-white outline-none font-bold flex-1" />
                                                <span className="text-sm text-gray-400 font-medium shrink-0">hrs</span>
                                            </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-brand-black dark:text-white">{selectedEmp.overtimeWorked} <span className="text-sm text-gray-400 font-medium">hrs</span></p>
                                        )}
                                    </div>
                                </div>

                                {/* Contract Attachment Area */}
                                <div>
                                    <h3 className="text-brand-black dark:text-white font-bold mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Contract & Documents</h3>
                                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-green hover:bg-brand-green/5 transition-colors cursor-pointer group">
                                        <FileCode2 size={40} className="text-gray-400 dark:text-gray-500 group-hover:text-brand-green mb-3 transition-colors" />
                                        <p className="text-brand-black dark:text-white font-bold text-lg mb-1">Official Employment Contract</p>
                                        <p className="text-sm text-gray-500 font-medium">Click to upload or review latest document versions.</p>
                                    </div>
                                </div>

                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-4">
                                {isEditingPreview ? (
                                    <>
                                        <button onClick={() => { setIsEditingPreview(false); setEditPreviewForm(selectedEmp); }} className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-sm cursor-pointer">Cancel</button>
                                        <button onClick={handleSavePreview} className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-lg flex items-center cursor-pointer"><Save size={18} className="mr-2" /> Save Changes</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditingPreview(true)} className="px-6 py-2.5 bg-brand-yellow text-brand-black font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-yellow/20 flex items-center cursor-pointer"><Edit size={18} className="mr-2" /> Edit Profile</button>
                                        <button onClick={() => setSelectedEmp(null)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer">Close View</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---- Add Employee Modal ---- */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                <h2 className="text-2xl font-bold text-brand-black dark:text-white flex items-center">
                                    <UserPlus className="text-brand-green mr-3" size={28} /> Add New Employee
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddEmployee} className="p-6 space-y-4 bg-white dark:bg-gray-900">
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                                    <input type="text" required value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors" placeholder="John Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Role</label>
                                        <select required value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors appearance-none cursor-pointer">
                                            <option value="" disabled>Select Role</option>
                                            <option value="Director">Director (Tier 1)</option>
                                            <option value="Manager">Manager (Tier 2)</option>
                                            <option value="HR Specialist">HR Specialist (Tier 2)</option>
                                            <option value="Supervisor">Supervisor (Tier 3)</option>
                                            <option value="FRS II">FRS II (Tier 4)</option>
                                            <option value="FRS I">FRS I (Tier 4)</option>
                                            <option value="FRA">FRA (Tier 4)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Supervisor</label>
                                        <select value={newEmp.supervisorId || ''} onChange={e => setNewEmp({ ...newEmp, supervisorId: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors appearance-none cursor-pointer">
                                            <option value="">No Reporting Head</option>
                                            {employees.filter(e => e.role === 'Supervisor').map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Joining Date</label>
                                        <input type="date" required value={newEmp.joiningDate} onChange={e => setNewEmp({ ...newEmp, joiningDate: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Email</label>
                                    <input type="email" required value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors" placeholder="name@octaaccountants.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Age</label>
                                        <input type="number" required value={newEmp.age} onChange={e => setNewEmp({ ...newEmp, age: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors" placeholder="25" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 block">Academics</label>
                                        <input type="text" required value={newEmp.qualification} onChange={e => setNewEmp({ ...newEmp, qualification: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-lg px-4 py-3 focus:border-brand-green dark:focus:border-brand-yellow outline-none transition-colors" placeholder="e.g. ACCA" />
                                    </div>
                                </div>
                                <div className="pt-4 flex space-x-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 font-bold text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 font-bold text-brand-black bg-brand-yellow rounded-xl hover:bg-yellow-400 shadow-lg shadow-brand-yellow/10 hover:shadow-brand-yellow/30 transition-all">Onboard Staff</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EmployeeDirectory;
