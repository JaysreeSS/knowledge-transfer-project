import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2, Clock, Zap, ArrowRight, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TransitionHistoryTimeline({ projectId }) {
    const [transitions, setTransitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('project_transitions')
                .select('*')
                .eq('project_id', projectId)
                .order('started_at', { ascending: false });

            if (!error && data) {
                setTransitions(data);
            }
            setLoading(false);
        };

        if (projectId) fetchHistory();
    }, [projectId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-50 grayscale transition-all">
            <History className="w-8 h-8 animate-spin text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Retrieving Timeline...</p>
        </div>
    );

    if (transitions.length === 0) return (
        <div className="py-16 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/10 text-center gap-3">
            <History className="w-10 h-10 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">No transition history recorded</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Lifecycle Timeline
            </h3>

            <div className="relative pl-8 space-y-10 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 transition-colors max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {transitions.map((t, idx) => (
                    <div key={t.id} className="relative group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        {/* Status Node */}
                        <div className={`absolute -left-8 top-1 w-7 h-7 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center transition-all shadow-sm ${
                            t.status === 'COMPLETED' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-orange-500 shadow-orange-500/20'
                        }`}>
                            {t.status === 'COMPLETED' ? <CheckCircle2 size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg shadow-sm">{new Date(t.started_at).toLocaleDateString()}</span>
                                <Badge variant="soft" className="text-[9px] font-black uppercase tracking-widest border-none px-2 rounded-lg flex items-center gap-1 bg-primary/5 text-primary">
                                    <Zap size={10} /> {t.transition_type}
                                </Badge>
                                {t.status === 'COMPLETED' && (
                                    <Badge variant="soft" className="text-[9px] font-black uppercase tracking-widest border-none px-2 rounded-lg bg-emerald-50 text-emerald-600">Finalized</Badge>
                                )}
                            </div>

                            <Card className="border-slate-100 dark:border-slate-800 shadow-sm-bottom bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl group-hover:border-primary/20 transition-all">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 opacity-60">
                                        <User className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">Initiated by {t.initiator_id}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Scope</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">{t.scope}</span>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-200" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Receivers</span>
                                            <div className="flex -space-x-1">
                                                {(t.receiver_ids || []).map((rid, i) => (
                                                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                        {rid.charAt(0)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {t.completed_at && (
                                        <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Duration: {Math.round((new Date(t.completed_at) - new Date(t.started_at)) / (1000 * 60 * 60 * 24))} days</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
