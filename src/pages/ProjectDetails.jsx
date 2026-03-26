import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';
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
    FileDown
} from 'lucide-react';
import { exportProjectToPDF } from '../lib/pdfExport';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/utils';
import { toast } from 'sonner';

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
        updateProject
    } = useProjects();
    const { users: allUsers, templates, settings } = useAdmin();
    const themeColor = settings?.theme_color?.replace('#', '') || localStorage.getItem('a_theme_color')?.replace('#', '') || '7c3aed';
    const location = useLocation();
    const navigate = useNavigate();

    // Dynamic back path based on where we came from
    const returnPath = location.state?.from || (user?.isAdmin ? '/admin/projects' : '/manager/projects');
    const backLabel = returnPath.includes('users') ? 'Back to user projects' : 'Back to projects';

    const [isManagingTeam, setIsManagingTeam] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState(false);

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

    const project = projects.find(p => p.id === projectId);

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

    const handleCloseProject = () => {
        if (pendingSignOff) {
            updateProjectStatus(projectId, 'Completed');
            setPendingSignOff(false);
            toast.success('Project signed off and archived.');
        } else {
            setPendingSignOff(true);
            toast.warning('Click "Sign Off" again to confirm. This will archive the project as read-only.', { duration: 4000 });
            setTimeout(() => setPendingSignOff(false), 4000);
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

    return (
        <div className="px-4 sm:px-8 md:px-12 py-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                        <Badge variant={(project.status === 'Completed' || project.status === 'Signed Off') ? 'success' : project.status === 'In Progress' ? 'blue' : 'soft'} className="h-6 px-3 text-xs font-semibold rounded-full normal-case dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                             {project.status === 'Completed' || project.status === 'Signed Off' ? 'Signed Off' : (project.status || 'Active')}
                        </Badge>
                    </div>
                    {project.description && (
                         <p className="md:pl-[44px] max-w-2xl text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors line-clamp-2" title={project.description}>{project.description}</p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    {isManager && project.status !== 'Completed' && (
                        <Button
                            onClick={handleCloseProject}
                            disabled={overallProgress < 100}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium tracking-button text-sm h-10 px-6 shadow-sm"
                        >
                            Sign off
                        </Button>
                    )}
                    {isAdmin && project.status === 'Completed' && (
                        <Button
                            onClick={() => exportProjectToPDF(project)}
                            className="rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-medium tracking-button text-sm h-10 px-6 shadow-sm transition-all"
                        >
                            <FileDown className="w-4 h-4 mr-2" /> Export report
                        </Button>
                    )}
                </div>
            </div>

            {/* Top Project Summary Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2 shadow-xl border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm h-full flex flex-col transition-colors">
                    <CardHeader className="bg-slate-50/10 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 p-6">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-slate-100">
                             <FolderKanban className="text-primary w-5 h-5" /> Project Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 transition-colors border-b border-slate-100 dark:border-slate-800/60">
                            <MetaDataItem label="Manager" value={project.managerName} />
                            <MetaDataItem
                                label="Deadline"
                                headerExtra={isManager && project.status !== 'Completed' && !isEditingDeadline && (
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
                            <MetaDataItem label="Created On" value={new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} />
                            <MetaDataItem label="Total Sections" value={project.sections?.length || 0} />
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 transition-colors">
                                     <Users className="text-primary w-5 h-5" /> Team Members
                                </h3>
                                {isManager && project.status !== 'Completed' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-lg text-primary dark:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 text-xs font-semibold uppercase tracking-widest transition-all"
                                        onClick={() => setIsManagingTeam(!isManagingTeam)}
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-2" /> {isManagingTeam ? 'Confirm changes' : 'Manage team'}
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
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
                                                    <div key={idx} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:shadow-sm">
                                                        <Avatar className="w-8 h-8 rounded-full border border-primary/10 dark:border-primary/20 shadow-sm transition-colors shrink-0">
                                                            <AvatarImage src={getAvatarUrl(m.avatar_url || m.name, themeColor)} alt={m.name} />
                                                            <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-[10px] uppercase">
                                                                {m.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 transition-colors leading-tight">{m.name}</p>
                                                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 transition-all !normal-case leading-none italic">
                                                                {m.functionalRole || 'Member'}
                                                            </p>
                                                        </div>
                                                        {isManagingTeam && isManager && (
                                                            <button
                                                                onClick={() => removeMember(project.id, m.id)}
                                                                className="ml-auto p-1.5 rounded-lg text-slate-200 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                            >
                                                                 <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {members.length === 0 && (
                                                    <div className="py-8 px-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                                                        <Users className="w-5 h-5 text-slate-200 dark:text-slate-800" />
                                                        <p className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest italic text-center">No {ktRole}s assigned yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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
                                        <div className="w-full md:w-48">
                                            <select
                                                className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 dark:text-slate-200 transition-all"
                                                value={newMemberKtRole}
                                                onChange={(e) => setNewMemberKtRole(e.target.value)}
                                            >
                                                {['Contributor', 'Initiator', 'Receiver']
                                                    .filter(role => !(newMemberFunctionalRole === 'Manager' && role === 'Receiver'))
                                                    .map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
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
                                                        ktRole: newMemberKtRole,
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

                {/* Progress / Readiness Card */}
                <Card className="shadow-xl border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden relative h-full flex flex-col transition-colors">
                    <CardHeader className="bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 p-6 pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-slate-100">
                                <ShieldCheck className="text-primary w-5 h-5" /> Readiness
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-8 flex-1">
                        <div className="relative w-44 h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                <circle cx="88" cy="88" r="76" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="12" fill="transparent" />
                                <circle
                                    cx="88" cy="88" r="76"
                                    stroke="currentColor" strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={477}
                                    strokeDashoffset={477 - (477 * overallProgress) / 100}
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-semibold tracking-tighter text-slate-900 dark:text-slate-100 transition-colors">{overallProgress}</span>
                                    <span className="text-lg font-semibold text-slate-400 dark:text-slate-500 ml-0.5">%</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-1 transition-colors">Ready</span>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Validated sections</p>
                                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100 transition-colors">{understoodSections} / {totalSections} Finalized</p>
                                </div>
                                <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg transition-colors">
                                    <Zap className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <Progress value={overallProgress} className="h-2 bg-slate-100 dark:bg-slate-800 transition-colors" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Project Sections Table */}
            <Card className="shadow-xl border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-slate-100">
                            <ScrollText className="text-primary w-5 h-5" /> Project Sections ({project.sections?.length || 0})
                        </CardTitle>
                        <CardDescription className="text-xs font-medium dark:text-slate-400">Detailed tracking of knowledge documentation status.</CardDescription>
                    </div>
                    {isManager && project.status !== 'Completed' && (
                        <Button
                            onClick={() => setIsAddingSection(!isAddingSection)}
                            variant={isAddingSection ? "outline" : "default"}
                            className={`rounded-lg h-9 px-4 text-sm font-medium tracking-button shadow-sm transition-all ${isAddingSection ? 'text-slate-500 dark:text-slate-400 dark:border-slate-700' : 'bg-primary text-white hover:bg-primary/90'}`}
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
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Section title</th>
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Resource assigned</th>
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Workflow progress</th>
                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors">Review status</th>
                                    {isManager && <th className="p-4 w-16"></th>}
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
                                                    <span className={`text-base font-semibold tracking-normal text-slate-900 dark:text-slate-100 transition-colors ${isAdmin ? 'cursor-default' : 'group-hover:text-primary dark:group-hover:text-primary cursor-pointer'}`} onClick={() => {
                                                        if (isAdmin) return;
                                                        const isSectionContributor = section.contributorId === user.id;
                                                        navigate(isSectionContributor ? `/icr/handovers/${projectId}` : `/icr/onboardings/${projectId}`);
                                                    }}>{section.title}</span>
                                                    <span className="text-xs text-muted-foreground dark:text-slate-500 font-medium transition-colors">Step {idx + 1} of {project.sections.length}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {editingSectionId === section.id && isManager ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            className="h-8 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-md px-2 outline-none focus:ring-2 focus:ring-primary/10 bg-white dark:bg-slate-900 dark:text-slate-200 w-48 transition-all"
                                                            value={section.contributorId}
                                                            onChange={(e) => {
                                                                updateSection(project.id, section.id, { contributorId: e.target.value });
                                                                setEditingSectionId(null);
                                                            }}
                                                            onBlur={() => setEditingSectionId(null)}
                                                            autoFocus
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {project.members.filter(m => m.ktRole !== 'Receiver').map(m => (
                                                                <option key={m.userId} value={m.userId}>{m.name} ({m.functionalRole})</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={() => setEditingSectionId(null)} className="text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors p-1">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="w-8 h-8 rounded-full border border-primary/10 dark:border-primary/20 shadow-sm transition-colors shrink-0">
                                                            <AvatarImage src={getAvatarUrl(contributor?.avatar_url || contributor?.name, themeColor)} alt={contributor?.name} />
                                                            <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-[10px] uppercase">
                                                                {contributor?.name.charAt(0) || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none transition-colors">{contributor?.name || 'Unassigned'}</p>
                                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 !normal-case transition-colors italic">{contributor?.functionalRole || 'Member'}</span>
                                                            </div>
                                                        </div>
                                                        {isManager && project.status !== 'Completed' && progress === 0 && (
                                                            <button
                                                                className="ml-2 p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-primary dark:hover:text-primary transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 shadow-sm"
                                                                onClick={() => setEditingSectionId(section.id)}
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-6">
                                                        <Indicator icon={<FileText className="w-3.5 h-3.5" />} active={hasText} label="Text" />
                                                        <Indicator icon={<Paperclip className="w-3.5 h-3.5" />} active={hasAttachments} label="Files" />
                                                        <Indicator icon={<CheckCircle2 className="w-3.5 h-3.5" />} active={isReady} label="Submitted" />
                                                    </div>
                                                    <div className="flex items-center gap-4 transition-colors">
                                                        <div className="flex-1 w-28 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden transition-colors">
                                                            <div
                                                                className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-primary/70'}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-[30px] transition-colors">{progress}%</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getReviewStatusBadge(section.status)}
                                            </td>
                                            {isManager && (
                                                <td className="p-4 text-right">
                                                    {progress === 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`w-8 h-8 rounded-md transition-all ${pendingRemoveSectionId === section.id
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                                : 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-slate-400 dark:text-slate-600'
                                                                }`}
                                                            onClick={() => {
                                                                if (pendingRemoveSectionId === section.id) {
                                                                    removeSection(project.id, section.id);
                                                                    setPendingRemoveSectionId(null);
                                                                    toast.success('Section removed.');
                                                                } else {
                                                                    setPendingRemoveSectionId(section.id);
                                                                    toast.warning('Click again to confirm section removal.', { duration: 3000 });
                                                                    setTimeout(() => setPendingRemoveSectionId(prev => prev === section.id ? null : prev), 3000);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
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
                                {isManager && <Button onClick={() => setIsAddingSection(true)} variant="outline" className="rounded-lg h-9 font-semibold text-sm border border-slate-200 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">Start Project</Button>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MetaDataItem({ label, value, headerExtra }) {
    const isEditing = !!headerExtra && typeof value !== 'string'; 

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 h-3">
                <span className="text-xs font-semibold capitalize tracking-tight text-slate-400 dark:text-slate-500 leading-none transition-colors">{label}</span>
                {headerExtra}
            </div>
            <div className={`flex items-center transition-all ${isEditing ? 'p-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 shadow-inner' : 'p-0 h-4'}`}>
                {typeof value === 'object' ? (
                    value
                ) : (
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-[13px] leading-none whitespace-nowrap transition-colors">{value}</p>
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
