import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    FileSearch,
    Layers,
    MessageSquare,
    Paperclip,
    FileText,
    Download,
    Clock,
    UserCircle,
    ArrowRight,
    ThumbsUp,
    HelpCircle,
    RotateCcw,
    Users,
    Link as LinkIcon,
    ExternalLink,
    Zap,
    Flag
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OnboardingProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { projects, updateSectionStatus, addComment, setReverseKTMode, finalizeReceiverTransition, updateReceiverProgress, getReceiverCompletion } = useProjects();
    const navigate = useNavigate();

    const project = projects.find(p => p.id === projectId);
    const isDeadlinePassed = project?.deadline ? new Date() > new Date(new Date(project.deadline).setHours(23, 59, 59, 999)) : false;

    const [selectedSectionId, setSelectedSectionId] = useState(project?.sections[0]?.id);
    const [commentText, setCommentText] = useState('');

    const section = project?.sections.find(s => s.id === selectedSectionId);

    // If no section selected initially, select the first one
    useEffect(() => {
        if (!selectedSectionId && project?.sections.length > 0) {
            setSelectedSectionId(project.sections[0].id);
        }
    }, [project, selectedSectionId]);

    const handleStatusUpdate = (newStatus) => {
        if (section) {
            // Update the RECEIVER's personal progress, not the section's global status
            updateReceiverProgress(projectId, section.id, user.id, newStatus);
        }
    };

    const handleAddComment = () => {
        if (!commentText.trim() || !section) return;
        addComment(projectId, section.id, {
            userId: user.id,
            userName: user.name,
            text: commentText
        });
        setCommentText('');
    };

    const handleReverseKTFlip = async () => {
        const isCurrentlyReverse = project.lifecycleMode === 'REVERSE_KT';
        await setReverseKTMode(projectId, !isCurrentlyReverse);
        toast.success(`Switched to ${!isCurrentlyReverse ? 'Reverse KT' : 'Transition'} mode`);
    };

    const handleFinalize = async () => {
        const myCompletion = getReceiverCompletion(projectId, user.id);
        if (myCompletion < 100) {
            if (!confirm(`Your progress is ${myCompletion}%. Are you sure you want to finalize before completing all sections?`)) {
                return;
            }
        }
        if (confirm("This will mark YOUR transition as complete. You will become a Contributor. Continue?")) {
            await finalizeReceiverTransition(projectId, user.id);
            toast.success("Transition finalized! You are now a contributor.");
            navigate(`/icr/handovers/${projectId}`);
        }
    };

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 transition-colors">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 transition-colors" />
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight transition-colors">Project Record Missing</h2>
            <Button onClick={() => navigate('/icr/onboardings')} className="rounded-xl">Return to Onboardings</Button>
        </div>
    );

    // Helper: get THIS receiver's status for a given section
    const getMyStatus = (sectionId) => {
        const rp = (project.receiverProgress || []).find(
            r => r.sectionId === sectionId && r.receiverId === user.id
        );
        return rp?.status || 'Not Started';
    };

    const myCompletion = getReceiverCompletion(projectId, user.id);

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-900/20 min-h-screen font-sans transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/icr/onboardings')}
                    className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all shrink-0 hidden md:flex"
                    title="Back to Onboardings"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">{project.name}</p>
                    <Badge variant="outline" className={`rounded-lg px-4 py-1 font-medium text-xs uppercase tracking-label border transition-colors ${project.lifecycleMode === 'ACTIVE'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
                        : project.lifecycleMode === 'REVERSE_KT'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                        }`}>
                        {project.lifecycleMode}
                    </Badge>
                    <Badge variant="outline" className={`rounded-lg px-4 py-1 font-medium text-xs uppercase tracking-label border transition-colors ${(project.status === 'Completed' || project.status === 'Signed Off')
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                        : project.status === 'In Progress'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                        }`}>
                        {project.status === 'Completed' || project.status === 'Signed Off' ? 'Signed off' : (project.status || 'Active')}
                    </Badge>
                </div>
                <div className="flex items-center gap-4">
                    {isDeadlinePassed && (
                        <Badge variant="destructive" className="rounded-lg px-4 py-1 font-semibold text-xs uppercase tracking-widest bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800 flex items-center gap-1.5 animate-pulse transition-colors">
                            <AlertCircle className="w-3 h-3" /> Deadline passed - Locked
                        </Badge>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-700 ${myCompletion === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                style={{ width: `${myCompletion}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{myCompletion}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5 xl:h-[calc(100vh-120px)]">
                {/* Left Sidebar: Sections List & Team */}
                <div className="col-span-12 xl:col-span-3 flex flex-col gap-4 h-auto xl:h-full xl:overflow-y-auto xl:pr-2 custom-scrollbar">
                    {/* Sections List */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col">
                        <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 transition-colors">
                            <CardTitle className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" /> Learning modules
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-xs bg-slate-200/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-none font-medium">
                                    {project.sections.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                            {project.sections.map((s) => {
                                const isSelected = selectedSectionId === s.id;
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedSectionId(s.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border-l-4 relative group ${isSelected
                                            ? 'bg-primary/5 dark:bg-primary/10 border-primary shadow-sm'
                                            : 'bg-white dark:bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-100 dark:hover:border-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5 transition-colors">
                                            <h4 className={`text-xs font-semibold leading-snug transition-colors ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {s.title}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon status={getMyStatus(s.id)} />
                                            <span className={`text-xs font-medium uppercase tracking-label transition-colors ${isSelected ? 'text-primary/70 dark:text-primary/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {getMyStatus(s.id)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Team Members */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex-shrink-0">
                        <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Team Members
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[9px] bg-slate-200/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-none font-semibold">{project.members.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                            {[...project.members]
                                .sort((a, b) => {
                                    const roles = { 'Initiator': 1, 'Contributor': 2, 'Receiver': 3 };
                                    return (roles[a.ktRole] || 4) - (roles[b.ktRole] || 4);
                                })
                                .map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                        <div className="flex items-center gap-4 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-semibold text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-all">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors">{m.name}</p>
                                                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{m.functionalRole}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`text-[8px] px-2 py-0.5 font-semibold uppercase tracking-widest border transition-colors ${m.ktRole === 'Initiator' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' :
                                            m.ktRole === 'Receiver' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' :
                                                'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                                            }`}>
                                            {m.ktRole}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </Card>
                </div>

                {/* Right Content Area: Reader, Attachments, Discussion */}
                <div className="col-span-12 xl:col-span-9 flex flex-col gap-4 h-auto xl:h-full xl:overflow-y-auto custom-scrollbar pb-20">
                    {section ? (
                        <>
                            {/* Reader Section */}
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex-shrink-0">
                                <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10 transition-colors">
                                    <div className="space-y-2 transition-colors">
                                        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">{section.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const assignee = project.members.find(m => m.userId === section.contributorId);
                                                if (!assignee) return (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-colors">
                                                        <UserCircle className="w-3" />
                                                        Unassigned
                                                    </div>
                                                );

                                                const isInitiator = assignee.ktRole === 'Initiator';
                                                const colorClass = isInitiator
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800';

                                                return (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest border transition-colors ${colorClass}`}>
                                                        <UserCircle className="w-3 h-3" />
                                                        {assignee.ktRole}: {assignee.name}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {project.lifecycleMode === 'TRANSITION' && (
                                            <Button
                                                onClick={handleReverseKTFlip}
                                                disabled={isDeadlinePassed}
                                                className="rounded-lg h-9 px-4 font-medium tracking-button text-sm bg-amber-600 text-white hover:bg-amber-700 shadow-sm disabled:opacity-50"
                                            >
                                                <Zap className="w-3.5 h-3.5 mr-1.5" /> Start reverse KT
                                            </Button>
                                        )}
                                        {project.lifecycleMode === 'REVERSE_KT' && (
                                            <>
                                                <Button
                                                    onClick={handleReverseKTFlip}
                                                    variant="outline"
                                                    className="rounded-lg h-9 px-4 font-medium tracking-button text-sm border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Back to learning
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate('Presented')}
                                                    disabled={getMyStatus(section.id) === 'Presented' || project.status === 'Completed' || isDeadlinePassed}
                                                    className="rounded-lg h-9 px-4 font-medium tracking-button text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Mark as presented
                                                </Button>
                                            </>
                                        )}
                                        {(project.status === 'Signed Off' || myCompletion === 100) && (
                                            <Button
                                                onClick={handleFinalize}
                                                className="rounded-lg h-9 px-4 font-medium tracking-button text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm animate-pulse"
                                            >
                                                <Flag className="w-3.5 h-3.5 mr-1.5" /> Finalize my transition
                                            </Button>
                                        )}
                                        {(project.lifecycleMode === 'TRANSITION') && (
                                            <>
                                                <Button
                                                    onClick={() => handleStatusUpdate('Ready for Review')}
                                                    disabled={section.status === 'Ready for Review' || project.status === 'Completed' || isDeadlinePassed}
                                                    variant="outline"
                                                    className="rounded-lg h-9 px-4 font-medium tracking-button text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate('Needs Clarification')}
                                                    disabled={getMyStatus(section.id) === 'Needs Clarification' || getMyStatus(section.id) === 'Not Started' || project.status === 'Completed' || isDeadlinePassed}
                                                    className={`rounded-lg h-9 px-4 font-medium tracking-button text-sm transition-all ${getMyStatus(section.id) === 'Needs Clarification'
                                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/40'
                                                        : getMyStatus(section.id) === 'Not Started'
                                                            ? 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700'
                                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-100 dark:hover:border-orange-800 shadow-sm'
                                                        }`}
                                                >
                                                    <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Request clarification
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate('Understood')}
                                                    disabled={getMyStatus(section.id) === 'Understood' || getMyStatus(section.id) === 'Not Started' || project.status === 'Completed' || isDeadlinePassed}
                                                    className={`rounded-lg h-9 px-5 font-medium tracking-button text-sm transition-all shadow-sm ${getMyStatus(section.id) === 'Understood'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                                                        : getMyStatus(section.id) === 'Not Started'
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        }`}
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Understood
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 min-h-[450px]">
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        {section.content ? (
                                            <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">
                                                {section.content}
                                            </p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-80 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                                                <FileText className="w-12 h-12 mb-4 opacity-30" />
                                                <p className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">No content available for review</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12 items-stretch">
                                {/* Left Column: Attachments and Reference Links */}
                                <div className="flex flex-col gap-4">
                                    {/* Attachments */}
                                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden shrink-0">
                                        <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                            <CardTitle className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label flex items-center gap-2">
                                                <Paperclip className="w-3.5 h-3.5" /> Attachments
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                                            {(section.attachments || []).length === 0 ? (
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label text-center py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors">No files attached</p>
                                            ) : (
                                                (section.attachments || []).map((att, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl group hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate tracking-tight">{att.fileName}</p>
                                                                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{att.fileSize}</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                            onClick={() => {
                                                                if (att.url) {
                                                                    const link = document.createElement('a');
                                                                    link.href = att.url;
                                                                    link.download = att.fileName || 'download';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }
                                                            }}
                                                        >
                                                            <Download className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Reference Links */}
                                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden shrink-0">
                                        <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                            <CardTitle className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label flex items-center gap-2">
                                                <LinkIcon className="w-3.5 h-3.5" /> Reference links
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {(section.links || []).length === 0 ? (
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label text-center py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors">No reference links</p>
                                            ) : (
                                                (section.links || []).map((link, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl group hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm">
                                                                <LinkIcon className="w-4 h-4" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate tracking-tight">{link.title}</p>
                                                                <p className="text-[9px] font-semibold text-primary dark:text-primary/90 truncate hover:underline cursor-pointer transition-colors" onClick={() => window.open(link.url, '_blank')}>{link.url}</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                            onClick={() => window.open(link.url, '_blank')}
                                                        >
                                                            <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column: Discussion */}
                                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
                                    <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                        <CardTitle className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" /> Discussion
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                                        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                            {(section.comments || []).length === 0 ? (
                                                <div className="text-center py-10 flex flex-col items-center justify-center h-full gap-2 opacity-50 transition-colors">
                                                    <MessageSquare className="w-6 h-6 text-slate-200 dark:text-slate-700 transition-colors" />
                                                    <p className="text-xs font-medium text-slate-300 dark:text-slate-600 uppercase tracking-label transition-colors">No conversation yet</p>
                                                </div>
                                            ) : (
                                                section.comments.map((c, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1.5 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-all">
                                                        <div className="flex justify-between items-center transition-colors">
                                                            <span className="text-xs font-semibold uppercase text-primary dark:text-primary transition-colors tracking-widest">{c.userName}</span>
                                                            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest transition-colors">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-colors">{c.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex gap-2 shrink-0 transition-colors">
                                            <Input
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Ask clarifications..."
                                                className="h-10 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-primary/20 dark:text-slate-200 transition-all"
                                            />
                                            <Button
                                                onClick={handleAddComment}
                                                disabled={!commentText.trim()}
                                                size="icon"
                                                className="h-10 w-10 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-sm shrink-0 transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 space-y-4 transition-colors">
                            <Layers className="w-16 h-16 opacity-10 transition-colors" />
                            <p className="font-semibold uppercase tracking-widest text-xs text-slate-400 dark:text-slate-500 transition-colors">Select a section to begin learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

function StatusIcon({ status }) {
    switch (status) {
        case 'Understood': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
        case 'Needs Clarification': return <AlertCircle className="w-3 h-3 text-orange-500" />;
        case 'Ready for Review': return <FileSearch className="w-3 h-3 text-primary" />;
        case 'Presented': return <MessageSquare className="w-3 h-3 text-amber-500" />;
        case 'Not Started': return <Clock className="w-3 h-3 text-slate-300" />;
        case 'Draft': return <Clock className="w-3 h-3 text-slate-400" />;
        default: return <Clock className="w-3 h-3 text-slate-300" />;
    }
}
