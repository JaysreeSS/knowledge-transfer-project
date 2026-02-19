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
    ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function HandoverProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { projects, updateSectionStatus, addComment, addAttachment, removeAttachment } = useProjects();
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

    useEffect(() => {
        if (section) {
            setContent(section.content || '');
            setIsEditing(false);
        }
    }, [selectedSectionId, section]);

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Project Record Missing</h2>
            <Button onClick={() => navigate('/icr/handovers')} className="rounded-xl">Return to Handovers</Button>
        </div>
    );

    const isContributor = section?.contributorId === user.id;
    const isReadOnly = project.status === 'Completed';

    const handleSave = () => {
        if (section) {
            const hasChanged = content !== (section.content || '');
            const newStatus = (hasChanged && (section.status === 'Ready for Review' || section.status === 'Needs Clarification')) ? 'Draft' : section.status;
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

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-[1600px] mx-auto space-y-5 animate-in fade-in duration-700 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/icr/handovers')}
                    className="h-8 px-0 text-slate-500 hover:text-primary hover:bg-transparent font-semibold text-[10px] sm:text-xs transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-slate-900">{project.name}</p>
                    <Badge variant="outline" className={`rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest border ${(project.status === 'Completed' || project.status === 'Signed Off')
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : project.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                        {project.status === 'Completed' || project.status === 'Signed Off' ? 'Signed Off' : (project.status || 'Active')}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5 xl:h-[calc(100vh-120px)]">
                {/* Left Sidebar: Sections List & Team */}
                <div className="col-span-12 xl:col-span-3 flex flex-col gap-4 h-auto xl:h-full xl:overflow-y-auto xl:pr-2 custom-scrollbar">
                    {/* Sections List */}
                    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
                        <CardHeader className="p-4 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" /> Project Sections
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[9px] bg-slate-200/50 text-slate-600 border-none font-bold">{project.sections.length}</Badge>
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
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                                {s.title}
                                            </h4>
                                            {isAssigned && (
                                                <Badge className="bg-orange-50 text-orange-600 border border-orange-100 text-[8px] px-1.5 py-0 font-bold uppercase tracking-widest pointer-events-none">
                                                    You
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon status={s.status || 'Draft'} />
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary/70' : 'text-slate-400'}`}>
                                                {s.status || 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Team Members */}
                    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden flex-shrink-0">
                        <CardHeader className="p-4 bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Team Members
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[9px] bg-slate-200/50 text-slate-600 border-none font-bold">{project.members.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                            {[...project.members]
                                .sort((a, b) => {
                                    const roles = { 'Initiator': 1, 'Contributor': 2, 'Receiver': 3 };
                                    return (roles[a.ktRole] || 4) - (roles[b.ktRole] || 4);
                                })
                                .map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{m.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.functionalRole}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-widest border ${m.ktRole === 'Initiator' ? 'text-purple-600 bg-purple-50 border-purple-100' :
                                            m.ktRole === 'Receiver' ? 'text-orange-600 bg-orange-50 border-orange-100' :
                                                'text-blue-600 bg-blue-50 border-blue-100'
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
                            <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden flex-shrink-0">
                                <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between bg-white sticky top-0 z-10">
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold text-slate-900">{section.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const assignee = project.members.find(m => m.userId === section.contributorId);
                                                if (!assignee) return (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-slate-100">
                                                        <UserCircle className="w-3 h-3" />
                                                        Unassigned
                                                    </div>
                                                );

                                                const isInitiator = assignee.ktRole === 'Initiator';
                                                const colorClass = isInitiator
                                                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                    : 'bg-blue-50 text-blue-600 border-blue-100';

                                                return (
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${colorClass}`}>
                                                        <UserCircle className="w-3 h-3" />
                                                        {assignee.ktRole}: {assignee.name}
                                                    </div>
                                                );
                                            })()}
                                            {isContributor && !isReadOnly && (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Your Responsibility</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {!isReadOnly && isContributor && !isEditing && (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] shadow-sm transition-all"
                                            >
                                                Edit Content
                                            </Button>
                                        )}
                                        {!isReadOnly && isContributor && isEditing && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => { setIsEditing(false); setContent(section.content || ''); }}
                                                    className="h-9 px-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSave}
                                                    className="bg-primary text-white hover:bg-primary/90 rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] shadow-sm"
                                                >
                                                    <Save className="w-3.5 h-3.5 mr-2" /> Save Changes
                                                </Button>
                                            </div>
                                        )}
                                        {!isReadOnly && isContributor && section.status !== 'Understood' && !isEditing && (
                                            <Button
                                                onClick={() => handleStatusUpdate('Ready for Review')}
                                                disabled={!section.content || section.status === 'Ready for Review' || section.status === 'Needs Clarification'}
                                                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] shadow-sm"
                                            >
                                                <Send className="w-3.5 h-3.5 mr-2" /> Submit Section
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
                                            className="min-h-[400px] w-full resize-none p-6 text-base leading-relaxed text-slate-700 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-primary/20 transition-all font-medium"
                                        />
                                    ) : (
                                        <div className="prose prose-slate max-w-none">
                                            {section.content ? (
                                                <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-600">
                                                    {section.content}
                                                </p>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-80 text-slate-300 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                    <FileText className="w-12 h-12 mb-4 opacity-30" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No documentation drafted yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                                {/* Attachments */}
                                <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden h-fit">
                                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30 flex flex-row justify-between items-center">
                                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Paperclip className="w-3.5 h-3.5" /> Attachments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2">
                                        {(section.attachments || []).length === 0 ? (
                                            <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-8 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">No files attached</p>
                                        ) : (
                                            (section.attachments || []).map((att) => (
                                                <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-xl group hover:border-slate-200 transition-all">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[11px] font-bold text-slate-700 truncate tracking-tight">{att.fileName}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{att.fileSize}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-200">
                                                            <Download className="w-3 h-3 text-slate-500" />
                                                        </Button>
                                                        {!isReadOnly && isContributor && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
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
                                            <div className="pt-2">
                                                <Label htmlFor="file-upload" className="cursor-pointer">
                                                    <div className="w-full h-10 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-slate-50 transition-all group">
                                                        <Paperclip className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Add Attachment</span>
                                                    </div>
                                                    <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                                                </Label>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Discussion */}
                                <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden h-fit">
                                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30 flex flex-row justify-between items-center">
                                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" /> Discussion
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex flex-col">
                                        <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto min-h-[150px]">
                                            {(section.comments || []).length === 0 ? (
                                                <div className="text-center py-10 flex flex-col items-center gap-2 opacity-50">
                                                    <MessageSquare className="w-6 h-6 text-slate-200" />
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No conversation yet</p>
                                                </div>
                                            ) : (
                                                section.comments.map((c, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase text-primary tracking-widest">{c.userName}</span>
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{c.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {!isReadOnly && (
                                            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex gap-2">
                                                <Input
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Type localized query..."
                                                    className="h-10 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-primary/20"
                                                />
                                                <Button
                                                    onClick={handleAddComment}
                                                    disabled={!commentText.trim()}
                                                    size="icon"
                                                    className="h-10 w-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm shrink-0"
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
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                            <Layers className="w-16 h-16 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-[11px] text-slate-400">Select a section to begin documentation</p>
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
        case 'Draft': return <Clock className="w-3 h-3 text-slate-400" />;
        default: return <Clock className="w-3 h-3 text-slate-300" />;
    }
}
