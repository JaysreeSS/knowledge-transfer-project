import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { AdminProvider } from "./contexts/AdminContext.jsx";
import { ProjectProvider } from "./contexts/ProjectContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
// Login.jsx removed
import Landing from "./pages/Landing.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import UserProjects from "./pages/admin/UserProjects.jsx";
import TemplateManagement from "./pages/admin/TemplateManagement.jsx";
import AdminProjects from "./pages/admin/Projects.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";
import DashboardRedirect from "./pages/DashboardRedirect.jsx";
import ManagerDashboard from "./pages/manager/Dashboard.jsx";
import CreateProject from "./pages/manager/CreateProject.jsx";
import AllProjects from "./pages/manager/AllProjects.jsx";
import MyHandovers from "./pages/manager/MyHandovers.jsx";
import ManagerHandoverDetails from "./pages/manager/ManagerHandoverDetails.jsx";
import ManagerOnboardings from "./pages/manager/ManagerOnboardings.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";

// ICR Module Imports
import ICRDashboard from "./pages/icr/Dashboard.jsx";
import ICRMyHandovers from "./pages/icr/MyHandovers.jsx";
import HandoverProjectDetails from "./pages/icr/HandoverProjectDetails.jsx";
import ICRMyOnboardings from "./pages/icr/MyOnboardings.jsx";
import OnboardingProjectDetails from "./pages/icr/OnboardingProjectDetails.jsx";
import ICRLayout from "./components/ICRLayout.jsx";
import MyAccount from "./pages/MyAccount.jsx";

import AdminLayout from "./components/AdminLayout.jsx";
import ManagerLayout from "./components/ManagerLayout.jsx";
import GeneralLayout from "./components/GeneralLayout.jsx";
import DynamicFavicon from "./components/DynamicFavicon.jsx";

function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 animate-pulse">Restoring Session</p>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) return <Navigate to="/" replace />;

    if (allowedRoles && user) {
        const hasRole = allowedRoles.includes(user.role) || (user.isAdmin && allowedRoles.includes('System Admin'));
        if (!hasRole) {
            return <Navigate to="/dashboard" replace />;
        }
    }
    return <Outlet />;
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AdminProvider>
                    <ProjectProvider>
                        <DynamicFavicon />
                        <NotificationProvider>
                            <Router>
                                <Toaster position="top-right" richColors closeButton duration={4000} />
                                <Routes>
                                    {/* Unified Landing / Login Page */}
                                    <Route path="/" element={<Landing />} />

                                    {/* Admin Layout & Routes */}
                                    <Route element={<AdminLayout />}>
                                        <Route element={<ProtectedRoute allowedRoles={['System Admin']} />}>
                                            <Route path="/admin" element={<AdminDashboard />} />
                                            <Route path="/admin/users" element={<UserManagement />} />
                                            <Route path="/admin/users/:userId/projects" element={<UserProjects />} />
                                            <Route path="/admin/templates" element={<TemplateManagement />} />
                                            <Route path="/admin/projects" element={<AdminProjects />} />
                                            <Route path="/admin/projects/:projectId" element={<ProjectDetails />} />
                                            <Route path="/admin/settings" element={<AdminSettings />} />
                                            <Route path="/admin/account" element={<MyAccount />} />
                                        </Route>
                                    </Route>

                                    {/* Manager Layout & Routes */}
                                    <Route element={<ManagerLayout />}>
                                        <Route element={<ProtectedRoute allowedRoles={['Manager']} />}>
                                            <Route path="/manager" element={<ManagerDashboard />} />
                                            <Route path="/manager/create-project" element={<CreateProject />} />
                                            <Route path="/manager/projects" element={<AllProjects />} />
                                            <Route path="/manager/projects/:projectId" element={<ProjectDetails />} />
                                            <Route path="/manager/my-handovers" element={<MyHandovers />} />
                                            <Route path="/manager/my-handovers/:projectId" element={<ManagerHandoverDetails />} />
                                            <Route path="/manager/my-onboardings" element={<ManagerOnboardings />} />
                                            <Route path="/manager/account" element={<MyAccount />} />
                                        </Route>
                                    </Route>

                                    {/* General User Layout - For ICR and redirects */}
                                    <Route element={<GeneralLayout />}>
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/dashboard" element={<DashboardRedirect />} />

                                            {/* ICR Module (Initiator / Contributor / Receiver) */}
                                            <Route element={<ICRLayout />}>
                                                <Route path="/icr/dashboard" element={<ICRDashboard />} />
                                                <Route path="/icr/handovers" element={<ICRMyHandovers />} />
                                                <Route path="/icr/handovers/:projectId" element={<HandoverProjectDetails />} />
                                                <Route path="/icr/onboardings" element={<ICRMyOnboardings />} />
                                                <Route path="/icr/onboardings/:projectId" element={<OnboardingProjectDetails />} />
                                                <Route path="/icr/account" element={<MyAccount />} />
                                            </Route>
                                        </Route>
                                    </Route>

                                    {/* Legacy Redirects - Handled by catch-all */}
                                    <Route path="/login" element={<Navigate to="/" replace />} />
                                    <Route path="/admin-login" element={<Navigate to="/" replace />} />
                                    <Route path="/user-login" element={<Navigate to="/" replace />} />

                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Router>
                        </NotificationProvider>
                    </ProjectProvider>
                </AdminProvider>
            </ThemeProvider>
        </AuthProvider >
    );
}
