import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Folder, Clock, CheckCircle2, ChevronRight, LogOut, LayoutDashboard, FileText, Send, FolderKanban, AlertCircle, Zap, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';

export default function ManagerDashboard() {
    const { user, logout } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    const allManagerProjects = projects.filter(p => p.managerId === user.id);
    const activeProjectsCount = allManagerProjects.filter(p => p.lifecycleMode === 'ACTIVE').length;
    const transitionProjectsCount = allManagerProjects.filter(p => p.lifecycleMode === 'TRANSITION').length;
    const myOnboardingsCount = projects.filter(p => p.members.some(m => m.userId === user.id && m.ktRole === 'Receiver')).length;

    const stats = [
        {
            title: "Active Projects",
            value: activeProjectsCount,
            icon: Folder,
            color: "text-blue-600",
            bg: "bg-blue-50/80"
        },
        {
            title: "Transition Projects",
            value: transitionProjectsCount,
            icon: Zap,
            color: "text-orange-600",
            bg: "bg-orange-50/80"
        },
        {
            title: "My Onboardings",
            value: myOnboardingsCount,
            icon: ClipboardCheck,
            color: "text-purple-600",
            bg: "bg-purple-50/80"
        },
        {
            title: "Total Projects",
            value: allManagerProjects.length,
            icon: LayoutDashboard,
            color: "text-slate-600",
            bg: "bg-slate-50/80"
        }
    ];
    
    // For the "Your Projects" section below, show active/transition (In Progress)
    const managerProjects = allManagerProjects.filter(p => p.status !== 'Completed' && p.status !== 'Signed Off');

    return (
        <div className="font-sans transition-colors">
            {/* Main Content */}
            <main className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-colors">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div className="space-y-1 transition-colors">
                        <h1 id="manager-dashboard-title" className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">Manager dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg transition-colors">Overview of your project handovers and progress.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800/50 group overflow-hidden relative">
                            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.bg} dark:bg-slate-700 opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg} dark:bg-slate-800 ${stat.color} shadow-sm border border-slate-100 dark:border-slate-700`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 relative z-10">
                                <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-page-title">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="space-y-6">
                    <div className="flex flex-row items-center justify-between transition-colors">
                        <div className="transition-colors">
                            <h2 className="text-lg font-semibold tracking-section-title text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                <FolderKanban className="w-4 h-4 text-primary" />
                                Your projects
                            </h2>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label mt-1 transition-colors">Latest updates on your projects</p>
                        </div>
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:bg-primary/5 dark:hover:bg-primary/20 text-sm font-medium tracking-button h-8 transition-colors" onClick={() => navigate('/manager/projects')}>
                            View all <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {managerProjects.length > 0 ? managerProjects.map((proj, i) => {
                            const isTransition = proj.lifecycleMode === 'TRANSITION';
                            return (
                                <div key={i} className="group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all flex flex-col overflow-hidden bg-white dark:bg-slate-800/50" onClick={() => navigate(`/manager/projects/${proj.id}`)}>
                                    <div className={`h-1 w-full ${isTransition ? 'bg-amber-500' : (proj.status === 'Completed' || proj.status === 'Signed Off') ? 'bg-emerald-500' : 'bg-primary'}`} />
                                    <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">{proj.name}</h4>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                                                    <div className={`w-1 h-1 rounded-full ${(proj.status === 'Completed' || proj.status === 'Signed Off') ? 'bg-emerald-500' : proj.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-label text-slate-500 dark:text-slate-400">
                                                        {proj.status === 'Completed' || proj.status === 'Signed Off' ? 'Signed off' : (proj.status || 'Active')}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
                                                {proj.description || 'No description provided.'}
                                            </p>
                                        </div>
                                        <div className="space-y-2 transition-colors">
                                            <div className="flex justify-between text-xs font-semibold uppercase tracking-label text-slate-400 dark:text-slate-500 transition-colors">
                                                <span>Progress</span>
                                                <span className="text-slate-900 dark:text-slate-100 transition-colors">{proj.completion}%</span>
                                            </div>
                                            <Progress value={proj.completion} className="h-1.5 bg-slate-100 dark:bg-slate-900 transition-colors"
                                                indicatorClassName={
                                                    proj.status === 'Completed' ? 'bg-emerald-500' :
                                                        proj.completion > 50 ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full text-center py-20 text-slate-400 text-xs font-semibold uppercase tracking-widest bg-white dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                No projects found.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}


