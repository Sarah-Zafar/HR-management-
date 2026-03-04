import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import {
    Users, Plane, CheckSquare, LayoutDashboard, Search, Bell, Menu, X, LogOut,
    ArrowLeft, Edit, Save, Clock, FileText, User, Network, DollarSign
} from 'lucide-react';

const EmployeeProfile = ({ onLogout, employeesData = [], setEmployeesData }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [editForm, setEditForm] = useState(null);

    useEffect(() => {
        // Fetch from global state so changes propagate immediately
        if (employeesData.length > 0) {
            const foundEmp = employeesData.find(emp => emp.id === parseInt(id));
            if (foundEmp) {
                setEmployee(foundEmp);
                setEditForm(foundEmp);
            } else {
                navigate('/admin/directory');
            }
        }
    }, [id, employeesData, navigate]);

    const handleSave = () => {
        // Sync local edit form to global state
        if (setEmployeesData) {
            setEmployeesData(prev => prev.map(emp => emp.id === editForm.id ? editForm : emp));
        }
        setEmployee(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset to the original employee state
        setEditForm(employee);
        setIsEditing(false);
    };

    if (!employee) return <div className="p-10 text-center font-bold">Loading Employee Data...</div>;

    const sick = employee.sick || { taken: 1, total: 8 };
    const annual = employee.annual || { taken: 0, total: 10 };
    const casual = employee.casual || { taken: 0, total: 5 };

    const renderLeaveBoxes = (quota, taken, fillClass) => {
        const boxes = [];
        for (let i = 0; i < quota; i++) {
            if (i < taken) {
                boxes.push(<div key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] shadow-sm ${fillClass}`}></div>);
            } else {
                boxes.push(<div key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] border border-gray-400 bg-gray-100 dark:border-gray-600 dark:bg-[#1A1A1A]"></div>);
            }
        }
        return <div className="flex flex-wrap gap-1.5 mt-2">{boxes}</div>;
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

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
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/directory'); }} className="flex items-center px-4 py-3 rounded-lg bg-brand-yellow text-brand-black font-bold shadow-md transition-all">
                            <Users className="mr-3" size={20} />
                            <span>Employee Directory</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/leave'); }} className="flex items-center px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
                            <Plane className="mr-3 text-brand-yellow group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-medium">Leave Dashboard</span>
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
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-20">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 mr-4 rounded-md text-gray-400 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <button
                            onClick={() => navigate('/admin/directory')}
                            className="flex items-center text-sm font-bold text-gray-500 hover:text-brand-green transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Back to Directory
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isEditing ? (
                            <div className="flex items-center space-x-2">
                                <button onClick={handleCancel} className="flex flex-row items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 rounded-lg shadow-sm transition-colors">
                                    <X size={16} className="mr-2" /> Cancel
                                </button>
                                <button onClick={handleSave} className="flex flex-row items-center px-4 py-2 bg-brand-green hover:bg-teal-800 text-white font-bold rounded-lg shadow-md transition-colors">
                                    <Save size={16} className="mr-2" /> Save Changes
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="flex flex-row items-center px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-brand-black font-extrabold rounded-lg shadow-md hover:shadow-lg transition-all">
                                <Edit size={16} className="mr-2" /> Edit Profile
                            </button>
                        )}
                    </div>
                </header>

                {/* Profile Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-gray-50">
                    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">

                        {/* Top Identity Block */}
                        <div className="bg-brand-green rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
                                <div className="w-24 h-24 bg-brand-yellow rounded-full flex items-center justify-center border-4 border-white shadow-lg text-brand-black">
                                    <User size={40} />
                                </div>
                                <div className="text-center sm:text-left">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="text-3xl font-extrabold bg-white/20 border border-white/40 rounded px-2 py-1 text-white outline-none focus:border-brand-yellow focus:bg-white/30 w-full mb-2"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    ) : (
                                        <h1 className="text-4xl font-extrabold mb-1 tracking-tight">{employee.name}</h1>
                                    )}

                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="text-sm font-bold bg-white/20 border border-white/40 rounded px-2 py-1 text-white outline-none w-full"
                                            value={editForm.role}
                                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-brand-yellow font-bold uppercase tracking-widest text-sm">{employee.role}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Deep Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Col - Data fields */}
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Age / Demographics</p>
                                    {isEditing ? (
                                        <input type="number" value={editForm.age || ''} onChange={e => setEditForm({ ...editForm, age: e.target.value })} className="border border-gray-200 rounded px-3 py-2 focus:outline-brand-green font-bold text-lg text-brand-black w-full" />
                                    ) : (
                                        <p className="font-bold text-xl text-brand-black">{employee.age || 25} Years Old</p>
                                    )}
                                    <p className="text-sm text-gray-500 font-medium mt-1">Male</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Supervisor</p>
                                    {isEditing ? (
                                        <select value={editForm.supervisorId || ''} onChange={e => setEditForm({ ...editForm, supervisorId: e.target.value })} className="border border-gray-200 rounded px-3 py-2 focus:outline-brand-green font-bold text-lg text-brand-black w-full outline-none">
                                            <option value="" disabled>Select Supervisor</option>
                                            <option value="r1">Bilal Zafar</option>
                                            <option value="r2">Ahmer Bhai</option>
                                            {employeesData.filter(e => e.id !== editForm.id).map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="font-bold text-xl text-brand-green">
                                            {employee.supervisorId === 'r1' ? 'Bilal Zafar' :
                                                employee.supervisorId === 'r2' ? 'Ahmer Bhai' :
                                                    employeesData.find(e => String(e.id) === String(employee.supervisorId))?.name || 'Unassigned'}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Academics</p>
                                    {isEditing ? (
                                        <input type="text" value={editForm.qualification || ''} onChange={e => setEditForm({ ...editForm, qualification: e.target.value })} className="border border-gray-200 rounded px-3 py-2 focus:outline-brand-green font-bold text-lg text-brand-black w-full" />
                                    ) : (
                                        <p className="font-bold text-xl text-brand-black">{employee.qualification || 'Bachelors / Relevant'}</p>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Joining Date</p>
                                    {isEditing ? (
                                        <input type="date" value={editForm.joiningDate} onChange={e => setEditForm({ ...editForm, joiningDate: e.target.value })} className="border border-gray-200 rounded px-3 py-2 focus:outline-brand-green font-bold text-lg text-brand-black w-full" />
                                    ) : (
                                        <p className="font-bold text-xl text-brand-black">{employee.joiningDate}</p>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    {isEditing ? (
                                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="border border-gray-200 rounded px-3 py-2 focus:outline-brand-green font-bold text-lg text-brand-black w-full">
                                            <option value="Active">Active</option>
                                            <option value="On Leave">On Leave</option>
                                            <option value="Terminated">Terminated</option>
                                        </select>
                                    ) : (
                                        <p className="font-bold text-xl text-green-600 flex items-center">
                                            <CheckCircle size={20} className="mr-2" /> {employee.status}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center sm:col-span-2">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2 flex items-center"><Clock size={16} className="mr-2" /> Work Performance (Current Month)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 font-bold mb-1">Base Hours Logged</p>
                                            <p className="font-extrabold text-3xl text-brand-green">160 <span className="text-sm text-gray-400 font-medium">hrs</span></p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-bold mb-1">Overtime Logged</p>
                                            <p className="font-extrabold text-3xl text-gray-700">12 <span className="text-sm text-gray-400 font-medium">hrs</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center sm:col-span-2">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2 flex items-center"><Plane size={16} className="mr-2 text-brand-black" /> Leave Balance (Box-Grid)</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                <span>Sick Leave</span>
                                                <span className="text-brand-black">{sick.total - sick.taken} / {sick.total} Remaining</span>
                                            </div>
                                            {renderLeaveBoxes(sick.total, sick.taken, "bg-amber-500")}
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                <span>Annual Leave</span>
                                                <span className="text-brand-black">{annual.total - annual.taken} / {annual.total} Remaining</span>
                                            </div>
                                            {renderLeaveBoxes(annual.total, annual.taken, "bg-green-500")}
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                <span>Casual Leave</span>
                                                <span className="text-brand-black">{casual.total - casual.taken} / {casual.total} Remaining</span>
                                            </div>
                                            {renderLeaveBoxes(casual.total, casual.taken, "bg-blue-500")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col - Documents */}
                            <div className="space-y-6 lg:col-span-1">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                                    <h3 className="font-bold text-brand-black text-lg mb-4 border-b border-gray-100 pb-2">Employment Documents</h3>

                                    {/* Contract Block */}
                                    <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-white hover:border-brand-green transition-all group cursor-pointer flex-1">
                                        <div className="bg-brand-green/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <FileText size={32} className="text-brand-green" />
                                        </div>
                                        <p className="font-bold text-brand-black mb-1">Official Contract Doc</p>
                                        <p className="text-xs text-gray-500 font-medium mb-4">PDF • Signed on {employee.joiningDate}</p>

                                        <button className="text-sm font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors w-full">
                                            View / Download
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeProfile;
