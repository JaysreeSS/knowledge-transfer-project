import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    ChevronLeft,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Lock,
    LayoutDashboard,
    FolderKanban,
    ScrollText,
    History,
    Zap,
    Trash2,
    Users,
    FileText,
    Paperclip,
    Plus,
    UserPlus,
    Pencil,
    X,
    FileDown,
    Activity,
    UserMinus,
    ExternalLink,
    Timer,
    Code2,
    ArrowRight,
    Layers,
    ChevronRight,
    RefreshCw,
    Check,
    Target,
    HelpCircle,
    Sparkles
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportProjectToPDF } from '../lib/pdfExport';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/utils';
import { toast } from 'sonner';
import HandoverProjectDetails from './HandoverProjectDetails.jsx';
import TechStackCard from '../components/TechStackCard.jsx';
import TransitionHistoryTimeline from '../components/TransitionHistoryTimeline.jsx';
import { AIService } from '../services/aiService';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const {
        projects,
        fetchProjects,
        updateProjectStatus,
        updateMember,
        addMember,
        removeMember,
        addSection,
        removeSection,
        updateSectionStatus,
        updateSection,
        updateProject,
        triggerTransition,
        finalizeTransition,
        syncProjectProgress,
        updateProjectAIInsights
    } = useProjects();
    const { pushNotification } = useNotifications();
    const { users: allUsers, templates, settings } = useAdmin();
    const themeColor = settings?.theme_color?.replace('#', '') || localStorage.getItem('a_theme_color')?.replace('#', '') || '7c3aed';
    const location = useLocation();
    const navigate = useNavigate();

    // Dynamic back path based on where we came from
    const returnPath = location.state?.from || (user?.isAdmin ? '/admin/projects' : '/manager/projects');
    const backLabel = returnPath.includes('users') ? 'Back to user projects' : 'Back to projects';

    const [isManagingTeam, setIsManagingTeam] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [embeddedSectionId, setEmbeddedSectionId] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [showReadinessModal, setShowReadinessModal] = useState(false);

    // Sync project data on mount/ID change
    React.useEffect(() => {
        if (projectId) fetchProjects(true);
    }, [projectId, fetchProjects]);
    const [templateAssignees, setTemplateAssignees] = useState({});
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [pendingSignOff, setPendingSignOff] = useState(false);
    const [pendingRemoveSectionId, setPendingRemoveSectionId] = useState(null);

    const [newMemberId, setNewMemberId] = useState("");
    const [newMemberKtRole, setNewMemberKtRole] = useState("Contributor");
    const [newMemberFunctionalRole, setNewMemberFunctionalRole] = useState("");
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [tempDeadline, setTempDeadline] = useState("");
    const [isTriggeringTransition, setIsTriggeringTransition] = useState(false);
    const [transitionType, setTransitionType] = useState("INDIVIDUAL");
    const [selectedInitiatorIds, setSelectedInitiatorIds] = useState([]);
    const [selectedReceiverIds, setSelectedReceiverIds] = useState([]);
    const [isChangingManager, setIsChangingManager] = useState(false);
    const [newManagerId, setNewManagerId] = useState("");

    const [isFullTransitionModalOpen, setIsFullTransitionModalOpen] = useState(false);
    const [ftModalStep, setFtModalStep] = useState(1); // 1: Scope, 2: Receivers
    const [ftScope, setFtScope] = useState('FULL'); 
    const [ftSelectedSections, setFtSelectedSections] = useState([]);
    const [ftReceiverIds, setFtReceiverIds] = useState([]);

    const project = projects.find(p => p.id === projectId);

    const runReadinessAudit = async () => {
        if (!project) return;
        setIsAuditing(true);
        try {
            const sections = project.sections || [];
            const combinedContent = sections.map(s => `Title: ${s.title}\nContent: ${s.content || ''}`).join('\n\n---\n\n');

            // Extraction: Extrapolate updated tech stack from documentation content
            const extractedStack = await AIService.extractTechStack(combinedContent);
            console.log("[Audit] Extracted Tech Stack:", extractedStack);

            // Audit Logic: Readiness Score & Gaps
            const gaps = await AIService.detectKnowledgeGaps(sections);
            const score = await AIService.computeReadinessScore(sections, project.members || []);
            const recommendations = await AIService.recommendTransitionPlan(project, score, gaps);

            const aiInsights = {
                gaps,
                readinessScore: score,
                recommendations,
                lastAudit: new Date().toISOString(),
                auditLog: `Tech stack updated from audit: ${extractedStack.map(t => t.name).join(', ')}`
            };

            // Commit updates: update project insights AND the global tech stack
            await updateProjectAIInsights(projectId, aiInsights);
            
            if (extractedStack && extractedStack.length > 0) {
                await updateProject(projectId, { techStack: extractedStack });
            }

            toast.success('AI Readiness Audit complete! Project details updated.');
            setShowReadinessModal(true);
        } catch (error) {
            console.error("Audit failed", error);
            const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
            toast.error(`Audit failed: ${errorMessage}`);
        } finally {
            setIsAuditing(false);
        }
    };

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <h2 className="text-xl font-semibold tracking-section-title text-slate-900">Project not found</h2>
            <Button onClick={() => navigate('/dashboard')} className="rounded-xl text-sm font-medium tracking-button">Go home</Button>
        </div>
    );

    const isManager = project.managerId === user.id;
    const isAdmin = user.isAdmin;

    // Use persisted progress from database/context
    const overallProgress = project.completion || 0;
    const totalSections = project.sections?.length || 0;
    const understoodSections = project.sections?.filter(s => s.status === 'Understood').length || 0;

    const handleCloseProject = async () => {
        const { completion } = await syncProjectProgress(project.id, project.sections);
        if (completion >= 100) {
            if (project.lifecycleMode === 'TRANSITION') {
                await finalizeTransition(projectId);
                toast.success('Transition finalized! Project is now back in ACTIVE mode.');
            } else {
                await updateProjectStatus(projectId, 'Completed');
                toast.success('Project marked as completed.');
            }
        } else {
            toast.error('Project must be 100% complete to sign off.');
        }
    };

    const getSectionProgress = (section) => {
        const hasText = !!section.content;
        const hasAttachments = (section.attachments || []).length > 0;
        const isReady = section.status === 'Ready for Review' || section.status === 'Understood';

        // If Needs Clarification, isReady becomes false, reducing progress
        return (hasText ? 33 : 0) + (hasAttachments ? 33 : 0) + (isReady ? 34 : 0);
    };

    const getReviewStatusBadge = (status) => {
        switch (status) {
            case 'Understood':
                return <Badge variant="success" className="px-2 text-xs font-medium uppercase tracking-label">Understood</Badge>;
            case 'Ready for Review':
                return <Badge variant="blue" className="px-2 text-xs font-medium uppercase tracking-label">Ready for review</Badge>;
            case 'Needs Clarification':
                return <Badge variant="warning" className="px-2 text-xs font-medium uppercase tracking-label">Needs clarification</Badge>;
            default:
                return <Badge variant="soft" className="px-2 text-xs font-medium uppercase tracking-label">Not reviewed yet</Badge>;
        }
    };

    if (embeddedSectionId) {
        return (
            <div className="relative w-full h-full min-h-screen">
                <Button 
                    variant="outline" 
                    className="absolute top-6 left-6 z-50 shadow-sm"
                    onClick={() => setEmbeddedSectionId(null)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Project Overview
                </Button>
                <div className="pt-20">
                    <HandoverProjectDetails />
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-8 md:px-12 py-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(returnPath)}
                            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all shrink-0 hidden md:flex"
                            title={backLabel}
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 transition-colors leading-none">{project.name}</h1>
                        <div className="flex items-center gap-2">
                            {project.lifecycleMode === 'TRANSITION' && (
                                <Badge variant={project.status === 'In Progress' ? 'blue' : 'soft'} className="h-7 px-3 text-[10px] font-black uppercase tracking-label rounded-lg transition-all">
                                    {project.transitionType}: {project.status || 'In Progress'}
                                </Badge>
                            )}
                            <Badge variant={project.lifecycleMode === 'TRANSITION' ? 'warning' : 'soft'} className="h-7 px-3 text-[10px] font-black uppercase tracking-label rounded-lg flex items-center gap-2 transition-all">
                                <div className={`w-1.5 h-1.5 rounded-full ${project.lifecycleMode === 'TRANSITION' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_8px_rgba(var(--primary),0.5)]'}`} />
                                {project.lifecycleMode}
                            </Badge>
                        </div>
                    </div>
                    {project.description && (
                         <p className="md:pl-[44px] max-w-2xl text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors line-clamp-2" title={project.description}>{project.description}</p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    {(isManager || isAdmin) && project.status !== 'Completed' && project.lifecycleMode === 'ACTIVE' && (
                        <div className="flex gap-2">
                             <Button
                                onClick={() => {
                                    if (isAdmin) {
                                        setFtSelectedSections(project.sections?.map(s => s.id) || []);
                                        setTempDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "");
                                        setIsFullTransitionModalOpen(true);
                                    } else {
                                        setTransitionType('INDIVIDUAL');
                                        setTempDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "");
                                        setIsTriggeringTransition(true);
                                    }
                                }}
                                className={`rounded-lg ${isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-medium tracking-button text-sm h-10 px-6 shadow-sm`}
                            >
                                <Zap className="w-4 h-4 mr-2" /> Start {isAdmin ? 'Full' : 'Individual'} Transition
                            </Button>
                        </div>
                    )}
                     {isManager && project.status !== 'Completed' && project.lifecycleMode === 'TRANSITION' && (
                        <div className="flex gap-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={runReadinessAudit}
                                disabled={isAuditing}
                                className="bg-white dark:bg-slate-900 border-primary/20 text-primary hover:bg-primary/5 rounded-lg font-bold uppercase tracking-widest text-[10px] h-10 px-4 transition-all"
                            >
                                {isAuditing ? (
                                    <>
                                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> Auditing...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="mr-2 h-4 w-4" /> Run AI Audit
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleCloseProject}
                                disabled={overallProgress < 100}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium tracking-button text-sm h-10 px-6 shadow-sm"
                            >
                                Sign off transition
                            </Button>
                        </div>
                    )}
                    {isAdmin && project.status === 'Completed' && (
                        <Button
                            onClick={() => exportProjectToPDF(project)}
                            className="rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-medium tracking-button text-sm h-10 px-6 shadow-sm transition-all"
                        >
                            <FileDown className="w-4 h-4 mr-2" /> Export report
                        </Button>
                    )}
                    {isAdmin && project.lifecycleMode === 'ACTIVE' && project.status !== 'Completed' && (
                    <Button
                        onClick={() => {
                            setTempDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "");
                            setIsChangingManager(true);
                        }}
                        className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium tracking-button text-sm h-10 px-6 shadow-sm mr-2"
                    >
                        <Users className="w-4 h-4 mr-2" /> Change Manager
                    </Button>
                    )}
                </div>
            </div>

            {/* Individual KT Transition Trigger Dialog */}
            <Dialog open={isTriggeringTransition} onOpenChange={(open) => {
                setIsTriggeringTransition(open);
                if (!open) {
                    setSelectedInitiatorIds([]);
                    setSelectedReceiverIds([]);
                    setTempDeadline("");
                }
            }}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl">
                    <div className="h-1.5 w-full bg-orange-500" />
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-bold tracking-tight">Individual KT Initiation</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500">
                            Configure a knowledge transfer session for specific team members.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Select Initiators (Leaving/Moving)</Label>
                            <ScrollArea className="h-[140px] rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                                <div className="space-y-1">
                                    {project.members
                                        .filter(m => m.userId !== project.managerId) // Managers cannot be initiators
                                        .map(m => {
                                            const isSelected = selectedInitiatorIds.includes(m.userId);
                                            return (
                                                <div 
                                                    key={m.userId}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedInitiatorIds(selectedInitiatorIds.filter(id => id !== m.userId));
                                                        else setSelectedInitiatorIds([...selectedInitiatorIds, m.userId]);
                                                    }}
                                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <span className="text-sm font-semibold">{m.name} <span className="text-[10px] font-medium opacity-60 ml-2 italic">{m.functionalRole}</span></span>
                                                    {isSelected && <Check className="w-4 h-4" />}
                                                </div>
                                            );
                                        })}
                                </div>
                            </ScrollArea>
                            {selectedInitiatorIds.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedInitiatorIds.map(id => {
                                        const u = project.members.find(m => m.userId === id);
                                        return <Badge key={id} variant="secondary" className="bg-orange-100 text-orange-700 border-none text-[9px] px-2">{u?.name}</Badge>;
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Select Receivers (Incoming/Learning)</Label>
                            <ScrollArea className="h-[140px] rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                                <div className="space-y-1">
                                    {allUsers
                                        .filter(u => !u.isAdmin && u.id !== project.managerId) // Managers cannot be receivers
                                        .filter(u => !project.members.find(pm => pm.userId === u.id))
                                        .map(u => {
                                            const isSelected = selectedReceiverIds.includes(u.id);
                                            return (
                                                <div 
                                                    key={u.id}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedReceiverIds(selectedReceiverIds.filter(id => id !== u.id));
                                                        else setSelectedReceiverIds([...selectedReceiverIds, u.id]);
                                                    }}
                                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <span className="text-sm font-semibold">{u.name} <span className="text-[10px] font-medium opacity-60 ml-2 italic">{u.role}</span></span>
                                                    {isSelected && <Check className="w-4 h-4" />}
                                                </div>
                                            );
                                        })}
                                </div>
                            </ScrollArea>
                            {selectedReceiverIds.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedReceiverIds.map(id => {
                                        const u = allUsers.find(user => user.id === id);
                                        return <Badge key={id} variant="secondary" className="bg-blue-100 text-blue-700 border-none text-[9px] px-2">{u?.name}</Badge>;
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                             <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Target Transition Deadline</Label>
                             <Input 
                                type="date" 
                                value={tempDeadline}
                                onChange={(e) => setTempDeadline(e.target.value)}
                                className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                             />
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" onClick={() => setIsTriggeringTransition(false)} className="text-xs font-bold uppercase tracking-widest text-slate-500">Cancel</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-600/20 font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-all"
                            disabled={selectedInitiatorIds.length === 0 || selectedReceiverIds.length === 0}
                            onClick={async () => {
                                const success = await triggerTransition(project.id, 'INDIVIDUAL', selectedInitiatorIds, selectedReceiverIds, tempDeadline);
                                if (success) {
                                    setIsTriggeringTransition(false);
                                    toast.success('Transition triggered successfully!');
                                }
                            }}
                        >
                            Trigger KT Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Manager Dialog */}
            <Dialog open={isChangingManager} onOpenChange={setIsChangingManager}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Change Project Manager</DialogTitle>
                        <DialogDescription>
                            Assign a new manager. This will trigger a manager transition where the old manager hands over to the new manager.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="block text-xs font-bold uppercase tracking-label text-slate-500">New Manager</Label>
                            <Select value={newManagerId} onValueChange={setNewManagerId}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><SelectValue placeholder="Select new manager" /></SelectTrigger>
                                <SelectContent>
                                    {allUsers.filter(u => u.role === 'Manager' && u.id !== project.managerId).map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="block text-xs font-bold uppercase tracking-label text-slate-500">Target Handover Deadline</Label>
                            <Input 
                                type="date" 
                                value={tempDeadline}
                                onChange={(e) => setTempDeadline(e.target.value)}
                                className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsChangingManager(false)}>Cancel</Button>
                        <Button 
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={!newManagerId}
                            onClick={async () => {
                                const newManager = allUsers.find(u => u.id === newManagerId);
                                if (!newManager) return;
                                
                                const oldManagerId = project.managerId;
                                const oldManagerName = project.managerName;

                                // 1. Add new manager as Receiver if not already a member
                                if (!project.members.find(m => m.userId === newManager.id)) {
                                    await addMember(project.id, {
                                        userId: newManager.id,
                                        name: newManager.name,
                                        ktRole: 'Receiver',
                                        functionalRole: 'Manager'
                                    });
                                }

                                // 2. Add old manager as Initiator if not already a member
                                if (!project.members.find(m => m.userId === oldManagerId)) {
                                    await addMember(project.id, {
                                        userId: oldManagerId,
                                        name: oldManagerName,
                                        ktRole: 'Initiator',
                                        functionalRole: 'Manager'
                                    });
                                }

                                // 3. Trigger transition using helper
                                const success = await triggerTransition(
                                    project.id, 
                                    'MANAGER', 
                                    [oldManagerId], 
                                    [newManager.id], 
                                    tempDeadline
                                );
                                
                                if (success) {
                                    // Update actual manager ownership
                                    await updateProject(project.id, { 
                                        managerId: newManager.id, 
                                        managerName: newManager.name
                                    });
                                    setIsChangingManager(false);
                                    toast.success('Manager handover initiated!');
                                }
                            }}
                        >
                            Start Handover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
                <div className="xl:col-span-2 space-y-8 flex flex-col">
                    <Card className="shadow-none border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col transition-colors">
                        <CardHeader className="bg-slate-50/10 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-800 p-6">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-slate-100">
                             <FolderKanban className="text-primary w-5 h-5" /> Project Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-start">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 transition-colors border-b border-slate-100 dark:border-slate-800/60">
                            <MetaDataItem label="Manager" value={project.managerName} />
                            <MetaDataItem label="Created On" value={new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} />
                            {project.lifecycleMode === 'TRANSITION' && (
                                <MetaDataItem
                                    label="Deadline"
                                    headerExtra={isManager && project.lifecycleMode === 'ACTIVE' && project.status !== 'Completed' && !isEditingDeadline && (
                                        <button
                                            onClick={() => {
                                                setTempDeadline(project.deadline ? project.deadline.split('T')[0] : "");
                                                setIsEditingDeadline(true);
                                            }}
                                            className="p-0.5 rounded text-slate-300 dark:text-slate-600 hover:text-primary transition-colors flex items-center"
                                            title="Edit Deadline"
                                        >
                                            <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                    )}
                                    value={
                                        isEditingDeadline && isManager ? (
                                            <input
                                                type="date"
                                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md h-7 px-2 font-semibold text-xs outline-none focus:ring-2 focus:ring-primary/10 w-full dark:text-slate-200 transition-colors"
                                                value={tempDeadline}
                                                onChange={(e) => setTempDeadline(e.target.value)}
                                                onBlur={async () => {
                                                    if (tempDeadline !== (project.deadline ? project.deadline.split('T')[0] : "")) {
                                                        await updateProject(project.id, { deadline: tempDeadline });
                                                        
                                                        // Notify all team members
                                                        project.members.forEach(member => {
                                                            if (member.userId !== user.id) {
                                                                pushNotification({
                                                                    user_id: member.userId,
                                                                    module: 'icr',
                                                                    type: 'deadline',
                                                                    title: 'Deadline Updated',
                                                                    body: `The deadline for project "${project.name}" has been updated to ${new Date(tempDeadline).toLocaleDateString()}.`,
                                                                    project_id: project.id,
                                                                    project_name: project.name
                                                                });
                                                            }
                                                        });
                                                    }
                                                    setIsEditingDeadline(false);
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'
                                        )
                                    }
                                />
                            )}
                            <MetaDataItem label="Total Sections" value={project.sections?.length || 0} />
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 transition-colors">
                                     <Users className="text-primary w-5 h-5" /> Team Members
                                </h3>
                                {isManager && project.lifecycleMode === 'ACTIVE' && project.status !== 'Completed' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-lg text-primary dark:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 text-xs font-semibold uppercase tracking-label transition-all"
                                        onClick={() => setIsManagingTeam(!isManagingTeam)}
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-2" /> {isManagingTeam ? 'Confirm changes' : 'Manage team'}
                                    </Button>
                                )}
                            </div>

                            <div className="pt-4">
                                {project.lifecycleMode === 'ACTIVE' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {project.members.map((m, idx) => (
                                            <div key={idx} className="flex items-center gap-3 transition-all">
                                                <Avatar className="w-9 h-9 rounded-full border border-primary/10 dark:border-primary/20 shadow-sm transition-colors shrink-0">
                                                    <AvatarImage src={getAvatarUrl(m.avatar_url || m.name, themeColor)} alt={m.name} />
                                                    <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-xs uppercase">
                                                        {m.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors leading-tight">{m.name}</p>
                                                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 transition-all leading-none italic">
                                                        {m.functionalRole || 'Member'}
                                                    </p>
                                                </div>
                                                {isManagingTeam && isManager && m.userId !== project.managerId && (
                                                    <button
                                                        onClick={() => removeMember(project.id, m.userId)}
                                                        className="ml-auto p-1.5 rounded-lg text-slate-200 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    >
                                                         <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {project.members.length === 0 && (
                                            <div className="md:col-span-3 py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                                                <Users className="w-6 h-6 text-slate-200 dark:text-slate-800" />
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-label italic text-center">No team members assigned yet</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                        {['Initiator', 'Contributor', 'Receiver'].map(ktRole => {
                                            const members = project.members.filter(m => m.ktRole === ktRole);
                                            return (
                                                <div key={ktRole} className="space-y-4">
                                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 capitalize tracking-tight leading-none">{ktRole}s</h4>
                                                        <Badge variant="secondary" className="h-4 px-2 text-[9px] font-semibold bg-slate-50 dark:bg-slate-900 border-none">{members.length}</Badge>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        {members.map((m, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 py-1 transition-all">
                                                                <Avatar className="w-8 h-8 rounded-full border border-primary/10 dark:border-primary/20 shadow-sm transition-colors shrink-0">
                                                                    <AvatarImage src={getAvatarUrl(m.avatar_url || m.name, themeColor)} alt={m.name} />
                                                                    <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-[10px] uppercase">
                                                                        {m.name.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 transition-colors leading-tight">{m.name}</p>
                                                                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 transition-all leading-none italic">
                                                                        {m.functionalRole || 'Member'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {members.length === 0 && (
                                                            <div className="py-8 px-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                                                                <Users className="w-5 h-5 text-slate-200 dark:text-slate-800" />
                                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-label italic text-center">No {ktRole}s</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {isManagingTeam && isManager && (
                                <div className="mt-6 p-6 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-5 animate-in slide-in-from-top-2 duration-300 transition-colors">
                                    <p className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 transition-colors">Add new stakeholder</p>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <select
                                                className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 dark:text-slate-200 transition-all"
                                                value={newMemberId}
                                                onChange={(e) => {
                                                    const uid = e.target.value;
                                                    setNewMemberId(uid);
                                                    const user = allUsers.find(u => u.id === uid);
                                                    setNewMemberFunctionalRole(user?.role || "");
                                                }}
                                            >
                                                <option value="">Select a user...</option>
                                                {allUsers
                                                    .filter(u => !u.isAdmin && u.role !== 'System Admin')
                                                    .filter(u => !project.members.find(m => m.userId === u.id))
                                                    .map(u => (
                                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                                    ))}
                                            </select>
                                        </div>
                                        {/* In ACTIVE phase, we don't show the KT role selector as per requirements */}
                                        {project.lifecycleMode !== 'ACTIVE' && (
                                            <div className="w-full md:w-48 transition-all">
                                                <select
                                                    className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 dark:text-slate-200"
                                                    value={newMemberKtRole}
                                                    onChange={(e) => setNewMemberKtRole(e.target.value)}
                                                >
                                                    {['Contributor', 'Initiator', 'Receiver']
                                                        .filter(role => {
                                                            const isManagerRole = newMemberFunctionalRole === 'Manager';
                                                            if (isManagerRole) return role === 'Contributor';
                                                            return true;
                                                        })
                                                        .map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        )}
                                        <Button
                                            disabled={!newMemberId}
                                            onClick={() => {
                                                const selectedUser = allUsers.find(u => u.id === newMemberId);
                                                if (selectedUser) {
                                                    if (newMemberKtRole === 'Initiator' && project.members.filter(m => m.ktRole === 'Initiator').length >= 2) {
                                                        toast.error('Maximum of 2 Initiators allowed.');
                                                        return;
                                                    }
                                                    addMember(project.id, {
                                                        userId: selectedUser.id,
                                                        name: selectedUser.name,
                                                        ktRole: project.lifecycleMode === 'ACTIVE' ? 'Contributor' : newMemberKtRole,
                                                        functionalRole: selectedUser.role
                                                    });
                                                    setNewMemberId("");
                                                    setNewMemberKtRole("Contributor");
                                                }
                                            }}
                                            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 font-medium h-9 text-sm tracking-button"
                                        >
                                            Add to team
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {(() => {
                    const techStackSection = project.sections?.find(s => (s.title || '').toLowerCase().includes('tech stack') || (s.title || '').toLowerCase().includes('technology'));
                    if (!techStackSection) return null;

                    return (
                        <Card className="shadow-xl border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col transition-colors">
                            <CardHeader className="bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 p-6 pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-slate-100">
                                    <Code2 className="text-primary w-5 h-5" /> Tech Stack Documentation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="prose dark:prose-invert text-sm max-w-none line-clamp-6 text-slate-600 dark:text-slate-300">
                                    {techStackSection.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: techStackSection.content.replace(/##+/g, '').slice(0, 300) + '...' }} />
                                    ) : (
                                        <p className="text-slate-500 italic">No technology stack documentation entered yet.</p>
                                    )}
                                </div>
                                {techStackSection.content && (
                                    <Button
                                        variant="ghost" 
                                        size="sm"
                                        className="mt-4 text-xs font-semibold text-primary px-0 hover:bg-transparent hover:text-primary/80"
                                        onClick={() => setEmbeddedSectionId(techStackSection.id)}
                                    >
                                        View Full Documentation <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })()}
            </div>

            {/* Sidebar / Metadata */}
            <div className="xl:col-span-1 flex flex-col gap-8 h-full">
                <Card className="border border-slate-200 dark:border-slate-800 shadow-none rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col flex-1 min-h-0">
                    <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-primary" /> Lifecycle Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 overflow-y-auto">
                        <TransitionHistoryTimeline projectId={projectId} />
                    </CardContent>
                </Card>
                <TechStackCard stack={project.techStack} className="flex flex-col flex-1 min-h-0 shadow-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
            </div>
        </div>

            {/* Main Project Sections Table */}
            <Card className="shadow-xl border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
                    <div className="flex items-center gap-6 flex-1 w-full sm:w-auto">
                        <div className="space-y-1 shrink-0">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-slate-100">
                                <ScrollText className="text-primary w-5 h-5" /> Project Sections ({project.sections?.length || 0})
                            </CardTitle>
                            <CardDescription className="text-xs font-medium dark:text-slate-400 leading-none">Knowledge documentation status.</CardDescription>
                        </div>
                        
                        <div className="hidden sm:block h-10 w-px bg-slate-200 dark:border-slate-700 mx-2" />

                        <div className="flex-1 max-w-xs space-y-2">
                             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-label text-slate-400 dark:text-slate-500">
                                <span>Overall Progress</span>
                                <span className="text-slate-900 dark:text-slate-100 transition-colors">{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-1.5 transition-colors" />
                        </div>
                    </div>

                    {isManager && project.lifecycleMode === 'ACTIVE' && project.status !== 'Completed' && (
                        <Button
                            onClick={() => setIsAddingSection(!isAddingSection)}
                            variant={isAddingSection ? "outline" : "default"}
                            className={`rounded-lg h-9 px-4 text-sm font-medium tracking-button shadow-sm transition-all shrink-0 ${isAddingSection ? 'text-slate-500 dark:text-slate-400 dark:border-slate-700' : 'bg-primary text-white hover:bg-primary/90'}`}
                        >
                            {isAddingSection ? <X className="w-3.5 h-3.5 mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
                            {isAddingSection ? 'Cancel' : 'Add section'}
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {isAddingSection && isManager && (
                        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 transition-colors">
                            <h4 className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 mb-6">Available section templates</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {templates.filter(t => !project.sections.find(s => s.title === t.title)).map(t => (
                                    <Card key={t.id} className="p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-md transition-all group flex flex-col gap-6 bg-white dark:bg-slate-900/50">
                                        <div className="flex items-start gap-4">
                                            <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-primary/5 dark:group-hover:bg-primary/20 group-hover:text-primary dark:group-hover:text-primary transition-colors border border-slate-100 dark:border-slate-700">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base mt-1.5 transition-colors">{t.title}</h4>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Primary assignee</label>
                                                <select
                                                    className="w-full h-8 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-md px-2 outline-none focus:ring-2 focus:ring-primary/10 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 transition-all"
                                                    value={templateAssignees[t.id] || ""}
                                                    onChange={(e) => setTemplateAssignees(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                >
                                                    <option value="">Select Member...</option>
                                                    {project.members.filter(m => m.ktRole !== 'Receiver').map(m => (
                                                        <option key={m.userId} value={m.userId}>{m.name} ({m.functionalRole})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    if (!templateAssignees[t.id]) {
                                                        toast.error('Please select a member to assign.');
                                                        return;
                                                    }
                                                    addSection(project.id, { id: t.id, title: t.title, description: t.description, contributorId: templateAssignees[t.id] });
                                                    setIsAddingSection(false);
                                                    setTemplateAssignees({});
                                                    toast.success(`Section "${t.title}" added.`);
                                                }}
                                                className="w-full rounded-md bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-medium text-xs h-8 tracking-button transition-all"
                                                disabled={!templateAssignees[t.id]}
                                            >
                                                Insert section
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Section Detail</th>
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Assigned Person</th>
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors text-center">Health Indicator</th>
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors text-center">Review Status</th>
                                    {isManager && project.lifecycleMode === 'ACTIVE' && <th className="p-4 w-24"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {project.sections.map((section, idx) => {
                                    const progress = getSectionProgress(section);
                                    const contributor = project.members.find(m => m.userId === section.contributorId);
                                    const hasText = !!section.content;
                                    const hasAttachments = (section.attachments || []).length > 0;
                                    const isReady = section.status === 'Ready for Review' || section.status === 'Understood';

                                    return (
                                        <tr key={section.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="p-4 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-base font-semibold tracking-normal text-slate-900 dark:text-slate-100 transition-colors cursor-pointer group-hover:text-primary dark:group-hover:text-primary`} onClick={() => {
                                                        setEmbeddedSectionId(section.id);
                                                    }}>{section.title}</span>
                                                    <span className="text-xs text-muted-foreground dark:text-slate-500 font-medium transition-colors">Step {idx + 1} of {project.sections.length}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {editingSectionId === section.id ? (
                                                        <select
                                                            className="h-8 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 text-xs font-medium outline-none focus:ring-1 focus:ring-primary/30 dark:text-slate-200 transition-all"
                                                            value={section.contributorId || ""}
                                                            onChange={async (e) => {
                                                                const newId = e.target.value;
                                                                await updateSection(projectId, section.id, { contributorId: newId });
                                                                setEditingSectionId(null);
                                                                toast.success('Assignee updated.');
                                                            }}
                                                            onBlur={() => setEditingSectionId(null)}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Member...</option>
                                                            {project.members.filter(m => m.ktRole !== 'Receiver').map(m => (
                                                                <option key={m.userId} value={m.userId}>{m.name} ({m.ktRole})</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <>
                                                            <Avatar className="w-8 h-8 rounded-full border border-primary/10 dark:border-primary/20 shadow-sm transition-colors shrink-0">
                                                                <AvatarImage src={getAvatarUrl(contributor?.avatar_url || contributor?.name, themeColor)} alt={contributor?.name} />
                                                                <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-[10px] uppercase">
                                                                    {contributor?.name.charAt(0) || '?'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{contributor?.name || 'Unassigned'}</span>
                                                                {isManager && project.lifecycleMode === 'ACTIVE' && (!hasText && (section.attachments || []).length === 0) ? (
                                                                    <button 
                                                                        onClick={() => setEditingSectionId(section.id)}
                                                                        className="p-1 rounded bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                                                                        title="Change Assignee"
                                                                    >
                                                                        <Pencil className="w-2.5 h-2.5" />
                                                                    </button>
                                                                ) : isManager && (
                                                                    <Lock className="w-2.5 h-2.5 text-slate-200 dark:text-slate-800" title={project.lifecycleMode === 'TRANSITION' ? "Cannot edit during transition" : "Cannot change assignee of started sections"} />
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    {!hasText ? (
                                                        <Badge variant="soft" className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> Missing Content
                                                        </Badge>
                                                    ) : progress < 70 ? (
                                                        <Badge variant="soft" className="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800 flex items-center gap-1">
                                                            <Timer className="w-3 h-3" /> Stale / Incomplete
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="soft" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Fresh / Ready
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    {getReviewStatusBadge(section.status)}
                                                </div>
                                            </td>
                                            {isManager && (
                                                <td className="p-4 text-right">
                                                    {(!hasText && (section.attachments || []).length === 0) ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to delete "${section.title}"?`)) {
                                                                    removeSection(projectId, section.id);
                                                                    toast.success('Section removed.');
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    ) : (
                                                        <div className="w-8 h-8 flex items-center justify-center" title="Cannot delete sections with content">
                                                            <Lock className="w-3 h-3 text-slate-200 dark:text-slate-800" />
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {project.sections.length === 0 && (
                            <div className="py-24 text-center flex flex-col items-center gap-4 transition-colors">
                                <FileText className="w-12 h-12 text-slate-100 dark:text-slate-900" />
                                <p className="text-base font-semibold text-muted-foreground dark:text-slate-500 transition-colors">No project sections defined yet.</p>
                                {isManager && project.lifecycleMode === 'ACTIVE' && <Button onClick={() => setIsAddingSection(true)} variant="outline" className="rounded-lg h-9 font-semibold text-sm border border-slate-200 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">Start Project</Button>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Full Transition Modal (Admin only) */}
            <Dialog open={isFullTransitionModalOpen} onOpenChange={(open) => {
                setIsFullTransitionModalOpen(open);
                if (!open) {
                    setFtModalStep(1);
                    setFtScope('FULL');
                    setFtSelectedSections(project.sections?.map(s => s.id) || []);
                    setFtReceiverIds([]);
                    setTempDeadline("");
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {ftModalStep === 1 && "Start Transition - Select Scope"}
                            {ftModalStep === 2 && "Start Transition - Select Receivers"}
                        </DialogTitle>
                        <DialogDescription>
                            {ftModalStep === 1 && "Decide if you want to transition all sections or only specific ones."}
                            {ftModalStep === 2 && "Select one or more team members who will participate as receivers."}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {ftModalStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="flex gap-4">
                                    <div 
                                        onClick={() => setFtScope('FULL')}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${ftScope === 'FULL' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                    >
                                        <Layers className={`w-6 h-6 ${ftScope === 'FULL' ? 'text-primary' : 'text-slate-400'}`} />
                                        <span className={`text-xs font-bold uppercase tracking-widest ${ftScope === 'FULL' ? 'text-primary' : 'text-slate-500'}`}>Full Project</span>
                                    </div>
                                    <div 
                                        onClick={() => setFtScope('PARTIAL')}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${ftScope === 'PARTIAL' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                    >
                                        <RefreshCw className={`w-6 h-6 ${ftScope === 'PARTIAL' ? 'text-orange-500' : 'text-slate-400'}`} />
                                        <span className={`text-xs font-bold uppercase tracking-widest ${ftScope === 'PARTIAL' ? 'text-orange-500' : 'text-slate-500'}`}>Partial</span>
                                    </div>
                                </div>

                                {ftScope === 'PARTIAL' && (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Select Sections to Include</Label>
                                        <ScrollArea className="h-[200px] rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                                            <div className="space-y-3">
                                                {project.sections?.map(section => (
                                                    <div key={section.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                        <Checkbox 
                                                            id={section.id} 
                                                            checked={ftSelectedSections.includes(section.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) setFtSelectedSections([...ftSelectedSections, section.id]);
                                                                else setFtSelectedSections(ftSelectedSections.filter(id => id !== section.id));
                                                            }}
                                                        />
                                                        <label htmlFor={section.id} className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                                                            {section.title}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                        )}

                        {ftModalStep === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Select Incoming Receivers (One or More)</Label>
                                <ScrollArea className="h-[250px] rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                                    <div className="grid grid-cols-1 gap-1">
                                        {allUsers.filter(u => !u.isAdmin && !project.members.find(pm => pm.userId === u.id)).map(u => {
                                            const isSelected = ftReceiverIds.includes(u.id);
                                            return (
                                                <div 
                                                    key={u.id} 
                                                    onClick={() => {
                                                        if (isSelected) setFtReceiverIds(ftReceiverIds.filter(id => id !== u.id));
                                                        else setFtReceiverIds([...ftReceiverIds, u.id]);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'}`}
                                                >
                                                    <Avatar className="w-8 h-8 rounded-full shrink-0">
                                                        <AvatarImage src={getAvatarUrl(u.name, themeColor)} alt={u.name} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{u.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{u.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{u.role} • {u.functionalRole || 'Member'}</p>
                                                    </div>
                                                    {isSelected && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white"><Check size={12} /></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                                {ftReceiverIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {ftReceiverIds.map(id => {
                                            const u = allUsers.find(user => user.id === id);
                                            return <Badge key={id} variant="secondary" className="bg-primary/10 text-primary border-none px-2 py-0.5 rounded-full text-[10px]">{u?.name}</Badge>;
                                        })}
                                    </div>
                                )}
                                
                                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Final Transition Deadline</Label>
                                    <Input 
                                        type="date" 
                                        value={tempDeadline}
                                        onChange={(e) => setTempDeadline(e.target.value)}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-50 dark:border-slate-800 pt-4">
                        <div className="flex justify-between w-full">
                            <Button variant="ghost" onClick={() => {
                                if (ftModalStep === 1) setIsFullTransitionModalOpen(false);
                                else setFtModalStep(ftModalStep - 1);
                            }} className="rounded-xl h-10 px-4 font-semibold text-slate-500">
                                {ftModalStep === 1 ? 'Cancel' : <><ChevronLeft className="mr-2 w-4 h-4" /> Back</>}
                            </Button>
                            
                             <Button 
                                className={`h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg transition-all ${ftModalStep === 2 ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                                disabled={(ftModalStep === 1 && ftScope === 'PARTIAL' && ftSelectedSections.length === 0) || (ftModalStep === 2 && ftReceiverIds.length === 0)}
                                onClick={async () => {
                                    if (ftModalStep < 2) setFtModalStep(ftModalStep + 1);
                                    else {
                                        // Note: Logic adaptation - transitionType = ftScope ('FULL'/'PARTIAL'), initiatorId = null (admin trigger)
                                        const success = await triggerTransition(project.id, ftScope, null, ftReceiverIds, tempDeadline);
                                        if (success) {
                                            toast.success(`${ftScope === 'FULL' ? 'Full' : 'Partial'} transition started successfully`);
                                            setIsFullTransitionModalOpen(false);
                                        } else {
                                            toast.error('Failed to start transition');
                                        }
                                    }
                                }}
                            >
                                {ftModalStep === 2 ? 'Start Transition' : <>Next <ArrowRight className="ml-2 w-3.5 h-3.5" /></>}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Professional AI Transition Readiness Report */}
            <Dialog open={showReadinessModal} onOpenChange={setShowReadinessModal}>
                <DialogContent className="sm:max-w-[700px] h-[85vh] overflow-hidden flex flex-col p-0 border-none bg-white dark:bg-slate-950 shadow-2xl rounded-3xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                    
                    <DialogHeader className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10 shrink-0">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        KT Readiness Audit
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    AI-Driven Transition Analysis • {project?.aiInsights?.lastAudit ? new Date(project.aiInsights.lastAudit).toLocaleTimeString() : 'Current Project State'}
                                </DialogDescription>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${project?.aiInsights?.readinessScore >= 80 ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'border-primary bg-primary/5 text-primary'}`}>
                                    <span className="text-xl font-bold tracking-tighter">{project?.aiInsights?.readinessScore || '--'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                            </div>
                        </div>
                    </DialogHeader>
 
                    <div className="flex-1 overflow-y-auto px-8 py-6 relative z-10 scrollbar-hide">
                        <div className="space-y-8 pb-4">
                            {/* Key Performance Indicators */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Doc Quality</p>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Optimized</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Team Sync</p>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Active engagement</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ready for Review</div>
                                </div>
                            </div>
 
                            {/* Critical Knowledge Gaps */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Knowledge Gaps ({project?.aiInsights?.gaps?.length || 0})</Label>
                                <div className="space-y-2">
                                    {project?.aiInsights?.gaps?.map((gap, i) => (
                                        <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-3">
                                            <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/10 text-amber-500 shrink-0">
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{gap.title || "Foundational Gap"}</h5>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{gap.message || gap}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!project?.aiInsights?.gaps || project.aiInsights.gaps.length === 0) && (
                                        <div className="p-8 text-center border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                                            <p className="text-xs font-medium text-slate-400 mt-2">No critical knowledge gaps detected.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
 
                            {/* Transition Strategy */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Transition Strategy & Focus</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-indigo-500" />
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Priority Focus Areas</p>
                                        </div>
                                        <div className="space-y-2">
                                            {project?.aiInsights?.recommendations?.focusAreas?.map((area, i) => (
                                                <div key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                                    {area}
                                                </div>
                                            ))}
                                            {(!project?.aiInsights?.recommendations?.focusAreas || project.aiInsights.recommendations.focusAreas.length === 0) && (
                                                <p className="text-[10px] opacity-50 italic">Analysis required.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-primary/5 dark:bg-primary/5 border border-primary/10 dark:border-primary/10 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="w-4 h-4 text-primary" />
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Required Clarifications</p>
                                        </div>
                                        <div className="space-y-2">
                                            {project?.aiInsights?.recommendations?.clarificationsNeeded?.map((item, i) => (
                                                <div key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                                                    {item}
                                                </div>
                                            ))}
                                            {(!project?.aiInsights?.recommendations?.clarificationsNeeded || project.aiInsights.recommendations.clarificationsNeeded.length === 0) && (
                                                <p className="text-[10px] opacity-50 italic">No specific clarifications flagged.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
 
                    <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                        <Button 
                            onClick={() => setShowReadinessModal(false)} 
                            className="w-full rounded-xl font-bold text-sm h-11 bg-primary text-white hover:bg-primary/90 shadow-sm"
                        >
                            Acknowledge Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function MetaDataItem({ label, value, headerExtra }) {
    return (
        <div className="flex flex-col gap-1.5 transition-all">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">{label}</span>
                {headerExtra}
            </div>
            <div className="flex items-center min-h-[1.25rem]">
                {typeof value === 'object' ? (
                    value
                ) : (
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors truncate">{value}</span>
                )}
            </div>
        </div>
    );
}

function Indicator({ icon, active, label }) {
    return (
        <div className={`flex items-center gap-2 group/tip relative ${active ? 'text-primary' : 'text-slate-300 dark:text-slate-700'} transition-colors`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${active ? 'border-primary/20 dark:border-primary/40 bg-primary/5 dark:bg-primary/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'}`}>
                {icon}
            </div>
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold py-2 px-4 rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {label}: <span className={active ? 'text-emerald-400' : 'text-slate-400'}>{active ? 'ACTIVE' : 'PENDING'}</span>
            </span>
        </div>
    );
}
