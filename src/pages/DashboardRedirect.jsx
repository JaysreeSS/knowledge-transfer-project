import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useProjects } from '../contexts/ProjectContext.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function DashboardRedirect() {
    const { user } = useAuth();
    const { projects, loading } = useProjects();

    if (!user) return <Navigate to="/" replace />;
    if (user.isAdmin) return <Navigate to="/admin" replace />;
    if (user.role === 'Manager') return <Navigate to="/manager" replace />;

    // Handle role mapping for contributors/receivers
    if (loading) return <LoadingScreen />;

    // Default Fallback - Redirect everyone else to the Unified ICR Dashboard
    // The ICR dashboard handles showing both Handovers and Onboardings based on project roles
    return <Navigate to="/icr/dashboard" replace />;
}
