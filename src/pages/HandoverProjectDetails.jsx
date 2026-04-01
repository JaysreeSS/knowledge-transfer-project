import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Lock,
    Unlock,
    AlertCircle,
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
    Zap,
    Activity,
    RefreshCw,
    Link as LinkIcon,
    ExternalLink,
    Code,
    Palette,
    LayoutDashboard,
    Table as TableIcon,
    Undo2,
    Redo2,
    Indent,
    Outdent,
    X,
    Info,
    Edit2,
    Pencil,
    Heading1,
    Heading2,
    Type,
    Sparkles,
    Quote,
    Highlighter,
    List,
    ListOrdered,
    Search,
    ThumbsUp,
    HelpCircle,
    RotateCcw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import LoadingScreen from '../components/LoadingScreen.jsx';
import logoSmall from '../assets/logo-small.png';
import logoLight from '/favicon-light.png';
import { useTheme } from '../contexts/ThemeContext.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import TechStackCard from '../components/TechStackCard.jsx';
import AIAssistant from '../components/AIAssistant.jsx';
import { AIService } from '../services/aiService';

// Advanced Markdown Renderer using industry-standard libraries
const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    // Custom Components for ReactMarkdown to handle Tailwind styling
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

export default function HandoverProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { projects, loading, updateSectionStatus, addComment, addAttachment, removeAttachment, addLink, removeLink, getReceiverCompletion, updateReceiverProgress, updateSectionClarity, updateProject, fetchProjects } = useProjects();
    const { theme } = useTheme();
    const { pushNotification } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const project = projects.find(p => p.id === projectId);
    
    // Determine the return path based on the current route prefix
    const isManagerRoute = location.pathname.startsWith('/manager');
    const returnPath = isManagerRoute ? '/manager/my-handovers' : '/icr/handovers';
    const backLabel = isManagerRoute ? 'Back to My Handovers' : 'Back to Handovers';

    useEffect(() => {
        if (projectId) {
            fetchProjects(true);
        }
    }, [projectId, fetchProjects]);

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
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [bulkLinks, setBulkLinks] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestReason, setRequestReason] = useState('Just wanted to edit');
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [isEvaluating, setIsEvaluating] = useState(false);
    
    // Table Designer State
    const [gridHover, setGridHover] = useState({ r: 0, c: 0 });
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isUnderstandOpen, setIsUnderstandOpen] = useState(false);
    const [manualGrid, setManualGrid] = useState({ rows: 3, cols: 2 });
    
    // Table management logic for raw markdown
    const getTableInfoAtCursor = () => {
        const textarea = document.getElementById('markdown-editor');
        if (!textarea) return null;
        
        const cursor = textarea.selectionStart;
        const text = content;
        
        // Find boundaries of the table
        let start = text.lastIndexOf('\n\n|', cursor);
        if (start === -1) start = text.startsWith('|') ? 0 : text.lastIndexOf('\n|', cursor);
        
        let end = text.indexOf('\n\n', cursor);
        if (end === -1) end = text.length;

        const tableText = text.substring(start, end).trim();
        if (!tableText.startsWith('|')) return null;

        const lines = tableText.split('\n');
        const rows = lines.filter(l => l.trim() !== '' && !l.includes('---'));
        if (rows.length === 0) return null;

        const colCount = rows[0].split('|').filter((_, i, a) => i > 0 && i < a.length - 1).length;
        
        // Find current row/col
        const relativeCursor = cursor - start;
        const textBeforeCursor = tableText.substring(0, relativeCursor);
        const currentRowIdx = textBeforeCursor.split('\n').length - 1;
        const currentLine = lines[currentRowIdx] || '';
        const currentColIdx = currentLine.substring(0, cursor - (text.lastIndexOf('\n', cursor) + 1)).split('|').length - 2;

        return { start, end, tableText, lines, rows, colCount, currentRowIdx, currentColIdx };
    };

    const handleTableAction = (action) => {
        const info = getTableInfoAtCursor();
        if (!info) {
            toast.error('Place cursor inside a table to modify it');
            return;
        }

        const { start, end, lines, currentColIdx, currentRowIdx } = info;
        saveHistory();

        let newLines = [...lines];
        
        if (action === 'addRow') {
            const separatorIdx = newLines.findIndex(l => l.includes('---'));
            const targetIdx = Math.max(separatorIdx + 1, currentRowIdx + 1);
            const newRow = '| ' + new Array(info.colCount).fill(' ').join(' | ') + ' |';
            newLines.splice(targetIdx, 0, newRow);
        } else if (action === 'addCol') {
            newLines = newLines.map(line => {
                if (line.includes('---')) return line.replace(/\|$/, ' --- |');
                const p = line.split('|');
                const target = Math.max(1, currentColIdx + 2);
                p.splice(target, 0, '   ');
                return p.join('|');
            });
        } else if (action === 'delRow') {
            if (newLines.length <= 2) return; // Don't delete last row + header
            newLines.splice(currentRowIdx, 1);
        } else if (action === 'delCol') {
            if (info.colCount <= 1) return;
            newLines = newLines.map(line => {
                const p = line.split('|');
                const target = Math.max(1, currentColIdx + 1);
                p.splice(target, 1);
                return p.join('|');
            });
        } else if (action === 'delTable') {
            setContent(content.substring(0, start) + content.substring(end));
            toast.success(`Table deleted`);
            return;
        }

        const newTable = newLines.join('\n');
        const before = content.substring(0, start);
        const after = content.substring(end);
        setContent(before + newTable + after);
        toast.success(`Table ${action} performed`);
    };
    const convertHtmlToMarkdown = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const cleanNode = (node) => {
            let text = "";
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    text += child.textContent;
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const tag = child.tagName.toLowerCase();
                    const inner = cleanNode(child);
                    
                    if (tag === 'b' || tag === 'strong') text += `**${inner}**`;
                    else if (tag === 'i' || tag === 'em') text += `_${inner}_`;
                    else if (tag === 'u') text += `<u>${inner}</u>`;
                    else if (tag === 'p' || tag === 'div' || tag === 'br') text += `\n${inner}\n`;
                    else if (tag === 'a') text += `[${inner}](${child.getAttribute('href') || '#'})`;
                    else if (tag === 'h1') text += `\n# ${inner}\n`;
                    else if (tag === 'h2') text += `\n## ${inner}\n`;
                    else if (tag === 'li') text += `\n- ${inner}`;
                    else text += inner;
                }
            });
            return text;
        };

        return cleanNode(doc.body).replace(/\n\s*\n/g, '\n\n').trim();
    };

    const handlePaste = (e) => {
        const html = e.clipboardData.getData('text/html');
        if (!html) return;

        const markdown = convertHtmlToMarkdown(html);
        if (!markdown) return;

        e.preventDefault();
        applyFormatting(markdown, '', '');
    };

    const saveHistory = () => {
        setHistory(prev => [...prev.slice(-19), content]);
        setRedoHistory([]);
    };

    const handleUndo = (e) => {
        if (e) e.preventDefault();
        if (history.length > 0) {
            const last = history[history.length - 1];
            setRedoHistory(prev => [...prev, content]);
            setHistory(prev => prev.slice(0, -1));
            setContent(last);
        }
    };

    const handleRedo = (e) => {
        if (e) e.preventDefault();
        if (redoHistory.length > 0) {
            const next = redoHistory[redoHistory.length - 1];
            setHistory(prev => [...prev, content]);
            setRedoHistory(prev => prev.slice(0, -1));
            setContent(next);
        }
    };

    const applyFormatting = (tag, endTag = '', placeholder = 'text') => {
        const textarea = document.getElementById('markdown-editor');
        if (!textarea) return;
        
        saveHistory();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end);
        const selectedText = content.substring(start, end);

        let newText;
        if (tag.includes('\n') || tag.startsWith('|') || tag === '---' || tag === '***' || tag === '___') {
            // Structural (Tables, HR, Code Blocks)
            newText = textBefore + tag + textAfter;
        } else {
            // Wrappers (Bold, Italic)
            const middle = selectedText || placeholder || (tag === '**' ? 'bold' : tag === '_' ? 'italic' : tag === '<u>' ? 'underline' : 'text');
            newText = textBefore + tag + middle + (endTag || tag) + textAfter;
        }

        setContent(newText);
        
        setTimeout(() => {
            textarea.focus();
            const placeholderLen = (placeholder || (tag === '**' ? 'bold' : tag === '_' ? 'italic' : tag === '<u>' ? 'underline' : 'text')).length;
            const newPos = (tag.includes('\n') || tag === '---' || tag === '***' || tag === '___') ? start + tag.length : start + tag.length + (selectedText ? selectedText.length : placeholderLen);
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    useEffect(() => {
        if (section) {
            setContent(section.content || '');
        }
    }, [selectedSectionId, project]);

    const handleSaveSection = async () => {
        const success = await updateSectionStatus(projectId, selectedSectionId, { content });
        if (success) {
            toast.success('Documentation saved successfully');
            setIsEditing(false);
        }
    };

    const handleIndent = (isIncrease = true) => {
        saveHistory();
        const textarea = document.getElementById('markdown-editor');
        const start = textarea.selectionStart;
        const text = content;
        const lines = text.split('\n');
        
        // Find current line index
        let currentLineIndex = 0;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1;
            if (charCount > start) {
                currentLineIndex = i;
                break;
            }
        }

        if (isIncrease) {
            lines[currentLineIndex] = '    ' + lines[currentLineIndex];
        } else {
            lines[currentLineIndex] = lines[currentLineIndex].replace(/^(\t|    |  )/, '');
        }

        setContent(lines.join('\n'));
    };

    const clearFormatting = () => {
        saveHistory();
        // Regex to strip all markup but keep nested text
        let cleanText = content
            .replace(/<\/?u>|<\/?span.*?>/g, '') // remove HTML tags
            .replace(/\*\*(.*?)\*\*/g, '$1') // remove Bold
            .replace(/\_(.*?)\_/g, '$1') // remove Italic
            .replace(/\~\~(.*?)\~\~/g, '$1') // remove Strike
            .replace(/^\#+\s/gm, '') // remove Headings
            .replace(/^\>\s/gm, '') // remove Quotes
            .replace(/\`{3,}[\s\S]*?\`{3,}/g, (m) => m.replace(/\`{3,}/g, '')) // basic code fence cleaning
            .replace(/\`(.+?)\`/g, '$1') // remove inline code
            .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // remove links
        
        setContent(cleanText);
    };

    const handleEditorKeyDown = (e) => {
        // Shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) handleRedo();
                    else handleUndo();
                    break;
                case 'y':
                    e.preventDefault();
                    handleRedo();
                    break;
                case 'b':
                    e.preventDefault();
                    applyFormatting('**');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormatting('_');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormatting('<u>', '</u>');
                    break;
            }
        }

        // List continuation logic
        if (e.key === 'Enter') {
            const textarea = e.target;
            const pos = textarea.selectionStart;
            const textBefore = content.substring(0, pos);
            const lastNewLine = textBefore.lastIndexOf('\n');
            const currentLine = textBefore.substring(lastNewLine + 1);
            
            const bulletMatch = currentLine.match(/^(\s*[\-\*])\s(.*)/);
            const numberMatch = currentLine.match(/^(\s*\d+\.)\s(.*)/);
            
            if (bulletMatch || numberMatch) {
                const prefix = bulletMatch ? bulletMatch[1] : numberMatch[1];
                const contentText = bulletMatch ? bulletMatch[2] : numberMatch[2];
                
                if (contentText.trim() === '') {
                    // Empty list item - clear line and end list
                    e.preventDefault();
                    const nextLineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
                    const newContent = content.substring(0, nextLineStart) + content.substring(pos);
                    setContent(newContent);
                    setTimeout(() => textarea.setSelectionRange(nextLineStart, nextLineStart), 0);
                } else {
                    // Continue list
                    e.preventDefault();
                    const newPrefix = numberMatch ? (parseInt(numberMatch[1]) + 1) + '. ' : prefix + ' ';
                    const insert = '\n' + newPrefix;
                    const newContent = content.substring(0, pos) + insert + content.substring(pos);
                    setContent(newContent);
                    setTimeout(() => textarea.setSelectionRange(pos + insert.length, pos + insert.length), 0);
                }
            }
        }
    };
    if (loading) return <LoadingScreen />;

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 transition-colors">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 transition-colors" />
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight transition-colors">Project Record Missing</h2>
            <Button onClick={() => navigate(returnPath)} className="rounded-xl">Return Back</Button>
        </div>
    );

    const userRole = project.members.find(m => m.userId === user.id)?.ktRole;
    const isContributor = section?.contributorId === user.id;
    const isReceiver = userRole === 'Receiver';
    const isInitiator = userRole === 'Initiator';
    const isDeadlinePassed = project.deadline && project.lifecycleMode === 'TRANSITION' ? new Date() > new Date(new Date(project.deadline).setHours(23, 59, 59, 999)) : false;
    const isReadOnly = project.lifecycleMode === 'TRANSITION' || isDeadlinePassed;

    const handleSave = async () => {
        if (section) {
            const hasChanged = content !== (section.content || '');
            const newStatus = (hasChanged && (section.status === 'Ready for Review' || section.status === 'Needs Clarification' || section.status === 'Understood')) ? 'Active' : section.status;
            
            setIsEvaluating(true);
            const success = await updateSectionStatus(projectId, section.id, newStatus, content);
            
            if (success) {
                // Trigger AI Clarity Checker
                const clarityData = await AIService.evaluateClarity(content);
                await updateSectionClarity(projectId, section.id, clarityData);

                // Tech Stack Extraction (if content is substantial)
                if (content.length > 300) {
                    const extractedStack = await AIService.extractTechStack(content);
                    if (extractedStack && extractedStack.length > 0) {
                        const currentStack = project.techStack || [];
                        
                        // Merge by name to avoid duplicates
                        const mergedStack = [...currentStack];
                        let addedCount = 0;
                        
                        extractedStack.forEach(newItem => {
                            if (!mergedStack.some(item => item.name.toLowerCase() === newItem.name.toLowerCase())) {
                                mergedStack.push(newItem);
                                addedCount++;
                            }
                        });

                        if (addedCount > 0) {
                            await updateProject(projectId, { techStack: mergedStack });
                            toast.success(`AI identified ${addedCount} new technologies: ${extractedStack.map(t => t.name).join(', ')}`);
                        }
                    }
                }

                toast.success('Documentation saved and AI evaluated for clarity');
                setIsEditing(false);
            }
            setIsEvaluating(false);
        }
    };

    const handleStatusUpdate = (newStatus) => {
        if (section) {
            updateSectionStatus(projectId, section.id, newStatus, content);
            
            // Notification Logic
            if (newStatus === 'Ready for Review') {
                const receivers = project.members.filter(m => m.ktRole === 'Receiver');
                receivers.forEach(r => {
                    pushNotification({
                        user_id: r.userId,
                        module: 'icr',
                        type: 'review',
                        title: 'Section ready for review',
                        body: `Section "${section.title}" in project "${project.name}" is now ready for your review.`,
                        project_id: projectId,
                        project_name: project.name
                    });
                });
            } else if (newStatus === 'Needs Clarification') {
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
            }
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
        const files = Array.from(e.target.files);
        if (files && files.length > 0 && section) {
            files.forEach(file => {
                addAttachment(projectId, section.id, {
                    fileName: file.name,
                    fileSize: (file.size / 1024).toFixed(1) + ' KB',
                    uploadedBy: user.name,
                    url: "#" // Mock URL
                });
            });
            toast.success(`${files.length} files attached.`);
        }
    };

    const handleImportLinks = () => {
        if (!bulkLinks.trim()) return;
        const links = bulkLinks.split('\n').filter(l => l.trim().length > 0);
        const addedCount = links.length;
        links.forEach(l => {
            let url = l.trim();
            if (!url.startsWith('http')) url = 'https://' + url;
            
            let title = url;
            try {
                const domain = new URL(url).hostname.replace('www.', '');
                title = domain.charAt(0).toUpperCase() + domain.slice(1);
            } catch(e) {}

            addLink(projectId, section.id, {
                title,
                url,
                createdBy: user.name
            });
        });
        setBulkLinks('');
        setIsLinkModalOpen(false);
        toast.success(`${addedCount} links imported.`);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            files.forEach(file => {
                addAttachment(projectId, section.id, {
                    fileName: file.name,
                    fileSize: (file.size / 1024).toFixed(1) + ' KB',
                    uploadedBy: user.name,
                    url: "#" // Mock URL
                });
            });
            toast.success(`${files.length} files attached.`);
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

    const handleRequestEdit = async () => {
        try {
            await pushNotification({
                user_id: project.managerId,
                module: 'manager',
                type: 'edit_request',
                title: 'Deadline Edit Request',
                body: `${user.name} requested to edit "${project.name}". Reason: ${requestReason}`,
                project_id: project.id,
                project_name: project.name
            });
            setIsRequestModalOpen(false);
            toast.success('Edit request sent to manager');
        } catch (error) {
            toast.error('Failed to send request');
        }
    };

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 bg-slate-50 dark:bg-slate-900/20 min-h-screen font-sans transition-colors pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(returnPath)}
                        className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all shrink-0 hidden md:flex"
                        title={backLabel}
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
                                {(project.status === 'Completed' || project.status === 'Signed Off') ? (project.lifecycleMode === 'ACTIVE' ? 'Active' : 'Signed off') : (project.status || 'Active')}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {project.deadline && project.lifecycleMode === 'TRANSITION' && (
                        isDeadlinePassed ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800/60 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group animate-pulse">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2 bg-slate-900 dark:bg-slate-800 text-white border-white/10 shadow-2xl rounded-xl" sideOffset={8}>
                                    <div className="flex items-center gap-2 text-[10px] font-bold whitespace-nowrap text-red-400 px-1">
                                        <Clock className="w-3 h-3" />
                                        Deadline <span className="text-white mx-0.5">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span> Passed
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                                <PopoverTrigger asChild>
                                    <div 
                                        className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/60 cursor-help hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                                        onMouseEnter={() => setIsInfoOpen(true)}
                                        onMouseLeave={() => setIsInfoOpen(false)}
                                    >
                                        <Info className="w-4 h-4" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent 
                                    className="w-auto p-3 bg-slate-900 text-white border-white/10 shadow-xl rounded-xl" 
                                    sideOffset={8}
                                    onMouseEnter={() => setIsInfoOpen(true)}
                                    onMouseLeave={() => setIsInfoOpen(false)}
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-bold whitespace-nowrap px-1">
                                        <Clock className="w-3 h-3 text-blue-400" />
                                        Deadline: <span className="text-blue-200 ml-0.5">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    )}
                    <Badge variant={project.lifecycleMode === 'TRANSITION' ? 'warning' : 'soft'} className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${project.lifecycleMode === 'TRANSITION' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
                        {project.lifecycleMode}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5 mb-10">
                {/* Left Sidebar: Sections List & Team */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-auto lg:pr-2">
                    {/* Sections List */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col">
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
                        <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
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
                                        <div className="flex justify-between items-start mb-1.5 transition-colors">
                                            <h4 className={`text-xs font-bold leading-snug transition-colors ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {s.title}
                                            </h4>
                                            {s.clarityScore > 0 && (
                                                <Badge className={`text-[8px] px-1 py-0 h-3.5 border-none font-bold ${s.clarityScore < 60 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                                    {s.clarityScore}%
                                                </Badge>
                                            )}
                                            {isAssigned && (
                                                <Badge className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800 text-[10px] px-2 py-0 font-bold uppercase tracking-widest pointer-events-none transition-colors">
                                                    You
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon status={s.status || (project.lifecycleMode === 'ACTIVE' ? 'Active' : 'Draft')} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-primary/70 dark:text-primary/80' : 'text-slate-400 dark:text-slate-500'}`}>
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
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors">{m.name}</p>
                                                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{m.functionalRole}</p>
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
                                                            <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 transition-colors">{rc}%</span>
                                                        </div>
                                                    );
                                                })()}
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

                {/* Right Content Area: Editor, Attachments, Discussion */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 h-auto pb-20">
                    {section ? (
                        <>
                            {/* Editor Section */}
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex-shrink-0">
                                <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10 transition-colors">
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">{section.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const assignee = project.members.find(m => m.userId === section.contributorId);
                                                if (!assignee) return (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-colors">
                                                        <UserCircle className="w-3 h-3" />
                                                        Unassigned
                                                    </div>
                                                );

                                                const isInitiator = assignee.ktRole === 'Initiator';
                                                const colorClass = isInitiator
                                                    ? 'bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/20 dark:border-primary/80'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800';

                                                return (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest border transition-colors ${colorClass}`}>
                                                        <UserCircle className="w-3 h-3" />
                                                        {assignee.ktRole}: {assignee.name}
                                                    </div>
                                                );
                                            })()}
                                            {isContributor && !isReadOnly && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-widest transition-colors">Your Responsibility</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isReadOnly && isContributor && !isEditing && (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm transition-all"
                                                title="Edit content"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {!isReadOnly && isContributor && isEditing && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setIsEditing(false); setContent(section.content || ''); }}
                                                    className="h-9 px-3 text-slate-400 hover:text-slate-600 font-medium"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSave}
                                                    className="bg-primary text-white hover:bg-primary/90 h-9 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
                                                >
                                                    <Save className="w-3.5 h-3.5" /> Save
                                                </Button>
                                            </div>
                                        )}
                                        {!isReadOnly && isContributor && section.status !== 'Understood' && !isEditing && (
                                            <div className="flex items-center gap-2">
                                                {section.status !== 'Active' && section.status !== 'Draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate('Not Started')}
                                                        className="h-9 px-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs font-bold uppercase tracking-widest"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleStatusUpdate('Ready for Review')}
                                                    disabled={!section.content || section.status === 'Ready for Review' || section.status === 'Needs Clarification'}
                                                    className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl h-9 px-4 font-medium text-sm shadow-sm"
                                                >
                                                    <Send className="w-3.5 h-3.5 mr-2" /> Submit
                                                </Button>
                                            </div>
                                        )}
                                        {!isReadOnly && isReceiver && section.status === 'Ready for Review' && (
                                            <div className="flex items-center gap-2">
                                                <Popover open={isUnderstandOpen} onOpenChange={setIsUnderstandOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            onClick={() => handleStatusUpdate('Understood')}
                                                            onMouseEnter={() => setIsUnderstandOpen(true)}
                                                            onMouseLeave={() => setIsUnderstandOpen(false)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-sm"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-1.5 px-3 bg-slate-900 text-white border-none shadow-xl rounded-lg" sideOffset={5}>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Understood</span>
                                                    </PopoverContent>
                                                </Popover>

                                                <Popover open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            onClick={() => handleStatusUpdate('Needs Clarification')}
                                                            onMouseEnter={() => setIsHelpOpen(true)}
                                                            onMouseLeave={() => setIsHelpOpen(false)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl border-orange-200 bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-400 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-sm"
                                                        >
                                                            <HelpCircle className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-1.5 px-3 bg-slate-900 text-white border-none shadow-xl rounded-lg" sideOffset={5}>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Request Clarification</span>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 min-h-[500px] flex flex-col">
                                    {/* Markdown Editor Toolbar (Always Visible) */}
                                    <div className={`flex flex-wrap items-center gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 transition-all ${!isEditing ? 'opacity-40 grayscale-[0.3]' : ''}`}>
                                        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-1.5 pl-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 px-2 flex items-center gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Headings" disabled={!isEditing}>
                                                        <Heading1 className="w-3.5 h-3.5" />
                                                        <ChevronLeft className="w-3 h-3 rotate-[-90deg] opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[120px] p-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                                                    {[1, 2, 3, 4, 5, 6].map(level => (
                                                        <Button 
                                                            key={level} 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="w-full justify-start font-bold text-xs h-8 px-2 hover:bg-primary/5 hover:text-primary"
                                                            onClick={() => applyFormatting('#'.repeat(level) + ' ', '')}
                                                        >
                                                            H{level} {level <= 2 ? 'Heading' : 'Sub'}
                                                        </Button>
                                                    ))}
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-1.5">
                                            {[
                                                { label: 'Bold', tag: '**', endTag: '**', icon: 'B' },
                                                { label: 'Italic', tag: '_', endTag: '_', icon: 'I' },
                                                { label: 'Underline', tag: '<u>', endTag: '</u>', icon: 'U' },
                                                { label: 'Strike', tag: '~~', endTag: '~~', icon: 'S' }
                                            ].map(b => (
                                                <Button key={b.label} variant="ghost" size="sm" className="h-7 w-7 p-0 text-[11px] font-bold hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={() => applyFormatting(b.tag, b.endTag)} disabled={!isEditing} title={b.label}>
                                                    <span className={b.label === 'Underline' ? 'underline' : b.label === 'Italic' ? 'italic' : b.label === 'Strike' ? 'line-through' : ''}>{b.icon}</span>
                                                </Button>
                                            ))}
                                            
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Font Color" disabled={!isEditing}>
                                                        <Palette className="w-3.5 h-3.5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[180px] p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        {['red', 'blue', 'green', 'orange', 'purple', 'rose', 'indigo', 'slate'].map(color => (
                                                            <div 
                                                                key={color} 
                                                                className="w-full aspect-square rounded cursor-pointer hover:ring-2 ring-primary/50 transition-all" 
                                                                style={{ backgroundColor: color === 'rose' ? '#e11d48' : color === 'indigo' ? '#4f46e5' : color }}
                                                                onClick={() => applyFormatting(`<span style="color:${color}">`, '</span>')}
                                                            />
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Highlight" disabled={!isEditing}>
                                                        <Highlighter className="w-3.5 h-3.5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[180px] p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        {['yellow', 'cyan', 'lime', 'pink', 'orange', 'gray', 'white', 'black'].map(color => (
                                                            <div 
                                                                key={color} 
                                                                className="w-full aspect-square rounded cursor-pointer border border-slate-100 dark:border-slate-800 hover:ring-2 ring-primary/50 transition-all" 
                                                                style={{ backgroundColor: color }}
                                                                onClick={() => applyFormatting(`<mark style="background-color:${color}; padding: 2px 4px; border-radius: 4px;">`, '</mark>')}
                                                            />
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        
                                        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-1.5">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Bullet List" onClick={() => applyFormatting('- ', '')} disabled={!isEditing}>
                                                <List className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Numbered List" onClick={() => applyFormatting('1. ', '')} disabled={!isEditing}>
                                                <ListOrdered className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Quote" onClick={() => applyFormatting('> ', '')} disabled={!isEditing}>
                                                <Quote className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={() => applyFormatting('***')} title="Horizontal Rule" disabled={!isEditing}>
                                                <div className="w-4 h-[1px] bg-current" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-1.5">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Outdent" onClick={() => handleIndent(false)} disabled={!isEditing}>
                                                <Outdent className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" title="Indent" onClick={() => handleIndent(true)} disabled={!isEditing}>
                                                <Indent className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-1.5">
                                            <Popover onOpenChange={() => setGridHover({ r: 0, c: 0 })}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 px-2 flex items-center gap-1.5 bg-primary/5 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 transition-all disabled:opacity-100" title="Table Tools" disabled={!isEditing}>
                                                        <TableIcon className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Table</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[240px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
                                                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <LayoutDashboard className="w-3 h-3 text-primary" /> Quick Grid
                                                        </p>
                                                        <div className="grid grid-cols-5 gap-2" onMouseLeave={() => setGridHover({ r: 0, c: 0 })}>
                                                            {Array.from({ length: 25 }).map((_, i) => {
                                                                const r = Math.floor(i / 5) + 1;
                                                                const c = (i % 5) + 1;
                                                                const isSelected = r <= gridHover.r && c <= gridHover.c;
                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        onMouseEnter={() => setGridHover({ r, c })}
                                                                        onClick={() => {
                                                                            let table = '|';
                                                                            for (let j = 0; j < c; j++) table += ` Header ${j + 1} |`;
                                                                            table += '\n|';
                                                                            for (let j = 0; j < c; j++) table += '---|';
                                                                            for (let row = 0; row < r; row++) {
                                                                                table += '\n|';
                                                                                for (let j = 0; j < c; j++) table += ' Cell |';
                                                                            }
                                                                            applyFormatting(table);
                                                                        }}
                                                                        className={`w-full aspect-square border-2 rounded-md cursor-pointer transition-all duration-150 ${isSelected ? 'bg-primary/20 border-primary scale-110 z-10 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                            <span>{gridHover.r > 0 ? `${gridHover.r} x ${gridHover.c}` : 'Hover to select'}</span>
                                                            {gridHover.r > 0 && <span className="text-primary animate-pulse">Click to Insert</span>}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                                                        <div className="pt-2 space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center opacity-50 italic">Quick Edit Table</p>
                                                            <div className="grid grid-cols-2 gap-2 px-1 pb-1">
                                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase hover:bg-primary/10" onClick={() => handleTableAction('addRow')}>+ Row</Button>
                                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase hover:bg-primary/10" onClick={() => handleTableAction('addCol')}>+ Column</Button>
                                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase hover:text-red-500 hover:bg-red-50" onClick={() => handleTableAction('delRow')}>- Row</Button>
                                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase hover:text-red-500 hover:bg-red-50" onClick={() => handleTableAction('delCol')}>- Column</Button>
                                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase col-span-2 text-red-600 hover:bg-red-50 mt-1" onClick={() => handleTableAction('delTable')}>Delete Table</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>



                                        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-1.5 pl-1.5">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={() => applyFormatting('[]()', '')} title="Link" disabled={!isEditing}>
                                                <LinkIcon className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={() => applyFormatting('```\n', '\n```')} title="Code Block" disabled={!isEditing}>
                                                <Code className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-slate-800 mr-1.5">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={handleUndo} title="Undo (Ctrl+Z)" disabled={!isEditing}>
                                                <Undo2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={handleRedo} title="Redo (Ctrl+Y)" disabled={!isEditing}>
                                                <Redo2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-100" onClick={clearFormatting} title="Clear Formatting" disabled={!isEditing}>
                                                <Type className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>

                                        <div className="flex-1" />

                                        <div className="flex items-center gap-0.5 pr-1.5">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 group relative flex items-center gap-2 pl-2 pr-3 bg-gradient-to-tr from-primary/10 to-purple-600/10 text-primary hover:from-primary hover:to-purple-600 hover:text-white rounded-xl border border-primary/20 hover:border-transparent hover:shadow-lg hover:shadow-primary/20 transition-all" 
                                                        title="AI Magic Documentation" 
                                                        disabled={!isEditing}
                                                    >
                                                        <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[340px] p-0 bg-transparent border-none shadow-none" align="end" sideOffset={12}>
                                                    <AIAssistant 
                                                        projectData={project}
                                                        sectionTitle={section?.title}
                                                        currentContent={content}
                                                        onApplyDraft={(aiContent) => {
                                                            saveHistory();
                                                            setContent(aiContent);
                                                            toast.success("AI content applied to editor!");
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>


                                    </div>

                                    {isEditing ? (
                                        <div className="flex-1 flex flex-col bg-slate-50/10 dark:bg-slate-900/10">
                                            <Textarea
                                                id="markdown-editor"
                                                value={content}
                                                onPaste={handlePaste}
                                                onChange={(e) => setContent(e.target.value)}
                                                onKeyDown={handleEditorKeyDown}
                                                placeholder="Write your detailed documentation here..."
                                                className="flex-1 min-h-[500px] w-full resize-none p-8 text-base leading-relaxed text-slate-700 dark:text-slate-200 bg-transparent border-none focus:ring-0 transition-all font-medium custom-scrollbar"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-8 pb-12 transition-all">
                                            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-a:text-primary prose-a:font-semibold">
                                                {section.content ? (
                                                    <div className="space-y-12">
                                                        <div className="text-slate-600 dark:text-slate-300">
                                                            <MarkdownRenderer content={section.content} />
                                                        </div>

                                                        {/* AI Clarity Insights Overlay - Premium Glassmorphic Design */}
                                                        {section.clarityScore > 0 && (
                                                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/[0.03] to-purple-500/[0.03] dark:from-primary/[0.08] dark:to-purple-500/[0.08] border border-primary/20 backdrop-blur-md space-y-6 animate-in slide-in-from-bottom-4 duration-700 relative overflow-hidden group/clarity shadow-lg shadow-primary/5">
                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity group-hover/clarity:opacity-100 opacity-50" />
                                                                
                                                                <div className="flex items-center justify-between relative z-10">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-primary/10">
                                                                             <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">AI Clarity Analysis</h4>
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section dynamic evaluation</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="h-12 w-px bg-primary/10" />
                                                                        <div className="text-right">
                                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Clarity Score</div>
                                                                            <div className="flex items-baseline gap-1">
                                                                                <span className={`text-3xl font-black tracking-tighter ${section.clarityScore < 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{section.clarityScore}</span>
                                                                                <span className="text-xs font-bold text-slate-400">/100</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {section.claritySuggestions?.length > 0 && (
                                                                    <div className="space-y-3 relative z-10">
                                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Actionable Improvements
                                                                        </p>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {section.claritySuggestions.map((suggestion, i) => (
                                                                                <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-slate-950/40 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100/50 dark:border-primary/10 transition-all hover:border-primary/30 group/item">
                                                                                    <div className="mt-1 w-2 h-2 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover/item:bg-primary/40 transition-colors">
                                                                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                                                                    </div>
                                                                                    {suggestion}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-80 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10">
                                                        <FileText className="w-12 h-12 mb-4 opacity-10 text-slate-900 dark:text-white" />
                                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">No content available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 items-start">
                                {/* Left Column: Attachments and Reference Links */}
                                <div className="flex flex-col gap-4">
                                    {/* Consolidated Resources Card (Attachments + Links) */}
                                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden shrink-0">
                                        <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                                <Paperclip className="w-3.5 h-3.5" /> Project Resources
                                            </CardTitle>
                                            {!isReadOnly && isContributor && (
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary gap-1.5" onClick={() => setIsLinkModalOpen(true)}>
                                                    <LinkIcon className="w-3 h-3" /> Add Links
                                                </Button>
                                            )}
                                        </CardHeader>
                                        
                                        <CardContent className="p-4 space-y-6 overflow-y-auto max-h-[500px] custom-scrollbar">
                                            {/* Unified Drag & Drop + Browse area */}
                                            {!isReadOnly && isContributor && (
                                                <div 
                                                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${isDragging ? 'bg-primary/5 border-primary scale-[1.01] shadow-lg' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={handleDrop}
                                                >
                                                    <input 
                                                        id="file-upload" type="file" className="hidden" 
                                                        onChange={handleFileUpload} 
                                                        multiple
                                                        accept=".doc,.docx,.pdf,.ppt,.pptx,.txt,.md,.js,.jsx,.ts,.tsx,.py,.go,.rb,.html,.css"
                                                    />
                                                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                                                            <Paperclip className={`w-5 h-5 ${isDragging ? 'animate-bounce' : ''}`} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                                                                {isDragging ? 'Drop to upload' : 'Drag & Drop files here'}
                                                            </p>
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none opacity-60">
                                                                or <span className="text-primary hover:underline">browse files</span>
                                                            </p>
                                                        </div>
                                                    </Label>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Attachments Section */}
                                                <div className="space-y-3">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                        <FileText className="w-3 h-3" /> Attachments
                                                    </h5>
                                                    {(section.attachments || []).length === 0 ? (
                                                        <p className="text-xs font-medium text-slate-300 dark:text-slate-700 uppercase tracking-widest italic py-4">No documents</p>
                                                    ) : (
                                                        (section.attachments || []).map((att) => (
                                                            <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-slate-200 transition-all">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="w-7 h-7 rounded bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                                                                        <FileText className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate tracking-tight transition-colors">{att.fileName}</p>
                                                                        <p className="text-[9px] font-semibold text-slate-400 transition-colors">{(att.fileSize / 1024).toFixed(1)} KB</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => window.open(att.url, '_blank')}>
                                                                        <Download className="w-3 h-3 text-slate-500" />
                                                                    </Button>
                                                                    {!isReadOnly && isContributor && (
                                                                        <Button variant="ghost" size="icon" className="w-7 h-7 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => removeAttachment(projectId, section.id, att.id)}>
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Links Section */}
                                                <div className="space-y-3">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                        <LinkIcon className="w-3 h-3" /> Quick Links
                                                    </h5>
                                                    {(section.links || []).length === 0 ? (
                                                        <p className="text-xs font-medium text-slate-300 dark:text-slate-700 uppercase tracking-widest italic py-4">No reference links</p>
                                                    ) : (
                                                        (section.links || []).map((link) => (
                                                            <div key={link.id} className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-slate-200 transition-all">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="w-7 h-7 rounded bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                                                                        <LinkIcon className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate tracking-tight transition-colors">{link.title}</p>
                                                                        <p className="text-[9px] font-semibold text-primary override-primary truncate hover:underline cursor-pointer" onClick={() => window.open(link.url, '_blank')}>{link.url}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => window.open(link.url, '_blank')}>
                                                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                                                    </Button>
                                                                    {!isReadOnly && isContributor && (
                                                                        <Button variant="ghost" size="icon" className="w-7 h-7 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => removeLink(projectId, section.id, link.id)}>
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column: Discussion */}
                                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-fit">
                                    <CardHeader className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row justify-between items-center transition-colors">
                                        <CardTitle className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" /> Discussion
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex flex-col overflow-y-auto max-h-[400px] custom-scrollbar">
                                        <div className="p-4 space-y-3">
                                            {(section.comments || []).length === 0 ? (
                                                <div className="text-center py-10 flex flex-col items-center justify-center min-h-[180px] gap-2 opacity-50 transition-colors">
                                                    <MessageSquare className="w-6 h-6 text-slate-200 dark:text-slate-700 transition-colors" />
                                                    <p className="text-xs font-medium text-slate-300 dark:text-slate-600 uppercase tracking-label transition-colors">No conversation yet</p>
                                                </div>
                                            ) : (
                                                section.comments.map((c, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1.5 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-all">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-semibold uppercase text-primary dark:text-primary transition-colors tracking-widest">{c.userName}</span>
                                                            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest transition-colors">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-colors">{c.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                    {!isReadOnly && (
                                        <CardFooter className="sticky bottom-0 z-10 p-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex gap-2 shrink-0 transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                                            <Input
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Reply here..."
                                                className="h-11 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus-visible:ring-primary/20 dark:text-slate-200 transition-all"
                                            />
                                            <Button
                                                onClick={handleAddComment}
                                                disabled={!commentText.trim()}
                                                size="icon"
                                                className="h-11 w-11 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0 transition-all active:scale-95"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 space-y-4 transition-colors">
                            <Layers className="w-16 h-16 opacity-10 transition-colors" />
                            <p className="font-semibold uppercase tracking-widest text-xs text-slate-400 dark:text-slate-500 transition-colors">Select a section to begin documentation</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Link Import Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-primary" /> Import External Links
                            </CardTitle>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Paste multiple links, one per line</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Textarea 
                                className="min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                                placeholder={"https://example.com\nhttps://google.com\n..."}
                                value={bulkLinks}
                                onChange={(e) => setBulkLinks(e.target.value)}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="ghost" onClick={() => setIsLinkModalOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Close</Button>
                            <Button onClick={handleImportLinks} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95">Import links</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Request Edit Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" /> Request Edit Permission
                            </CardTitle>
                            <CardDescription>
                                Select a reason why you need to modify this project after the deadline.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reason for request</Label>
                                <select 
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-slate-200"
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                >
                                    <option value="Extend deadline">Extend deadline</option>
                                    <option value="Just wanted to edit">Just wanted to edit</option>
                                    <option value="Incomplete documentation">Incomplete documentation</option>
                                    <option value="Need to add attachments">Need to add attachments</option>
                                    <option value="Clarification received">Clarification received</option>
                                </select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="ghost" onClick={() => setIsRequestModalOpen(false)} className="rounded-xl font-semibold">Cancel</Button>
                            <Button onClick={handleRequestEdit} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold tracking-tight">Send Request</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}

function StatusIcon({ status }) {
    switch (status) {
        case 'Understood': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
        case 'Needs Clarification': return <AlertCircle className="w-3 h-3 text-orange-500" />;
        case 'Ready for Review': return <Search className="w-3 h-3 text-primary" />;
        case 'Presented': return <MessageSquare className="w-3 h-3 text-amber-500" />;
        case 'Active': return <CheckCircle2 className="w-3 h-3 text-primary" />;
        case 'Draft': return <Clock className="w-3 h-3 text-slate-400" />;
        default: return <Clock className="w-3 h-3 text-slate-300" />;
    }
}
