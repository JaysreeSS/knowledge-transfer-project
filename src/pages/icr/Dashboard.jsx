import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
    Briefcase,
    Layers,
    ArrowUpRight,
    Send,
    Inbox,
    Zap,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ICRDashboard() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    // 1. Get all projects where the user is a member
    const myProjects = projects.filter(p =>
        p.members.some(m => m.userId === user.id)
    );

    const activeProjects = myProjects.filter(p => p.lifecycleMode === 'ACTIVE');
    const transitionProjects = myProjects.filter(p => p.lifecycleMode === 'TRANSITION');

    const getMyRole = (project) => {
        const member = project.members.find(m => m.userId === user.id);
        return member?.ktRole || 'Member';
    };

    const handleProjectClick = (project) => {
        const role = getMyRole(project);
        if (role === 'Receiver') {
            navigate(`/icr/onboardings/${project.id}`);
        } else {
            navigate(`/icr/handovers/${project.id}`);
        }
    };

    const attentionNeeded = projects.flatMap(p => {
        const myRole = getMyRole(p);
        const myTasks = [];

        (p.sections || []).forEach(s => {
            if (s.contributorId === user.id && s.status === 'Needs Clarification') {
                myTasks.push({ ...s, projectId: p.id, projectName: p.name, type: 'clarify' });
            }
            if (myRole === 'Receiver' && s.status === 'Ready for Review') {
                myTasks.push({ ...s, projectId: p.id, projectName: p.name, type: 'review' });
            }
        });

        return myTasks;
    });

    const onboardings = myProjects.filter(p => getMyRole(p) === 'Receiver');
    const handovers = myProjects.filter(p => getMyRole(p) !== 'Receiver');

    const stats = [
        {
            title: "Active Projects",
            value: activeProjects.length,
            icon: Briefcase,
            color: "text-emerald-600",
            bg: "bg-emerald-50/80"
        },
        {
            title: "Transition Projects",
            value: transitionProjects.length,
            icon: Zap,
            color: "text-amber-600",
            bg: "bg-amber-50/80"
        },
        {
            title: "My Onboardings",
            value: onboardings.length,
            icon: Inbox,
            color: "text-blue-600",
            bg: "bg-blue-50/80"
        }
    ];

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 transition-colors">
            <header className="space-y-1">
                <h1 id="icr-dashboard-title" className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-page-title transition-colors">ICR Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg transition-colors">
                    Command center for your continuous knowledge and transitions.
                </p>
            </header>

            {/* Stats */}
            <div id="icr-stats-grid" className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800/50 group overflow-hidden relative">
                        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.bg} dark:bg-slate-700/20 opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                        <CardContent className="p-6 relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 mb-2 transition-colors">{stat.title}</p>
                                <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-page-title transition-colors">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg} dark:bg-slate-900 ${stat.color} dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-12">
                {/* Onboardings Section */}
                <ProjectSection
                    title="My Onboardings"
                    icon={<Inbox className="w-4 h-4 text-blue-500" />}
                    projects={onboardings}
                    handleProjectClick={handleProjectClick}
                    getMyRole={getMyRole}
                />

                {/* Transition Projects Section */}
                <ProjectSection
                    title="Transition Projects"
                    icon={<Zap className="w-4 h-4 text-amber-500" />}
                    projects={transitionProjects.filter(p => getMyRole(p) !== 'Receiver')}
                    handleProjectClick={handleProjectClick}
                    getMyRole={getMyRole}
                />

                {/* Active Projects Section */}
                <ProjectSection
                    title="Active Projects"
                    icon={<Briefcase className="w-4 h-4 text-emerald-500" />}
                    projects={activeProjects.filter(p => getMyRole(p) !== 'Receiver')}
                    handleProjectClick={handleProjectClick}
                    getMyRole={getMyRole}
                />
            </div>
        </div>
    );
}

function ProjectSection({ title, icon, projects, handleProjectClick, getMyRole }) {
    if (projects.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 tracking-section-title flex items-center gap-2 transition-colors">
                {icon}
                {title}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 transition-colors">
                    {projects.length}
                </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => {
                    const role = getMyRole(project);
                    const isTransition = project.lifecycleMode === 'TRANSITION';

                    return (
                        <Card
                            key={project.id}
                            onClick={() => handleProjectClick(project)}
                            className="group cursor-pointer hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50"
                        >
                            <div className={`h-1 w-full ${isTransition ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            {isTransition ? <Zap className="w-3 h-3 text-amber-500" /> : <Briefcase className="w-3 h-3 text-emerald-500" />}
                                            <span className={`text-[9px] font-black uppercase tracking-label ${isTransition ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {project.lifecycleMode}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] w-fit font-medium border-slate-100 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-900 transition-colors">
                                            {role}
                                        </Badge>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 group-hover:border-primary/20 group-hover:text-primary transition-all shadow-sm">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic mt-1">
                                        {project.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="space-y-1.5 pt-3 border-t border-slate-50 dark:border-slate-800 transition-colors">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-label text-slate-400 dark:text-slate-500 transition-colors">
                                        <span>Progress</span>
                                        <span className="text-slate-900 dark:text-slate-100">{project.completion}%</span>
                                    </div>
                                    <Progress value={project.completion} className="h-1 bg-slate-100 dark:bg-slate-900 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
