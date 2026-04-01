import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { AdminProvider } from "./contexts/AdminContext.jsx";
import { ProjectProvider } from "./contexts/ProjectContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

// Standard Pages
const Landing = lazy(() => import("./pages/Landing.jsx"));
const DashboardRedirect = lazy(() => import("./pages/DashboardRedirect.jsx"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails.jsx"));
const MyAccount = lazy(() => import("./pages/MyAccount.jsx"));

// Admin Module
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement.jsx"));
const UserProjects = lazy(() => import("./pages/admin/UserProjects.jsx"));
const TemplateManagement = lazy(() => import("./pages/admin/TemplateManagement.jsx"));
const AdminProjects = lazy(() => import("./pages/admin/Projects.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/Settings.jsx"));

// Manager Module
const ManagerDashboard = lazy(() => import("./pages/manager/Dashboard.jsx"));
const CreateProject = lazy(() => import("./pages/manager/CreateProject.jsx"));
const AllProjects = lazy(() => import("./pages/manager/AllProjects.jsx"));
const ManagerHandovers = lazy(() => import("./pages/manager/ManagerHandovers.jsx"));
const ManagerOnboardings = lazy(() => import("./pages/manager/ManagerOnboardings.jsx"));
const ManagerOnboardingWorkspace = lazy(() => import("./pages/manager/ManagerOnboardingWorkspace.jsx"));

const ICRDashboard = lazy(() => import("./pages/icr/Dashboard.jsx"));
const ICRMyHandovers = lazy(() => import("./pages/icr/MyHandovers.jsx"));
const HandoverProjectDetails = lazy(() => import("./pages/HandoverProjectDetails.jsx"));
const ICRMyOnboardings = lazy(() => import("./pages/icr/MyOnboardings.jsx"));
const OnboardingProjectDetails = lazy(() => import("./pages/OnboardingProjectDetails.jsx"));

// Layouts
import AdminLayout from "./components/AdminLayout.jsx";
import ManagerLayout from "./components/ManagerLayout.jsx";
import GeneralLayout from "./components/GeneralLayout.jsx";
import ICRLayout from "./components/ICRLayout.jsx";
import DynamicFavicon from "./components/DynamicFavicon.jsx";

function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) return <LoadingScreen />;
    
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
                                <Suspense fallback={<LoadingScreen />}>
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
                                                <Route path="/manager/my-handovers" element={<ManagerHandovers />} />
                                                <Route path="/manager/my-handovers/:projectId" element={<HandoverProjectDetails />} />
                                                <Route path="/manager/my-onboardings" element={<ManagerOnboardings />} />
                                                <Route path="/manager/my-onboardings/:projectId" element={<ManagerOnboardingWorkspace />} />
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
                                </Suspense>
                            </Router>
                        </NotificationProvider>
                    </ProjectProvider>
                </AdminProvider>
            </ThemeProvider>
        </AuthProvider >
    );
}

