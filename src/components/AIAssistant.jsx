import React, { useState } from 'react';
import { 
    Sparkles, 
    Send, 
    Wand2, 
    Zap, 
    FileText, 
    RotateCcw, 
    Check, 
    X, 
    BrainCircuit,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AIService } from '../services/aiService';

export default function AIAssistant({ 
    projectData, 
    sectionTitle, 
    currentContent, 
    onApplyDraft 
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [draft, setDraft] = useState('');
    const [mode, setMode] = useState('draft'); // 'draft' | 'polish' | 'summarize'

    const generateAIDraft = async () => {
        setIsGenerating(true);
        setDraft('');
        
        try {
            const aiDraft = await AIService.generateDraft({
                projectName: projectData?.name,
                description: projectData?.description,
                techStack: projectData?.techStack,
                sectionTitle: sectionTitle
            });
            
            setDraft(aiDraft);
            toast.success("AI Draft generated successfully!");
        } catch (error) {
            toast.error("Failed to generate AI draft. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const polishText = async () => {
        if (!currentContent) {
            toast.error("Please add some content first to polish.");
            return;
        }
        setIsGenerating(true);
        setDraft('');

        try {
            const polished = await AIService.polishContent(currentContent);
            setDraft(polished);
            toast.success("Content refined!");
        } catch (error) {
            toast.error("Failed to polish content. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-200 dark:border-primary/10">
            <CardHeader className="p-6 bg-gradient-to-br from-primary/[0.08] via-purple-500/[0.05] to-transparent border-b border-slate-100 dark:border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12" />
                <div className="flex items-center justify-between relative z-10">
                    <CardTitle className="text-sm font-black flex items-center gap-3 text-primary uppercase tracking-[0.15em]">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-primary/10">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                        KT-AI Documentation
                    </CardTitle>
                    <Badge variant="outline" className="bg-primary text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg shadow-primary/20">PRO</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 relative z-10">
                {!draft && !isGenerating ? (
                    <div className="space-y-4">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wide">
                            Select an AI generation mode to enhance your project documentation.
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="justify-start h-auto py-4 px-4 bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/5 group transition-all rounded-2xl group/btn shadow-sm"
                                onClick={() => { setMode('draft'); generateAIDraft(); }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover/btn:bg-emerald-500/20 group-hover/btn:scale-110 transition-all shadow-sm">
                                        <Wand2 className="w-4 h-4" />
                                    </div>
                                    <div className="text-left space-y-0.5">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Generate Draft</p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-black">Meta-data synthesis</p>
                                    </div>
                                </div>
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="justify-start h-auto py-4 px-4 bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/5 group transition-all rounded-2xl group/btn shadow-sm"
                                onClick={() => { setMode('polish'); polishText(); }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 group-hover/btn:bg-blue-500/20 group-hover/btn:scale-110 transition-all shadow-sm">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div className="text-left space-y-0.5">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Refine & Polish</p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-black">Quality enhancement</p>
                                    </div>
                                </div>
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="justify-start h-auto py-4 px-4 bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/5 group transition-all rounded-2xl group/btn shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                onClick={() => toast.info("Resource Analysis coming soon!")}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 group-hover/btn:bg-purple-500/20 group-hover/btn:scale-110 transition-all shadow-sm">
                                        <BrainCircuit className="w-4 h-4" />
                                    </div>
                                    <div className="text-left space-y-0.5">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Resource Summary</p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-black">Automated indexing</p>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>
                ) : isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-pulse">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AI is thinking...</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Synthesizing ${mode} for "${sectionTitle}"</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Result Preview</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDraft('')}>
                                <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                            {draft}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest" onClick={() => setDraft('')}>
                                <X className="w-3.5 h-3.5 mr-2" /> Discard
                            </Button>
                            <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest" onClick={() => { onApplyDraft(draft); setDraft(''); }}>
                                <Check className="w-3.5 h-3.5 mr-2" /> Apply Changes
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium flex items-center gap-1.5">
                    <Zap className="w-2.5 h-2.5 text-primary fill-primary" /> Powered by DeepMind Gemini 1.5 Pro
                </p>
            </CardFooter>
        </Card>
    );
}
