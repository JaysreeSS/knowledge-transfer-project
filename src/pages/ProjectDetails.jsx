import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
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
import { toast } from 'sonner';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const {
        projects,
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
    const { users: allUsers, templates } = useAdmin();
    const navigate = useNavigate();

    const [isManagingTeam, setIsManagingTeam] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState(false);
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
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Project Not Found</h2>
            <Button onClick={() => navigate('/dashboard')} className="rounded-xl text-sm">Go Home</Button>
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
                return <Badge variant="success" className="px-2.5">Understood</Badge>;
            case 'Ready for Review':
                return <Badge variant="blue" className="px-2.5">Ready for Review</Badge>;
            case 'Needs Clarification':
                return <Badge variant="warning" className="px-2.5">Needs Clarification</Badge>;
            default:
                return <Badge variant="soft" className="px-2.5">Not Reviewed Yet</Badge>;
        }
    };

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(isAdmin ? '/admin/projects' : '/manager/projects')}
                        className="w-fit h-7 px-0 text-slate-500 hover:text-primary hover:bg-transparent font-medium text-xs transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">Project Overview</h1>
                </div>

                <div className="flex items-center gap-3">
                    {isManager && project.status !== 'Completed' && (
                        <Button
                            onClick={handleCloseProject}
                            disabled={overallProgress < 100}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest h-9 px-5 shadow-sm"
                        >
                            Signed Off
                        </Button>
                    )}
                    {isAdmin && project.status === 'Completed' && (
                        <Button
                            onClick={() => exportProjectToPDF(project)}
                            className="rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest h-9 px-5 shadow-sm"
                        >
                            <FileDown className="w-4 h-4 mr-2" /> Export Report
                        </Button>
                    )}
                    <Badge variant={(project.status === 'Completed' || project.status === 'Signed Off') ? 'success' : project.status === 'In Progress' ? 'blue' : 'soft'} className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest">
                        {project.status === 'Completed' || project.status === 'Signed Off' ? 'Signed Off' : (project.status || 'Active')}
                    </Badge>
                </div>
            </div>

            {/* Top Project Summary Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2 shadow-sm border border-slate-200 rounded-xl overflow-hidden bg-white h-full flex flex-col">
                    <CardHeader className="p-6 pb-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/10">
                                        <FolderKanban className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">{project.name}</CardTitle>
                                </div>
                                {project.description && (
                                    <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">{project.description}</p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 py-6 border-y border-slate-100">
                            <MetaDataItem label="Manager" value={project.managerName} />
                            <MetaDataItem label="Created On" value={new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} />
                            <MetaDataItem
                                label="Deadline"
                                headerExtra={isManager && project.status !== 'Completed' && !isEditingDeadline && (
                                    <button
                                        onClick={() => {
                                            setTempDeadline(project.deadline ? project.deadline.split('T')[0] : "");
                                            setIsEditingDeadline(true);
                                        }}
                                        className="p-0.5 rounded text-slate-300 hover:text-primary transition-colors flex items-center"
                                        title="Edit Deadline"
                                    >
                                        <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                )}
                                value={
                                    isEditingDeadline && isManager ? (
                                        <input
                                            type="date"
                                            className="bg-slate-50 border border-slate-200 rounded-md h-7 px-2 font-semibold text-xs outline-none focus:ring-2 focus:ring-primary/10 w-full"
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
                            <MetaDataItem label="Total Sections" value={project.sections?.length || 0} />
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team Members ({project.members?.length || 0})</h3>
                                {isManager && project.status !== 'Completed' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-lg text-primary hover:bg-primary/5 text-[11px] font-semibold uppercase tracking-wider"
                                        onClick={() => setIsManagingTeam(!isManagingTeam)}
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-1.5" /> {isManagingTeam ? 'Confirm Changes' : 'Manage Team'}
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {[...project.members]
                                    .sort((a, b) => {
                                        const rolePriority = (member) => {
                                            if (member.functionalRole === 'Manager') return 0;
                                            if (member.ktRole === 'Initiator') return 1;
                                            if (member.ktRole === 'Contributor') return 2;
                                            if (member.ktRole === 'Receiver') return 3;
                                            return 4;
                                        };
                                        return rolePriority(a) - rolePriority(b);
                                    })
                                    .map((m, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-primary border border-primary/10 shrink-0">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 leading-none truncate">{m.name}</p>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                                                        {m.functionalRole || 'Member'}
                                                    </span>
                                                    <div className="flex">
                                                        <Badge variant={m.ktRole === 'Initiator' ? 'purple' : m.ktRole === 'Receiver' ? 'warning' : 'blue'} className="text-[7.5px] px-1 py-0 h-3.5 font-bold uppercase tracking-tighter">
                                                            {m.ktRole}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {isManagingTeam && isManager && (
                                                <button
                                                    onClick={() => removeMember(project.id, m.id)}
                                                    className="ml-auto p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {isManagingTeam && isManager && (
                                <div className="mt-6 p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-5 animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Add New Stakeholder</p>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="flex-1">
                                            <select
                                                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10"
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
                                                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10"
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
                                            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 font-medium h-9 text-sm"
                                        >
                                            Add to Team
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Prominent Progress Section */}
                <Card className="shadow-sm border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden relative h-full flex flex-col justify-between">
                    <CardHeader className="p-6 pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Project Readiness</CardTitle>
                            <ShieldCheck className="w-5 h-5 text-primary/60" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-8 flex-1">
                        <div className="relative w-44 h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                <circle cx="88" cy="88" r="76" stroke="currentColor" className="text-white" strokeWidth="14" fill="transparent" />
                                <circle
                                    cx="88" cy="88" r="76"
                                    stroke="currentColor" strokeWidth="14"
                                    fill="transparent"
                                    strokeDasharray={477}
                                    strokeDashoffset={477 - (477 * overallProgress) / 100}
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900">{overallProgress}</span>
                                    <span className="text-base font-semibold text-slate-400 ml-1">%</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Completion</span>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Validated Sections</p>
                                    <p className="text-sm font-semibold text-slate-900">{understoodSections} / {totalSections} Finalized</p>
                                </div>
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                </div>
                            </div>
                            <Progress value={overallProgress} className="h-2 bg-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Project Sections Table */}
            <Card className="shadow-sm border border-slate-200 rounded-xl overflow-hidden bg-white">
                <CardHeader className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            <ScrollText className="w-4 h-4 text-primary/70" />
                            Project Sections ({project.sections?.length || 0})
                        </CardTitle>
                        <CardDescription className="text-xs">Detailed tracking of knowledge documentation status.</CardDescription>
                    </div>
                    {isManager && project.status !== 'Completed' && (
                        <Button
                            onClick={() => setIsAddingSection(!isAddingSection)}
                            variant={isAddingSection ? "outline" : "default"}
                            className={`rounded-lg h-9 px-4 text-sm font-medium shadow-sm transition-all ${isAddingSection ? 'text-slate-500' : 'bg-primary text-white hover:bg-primary/90'}`}
                        >
                            {isAddingSection ? <X className="w-3.5 h-3.5 mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
                            {isAddingSection ? 'Cancel' : 'Add Section'}
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {isAddingSection && isManager && (
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">Available Section Templates</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {templates.filter(t => !project.sections.find(s => s.title === t.title)).map(t => (
                                    <Card key={t.id} className="p-5 border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all group flex flex-col gap-5 bg-white">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors border border-slate-100">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-semibold text-slate-800 text-sm mt-1.5">{t.title}</h4>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-slate-50">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">Primary Assignee</label>
                                                <select
                                                    className="w-full h-8 text-xs font-medium border border-slate-200 rounded-md px-2 outline-none focus:ring-2 focus:ring-primary/10 bg-slate-50"
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
                                                className="w-full rounded-md bg-slate-900 hover:bg-black text-white font-medium text-xs h-8"
                                                disabled={!templateAssignees[t.id]}
                                            >
                                                Insert Section
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
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Section Title</th>
                                    <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resource Assigned</th>
                                    <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workflow Progress</th>
                                    <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Review Status</th>
                                    {isManager && <th className="p-4 w-16"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {project.sections.map((section, idx) => {
                                    const progress = getSectionProgress(section);
                                    const contributor = project.members.find(m => m.userId === section.contributorId);
                                    const hasText = !!section.content;
                                    const hasAttachments = (section.attachments || []).length > 0;
                                    const isReady = section.status === 'Ready for Review' || section.status === 'Understood';

                                    return (
                                        <tr key={section.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => {
                                                        const isSectionContributor = section.contributorId === user.id;
                                                        navigate(isSectionContributor ? `/icr/handovers/${projectId}` : `/icr/onboardings/${projectId}`);
                                                    }}>{section.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Step {idx + 1} of {project.sections.length}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {editingSectionId === section.id && isManager ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            className="h-8 text-xs font-semibold border border-slate-200 rounded-md px-2 outline-none focus:ring-2 focus:ring-primary/10 bg-white w-48"
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
                                                        <button onClick={() => setEditingSectionId(null)} className="text-slate-400 hover:text-red-500 p-1">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px]">
                                                            {contributor?.name.charAt(0) || '?'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-xs font-semibold text-slate-800 leading-none">{contributor?.name || 'Unassigned'}</p>
                                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{contributor?.functionalRole || 'Member'}</span>
                                                            </div>
                                                        </div>
                                                        {isManager && project.status !== 'Completed' && progress === 0 && (
                                                            <button
                                                                className="ml-2 p-1.5 rounded-md hover:bg-white text-slate-300 hover:text-primary transition-all border border-transparent hover:border-slate-100 shadow-sm"
                                                                onClick={() => setEditingSectionId(section.id)}
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-6">
                                                        <Indicator icon={<FileText className="w-3.5 h-3.5" />} active={hasText} label="Text" />
                                                        <Indicator icon={<Paperclip className="w-3.5 h-3.5" />} active={hasAttachments} label="Files" />
                                                        <Indicator icon={<CheckCircle2 className="w-3.5 h-3.5" />} active={isReady} label="Submitted" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-primary/70'}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-500 min-w-[30px]">{progress}%</span>
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
                                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                : 'hover:bg-red-50 hover:text-red-600 text-slate-400'
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
                            <div className="py-24 text-center flex flex-col items-center gap-4">
                                <FileText className="w-12 h-12 text-slate-100" />
                                <p className="text-sm font-semibold text-slate-400">No project sections defined yet.</p>
                                {isManager && <Button onClick={() => setIsAddingSection(true)} variant="outline" className="rounded-lg h-9 font-semibold text-xs border border-slate-200">Start Project</Button>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MetaDataItem({ label, value, headerExtra }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 h-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
                {headerExtra}
            </div>
            <div className="h-5 flex items-center">
                {typeof value === 'object' ? (
                    value
                ) : (
                    <p className="font-semibold text-slate-900 text-sm leading-none whitespace-nowrap">{value}</p>
                )}
            </div>
        </div>
    );
}

function Indicator({ icon, active, label }) {
    return (
        <div className={`flex items-center gap-2 group/tip relative ${active ? 'text-primary' : 'text-slate-300'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${active ? 'border-primary/20 bg-primary/5' : 'border-slate-100 bg-slate-50'}`}>
                {icon}
            </div>
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold py-1.5 px-3 rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {label}: <span className={active ? 'text-emerald-400' : 'text-slate-400'}>{active ? 'ACTIVE' : 'PENDING'}</span>
            </span>
        </div>
    );
}
