import React from "react";
import { Users, FileText, FolderKanban, TrendingUp, Zap, Briefcase, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

import { useAdmin } from "../../contexts/AdminContext.jsx";
import { useProjects } from "../../contexts/ProjectContext.jsx";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { users, templates } = useAdmin();
    const { projects: allProjects } = useProjects();

    const activeProjects = allProjects.filter(p => p.status !== 'Completed').length;
    const totalAssociates = users.length;
    const totalTemplates = templates.length;

    // Real-time Stats
    const stats = [
        {
            title: "Total Users",
            value: totalAssociates,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50/80"
        },
        {
            title: "Active Projects",
            value: activeProjects,
            icon: FolderKanban,
            color: "text-purple-600",
            bg: "bg-purple-50/80"
        },
        {
            title: "Templates",
            value: totalTemplates,
            icon: FileText,
            color: "text-pink-600",
            bg: "bg-pink-50/80"
        }
    ];

    // Get real managers/leads from users context (Excluding Admins)
    const managers = users
        .filter(u => u.role === 'Manager')
        .map(u => ({
            name: u.name,
            role: 'Project Manager',
            project: allProjects.find(p => p.managerName === u.name)?.name || "No active project"
        }));

    // Get real active projects from context
    const projectList = allProjects
        .filter(p => p.status !== 'Completed')
        .slice(0, 4);

    // Calculate real role counts
    const roleStats = [
        { label: "Developers", count: users.filter(u => u.role === 'Developer').length, color: "bg-blue-500", lightBg: "bg-blue-50" },
        { label: "QA Engineers", count: users.filter(u => u.role === 'QA Engineer').length, color: "bg-purple-500", lightBg: "bg-purple-50" },
        { label: "Business Analysts", count: users.filter(u => u.role === 'Business Analyst').length, color: "bg-amber-500", lightBg: "bg-amber-50" },
        { label: "Support", count: users.filter(u => u.role === 'Support').length, color: "bg-slate-500", lightBg: "bg-slate-50" }
    ];

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm font-medium">Key performance metrics and project activity overview.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden relative group">
                        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} border border-slate-100`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Team Overview */}
                <Card className="border border-slate-200 shadow-sm flex flex-col">
                    <CardHeader className="border-b border-slate-100 p-6">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary/70" />
                            Team Overview
                        </CardTitle>
                        <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">Manager activity and role distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8 flex-1">
                        {/* Managers List */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Leadership</h4>
                            <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3">
                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {managers.length > 0 ? (
                                        managers.map((mgr, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                <div className="w-8 h-8 min-w-[32px] rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-semibold text-primary text-xs">
                                                    {mgr.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{mgr.name}</p>
                                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight truncate">{mgr.role}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs font-medium text-slate-400">
                                            No managers found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Role Distribution */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Organization Roles</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {roleStats.map((role, i) => (
                                    <div key={i} className={`p-3 rounded-lg border border-slate-100 bg-white flex flex-col gap-1 shadow-sm`}>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${role.color}`} />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">{role.label}</span>
                                        </div>
                                        <span className="text-xl font-bold text-slate-900">{role.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Projects Status */}
                <Card className="border border-slate-200 shadow-sm flex flex-col">
                    <CardHeader className="border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-primary/70" />
                                Active Projects
                            </CardTitle>
                            <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">Tracking live project completion</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:text-primary hover:bg-primary/5 font-semibold text-xs" onClick={() => navigate('/admin/projects')}>
                            View All <ChevronRight className="w-3.5 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {projectList.length > 0 ? projectList.map((proj, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">{proj.name}</h4>
                                            <p className="text-[11px] text-slate-400 font-medium italic">Lead: {proj.managerName || 'Unassigned'}</p>
                                        </div>
                                        <Badge variant={proj.status === 'Completed' ? 'success' : 'blue'} className="text-[10px] px-2">
                                            {proj.status}
                                        </Badge>
                                    </div>
                                    <Progress value={proj.completion} className="h-1.5 bg-slate-100" />
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                                    No active projects found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
