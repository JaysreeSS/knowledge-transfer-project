import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, 
    X, 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    Minimize2, 
    Maximize2,
    Loader2,
    Zap,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AIOnboardingConcierge({ project }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: `Hi **${user?.name}**! I'm your AI Onboarding Concierge for **${project?.name}**. I've analyzed the documentation, tech stack, and resources to help you get up to speed. How can I assist you today?` 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = {
                projectName: project?.name,
                projectDescription: project?.description,
                techStack: project?.techStack || [],
                documentationCount: project?.sections?.length || 0,
                userRole: user?.ktRole || 'Receiver'
            };

            const responseData = await AIService.getChatResponse({
                message: userMessage.content,
                role: user?.ktRole || 'Receiver',
                mode: 'CONCIERGE',
                projectContext: {
                    name: project?.name,
                    description: project?.description,
                    techStack: project?.techStack || []
                },
                sectionContext: context
            });
            
            setMessages(prev => [...prev, { role: 'assistant', content: responseData.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-110 transition-all z-[100] group overflow-hidden border-2 border-white/20"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-purple-600 to-primary animate-gradient-xy group-hover:opacity-100 opacity-90 transition-opacity" />
                <Bot className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </Button>
        );
    }

    return (
        <Card className={`fixed bottom-6 right-6 z-[100] border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl ${isMinimized ? 'w-72 h-14' : 'w-[400px] h-[580px] max-h-[85vh]'}`}>
            <CardHeader className="p-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">AI Concierge</CardTitle>
                            {!isMinimized && <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Always Active</span>
                            </div>}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600" onClick={() => setIsMinimized(!isMinimized)}>
                            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500" onClick={() => setIsOpen(false)}>
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {!isMinimized && (
                <>
                    <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                        >
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`flex gap-3 max-w-[88%] ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${m.role === 'assistant' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-[10px]'}`}>
                                            {m.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className={`p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-sm transition-colors ${m.role === 'assistant' ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                                            {m.role === 'assistant' ? (
                                                <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/10 prose-headings:text-xs prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-widest max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                                </div>
                                            ) : m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%] items-center animate-pulse">
                                        <div className="w-7 h-7 rounded-lg bg-primary/5 border border-primary/20 text-primary flex items-center justify-center">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                                            Analyzing documentation...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col gap-2 shrink-0 transition-colors">
                        <form 
                            className="flex gap-2 w-full"
                            onSubmit={handleSendMessage}
                        >
                            <Input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question about this project..."
                                className="h-11 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary/20 transition-all"
                            />
                            <Button size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={!input.trim() || isLoading}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                                <Sparkles className="w-2.5 h-2.5 text-primary" /> RAG-Enabled Intelligence
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest transition-colors">Gemini Pro 1.5</span>
                                <Info className="w-2.5 h-2.5 text-slate-300 dark:text-slate-700" />
                            </div>
                        </div>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
