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
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Main Content */}
            <main className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manager Dashboard</h1>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">Overview of your project handovers and progress.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {stats.map((stat, index) => (
                        <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
                            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} shadow-sm border border-slate-100`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 relative z-10">
                                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Cards Grid: Recent Projects & Notifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Recent Projects List (Matching Admin Style) */}
                    <Card className="border-slate-200 shadow-sm flex flex-col h-[450px]">
                        <CardHeader className="p-6 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <FolderKanban className="w-4 h-4 text-primary" />
                                    Recent Projects
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LATEST UPDATES ON YOUR PROJECTS</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:bg-primary/5 text-xs font-bold uppercase tracking-wider h-8" onClick={() => navigate('/manager/projects')}>
                                View All <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 overflow-auto">
                            <div className="space-y-4">
                                {managerProjects.length > 0 ? managerProjects.slice(0, 5).map((proj, i) => (
                                    <div key={i} className="group cursor-pointer p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all" onClick={() => navigate(`/manager/projects/${proj.id}`)}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{proj.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{proj.description}</p>
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${(proj.status === 'Completed' || proj.status === 'Signed Off')
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : proj.status === 'In Progress'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                    : 'bg-slate-50 text-slate-400 border-slate-200'
                                                }`}>
                                                {proj.status === 'Completed' || proj.status === 'Signed Off' ? 'Signed Off' : (proj.status || 'Active')}
                                            </span>
                                        </div>
                                        <Progress value={proj.completion} className="h-1.5 bg-slate-100"
                                            indicatorClassName={
                                                proj.status === 'Completed' ? 'bg-emerald-500' :
                                                    proj.completion > 50 ? 'bg-blue-500' : 'bg-slate-400'
                                            }
                                        />
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        No projects found. Create one to get started.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications Panel */}
                    <Card className="border-slate-200 shadow-sm flex flex-col h-[450px]">
                        <CardHeader className="p-6 border-b border-slate-100 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                Attention Needed
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SECTIONS REQUIRING CLARIFICATION</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 overflow-auto">
                            <div className="space-y-4">
                                {(() => {
                                    const attentionItems = managerProjects.flatMap(p =>
                                        p.sections
                                            .filter(s => s.status === 'Needs Clarification')
                                            .map(s => ({ ...s, projectName: p.name, projectId: p.id }))
                                    );

                                    if (attentionItems.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                No pending actions needed
                                            </div>
                                        );
                                    }

                                    return attentionItems.map((item, idx) => {
                                        const isClarify = item.status === 'Needs Clarification';
                                        return (
                                            <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isClarify ? 'bg-orange-50/50 border-orange-100 hover:bg-orange-50' : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
                                                }`} onClick={() => navigate(`/manager/projects/${item.projectId}`)}>
                                                <div className="mt-1">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${isClarify ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">PROJECT: {item.projectName}</p>
                                                    <div className="flex mt-3">
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isClarify ? 'bg-orange-100/30 text-orange-600 border-orange-200' : 'bg-blue-100/30 text-blue-600 border-blue-200'
                                                            }`}>{item.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}


