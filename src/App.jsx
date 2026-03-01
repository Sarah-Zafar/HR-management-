import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initialEmployees } from './data/employees';
import GatewayPage from './pages/GatewayPage';
import AdminLoginPage from './pages/AdminLoginPage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDirectory from './pages/admin/EmployeeDirectory';
import LeaveDashboard from './pages/admin/LeaveDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import RequestLeave from './pages/employee/RequestLeave';
import MyCalendar from './pages/employee/MyCalendar';
import { Sun, Moon } from 'lucide-react';

function App() {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isEmployeeAuthenticated, setIsEmployeeAuthenticated] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Centralized Leave State
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeesData, setEmployeesData] = useState(() => {
        return initialEmployees.map((emp, index) => {
            const sickTaken = index === 0 ? 1 : 0;
            return {
                ...emp,
                sick: { taken: sickTaken, total: 8 },
                casual: { taken: 0, total: 5 },
                annual: { taken: 0, total: 10 }
            };
        });
    });

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <BrowserRouter>
            <div className="min-h-screen relative font-sans">
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
                    <Route path="/" element={<GatewayPage />} />

                    {/* Login Routes */}
                    <Route
                        path="/admin/login"
                        element={<AdminLoginPage onLogin={() => setIsAdminAuthenticated(true)} />}
                    />
                    <Route
                        path="/employee/login"
                        element={<EmployeeLoginPage onLogin={() => setIsEmployeeAuthenticated(true)} />}
                    />

                    {/* Protected Dashboards */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            isAdminAuthenticated ? (
                                <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/directory"
                        element={
                            isAdminAuthenticated ? (
                                <EmployeeDirectory onLogout={() => setIsAdminAuthenticated(false)} />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/admin/leave"
                        element={
                            isAdminAuthenticated ? (
                                <LeaveDashboard
                                    onLogout={() => setIsAdminAuthenticated(false)}
                                    leaveRequests={leaveRequests}
                                    setLeaveRequests={setLeaveRequests}
                                    employeesData={employeesData}
                                    setEmployeesData={setEmployeesData}
                                />
                            ) : (
                                <Navigate to="/admin/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/employee/dashboard"
                        element={
                            isEmployeeAuthenticated ? (
                                <EmployeeDashboard onLogout={() => setIsEmployeeAuthenticated(false)} />
                            ) : (
                                <Navigate to="/employee/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/employee/request-leave"
                        element={
                            isEmployeeAuthenticated ? (
                                <RequestLeave
                                    onLogout={() => setIsEmployeeAuthenticated(false)}
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
                            isEmployeeAuthenticated ? (
                                <MyCalendar onLogout={() => setIsEmployeeAuthenticated(false)} />
                            ) : (
                                <Navigate to="/employee/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/employee/*"
                        element={
                            isEmployeeAuthenticated ? (
                                <EmployeeDashboard onLogout={() => setIsEmployeeAuthenticated(false)} />
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
