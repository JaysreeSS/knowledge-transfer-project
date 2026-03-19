import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FolderKanban, Zap, CheckCircle2, Calendar } from 'lucide-react';

export default function UserProjects() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { users } = useAdmin();
    const { projects } = useProjects();

    const targetUser = users.find(u => u.id === userId);

    if (!targetUser) {
        return (
            <div className="p-12 text-center space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">User not found</h2>
                <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
            </div>
        );
    }

    const getGranularSectionProgress = (s) => {
        const hasText = !!s.content;
        const hasAttachments = (s.attachments || []).length > 0;
        const isReady = s.status === 'Ready for Review' || s.status === 'Understood';
        return (hasText ? 33 : 0) + (hasAttachments ? 33 : 0) + (isReady ? 34 : 0);
    };

    // Filter projects for this user
    const userProjects = projects.filter(p =>
        p.managerId === targetUser.id ||
        p.members.some(m => m.userId === targetUser.id)
    ).map(p => {
        const membership = p.members.find(m => m.userId === targetUser.id);
        const ktRole = membership?.ktRole || (p.managerId === targetUser.id ? 'Manager' : 'Member');
        let individualProgress = 0;

        if (ktRole === 'Receiver') {
            const totalSections = p.sections.length;
            if (totalSections > 0) {
                const understood = p.sections.filter(s => s.status === 'Understood').length;
                individualProgress = Math.round((understood / totalSections) * 100);
            }
        } else if (ktRole === 'Manager') {
            individualProgress = p.completion || 0;
        } else if (ktRole === 'Contributor' || ktRole === 'Initiator') {
            const userSections = p.sections.filter(s => s.contributorId === targetUser.id);
            if (userSections.length > 0) {
                const totalProgress = userSections.reduce((acc, s) => acc + getGranularSectionProgress(s), 0);
                individualProgress = Math.round(totalProgress / userSections.length);
            } else if (ktRole === 'Initiator') {
                individualProgress = p.completion || 0;
            }
        } else {
            individualProgress = p.completion || 0;
        }

        return {
            ...p,
            userKtRole: ktRole,
            userProgress: individualProgress
        };
    });

    // Sorting Logic: Active projects first, Signed Off last. Sub-sort by Date of Creation (newest first).
    const sortedProjects = [...userProjects].sort((a, b) => {
        // Status sort: Signed Off (Completed) goes to bottom
        const statusOrder = { 'In Progress': 0, 'Ready': 0, 'Review': 0, 'Completed': 1 };
        const statusA = statusOrder[a.status] ?? 0;
        const statusB = statusOrder[b.status] ?? 0;

        if (statusA !== statusB) return statusA - statusB;

        // Date sort: Newest first
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return (
        <div className="px-4 sm:px-8 md:px-12 py-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/admin/users')}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Project Engagements</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Viewing all projects for <span className="text-primary font-bold">{targetUser.name}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-8 bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                        <div className="h-2 bg-primary"></div>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary border border-primary/20 dark:border-primary/30 transition-colors">
                                    <span className="text-lg font-bold uppercase">{targetUser.name?.substring(0, 2)}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight transition-colors">{targetUser.name}</h2>
                                    <Badge variant="soft" className="mt-1 lowercase text-[11px] font-bold tracking-wider dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800 transition-colors">{targetUser.role}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Username</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{targetUser.username}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Engagement Count</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{userProjects.length} Projects Total</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects List */}
                <div className="lg:col-span-2 space-y-4">
                    {sortedProjects.length > 0 ? (
                        sortedProjects.map((project) => (
                            <Card
                                key={project.id}
                                className="group hover:border-primary/30 transition-all duration-300 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-800/50 cursor-pointer backdrop-blur-sm"
                                onClick={() => navigate(`/admin/projects/${project.id}`, { state: { from: `/admin/users/${userId}/projects` } })}
                            >
                                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${project.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-500 dark:text-emerald-400' : 'bg-primary/5 dark:bg-primary/20 border-primary/10 dark:border-primary/20 text-primary dark:text-primary'}`}>
                                            {project.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <FolderKanban className="w-5 h-5" />}
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">{project.name}</h3>
                                                <Badge variant={project.status === 'Completed' ? 'success' : 'blue'} className="text-[9px] h-4 font-bold uppercase tracking-wider px-1.5">
                                                    {project.status === 'Completed' ? 'Signed Off' : project.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <span className="text-slate-200 dark:text-slate-700 text-xs">•</span>
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-primary dark:text-primary transition-colors">
                                                    <Zap className="w-3 h-3" />
                                                    {project.userKtRole}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                                        <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress</span>
                                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{project.userProgress}%</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${project.userProgress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${project.userProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-all border border-transparent hover:border-primary/10 dark:hover:border-primary/20 dark:text-slate-400"
                                        >
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 transition-all">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
                                <FolderKanban className="w-10 h-10 text-slate-200 dark:text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No project engagements</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">This user hasn't been assigned to any projects yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
