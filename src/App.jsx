import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { AdminProvider } from "./contexts/AdminContext.jsx";
import { ProjectProvider } from "./contexts/ProjectContext.jsx";
// Login.jsx removed
import Landing from "./pages/Landing.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import TemplateManagement from "./pages/admin/TemplateManagement.jsx";
import AdminProjects from "./pages/admin/Projects.jsx";
import DashboardRedirect from "./pages/DashboardRedirect.jsx";
import ManagerDashboard from "./pages/manager/Dashboard.jsx";
import CreateProject from "./pages/manager/CreateProject.jsx";
import AllProjects from "./pages/manager/AllProjects.jsx";
import MyHandovers from "./pages/manager/MyHandovers.jsx";
import ManagerHandoverDetails from "./pages/manager/ManagerHandoverDetails.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";

// ICR Module Imports
import ICRDashboard from "./pages/icr/Dashboard.jsx";
import ICRMyHandovers from "./pages/icr/MyHandovers.jsx";
import HandoverProjectDetails from "./pages/icr/HandoverProjectDetails.jsx";
import ICRMyOnboardings from "./pages/icr/MyOnboardings.jsx";
import OnboardingProjectDetails from "./pages/icr/OnboardingProjectDetails.jsx";
import ICRLayout from "./components/ICRLayout.jsx";

import AdminLayout from "./components/AdminLayout.jsx";
import ManagerLayout from "./components/ManagerLayout.jsx";
import LayoutWithFooter from "./components/LayoutWithFooter.jsx";

function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, user } = useAuth();
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
            <AdminProvider>
                <ProjectProvider>
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
                                    <Route path="/admin/templates" element={<TemplateManagement />} />
                                    <Route path="/admin/projects" element={<AdminProjects />} />
                                    <Route path="/admin/projects/:projectId" element={<ProjectDetails />} />
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
                                </Route>
                            </Route>

                            {/* General User Layout (Footer enabled) - For ICR and redirects */}
                            <Route element={<LayoutWithFooter />}>
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/dashboard" element={<DashboardRedirect />} />

                                    {/* ICR Module (Initiator / Contributor / Receiver) */}
                                    <Route element={<ICRLayout />}>
                                        <Route path="/icr/dashboard" element={<ICRDashboard />} />
                                        <Route path="/icr/handovers" element={<ICRMyHandovers />} />
                                        <Route path="/icr/handovers/:projectId" element={<HandoverProjectDetails />} />
                                        <Route path="/icr/onboardings" element={<ICRMyOnboardings />} />
                                        <Route path="/icr/onboardings/:projectId" element={<OnboardingProjectDetails />} />
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
                </ProjectProvider>
            </AdminProvider>
        </AuthProvider>
    );
}
