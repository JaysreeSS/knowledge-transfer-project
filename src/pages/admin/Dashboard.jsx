import React from "react";
import { Users, FileText, FolderKanban, TrendingUp, Zap, Briefcase, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import { useAdmin } from "../../contexts/AdminContext.jsx";
import { useProjects } from "../../contexts/ProjectContext.jsx";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { users, templates, settings } = useAdmin();
    const themeColor = settings?.theme_color?.replace('#', '') || '7c3aed';
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
            avatar_url: u.avatar_url,
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                <div className="space-y-1 transition-colors">
                    <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">Admin dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">Key performance metrics and project activity overview.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800/50 overflow-hidden relative group">
                        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 transition-colors">
                            <CardTitle className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 transition-colors">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg} dark:bg-slate-900 dark:border-slate-800 ${stat.color} border border-slate-100 dark:border-slate-800 transition-colors`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 transition-colors">
                            <div className="flex items-baseline gap-2 transition-colors">
                                <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">{stat.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Team Overview */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col bg-white dark:bg-slate-800/50">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
                        <CardTitle className="text-lg font-semibold tracking-section-title text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary/70" />
                            Team overview
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Manager activity and role distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8 flex-1">
                        {/* Managers List */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-semibold uppercase tracking-tight text-slate-400 dark:text-slate-500 transition-colors">Project Leadership</h4>
                            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition-colors">
                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                                    {managers.length > 0 ? (
                                        managers.map((mgr, i) => (
                                            <div key={i} className="flex items-center gap-4 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                                                <Avatar className="w-8 h-8 min-w-[32px] rounded-full border border-primary/10 dark:border-primary/20 shadow-sm transition-colors shrink-0">
                                                    <AvatarImage src={getAvatarUrl(mgr.avatar_url || mgr.name, themeColor)} alt={mgr.name} />
                                                    <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-xs transition-colors">
                                                        {mgr.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0 transition-colors">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors">{mgr.name}</p>
                                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize tracking-tight truncate transition-colors">{mgr.role}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">
                                            No managers found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Role Distribution */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-semibold uppercase tracking-tight text-slate-400 dark:text-slate-500 transition-colors">Organization Roles</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {roleStats.map((role, i) => (
                                    <div key={i} className={`p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-1 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-colors`}>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${role.color}`} />
                                            <span className="text-[11px] font-semibold capitalize tracking-tight text-slate-400 dark:text-slate-500 italic">{role.label}</span>
                                        </div>
                                        <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">{role.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Projects Status */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col bg-white dark:bg-slate-800/50">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold tracking-section-title text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-primary/70" />
                                Active projects
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Tracking live project completion</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:text-primary hover:bg-primary/5 font-medium tracking-button text-sm" onClick={() => navigate('/admin/projects')}>
                            View all <ChevronRight className="w-3.5 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6 transition-colors">
                            {projectList.length > 0 ? projectList.map((proj, i) => (
                                <div key={i} className="group cursor-pointer" onClick={() => navigate(`/admin/projects/${proj.id}`)}>
                                    <div className="flex justify-between items-center mb-2.5 transition-colors">
                                        <div className="transition-colors">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{proj.name}</h4>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic transition-colors">Lead: {proj.managerName || 'Unassigned'}</p>
                                        </div>
                                        <Badge variant={proj.status === 'Completed' ? 'success' : 'blue'} className="text-xs px-2 transition-colors">
                                            {proj.status}
                                        </Badge>
                                    </div>
                                    <Progress value={proj.completion} className="h-1.5 bg-slate-100 dark:bg-slate-800 transition-colors" />
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-medium transition-colors">
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
