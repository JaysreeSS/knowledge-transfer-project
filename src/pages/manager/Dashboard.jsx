import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Folder, Clock, CheckCircle2, ChevronRight, LogOut, LayoutDashboard, FileText, Send, FolderKanban, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';

export default function ManagerDashboard() {
    const { user, logout } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    const managerProjects = projects.filter(p => p.managerId === user.id);
    const activeProjects = managerProjects.filter(p => p.status !== 'Completed').length;
    const completedProjects = managerProjects.filter(p => p.status === 'Completed').length;

    const stats = [
        {
            title: "Total Projects",
            value: managerProjects.length,
            icon: Folder,
            color: "text-blue-600",
            bg: "bg-blue-50/80"
        },
        {
            title: "Active Handovers",
            value: activeProjects,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50/80"
        },
        {
            title: "Completed KT",
            value: completedProjects,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50/80"
        }
    ];

    return (
        <div className="font-sans transition-colors">
            {/* Main Content */}
            <main className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 transition-colors">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div className="space-y-1 transition-colors">
                        <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">Manager dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg transition-colors">Overview of your project handovers and progress.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
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
                                <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="space-y-4">
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] bg-white dark:bg-slate-800/50">
                        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between transition-colors">
                            <div className="transition-colors">
                                <CardTitle className="text-lg font-semibold tracking-section-title text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                    <FolderKanban className="w-4 h-4 text-primary" />
                                    Your projects
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label mt-1 transition-colors">Latest updates on your projects</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:bg-primary/5 dark:hover:bg-primary/20 text-sm font-medium tracking-button h-8 transition-colors" onClick={() => navigate('/manager/projects')}>
                                View all <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 overflow-auto text-slate-900 dark:text-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {managerProjects.length > 0 ? managerProjects.map((proj, i) => (
                                    <div key={i} className="group cursor-pointer p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex flex-col justify-between" onClick={() => navigate(`/manager/projects/${proj.id}`)}>
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">{proj.name}</h4>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${(proj.status === 'Completed' || proj.status === 'Signed Off')
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                                                    : proj.status === 'In Progress'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
                                                        : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'
                                                    }`}>
                                                    {proj.status === 'Completed' || proj.status === 'Signed Off' ? 'Signed off' : (proj.status || 'Active')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{proj.description}</p>
                                        </div>
                                        <div className="space-y-2 transition-colors">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                                                <span>Progress</span>
                                                <span className="text-slate-900 dark:text-slate-100 transition-colors">{proj.completion}%</span>
                                            </div>
                                            <Progress value={proj.completion} className="h-1.5 bg-slate-100 dark:bg-slate-900 transition-colors"
                                                indicatorClassName={
                                                    proj.status === 'Completed' ? 'bg-emerald-500' :
                                                        proj.completion > 50 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'
                                                }
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        No projects found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}


