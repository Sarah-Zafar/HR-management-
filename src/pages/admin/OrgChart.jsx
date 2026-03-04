import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import {
    Users, Plane, LayoutDashboard, Menu, X, LogOut, Network, Edit2, Shield, User, Briefcase, Save, Clock, DollarSign, Crown, CheckCircle
} from 'lucide-react';
const OrgChart = ({ onLogout, employeesData = [], setEmployeesData }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // 4-Tier Roles mapping
    const DIRECTOR_ROLES = ['Director'];
    const MANAGER_ROLES = ['Manager'];
    const SUPERVISOR_ROLES = ['Supervisor', 'HR Manager'];
    // Everything else is staff/employee tier

    // Tier-based Personnel Sorting (4 Tiers)
    const tiers = useMemo(() => {
        const sorted = {
            directors: [],
            managers: [],
            supervisors: [],
            employees: []
        };

        (employeesData || []).forEach(emp => {
            if (!emp?.role) return;
            if (DIRECTOR_ROLES.includes(emp.role)) sorted.directors.push(emp);
            else if (MANAGER_ROLES.includes(emp.role)) sorted.managers.push(emp);
            else if (SUPERVISOR_ROLES.includes(emp.role)) sorted.supervisors.push(emp);
            else sorted.employees.push(emp);
        });

        return sorted;
    }, [employeesData]);

    const getTierForRole = (role) => {
        if (role === 'Director') return 1;
        if (['Manager', 'HR Specialist'].includes(role)) return 2;
        if (role === 'Supervisor') return 3;
        return 4;
    };

    const handleUpdateEmployee = (e) => {
        e.preventDefault();
        const updated = {
            ...editingEmployee,
            tier: getTierForRole(editingEmployee.role)
        };

        setEmployeesData(prev => prev.map(emp => emp.id === updated.id ? updated : emp));
        setEditingEmployee(null);
        setToast({ message: `${editingEmployee.name} updated successfully!` });
        setTimeout(() => setToast(null), 3000);
    };

    const TierSection = ({ title, data, tierId }) => (
        <div className="mb-12 animate-fade-in-up">
            <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center ${tierId === 1 ? 'text-amber-500' :
                tierId === 2 ? 'text-brand-green' :
                    tierId === 3 ? 'text-blue-500' :
                        'text-gray-400'
                }`}>
                <div className={`w-8 h-[2px] mr-3 ${tierId === 1 ? 'bg-amber-400' :
                    tierId === 2 ? 'bg-brand-green' :
                        tierId === 3 ? 'bg-blue-400' :
                            'bg-gray-200'
                    }`}></div>
                {title} <span className="ml-3 opacity-50 font-black">({data?.length || 0})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.map(emp => (
                    <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative group transition-all hover:shadow-xl hover:-translate-y-1">
                        <button
                            onClick={() => setEditingEmployee(emp)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-brand-yellow transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>

                        <div className="flex items-center mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${tierId === 1 ? 'bg-amber-50 dark:bg-amber-900/10' :
                                tierId === 2 ? 'bg-brand-green/10' :
                                    tierId === 3 ? 'bg-blue-50 dark:bg-blue-900/10' :
                                        'bg-gray-50 dark:bg-gray-700/30'
                                }`}>
                                {tierId === 1 ? <Crown className="text-amber-500" size={24} /> :
                                    tierId === 2 ? <Shield className="text-brand-green" size={24} /> :
                                        tierId === 3 ? <Briefcase className="text-blue-500" size={24} /> :
                                            <User className="text-gray-400" size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-brand-black dark:text-white leading-tight">{emp.name}</h3>
                                <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.1em] mt-1">{emp.role}</p>
                            </div>
                        </div>

                        {tierId !== 1 && (
                            <div className="pt-4 border-t border-gray-50 dark:border-gray-700">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Reports to:</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${tierId === 4 ? 'bg-blue-400' : 'bg-teal-400'}`}></div>
                                    {employeesData.find(e => String(e?.id) === String(emp?.supervisorId))?.name || 'Directorate'}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    // Filter supervisors for the dropdown (Tier 3)
    const supervisorList = useMemo(() => {
        return (employeesData || []).filter(emp => emp?.role && (SUPERVISOR_ROLES.includes(emp.role) || MANAGER_ROLES.includes(emp.role)));
    }, [employeesData]);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
            {toast && (
                <div className="fixed top-6 right-6 z-[110] px-6 py-4 rounded-2xl shadow-2xl bg-brand-green text-white flex items-center animate-fade-in-right">
                    <CheckCircle className="mr-3 text-brand-yellow" size={20} />
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green flex flex-col transition-transform duration-300 border-r border-teal-900 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-teal-800 bg-white/5">
                    <div className="bg-white p-2 rounded-lg flex items-center justify-center w-full shadow-inner">
                        <img src={logoUrl} alt="Octa Accountants" className="h-8 object-contain" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-6">
                    <nav className="space-y-2 px-4">
                        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all group text-left">
                            <LayoutDashboard className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Dashboard</span>
                        </button>
                        <button onClick={() => navigate('/admin/directory')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all group text-left">
                            <Users className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Employee Directory</span>
                        </button>
                        <button onClick={() => navigate('/admin/leave')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all group text-left">
                            <Plane className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Leave Dashboard</span>
                        </button>
                        <button className="flex items-center w-full px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md text-left">
                            <Network className="mr-3" size={20} />
                            <span>Chart</span>
                        </button>
                        <button onClick={() => navigate('/admin/attendance')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group text-left">
                            <Clock className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Attendance</span>
                        </button>
                        <button onClick={() => navigate('/admin/payroll')} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group text-left">
                            <DollarSign className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Payroll Overview</span>
                        </button>
                    </nav>
                </div>
                <div className="p-4 border-t border-teal-800">
                    <button onClick={() => { if (onLogout) onLogout(); navigate('/'); }} className="flex items-center w-full px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 transition-colors group text-left">
                        <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-40">
                    <div className="flex items-center flex-1">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"><Menu size={24} /></button>
                        <h1 className="text-xl font-black text-brand-black dark:text-white tracking-tight flex items-center">
                            <Network className="mr-3 text-brand-green dark:text-brand-yellow" size={28} /> Personnel Hierarchy
                        </h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-10 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <TierSection title="Board of Directors" tierId={1} data={tiers.directors} />
                        <TierSection title="Management Team" tierId={2} data={tiers.managers} />
                        <TierSection title="Supervisory Level" tierId={3} data={tiers.supervisors} />
                        <TierSection title="Staff / Personnel" tierId={4} data={tiers.employees} />
                    </div>
                </main>

                {/* Edit Modal */}
                {editingEmployee && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-brand-black dark:text-white uppercase tracking-widest">Edit Personnel</h3>
                                <button onClick={() => setEditingEmployee(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleUpdateEmployee} className="p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={editingEmployee.name}
                                        onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-700 dark:text-white outline-none focus:border-brand-green transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Hierarchy Role</label>
                                    <select
                                        value={editingEmployee.role}
                                        onChange={e => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-700 dark:text-white outline-none focus:border-brand-green appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="Director">Director</option>
                                        <option value="Manager">Manager</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="FRS II">FRS II</option>
                                        <option value="FRS I">FRS I</option>
                                        <option value="FRA">FRA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Reporting Head</label>
                                    <select
                                        value={editingEmployee.supervisorId || ''}
                                        onChange={e => setEditingEmployee({ ...editingEmployee, supervisorId: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-700 dark:text-white outline-none focus:border-brand-green appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="">No Reporting Head</option>
                                        {supervisorList
                                            .filter(e => e.id !== editingEmployee.id)
                                            .map(e => (
                                                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                            ))}
                                    </select>
                                    <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">Note: Employees primarily report to Supervisors/Managers.</p>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-green text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-900/10 hover:shadow-teal-900/30 transition-all flex items-center justify-center translate-y-0 active:translate-y-1"
                                    >
                                        <Save className="mr-2" size={20} /> Update Personnel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgChart;
