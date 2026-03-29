import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initialEmployees } from './data/employees';
import GatewayPage from './pages/GatewayPage';
import AdminLoginPage from './pages/AdminLoginPage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDirectory from './pages/admin/EmployeeDirectory';
import LeaveDashboard from './pages/admin/LeaveDashboard';
import OrgChart from './pages/admin/OrgChart';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import CalendarManager from './pages/admin/CalendarManager';
import PayrollManager from './pages/admin/PayrollManager';
import EmployeeProfile from './pages/admin/EmployeeProfile';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import RequestLeave from './pages/employee/RequestLeave';
import MyCalendar from './pages/employee/MyCalendar';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, setDoc, doc, getDocs, query, limit } from 'firebase/firestore';


function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(localStorage.getItem('octa_user_role'));
    const [authLoading, setAuthLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                localStorage.removeItem('octa_user_role');
                setUserRole(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLoginSuccess = (role, userObj) => {
        localStorage.setItem('octa_user_role', role);
        setUserRole(role);
        if (userObj) setUser(userObj);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('octa_user_role');
            setUserRole(null);
            setUser(null);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // Seed Users with 4-tier distribution
    const initialUsers = [
        { id: 'r1', name: 'Bilal Zafar', role: 'Director', status: 'Active', baseSalary: 15000, remainingQuota: 20, sick: { taken: 0, total: 8 }, casual: { taken: 0, total: 5 }, annual: { taken: 0, total: 10 } },
        { id: 'r2', name: 'Ahmer Bhai', role: 'Director', status: 'Active', baseSalary: 15000, remainingQuota: 20, sick: { taken: 0, total: 8 }, casual: { taken: 0, total: 5 }, annual: { taken: 0, total: 10 } },
        { id: 1, name: 'Talha Arif', role: 'Manager', status: 'Active', baseSalary: 8000, supervisorId: 'r1', remainingQuota: 19, sick: { taken: 1, total: 8 }, casual: { taken: 0, total: 5 }, annual: { taken: 0, total: 10 } },
        { id: 2, name: 'Abdullah Nadeem', role: 'Manager', status: 'Active', baseSalary: 8000, supervisorId: 'r2', remainingQuota: 20, sick: { taken: 0, total: 8 }, casual: { taken: 0, total: 5 }, annual: { taken: 0, total: 10 } },
        { id: 3, name: 'Faizan Hamza', role: 'Supervisor', status: 'Active', baseSalary: 6000, supervisorId: 1, remainingQuota: 20, sick: { taken: 0, total: 8 }, casual: { taken: 0, total: 5 }, annual: { taken: 0, total: 10 } },
        { id: 4, name: 'Ahmad Sohail', role: 'Supervisor', status: 'Active', baseSalary: 6000, supervisorId: 2, remainingQuota: 20, sick: { taken: 0, total: 8 }, casual: { taken: 0, total: 5 }, annual: { taken: 0, total: 10 } },
        ...initialEmployees.slice(4).map((emp, index) => ({
            ...emp,
            baseSalary: 4500,
            remainingQuota: 20,
            supervisorId: (index % 2 === 0 ? 3 : 4),
            sick: { taken: 0, total: 8 },
            casual: { taken: 0, total: 5 },
            annual: { taken: 0, total: 10 }
        }))
    ];

    const initialHolidays = [
        { id: 'h1', title: 'Eid-ul-Fitr', date: '2026-03-31', type: 'holiday' },
        { id: 'h2', title: 'Pakistan Day', date: '2026-03-23', type: 'holiday' }
    ];

    // Centralized Data States (Restored to Local)
    const [employeesData, setEmployeesData] = useState(initialUsers);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [companyHolidays, setCompanyHolidays] = useState(initialHolidays);
    const [manualEntries, setManualEntries] = useState({});
    const [announcements, setAnnouncements] = useState([
        { id: 1, title: 'Ramadan Working Hours', content: 'Office hours adjusted to 9:00 AM - 3:00 PM.', date: '2026-03-01', priority: 'High' }
    ]);
    const [attendanceData, setAttendanceData] = useState([]);

    // Centralized Attendance Settings (12-Hour Format Strings)
    const [standardStart, setStandardStart] = useState("09:00 AM");
    const [standardEnd, setStandardEnd] = useState("05:00 PM");

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'attendance_config'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.standardStart) setStandardStart(data.standardStart);
                if (data.standardEnd) setStandardEnd(data.standardEnd);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'employees'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (list.length > 0) setEmployeesData(list);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'attendance', 'manual_logs'), (snapshot) => {
            if (snapshot.exists()) {
                setManualEntries(snapshot.data().entries || {});
            }
        });
        return () => unsubscribe();
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (authLoading) return (
        <div style={{
            height: '100vh',
            backgroundColor: '#001e1e',
            color: '#008080',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            flexDirection: 'column',
            gap: '1rem',
            fontFamily: 'sans-serif'
        }}>
            <div className="w-12 h-12 border-4 border-teal-800/20 border-t-teal-500 rounded-full animate-spin"></div>
            OCTA PORTAL: INITIALIZING...
        </div>
    );

    return (
        <BrowserRouter>
            <div className="min-h-screen relative font-sans text-brand-black dark:text-gray-100 transition-colors">
                {/* Global Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="fixed bottom-6 right-6 z-[100] p-3 rounded-full bg-white dark:bg-gray-800 text-brand-black dark:text-gray-200 shadow-xl transition-all hover:scale-110 border-2 border-gray-200 dark:border-gray-700"
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? <Sun size={24} className="text-brand-yellow animate-spin-slow" /> : <Moon size={24} className="text-brand-green" />}
                </button>

                <Routes>
                    {/* Public Gateway */}
                    <Route
                        path="/"
                        element={
                            user ? (
                                userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/employee/dashboard" replace />
                            ) : <GatewayPage />
                        }
                    />

                    {/* Login Routes */}
                    <Route
                        path="/admin/login"
                        element={user ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage onAuthSuccess={() => handleLoginSuccess('admin')} />}
                    />
                    <Route
                        path="/employee/login"
                        element={user ? <Navigate to="/employee/dashboard" replace /> : <EmployeeLoginPage onAuthSuccess={() => handleLoginSuccess('employee')} />}
                    />

                    {/* Protected Dashboards */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            user && userRole === 'admin' ? (
                                <AdminDashboard
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    leaveRequests={leaveRequests}
                                    attendanceData={attendanceData}
                                    announcements={announcements}
                                    setAnnouncements={setAnnouncements}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/directory"
                        element={
                            user && userRole === 'admin' ? (
                                <EmployeeDirectory
                                    onLogout={handleLogout}
                                    employees={employeesData}
                                    setEmployees={setEmployeesData}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/chart"
                        element={
                            user && userRole === 'admin' ? (
                                <OrgChart
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    setEmployeesData={setEmployeesData}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/attendance"
                        element={
                            user && userRole === 'admin' ? (
                                <AttendanceManagement
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    attendanceData={attendanceData}
                                    setEmployeesData={setEmployeesData}
                                    manualEntries={manualEntries}
                                    setManualEntries={setManualEntries}
                                    standardStart={standardStart}
                                    setStandardStart={setStandardStart}
                                    standardEnd={standardEnd}
                                    setStandardEnd={setStandardEnd}
                                    leaveRequests={leaveRequests}
                                    companyHolidays={companyHolidays}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/payroll"
                        element={
                            user && userRole === 'admin' ? (
                                <PayrollManager
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    setEmployeesData={setEmployeesData}
                                    manualEntries={manualEntries}
                                    standardStart={standardStart}
                                    setStandardStart={setStandardStart}
                                    standardEnd={standardEnd}
                                    setStandardEnd={setStandardEnd}
                                    leaveRequests={leaveRequests}
                                    companyHolidays={companyHolidays}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/profile/:id"
                        element={
                            user && userRole === 'admin' ? (
                                <EmployeeProfile
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    setEmployeesData={setEmployeesData}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/leave"
                        element={
                            user && userRole === 'admin' ? (
                                <LeaveDashboard
                                    onLogout={handleLogout}
                                    leaveRequests={leaveRequests}
                                    setLeaveRequests={setLeaveRequests}
                                    employeesData={employeesData}
                                    setEmployeesData={setEmployeesData}
                                    companyHolidays={companyHolidays}
                                    setCompanyHolidays={setCompanyHolidays}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/hr-calendar"
                        element={
                            user && userRole === 'admin' ? (
                                <CalendarManager
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    leaveRequests={leaveRequests}
                                    companyHolidays={companyHolidays}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/my-requests"
                        element={<Navigate to="/employee/request-leave" replace />}
                    />
                    <Route
                        path="/employee/dashboard"
                        element={
                            user && userRole === 'employee' ? (
                                <EmployeeDashboard
                                    onLogout={handleLogout}
                                    user={user}
                                    employeesData={employeesData}
                                    leaveRequests={leaveRequests}
                                    setLeaveRequests={setLeaveRequests}
                                    companyHolidays={companyHolidays}
                                    manualEntries={manualEntries}
                                    standardStart={standardStart}
                                    standardEnd={standardEnd}
                                    attendanceData={attendanceData}
                                    announcements={announcements}
                                />
                            ) : (
                                <Navigate to="/employee/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/employee/request-leave"
                        element={
                            user && userRole === 'employee' ? (
                                <RequestLeave
                                    onLogout={handleLogout}
                                    user={user}
                                    leaveRequests={leaveRequests}
                                    setLeaveRequests={setLeaveRequests}
                                    employeesData={employeesData}
                                />
                            ) : (
                                <Navigate to="/employee/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/employee/calendar"
                        element={
                            user && userRole === 'employee' ? (
                                <MyCalendar
                                    onLogout={handleLogout}
                                    user={user}
                                    leaveRequests={leaveRequests}
                                    companyHolidays={companyHolidays}
                                    employeesData={employeesData}
                                />
                            ) : (
                                <Navigate to="/employee/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/employee/*"
                        element={
                            user && userRole === 'employee' ? (
                                <EmployeeDashboard
                                    onLogout={handleLogout}
                                    employeesData={employeesData}
                                    leaveRequests={leaveRequests}
                                    setLeaveRequests={setLeaveRequests}
                                    companyHolidays={companyHolidays}
                                    manualEntries={manualEntries}
                                    standardStart={standardStart}
                                    standardEnd={standardEnd}
                                />
                            ) : (
                                <Navigate to="/employee/login" replace />
                            )
                        }
                    />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
