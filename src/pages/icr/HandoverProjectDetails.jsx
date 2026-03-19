import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    FileSearch,
    Layers,
    Users,
    Save,
    Send,
    MessageSquare,
    Paperclip,
    FileText,
    Download,
    Trash2,
    Clock,
    UserCircle,
    ArrowRight,
    Link as LinkIcon,
    ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function HandoverProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { projects, updateSectionStatus, addComment, addAttachment, removeAttachment, addLink, removeLink, getReceiverCompletion } = useProjects();
    const navigate = useNavigate();

    const project = projects.find(p => p.id === projectId);

    // Automatically select the first assigned section if available
    const initialSectionId = project?.sections.find(s => s.contributorId === user.id)?.id || project?.sections[0]?.id;
    const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
    const [pendingRemoveAttId, setPendingRemoveAttId] = useState(null);

    // Editor state
    const section = project?.sections.find(s => s.id === selectedSectionId);
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [showLinkInput, setShowLinkInput] = useState(false);

    useEffect(() => {
        if (section) {
            setContent(section.content || '');
            setIsEditing(false);
        }
    }, [selectedSectionId, section]);

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 transition-colors">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 transition-colors" />
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight transition-colors">Project Record Missing</h2>
            <Button onClick={() => navigate('/icr/handovers')} className="rounded-xl">Return to Handovers</Button>
        </div>
    );

    const isContributor = section?.contributorId === user.id;
    const isDeadlinePassed = project.deadline ? new Date() > new Date(new Date(project.deadline).setHours(23, 59, 59, 999)) : false;
    const isReadOnly = isDeadlinePassed || (project.lifecycleMode === 'TRANSITION' && (project.status === 'Completed' || project.status === 'Signed Off'));

    const handleSave = () => {
        if (section) {
            const hasChanged = content !== (section.content || '');
            const newStatus = (hasChanged && (section.status === 'Ready for Review' || section.status === 'Needs Clarification' || section.status === 'Understood')) ? 'Active' : section.status;
            updateSectionStatus(projectId, section.id, newStatus, content);
            setIsEditing(false);
        }
    };

    const handleStatusUpdate = (newStatus) => {
        if (section) {
            updateSectionStatus(projectId, section.id, newStatus, content);
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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && section) {
            addAttachment(projectId, section.id, {
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(1) + ' KB',
                uploadedBy: user.name,
                url: "#" // Mock URL
            });
        }
    };

    const handleAddLink = () => {
        if (!newLink.title.trim() || !newLink.url.trim() || !section) {
            toast.error('Both title and URL are required');
            return;
        }

        // Basic URL validation
        try {
            const url = newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`;
            addLink(projectId, section.id, {
                title: newLink.title,
                url: url,
                createdBy: user.name
            });
            setNewLink({ title: '', url: '' });
            setShowLinkInput(false);
            toast.success('Link added successfully');
        } catch (e) {
            toast.error('Invalid URL');
        }
    };

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-900/20 min-h-screen font-sans transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/icr/handovers')}
                    className="h-8 px-0 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-transparent font-medium text-sm tracking-button transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-4">
                    {isDeadlinePassed && (
                        <Badge variant="destructive" className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800 flex items-center gap-1.5 animate-pulse transition-colors">
                            <AlertCircle className="w-3 h-3" /> Deadline passed - Locked
                        </Badge>
                    )}
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors">{project.name}</p>
                    <Badge variant="outline" className={`rounded-lg px-3 py-1 font-medium text-xs uppercase tracking-label border transition-colors ${project.lifecycleMode === 'ACTIVE'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
                        : project.lifecycleMode === 'REVERSE_KT'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                        }`}>
                        {project.lifecycleMode}
                    </Badge>
                    <Badge variant="outline" className={`rounded-lg px-3 py-1 font-medium text-xs uppercase tracking-label border transition-colors ${(project.status === 'Completed' || project.status === 'Signed Off')
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                        : project.status === 'In Progress'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                        }`}>
                        {project.status === 'Completed' || project.status === 'Signed Off' ? 'Signed off' : (project.status || 'Active')}
                    </Badge>
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
                                    <Layers className="w-3.5 h-3.5" /> {project.lifecycleMode === 'ACTIVE' ? 'Living documentation' : 'Project sections'}
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[10px] bg-slate-200/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-none font-medium">
                                    {project.sections.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                            {project.sections.map((s) => {
                                const isAssigned = s.contributorId === user.id;
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
                                        <div className="flex justify-between items-start mb-1.5">
                                            <h4 className={`text-sm font-semibold leading-snug transition-colors ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {s.title}
                                            </h4>
                                            {isAssigned && (
                                                <Badge className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800 text-[10px] px-1.5 py-0 font-medium uppercase tracking-label pointer-events-none transition-colors">
                                                    You
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon status={s.status || (project.lifecycleMode === 'ACTIVE' ? 'Active' : 'Draft')} />
                                            <span className={`text-xs font-medium uppercase tracking-label transition-colors ${isSelected ? 'text-primary/70 dark:text-primary/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {s.status || (project.lifecycleMode === 'ACTIVE' ? 'Active' : 'Draft')}
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
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Team Members
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[9px] bg-slate-200/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-none font-bold">{project.members.length}</Badge>
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
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div className="transition-colors">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors">{m.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{m.functionalRole}</p>
                                                {m.ktRole === 'Receiver' && project.lifecycleMode !== 'ACTIVE' && (() => {
                                                    const rc = getReceiverCompletion(projectId, m.userId);
                                                    return (
                                                        <div className="flex items-center gap-1.5 mt-1 transition-colors">
                                                            <div className="w-14 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${rc === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                    style={{ width: `${rc}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 transition-colors">{rc}%</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-widest border transition-colors ${m.ktRole === 'Initiator' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' :
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

                {/* Right Content Area: Editor, Attachments, Discussion */}
                <div className="col-span-12 xl:col-span-9 flex flex-col gap-4 h-auto xl:h-full xl:overflow-y-auto custom-scrollbar pb-20">
                    {section ? (
                        <>
                            {/* Editor Section */}
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex-shrink-0">
                                <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10 transition-colors">
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{section.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const assignee = project.members.find(m => m.userId === section.contributorId);
                                                if (!assignee) return (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-colors">
                                                        <UserCircle className="w-3 h-3" />
                                                        Unassigned
                                                    </div>
                                                );

                                                const isInitiator = assignee.ktRole === 'Initiator';
                                                const colorClass = isInitiator
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800';

                                                return (
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border transition-colors ${colorClass}`}>
                                                        <UserCircle className="w-3 h-3" />
                                                        {assignee.ktRole}: {assignee.name}
                                                    </div>
                                                );
                                            })()}
                                            {isContributor && !isReadOnly && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest transition-colors">Your Responsibility</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {!isReadOnly && isContributor && !isEditing && (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg h-9 px-4 font-medium tracking-button text-sm shadow-sm transition-all"
                                            >
                                                Edit content
                                            </Button>
                                        )}
                                        {!isReadOnly && isContributor && isEditing && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => { setIsEditing(false); setContent(section.content || ''); }}
                                                    className="h-9 px-4 text-slate-400 dark:text-slate-500 font-medium tracking-button text-sm hover:text-slate-600 dark:hover:text-slate-300"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSave}
                                                    className="bg-primary text-white hover:bg-primary/90 rounded-lg h-9 px-4 font-medium tracking-button text-sm shadow-sm"
                                                >
                                                    <Save className="w-3.5 h-3.5 mr-2" /> Save changes
                                                </Button>
                                            </div>
                                        )}
                                        {!isReadOnly && isContributor && section.status !== 'Understood' && !isEditing && (
                                            <Button
                                                onClick={() => handleStatusUpdate('Ready for Review')}
                                                disabled={!section.content || section.status === 'Ready for Review' || section.status === 'Needs Clarification'}
                                                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg h-9 px-4 font-medium tracking-button text-sm shadow-sm"
                                            >
                                                <Send className="w-3.5 h-3.5 mr-2" /> Submit section
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 min-h-[450px]">
                                    {isEditing ? (
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Write your detailed documentation here..."
                                            className="min-h-[400px] w-full resize-none p-6 text-base leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary/20 transition-all font-medium transition-colors"
                                        />
                                    ) : (
                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            {section.content ? (
                                                <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">
                                                    {section.content}
                                                </p>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-80 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                                                    <FileText className="w-12 h-12 mb-4 opacity-30" />
                                                    <p className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">No documentation drafted yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label text-center py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">No files attached</p>
                                            ) : (
                                                (section.attachments || []).map((att) => (
                                                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl group hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate tracking-tight">{att.fileName}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{att.fileSize}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                                                                <Download className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                            </Button>
                                                            {!isReadOnly && isContributor && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                                                                    onClick={() => {
                                                                        if (pendingRemoveAttId === att.id) {
                                                                            removeAttachment(projectId, section.id, att.id);
                                                                            setPendingRemoveAttId(null);
                                                                            toast.success('Attachment removed.');
                                                                        } else {
                                                                            setPendingRemoveAttId(att.id);
                                                                            toast.warning('Click again to confirm removal.', { duration: 3000 });
                                                                            setTimeout(() => setPendingRemoveAttId(prev => prev === att.id ? null : prev), 3000);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {!isReadOnly && isContributor && (
                                                <div className="pt-2 sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm pb-1 transition-colors">
                                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                                        <div className="w-full h-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                                                            <Paperclip className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                                            <span className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">Add attachment</span>
                                                        </div>
                                                        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                                                    </Label>
                                                </div>
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
                                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label text-center py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors">No links added</p>
                                            ) : (
                                                (section.links || []).map((link) => (
                                                    <div key={link.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl group hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm transition-colors">
                                                                <LinkIcon className="w-4 h-4" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate tracking-tight transition-colors">{link.title}</p>
                                                                <p className="text-[9px] font-bold text-primary dark:text-primary override-primary truncate hover:underline cursor-pointer transition-colors" onClick={() => window.open(link.url, '_blank')}>{link.url}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" onClick={() => window.open(link.url, '_blank')}>
                                                                <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                            </Button>
                                                            {!isReadOnly && isContributor && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                                    onClick={() => {
                                                                        removeLink(projectId, section.id, link.id);
                                                                        toast.success('Link removed.');
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {!isReadOnly && isContributor && (
                                                <div className="pt-2 space-y-2 sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-colors">
                                                    {showLinkInput ? (
                                                        <div className="p-3 border border-primary/20 dark:border-primary/30 rounded-xl bg-primary/5 dark:bg-primary/10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Link Title</Label>
                                                                <Input
                                                                    placeholder="e.g. YouTube Tutorial"
                                                                    value={newLink.title}
                                                                    onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                                                    className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/50"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">URL</Label>
                                                                <Input
                                                                    placeholder="e.g. https://youtube.com/..."
                                                                    value={newLink.url}
                                                                    onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                                                    className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/50"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" className="h-8 text-xs font-medium uppercase tracking-label flex-1" onClick={handleAddLink}>Add link</Button>
                                                                <Button size="sm" variant="ghost" className="h-8 text-xs font-medium uppercase tracking-label flex-1 text-slate-500 dark:text-slate-400" onClick={() => setShowLinkInput(false)}>Cancel</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => setShowLinkInput(true)}
                                                            className="w-full h-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group cursor-pointer"
                                                        >
                                                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                                            <span className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">Add reference link</span>
                                                        </div>
                                                    )}
                                                </div>
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
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase text-primary dark:text-primary transition-colors tracking-widest">{c.userName}</span>
                                                            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-colors">{c.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {!isReadOnly && (
                                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex gap-2 shrink-0 transition-colors">
                                                <Input
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Reply here..."
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
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 space-y-4 transition-colors">
                            <Layers className="w-16 h-16 opacity-10 transition-colors" />
                            <p className="font-bold uppercase tracking-widest text-[11px] text-slate-400 dark:text-slate-500 transition-colors">Select a section to begin documentation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusIcon({ status }) {
    switch (status) {
        case 'Understood': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
        case 'Needs Clarification': return <AlertCircle className="w-3 h-3 text-orange-500" />;
        case 'Ready for Review': return <FileSearch className="w-3 h-3 text-primary" />;
        case 'Presented': return <MessageSquare className="w-3 h-3 text-amber-500" />;
        case 'Active': return <CheckCircle2 className="w-3 h-3 text-indigo-500" />;
        case 'Draft': return <Clock className="w-3 h-3 text-slate-400" />;
        default: return <Clock className="w-3 h-3 text-slate-300" />;
    }
}
