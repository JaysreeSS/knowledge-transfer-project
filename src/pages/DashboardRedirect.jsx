import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useProjects } from '../contexts/ProjectContext.jsx';

export default function DashboardRedirect() {
    const { user } = useAuth();
    const { projects, loading } = useProjects();

    if (!user) return <Navigate to="/" replace />;
    if (user.isAdmin) return <Navigate to="/admin" replace />;
    if (user.role === 'Manager') return <Navigate to="/manager" replace />;

    // Handle role mapping for contributors/receivers
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mapping Authorities...</p>
            </div>
        </div>
    );

    // Default Fallback - Redirect everyone else to the Unified ICR Dashboard
    // The ICR dashboard handles showing both Handovers and Onboardings based on project roles
    return <Navigate to="/icr/dashboard" replace />;
}
