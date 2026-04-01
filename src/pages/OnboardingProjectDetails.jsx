import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    CheckCircle2,
    Lock,
    Unlock,
    AlertCircle,
    Layers,
    Users,
    Download,
    Clock,
    UserCircle,
    ArrowRight,
    Link as LinkIcon,
    ExternalLink,
    Zap,
    Pencil,
    MessageSquare,
    Paperclip,
    FileText,
    ThumbsUp,
    HelpCircle,
    RotateCcw,
    Search,
    Info,
    FileSearch,
    Activity,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import TechStackCard from '../components/TechStackCard.jsx';
import AIOnboardingConcierge from '../components/AIOnboardingConcierge.jsx';
import { AIService } from '../services/aiService';

// Advanced Markdown Renderer using industry-standard libraries
const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    const components = {
        h1: ({ children }) => <h1 className="text-3xl font-extrabold border-b-2 border-primary/20 pb-2 mt-10 mb-6">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mt-8 mb-4 shadow-sm-bottom px-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-bold mt-8 mb-4 text-slate-800 dark:text-slate-100">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-semibold mt-6 mb-3 text-slate-700 dark:text-slate-200">{children}</h4>,
        h5: ({ children }) => <h5 className="text-base font-semibold mt-5 mb-2 text-slate-600 dark:text-slate-300 italic">{children}</h5>,
        h6: ({ children }) => <h6 className="text-sm font-bold mt-4 mb-2 text-slate-500 dark:text-slate-400 uppercase tracking-widest">{children}</h6>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-3 my-6 italic text-slate-600 dark:text-slate-400 bg-primary/5 dark:bg-primary/5 rounded-r-lg shadow-sm">
                {children}
            </blockquote>
        ),
        hr: () => <hr className="my-10 border-t-2 border-solid border-slate-200 dark:border-slate-800" />,
        table: ({ children }) => (
            <div className="overflow-x-auto my-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <table className="w-full border-collapse text-sm">{children}</table>
            </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-50/50 dark:bg-slate-900/50">{children}</thead>,
        th: ({ children }) => <th className="border border-slate-200 dark:border-slate-800 p-3 text-left font-bold text-slate-700 dark:text-slate-300">{children}</th>,
        td: ({ children }) => <td className="border border-slate-200 dark:border-slate-800 p-3 transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-800/20">{children}</td>,
        p: ({ children }) => <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-slate-100">{children}</strong>,
        code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
                return <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 font-mono text-[0.9em] mx-0.5" {...props}>{children}</code>;
            }
            return (
                <pre className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 p-5 rounded-2xl my-6 overflow-x-auto border border-slate-100 dark:border-slate-800 shadow-inner-sm font-mono text-sm leading-relaxed">
                    <code className="block" {...props}>{children}</code>
                </pre>
            );
        },
        a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold transition-colors">
                {children}
            </a>
        )
    };

    return (
        <div className="markdown-content animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]} 
                rehypePlugins={[rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default function OnboardingProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { projects, loading, addComment, updateReceiverProgress, getReceiverCompletion, finalizeReceiverTransition, updateSectionQuiz } = useProjects();
    const { pushNotification } = useNotifications();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const project = projects.find(p => p.id === projectId);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isUnderstandOpen, setIsUnderstandOpen] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizScore, setQuizScore] = useState(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    // Automatically select the first section if available
    useEffect(() => {
        if (project && !selectedSectionId && project.sections.length > 0) {
            setSelectedSectionId(project.sections[0].id);
        }
    }, [project, selectedSectionId]);

    const section = project?.sections.find(s => s.id === selectedSectionId);
    const isDeadlinePassed = project?.deadline ? new Date() > new Date(new Date(project.deadline).setHours(23, 59, 59, 999)) : false;

    // Helper: get THIS receiver's status for a given section
    const getMyStatus = (sectionId) => {
        const rp = (project?.receiverProgress || []).find(
            r => r.sectionId === sectionId && r.receiverId === user.id
        );
        return rp?.status || 'Not Started';
    };

    const handleAddComment = () => {
        if (!commentText.trim() || !section) return;
        addComment(projectId, section.id, {
            userId: user.id,
            userName: user.name,
            text: commentText
        });
        setCommentText("");
    };

    const handleStatusUpdate = async (newStatus) => {
        if (section) {
            if (newStatus === 'Understood' && !quizScore && (section.content?.length > 100)) {
                // Trigger Quiz instead of marking directly
                await startQuiz();
                return;
            }

            updateReceiverProgress(projectId, section.id, user.id, newStatus);

            if (newStatus === 'Needs Clarification') {
                if (section.contributorId !== user.id) {
                    pushNotification({
                        user_id: section.contributorId,
                        module: 'icr',
                        type: 'clarify',
                        title: 'Clarification requested',
                        body: `${user.name} has requested clarification on section "${section.title}" in project "${project.name}".`,
                        project_id: projectId,
                        project_name: project.name
                    });
                }
            } else if (newStatus === 'Understood') {
                if (section.contributorId !== user.id) {
                    pushNotification({
                        user_id: section.contributorId,
                        module: 'icr',
                        type: 'success',
                        title: 'Section understood',
                        body: `${user.name} has marked section "${section.title}" in project "${project.name}" as understood.`,
                        project_id: projectId,
                        project_name: project.name
                    });
                }
            } else if (newStatus === 'Not Started') {
                // Reset quiz score too
                setQuizScore(null);
            }
        }
    };

    const startQuiz = async () => {
        if (!section || !section.content) return;
        
        setIsGeneratingQuiz(true);
        let quiz = section.aiQuiz;
        if (!quiz) {
            quiz = await AIService.generateQuiz(section.title, section.content);
            await updateSectionQuiz(projectId, section.id, quiz);
        }
        
        setActiveQuiz(quiz);
        setQuizAnswers({});
        setCurrentQuestionIndex(0);
        setQuizScore(null);
        setIsQuizOpen(true);
        setIsGeneratingQuiz(false);
    };

    const handleQuizSubmit = () => {
        let correctCount = 0;
        activeQuiz.forEach((q, idx) => {
            if (quizAnswers[idx] === q.answer) correctCount++;
        });
        
        const score = Math.round((correctCount / activeQuiz.length) * 100);
        setQuizScore(score);
        
        if (score >= 70) {
            updateReceiverProgress(projectId, section.id, user.id, 'Understood');
            toast.success(`Validation passed with ${score}%! Section marked as Understood.`);
        } else {
            toast.error(`Validation failed with ${score}%. Please review the documentation again.`);
        }
    };

    if (loading) return <LoadingScreen />;

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 transition-colors text-center px-4">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 transition-colors" />
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight transition-colors">Project Record Missing</h2>
            <Button onClick={() => navigate(-1)} className="rounded-xl">Return Back</Button>
        </div>
    );

    // Business Logic for Draft State
    const isSubmitted = section?.status === 'Ready for Review' || section?.status === 'Understood' || section?.status === 'Needs Clarification' || section?.status === 'Presented';
    const hasContent = section?.content && section.content.trim().length > 0;

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 bg-slate-50 dark:bg-slate-900/20 min-h-screen font-sans transition-colors pb-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all shrink-0 hidden md:flex"
                        title="Back"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors leading-none">{project.name}</h1>
                        <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest border transition-colors ${(project.status === 'Completed' || project.status === 'Signed Off')
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                            : project.status === 'In Progress'
                                ? 'bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/20 dark:border-primary/80'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                            }`}>
                            {project.status === 'Completed' || project.status === 'Signed Off' ? 'Signed off' : (project.status || 'Active')}
                        </Badge>
                    </div>
                    {getMyStatus(project.sections[0]?.id) !== 'Not Started' && getReceiverCompletion(projectId, user.id) === 100 && (
                        <Button 
                            onClick={async () => {
                                await finalizeReceiverTransition(projectId, user.id);
                                toast.success('Congratulations! You have officially graduated to Contributor.');
                                navigate(`/icr/handovers/${projectId}`);
                            }}
                            className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 h-8 rounded-lg text-xs"
                        >
                            <Zap className="w-3.5 h-3.5 mr-1.5" /> Complete My Transition
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                        <PopoverTrigger asChild>
                            <div 
                                className={`p-1.5 rounded-lg border cursor-help transition-all shadow-sm ${isDeadlinePassed 
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/60 animate-pulse' 
                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/60'}`}
                                onMouseEnter={() => setIsInfoOpen(true)}
                                onMouseLeave={() => setIsInfoOpen(false)}
                            >
                                {isDeadlinePassed ? <Lock className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent 
                            className="w-auto p-1.5 px-3 bg-slate-900 text-white border-white/10 shadow-xl rounded-lg" 
                            sideOffset={6}
                            onMouseEnter={() => setIsInfoOpen(true)}
                            onMouseLeave={() => setIsInfoOpen(false)}
                        >
                            <div className="flex items-center gap-2 text-[10px] font-bold whitespace-nowrap">
                                <Clock className="w-3 h-3 text-blue-400" />
                                {isDeadlinePassed ? (
                                    <>Deadline <span className="text-blue-200 mx-1">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span> Passed</>
                                ) : (
                                    <>Deadline: <span className="text-blue-200 ml-1">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span></>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Badge variant={project.lifecycleMode === 'TRANSITION' ? 'warning' : 'soft'} className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${project.lifecycleMode === 'TRANSITION' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_8px_rgba(var(--primary),0.5)]'}`} />
                        {project.lifecycleMode}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5 mb-10">
                {/* Left Sidebar: Sections List & Team */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-auto lg:pr-2">
                    {/* Sections List */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col transition-colors">
                        <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 transition-colors">
                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" /> Project sections
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[9px] bg-slate-200/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-none font-semibold">
                                    {project.sections.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <div className="p-2 space-y-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                            {project.sections.map((s) => {
                                const isSelected = selectedSectionId === s.id;
                                const status = getMyStatus(s.id);

                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedSectionId(s.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border-l-4 relative group ${isSelected
                                            ? 'bg-primary/5 dark:bg-primary/10 border-primary shadow-sm'
                                            : 'bg-white/50 dark:bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-100 dark:hover:border-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5 transition-colors">
                                            <h4 className={`text-xs font-bold leading-snug transition-colors ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {s.title}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon status={status} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-primary/70 dark:text-primary/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Team Members */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex-shrink-0 transition-colors">
                        <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Team Members
                                </div>
                                <Badge variant="secondary" className="rounded-full px-2 py-0 h-4.5 text-[9px] bg-slate-200/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-none font-semibold">{project.members.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <div className="p-4 space-y-3">
                            {[...project.members]
                                .sort((a, b) => {
                                    const roles = { 'Initiator': 1, 'Contributor': 2, 'Receiver': 3 };
                                    return (roles[a.ktRole] || 4) - (roles[b.ktRole] || 4);
                                })
                                .map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-semibold text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div className="transition-colors">
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors leading-none">{m.name}</p>
                                                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors mt-0.5">{m.functionalRole || m.ktRole}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`text-[8px] px-2 py-0.5 font-semibold uppercase tracking-widest border transition-colors ${m.ktRole === 'Initiator' ? 'text-primary bg-primary/5 dark:bg-primary/20 border-primary/20 dark:border-primary/80' :
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

                {/* Right Content Area: Viewer and Resource/Discussion Grid */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-5 h-auto pb-5">
                    {section ? (
                        <>
                            {/* Documentation Viewer Card */}
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex-shrink-0 transition-colors">
                                <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10 transition-colors">
                                    <div className="space-y-2 transition-colors">
                                        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors leading-tight">{section.title}</CardTitle>
                                        <div className="flex items-center gap-2 transition-colors">
                                            {(() => {
                                                const assignee = project.members.find(m => m.userId === section.contributorId);
                                                const colorClass = assignee?.ktRole === 'Initiator'
                                                    ? 'bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/20 dark:border-primary/80'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800';

                                                return (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest border transition-colors ${colorClass}`}>
                                                        <UserCircle className="w-3 h-3" />
                                                        {assignee?.ktRole || 'Contributor'}: {assignee?.name || 'Unassigned'}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 transition-colors">
                                        {getMyStatus(section.id) !== 'Not Started' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusUpdate('Not Started')}
                                                disabled={project.status === 'Completed' || isDeadlinePassed}
                                                className="h-9 px-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold uppercase tracking-widest"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                                            </Button>
                                        )}
                                        
                                        <Popover open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    onClick={() => handleStatusUpdate('Needs Clarification')}
                                                    onMouseEnter={() => setIsHelpOpen(true)}
                                                    onMouseLeave={() => setIsHelpOpen(false)}
                                                    disabled={getMyStatus(section.id) === 'Needs Clarification' || !isSubmitted || project.status === 'Completed' || isDeadlinePassed}
                                                    className={`h-9 w-9 p-0 rounded-xl transition-all ${getMyStatus(section.id) === 'Needs Clarification'
                                                        ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 shadow-sm'
                                                    }`}
                                                >
                                                    <HelpCircle className="w-4 h-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-1.5 px-3 bg-slate-900 text-white border-none shadow-xl rounded-lg" sideOffset={5}>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Request clarification</span>
                                            </PopoverContent>
                                        </Popover>

                                        <Popover open={isUnderstandOpen} onOpenChange={setIsUnderstandOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    onClick={() => handleStatusUpdate('Understood')}
                                                    onMouseEnter={() => setIsUnderstandOpen(true)}
                                                    onMouseLeave={() => setIsUnderstandOpen(false)}
                                                    disabled={getMyStatus(section.id) === 'Understood' || !isSubmitted || project.status === 'Completed' || isDeadlinePassed}
                                                    className={`h-9 w-9 p-0 rounded-xl transition-all shadow-lg ring-offset-white dark:ring-offset-slate-900 ${getMyStatus(section.id) === 'Understood'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-none'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50 dark:shadow-none'
                                                    }`}
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-1.5 px-3 bg-slate-900 text-white border-none shadow-xl rounded-lg" sideOffset={5}>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Understood</span>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 min-h-[500px] flex flex-col relative transition-colors">
                                    {isGeneratingQuiz && (
                                        <div className="absolute inset-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
                                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100 transition-colors">Generating KT Validation</h3>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI is analyzing documentation to create your knowledge assessment...</p>
                                            </div>
                                        </div>
                                    )}

                                    {isQuizOpen && activeQuiz ? (
                                        <div className="flex-1 p-12 bg-primary/5 transition-all overflow-y-auto custom-scrollbar flex flex-col items-center">
                                            <div className="max-w-2xl w-full space-y-12">
                                                <div className="space-y-4 text-center">
                                                    <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px] h-6 px-4">Knowledge Assessment</Badge>
                                                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-100 transition-colors">{section.title} Quiz</h2>
                                                    <div className="flex items-center justify-center gap-6 pt-4">
                                                        <div className="flex items-center gap-1.5 grayscale opacity-60 transition-all">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Read</span>
                                                        </div>
                                                        <div className="w-12 h-px bg-primary/20" />
                                                        <div className="flex items-center gap-1.5 transition-all">
                                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Validate</span>
                                                        </div>
                                                        <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                                                        <div className="flex items-center gap-1.5 grayscale opacity-20 transition-all">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Finalize</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {quizScore !== null ? (
                                                    <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-8 transition-colors animate-in zoom-in-95 duration-500">
                                                        <div className="relative inline-block">
                                                            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black transition-colors ${quizScore >= 70 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'}`}>
                                                                {quizScore}%
                                                            </div>
                                                            {quizScore >= 70 && <CheckCircle2 className="absolute -top-1 -right-1 w-10 h-10 text-emerald-500 bg-white dark:bg-slate-900 rounded-full border-4 border-emerald-500 transition-colors" />}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">{quizScore >= 70 ? 'Validation Successful!' : 'Validation Required'}</h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                                                {quizScore >= 70 
                                                                    ? 'You have effectively captured the core knowledge of this section.' 
                                                                    : 'The assessment indicates gaps in understanding. We recommend reviewing the documentation again.'}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-4 items-center justify-center pt-4">
                                                            <Button onClick={() => setIsQuizOpen(false)} variant={quizScore >= 70 ? "outline" : "default"} className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 transition-all">
                                                                {quizScore >= 70 ? 'Finish validation' : 'Review Documentation'}
                                                            </Button>
                                                            {quizScore < 70 && (
                                                                <Button onClick={() => setQuizScore(null)} variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 transition-all">Retry Quiz</Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full space-y-8 animate-in slide-in-from-right-8 duration-500">
                                                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6 transition-colors">
                                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary transition-colors">
                                                                <span>Question {currentQuestionIndex + 1} of {activeQuiz.length}</span>
                                                                <div className="h-1 flex-1 mx-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                                                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.length) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug transition-colors">{activeQuiz[currentQuestionIndex].question}</h4>
                                                            <div className="grid grid-cols-1 gap-3 pt-4">
                                                                {activeQuiz[currentQuestionIndex].options.map((option, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setQuizAnswers({ ...quizAnswers, [currentQuestionIndex]: idx })}
                                                                        className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all border-2 flex items-center justify-between group ${quizAnswers[currentQuestionIndex] === idx 
                                                                            ? 'border-primary bg-primary/5 text-primary' 
                                                                            : 'border-slate-100 dark:border-slate-800 hover:border-primary/30 text-slate-600 dark:text-slate-300'}`}
                                                                    >
                                                                        {option}
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${quizAnswers[currentQuestionIndex] === idx ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                                                                            {quizAnswers[currentQuestionIndex] === idx && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-4">
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                                disabled={currentQuestionIndex === 0}
                                                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 transition-all"
                                                            >
                                                                Previous
                                                            </Button>
                                                            {currentQuestionIndex < activeQuiz.length - 1 ? (
                                                                <Button
                                                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                                                    disabled={quizAnswers[currentQuestionIndex] === undefined}
                                                                    className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-12 bg-slate-900 dark:bg-slate-700 text-white hover:bg-black dark:hover:bg-slate-600 transition-all font-sans"
                                                                >
                                                                    Next Question
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    onClick={handleQuizSubmit}
                                                                    disabled={Object.keys(quizAnswers).length < activeQuiz.length}
                                                                    className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-12 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                                >
                                                                    Submit Assessment
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={() => setIsQuizOpen(false)}
                                                            className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors py-2 mb-8"
                                                        >
                                                            Exit validation and return to documentation
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 pb-12 transition-all">
                                            <div className="prose prose-slate dark:prose-invert max-w-none transition-colors">
                                                {(() => {
                                                    if (!isSubmitted) {
                                                        if (hasContent) {
                                                            // Still Drafting case
                                                            return (
                                                                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 transition-all group p-10">
                                                                    <Pencil className="w-16 h-16 mb-8 text-slate-300 dark:text-slate-500 opacity-30 transition-colors" />
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-tight transition-colors">Still Drafting</h3>
                                                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-[320px] text-center leading-relaxed italic transition-colors">
                                                                        The contributor is currently crafting this documentation. Please check back later.
                                                                    </p>
                                                                </div>
                                                            );
                                                        } else {
                                                            // No Content yet drafted
                                                            return (
                                                                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 transition-all p-10">
                                                                    <FileText className="w-16 h-16 mb-8 opacity-30 text-slate-300 dark:text-slate-500 transition-colors" />
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-tight transition-colors">No Content</h3>
                                                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-[320px] text-center leading-relaxed italic transition-colors">
                                                                        This section is currently empty. The contributor hasn't started the draft yet.
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    } else {
                                                        // Submitted case
                                                        if (hasContent) {
                                                            return <MarkdownRenderer content={section.content} />;
                                                        } else {
                                                            return (
                                                                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 transition-all p-10">
                                                                    <FileSearch className="w-16 h-16 mb-8 opacity-30 text-slate-300 dark:text-slate-500 transition-colors" />
                                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-tight transition-colors">Empty Documentation</h3>
                                                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-[320px] text-center leading-relaxed italic transition-colors">
                                                                        This section was submitted but contains no documentation.
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resource and Discussion Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch pb-5">
                                {/* Left Side Stack: Attachments and Links */}
                                <div className="flex flex-col gap-5">
                                    {/* Attachments Card */}
                                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col transition-colors">
                                        <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                            <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Paperclip className="w-3.5 h-3.5" /> Attachments
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {!isSubmitted ? (
                                                <div className="py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-900/20 flex flex-col items-center justify-center gap-3 opacity-50 transition-colors">
                                                    <Lock className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Locked during draft</p>
                                                </div>
                                            ) : (section.attachments || []).length === 0 ? (
                                                <div className="text-center py-8 opacity-40">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">No documents available</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(section.attachments || []).map((att, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-slate-200 transition-all shadow-sm">
                                                            <div className="flex items-center gap-3 overflow-hidden text-clip">
                                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm shrink-0 transition-colors">
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-none mb-1 transition-colors">{att.fileName}</p>
                                                                    <p className="text-[9px] font-semibold text-slate-400 uppercase italic tracking-widest transition-colors leading-none">{att.fileSize}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
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
                                                                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Reference Links Card */}
                                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col transition-colors">
                                        <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                            <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <LinkIcon className="w-3.5 h-3.5" /> Reference links
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {!isSubmitted ? (
                                                <div className="py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-900/20 flex flex-col items-center justify-center gap-3 opacity-50 transition-colors text-center">
                                                    <Lock className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-2" />
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Protected during draft</p>
                                                </div>
                                            ) : (section.links || []).length === 0 ? (
                                                <div className="text-center py-8 opacity-40">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">No reference links</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(section.links || []).map((link, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-slate-200 transition-all shadow-sm">
                                                            <div className="flex items-center gap-3 overflow-hidden text-clip flex-1">
                                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm shrink-0 transition-colors">
                                                                    <LinkIcon className="w-4 h-4" />
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-none mb-1 transition-colors">{link.title}</p>
                                                                    <p 
                                                                        className="text-[9px] font-bold text-primary dark:text-primary/90 truncate hover:underline cursor-pointer transition-colors leading-none" 
                                                                        onClick={() => window.open(link.url, '_blank')}
                                                                    >
                                                                        {link.url}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 shrink-0"
                                                                onClick={() => window.open(link.url, '_blank')}
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Side: Discussion Card */}
                                <div className="flex flex-col">
                                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-full transition-colors min-h-[400px]">
                                        <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors sticky top-0 z-10">
                                            <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                                <MessageSquare className="w-3.5 h-3.5" /> Discussion
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                                            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 max-h-[450px]">
                                                {(section.comments || []).length === 0 ? (
                                                    <div className="text-center py-20 flex flex-col items-center justify-center min-h-[160px] gap-3 transition-colors">
                                                        <MessageSquare className="w-10 h-10 text-slate-200 dark:text-slate-800 transition-colors" />
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 transition-colors uppercase tracking-[0.2em]">No conversation yet</p>
                                                            <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 transition-colors uppercase italic tracking-widest">Type below to start</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    section.comments.map((c, idx) => (
                                                        <div key={idx} className="flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50 transition-all shadow-sm hover:border-slate-200">
                                                            <div className="flex justify-between items-center transition-colors">
                                                                <span className="text-[10px] font-black uppercase text-primary transition-colors tracking-[0.15em]">{c.userName}</span>
                                                                <div className="flex items-center gap-1.5 opacity-60">
                                                                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                                                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest italic transition-colors">
                                                                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-colors italic leading-relaxed">{c.text}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <CardFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex gap-2 shrink-0 transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                                                <Input
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Type here..."
                                                    className="h-12 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-primary/20 dark:text-slate-200 transition-all border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2"
                                                />
                                                <Button
                                                    onClick={handleAddComment}
                                                    disabled={!commentText.trim()}
                                                    size="icon"
                                                    className="h-12 w-12 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 shrink-0 transition-all active:scale-90 flex items-center justify-center"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </Button>
                                            </CardFooter>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-300 dark:text-slate-700 space-y-6 transition-colors text-center animate-in zoom-in-95 duration-500">
                            <Layers className="w-20 h-20 opacity-10 transition-colors animate-pulse" />
                            <div className="space-y-1">
                                <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-400 dark:text-slate-500 transition-colors">Explorer</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600 transition-colors italic">Please select a section to begin review</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <AIOnboardingConcierge project={project} />
        </div>
    );
}

function StatusIcon({ status }) {
    switch (status) {
        case 'Understood': return <CheckCircle2 className="w-3 h-3 text-emerald-500 transition-colors" />;
        case 'Needs Clarification': return <AlertCircle className="w-3 h-3 text-orange-500 transition-colors" />;
        case 'In Progress': return <RotateCcw className="w-3 h-3 text-primary animate-spin-slow transition-colors" />;
        case 'Presented': return <MessageSquare className="w-3 h-3 text-amber-500 transition-colors" />;
        case 'Ready for Review': return <Search className="w-3 h-3 text-primary transition-colors" />;
        case 'Active': return <CheckCircle2 className="w-3 h-3 text-primary transition-colors" />;
        case 'Draft': return <Clock className="w-3 h-3 text-slate-400 transition-colors" />;
        default: return <Clock className="w-3 h-3 text-slate-300 dark:text-slate-700 transition-colors" />;
    }
}
