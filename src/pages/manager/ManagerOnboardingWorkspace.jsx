import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    AlertTriangle, 
    FileText, 
    CheckCircle2, 
    ArrowLeft,
    Clock,
    Activity,
    ExternalLink,
    Zap,
    Lock,
    Search,
    ChevronRight,
    MessageSquare
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'sonner';
import { getAvatarUrl } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ManagerOnboardingWorkspace() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { projects, loading, finalizeManagerHandover } = useProjects();
    const { settings } = useAdmin();
    const navigate = useNavigate();
    const themeColor = settings?.theme_color?.replace('#', '') || '7c3aed';

    const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);

    const [verificationSteps, setVerificationSteps] = useState({
        overview: false,
        teamGrid: false,
        healthCheck: false,
        riskReview: false
    });

    const [previewSection, setPreviewSection] = useState(null);

    if (loading) return <LoadingScreen />;
    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <AlertTriangle className="w-12 h-12 text-slate-300" />
            <h2 className="text-xl font-bold">Project Not Found</h2>
            <Button onClick={() => navigate('/manager/my-onboardings')}>Go Back</Button>
        </div>
    );

    const isAllVerified = Object.values(verificationSteps).every(v => v);

    // Calculate Health stats
    const stats = {
        total: project.sections.length,
        completed: project.sections.filter(s => s.status === 'Understood' || s.status === 'Active').length,
        stale: project.sections.filter(s => !s.content || s.content.length < 50).length,
        pending: project.sections.filter(s => s.status === 'Ready for Review' || s.status === 'In Progress').length,
        clarification: project.sections.filter(s => s.status === 'Needs Clarification').length
    };

    const handleFinalize = async () => {
        if (!isAllVerified) {
            toast.error("Please complete all verification steps first.");
            return;
        }

        const success = await finalizeManagerHandover(project.id, user.id);
        if (success) {
            toast.success("Handover complete! You are now the project manager.");
            navigate(`/manager/projects/${project.id}`);
        } else {
            toast.error("Failed to finalize handover.");
        }
    };

    const toggleStep = (step) => {
        setVerificationSteps(prev => ({ ...prev, [step]: !prev[step] }));
    };

    return (
        <div className="px-6 md:px-12 py-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 bg-slate-50/50 dark:bg-slate-950/20 min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/manager/my-onboardings')}
                        className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{project.name}</h1>
                            <Badge variant="warning" className="px-3 py-0.5 rounded-full uppercase tracking-widest text-[9px] font-bold">
                                Manager Transition
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Perform high-level project assessment before taking ownership.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden xl:block">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Readiness Score</p>
                        <p className="text-2xl font-bold text-primary leading-none">{project.completion}%</p>
                    </div>
                    <Button 
                        onClick={handleFinalize}
                        disabled={!isAllVerified}
                        className={`h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all ${isAllVerified ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}
                    >
                        <Zap className="w-4 h-4 mr-2" /> Finalize Handover
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Project Stats & Team */}
                <div className="col-span-12 xl:col-span-4 space-y-8">
                    {/* Health Summary Card */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6">
                            <CardTitle className="text-sm font-semibold tracking-wide text-slate-400 flex items-center gap-3">
                                <Activity className="w-4 h-4 text-primary" /> Documentation Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.completed}</p>
                                    <p className="text-xs font-semibold text-emerald-500">Live Sections</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-3xl font-bold text-slate-400">{stats.stale}</p>
                                    <p className="text-xs font-semibold text-orange-500">Draft/Missing</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Overall Readiness</span>
                                    <span className="text-xs font-semibold text-primary">{project.completion}%</span>
                                </div>
                                <Progress value={project.completion} className="h-2.5" />
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-orange-800 dark:text-orange-400">Needs Clarification</span>
                                    </div>
                                    <Badge variant="warning" className="rounded-full shadow-none">{stats.clarification}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Grid */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6">
                            <CardTitle className="text-sm font-semibold tracking-wide text-slate-400 flex items-center gap-3">
                                <Users className="w-4 h-4 text-primary" /> Active Contributors
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-2">
                                    {project.members.filter(m => m.ktRole !== 'Receiver').map((m, idx) => {
                                        const assignedSections = project.sections.filter(s => s.contributorId === m.userId);
                                        return (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/20 group">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-10 h-10 rounded-xl border border-white dark:border-slate-800 shadow-sm transition-all group-hover:scale-105">
                                                        <AvatarImage src={getAvatarUrl(m.name, themeColor)} alt={m.name} />
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{m.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-none mb-1">{m.name}</p>
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{m.functionalRole}</p>
                                                    </div>
                                                    <Badge variant="soft" className="bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-bold text-[9px] uppercase tracking-widest">
                                                        {assignedSections.length} Sections
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Section Review & Verification */}
                <div className="col-span-12 xl:col-span-8 space-y-8">
                    {/* Project Overview & Risks */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-8">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-xl font-bold flex items-center gap-3">
                                    <LayoutDashboard className="w-5 h-5 text-primary" /> Handover Workspace
                                </CardTitle>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    <Clock className="w-3.5 h-3.5" /> Est. Review Time: 15m
                                </div>
                            </div>
                            <CardDescription className="text-sm font-medium leading-relaxed max-w-3xl">
                                Taking over as Project Manager requires understanding the current progress and potential roadblocks. 
                                Review the sections below and verify your understanding of each component.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                                {project.sections.map((section, idx) => (
                                    <div key={section.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-6 flex-1 min-w-0 pr-10">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                0{idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary transition-colors">{section.title}</h4>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                                        Owner: {project.members.find(m => m.userId === section.contributorId)?.name || 'Unassigned'}
                                                    </span>
                                                    <span className="text-slate-200 dark:text-slate-800">•</span>
                                                    <Badge variant={section.status === 'Understood' || section.status === 'Active' ? 'success' : 'soft'} className="px-2 py-0 h-4 text-[8px] font-bold uppercase tracking-widest border-none">
                                                        {section.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 shrink-0"
                                            onClick={() => setPreviewSection(section)}
                                        >
                                            <FileText className="w-3.5 h-3.5 mr-2" /> View Doc
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Checklist */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" /> Manager Verification
                            </CardTitle>
                            <CardDescription className="text-xs font-semibold uppercase tracking-widest text-primary/70">Required for Ownership Transfer</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <VerificationItem 
                                checked={verificationSteps.overview} 
                                onClick={() => toggleStep('overview')}
                                title="Project Purpose" 
                                desc="I understand the strategic goals and current phase of this project." 
                            />
                            <VerificationItem 
                                checked={verificationSteps.teamGrid} 
                                onClick={() => toggleStep('teamGrid')}
                                title="Stakeholder Roles" 
                                desc="I have reviewed the team structure and individual ownership." 
                            />
                            <VerificationItem 
                                checked={verificationSteps.healthCheck} 
                                onClick={() => toggleStep('healthCheck')}
                                title="Documentation Health" 
                                desc="I have assessed the quality and completeness of current records." 
                            />
                            <VerificationItem 
                                checked={verificationSteps.riskReview} 
                                onClick={() => toggleStep('riskReview')}
                                title="Risk Assessment" 
                                desc="I understand the open issues and potential roadblocks." 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Read-Only Modal for Documentation Preview */}
            <Dialog open={!!previewSection} onOpenChange={() => setPreviewSection(null)}>
                <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl !border-none shadow-2xl">
                    {previewSection && (
                        <>
                            <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between shrink-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">{previewSection.title}</DialogTitle>
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Read-Only Onboarding Deep Dive</p>
                                </div>
                                <div className="flex items-center gap-3 pr-8">
                                    <Badge variant="soft" className="bg-white dark:bg-slate-800 px-3 py-1 font-bold text-[9px] uppercase tracking-widest shadow-sm">
                                        Owner: {project.members.find(m => m.userId === previewSection.contributorId)?.name}
                                    </Badge>
                                </div>
                            </DialogHeader>
                            <ScrollArea className="flex-1 p-10 bg-white dark:bg-slate-950">
                                <div className="max-w-3xl mx-auto">
                                    {previewSection.content ? (
                                        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {previewSection.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="py-24 text-center space-y-4 opacity-30">
                                            <Search className="w-16 h-16 mx-auto text-slate-300" />
                                            <p className="font-bold uppercase tracking-widest text-sm">No Content Drafted Yet</p>
                                        </div>
                                    )}

                                    {/* Related Resources (ReadOnly) */}
                                    <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-10">
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Reference Links</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(previewSection.links || []).map((link, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                                                            <span className="text-sm font-bold truncate text-slate-700 dark:text-slate-300">{link.title}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                ))}
                                                {(previewSection.links || []).length === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase italic">No external links attached</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pb-12">
                                            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Recent Discussion</h5>
                                            <div className="space-y-3">
                                                {(previewSection.comments || []).map((c, i) => (
                                                    <div key={i} className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{c.userName}</span>
                                                            <span className="text-[8px] font-bold text-slate-400">{new Date(c.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed italic">"{c.text}"</p>
                                                    </div>
                                                ))}
                                                {(previewSection.comments || []).length === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase italic">No comments on this section</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
                                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    <Lock className="w-3.5 h-3.5" /> Editing is locked during onboarding review
                                </div>
                            </CardFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function VerificationItem({ checked, onClick, title, desc }) {
    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${checked ? 'bg-primary/5 border-primary shadow-inner-sm' : 'bg-white bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 shadow-sm'}`}
        >
            <div className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                {checked && <CheckCircle2 className="w-10 h-10" />}
            </div>
            <div className="space-y-1">
                <h5 className={`text-sm font-semibold tracking-wide transition-colors ${checked ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>{title}</h5>
                <p className={`text-[11px] font-semibold leading-relaxed transition-colors ${checked ? 'text-primary/70' : 'text-slate-500'}`}>{desc}</p>
            </div>
        </div>
    );
}
