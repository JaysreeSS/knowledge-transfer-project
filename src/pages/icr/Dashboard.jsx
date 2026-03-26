import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
    Briefcase,
    FileCheck,
    Layers,
    ArrowUpRight,
    Send,
    Inbox,
    Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ICRDashboard() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    // 1. Get all projects where the user is a member
    const myProjects = projects.filter(p =>
        p.members.some(m => m.userId === user.id)
    );

    const getMyRole = (project) => {
        const member = project.members.find(m => m.userId === user.id);
        return member?.ktRole || 'Member';
    };

    const handleProjectClick = (project) => {
        const role = getMyRole(project);
        if (role === 'Initiator' || role === 'Contributor') {
            navigate(`/icr/handovers/${project.id}`);
        } else if (role === 'Receiver') {
            navigate(`/icr/onboardings/${project.id}`);
        }
    };

    // 4. Enhanced Attention Needed Logic:
    // - As a Contributor: See 'Needs Clarification' tasks
    // - As a Receiver: See 'Ready for Review' tasks
    const attentionNeeded = projects.flatMap(p => {
        const myRole = p.members.find(m => m.userId === user.id)?.ktRole;
        const myTasks = [];

        (p.sections || []).forEach(s => {
            // Case 1: I am the contributor and the receiver has questions
            if (s.contributorId === user.id && s.status === 'Needs Clarification') {
                myTasks.push({ ...s, projectId: p.id, projectName: p.name, type: 'clarify' });
            }
            // Case 2: I am the receiver and a task is waiting for my sign-off
            if (myRole === 'Receiver' && s.status === 'Ready for Review') {
                myTasks.push({ ...s, projectId: p.id, projectName: p.name, type: 'review' });
            }
        });

        return myTasks;
    });

    const stats = [
        {
            title: "Active Handovers",
            value: myProjects.filter(p => {
                const r = getMyRole(p);
                return (r === 'Initiator' || r === 'Contributor') && p.status !== 'Completed';
            }).length,
            icon: Send,
            color: "text-blue-600",
            bg: "bg-blue-50/80"
        },
        {
            title: "Active Onboardings",
            value: myProjects.filter(p => {
                const r = getMyRole(p);
                return r === 'Receiver' && p.status !== 'Completed';
            }).length,
            icon: Inbox,
            color: "text-orange-600",
            bg: "bg-orange-50/80"
        },
        {
            title: "Total Engagements",
            value: myProjects.length,
            icon: Briefcase,
            color: "text-emerald-600",
            bg: "bg-emerald-50/80"
        }
    ];

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 space-y-5 max-w-7xl mx-auto animate-in fade-in duration-700 transition-colors">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg transition-colors">Overview of your knowledge transfer responsibilities and learning paths.</p>
            </header>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800/50 group overflow-hidden relative">
                        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.bg} dark:bg-slate-700/20 opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                        <CardContent className="p-6 relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 mb-2 transition-colors">{stat.title}</p>
                                <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg} dark:bg-slate-900 ${stat.color} dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dashboard Stats and Projects */}

            {/* Projects Grid */}
            <div className="space-y-4">
                <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-label flex items-center gap-2 transition-colors">
                    <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
                    Your projects
                </h2>

                {myProjects.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 dark:text-slate-600 text-xs font-medium uppercase tracking-label bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                        No active projects found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {myProjects.map(project => {
                            const role = getMyRole(project);
                            const isHandover = role === 'Initiator' || role === 'Contributor';
                            const roleColor = isHandover ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-orange-600 bg-orange-50 border-orange-100';

                            return (
                                <Card
                                    key={project.id}
                                    onClick={() => handleProjectClick(project)}
                                    className="group cursor-pointer hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50"
                                >
                                    <div className={`h-1.5 w-full ${isHandover ? 'bg-blue-500' : 'bg-orange-500'}`} />
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-label border ${isHandover ? 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800' : 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800'} transition-colors`}>
                                                {role}
                                            </div>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 group-hover:border-primary/20 group-hover:text-primary dark:group-hover:text-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-all">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-2">{project.description}</p>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                                            <div className="flex justify-between text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 transition-colors">
                                                <span>Completion</span>
                                                <span className="text-slate-900 dark:text-slate-100 transition-colors">{project.completion}%</span>
                                            </div>
                                            <Progress value={project.completion} className="h-1.5 bg-slate-100 dark:bg-slate-900 transition-colors" />
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="flex -space-x-2">
                                                {project.members && project.members.slice(0, 3).map((m, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-colors">
                                                        {m.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {project.members && project.members.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[9px] font-semibold text-slate-400 dark:text-slate-500 shadow-sm transition-colors">
                                                        +{project.members.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label ml-auto transition-colors">
                                                {project.sections?.length || 0} sections
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
