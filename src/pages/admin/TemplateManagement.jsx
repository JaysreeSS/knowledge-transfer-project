import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, ChevronLeft, Layout, Lock, Info, ExternalLink, Paperclip, Loader2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function TemplateManagement({ isEmbedded = false }) {
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useAdmin();
    const navigate = useNavigate();
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState(null);

    const handleAdd = async () => {
        if (!newTitle.trim()) return;

        setSaving(true);
        if (editingId) {
            await updateTemplate(editingId, {
                title: newTitle.trim(),
                description: newDescription,
                input_type: ['text', 'file']
            });
            setEditingId(null);
        } else {
            await addTemplate({
                title: newTitle.trim(),
                description: newDescription,
                input_type: ['text', 'file']
            });
        }

        setNewTitle('');
        setNewDescription('');
        setSaving(false);
    };

    const startEdit = (template) => {
        setEditingId(template.id);
        setNewTitle(template.title);
        setNewDescription(template.description || '');
    };

    const moveTemplateUp = async (template, currentIndex) => {
        if (currentIndex === 0) return;
        const sortedTemplates = [...templates].sort((a, b) => (a.order || 0) - (b.order || 0));
        const prevTemplate = sortedTemplates[currentIndex - 1];

        // Swap orders
        await updateTemplate(template.id, { order: prevTemplate.order });
        await updateTemplate(prevTemplate.id, { order: template.order });
    };

    const moveTemplateDown = async (template, currentIndex) => {
        const sortedTemplates = [...templates].sort((a, b) => (a.order || 0) - (b.order || 0));
        if (currentIndex === sortedTemplates.length - 1) return;
        const nextTemplate = sortedTemplates[currentIndex + 1];

        // Swap orders
        await updateTemplate(template.id, { order: nextTemplate.order });
        await updateTemplate(nextTemplate.id, { order: template.order });
    };



    return (
        <div className={`px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 ${isEmbedded ? 'px-0 py-0' : ''}`}>

            {!isEmbedded && (
                <header className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Section Templates</h1>
                    <p className="text-slate-500 text-sm font-medium">Define and manage standardized sections for knowledge transfer projects.</p>
                </header>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Creation panel */}
                <div className="md:col-span-1">
                    <Card className="shadow-sm border border-slate-200 rounded-xl sticky top-8">
                        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/30">
                            <CardTitle className="text-sm font-bold text-slate-900">{editingId ? 'Edit Section Template' : 'New Section Template'}</CardTitle>
                            <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">{editingId ? 'Modify existing template details.' : 'Define a new required section.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Section Title</label>
                                <Input
                                    placeholder="e.g. Compliance Checks"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="border-slate-200 rounded-lg h-10 text-sm focus-visible:ring-primary/10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Instructions / Info</label>
                                <Textarea
                                    placeholder="Describe what information is needed..."
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    className="border-slate-200 rounded-lg min-h-[120px] resize-none text-sm focus-visible:ring-primary/10"
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={handleAdd}
                                    disabled={saving || !newTitle.trim()}
                                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-medium h-9 text-sm shadow-sm"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Save Section Template' : 'Add Section Template')}
                                </Button>
                                {editingId && (
                                    <Button
                                        onClick={() => {
                                            setEditingId(null);
                                            setNewTitle('');
                                            setNewDescription('');
                                        }}
                                        variant="ghost"
                                        className="w-full mt-2 h-9 text-slate-500 font-medium"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* List panel */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">Ordered Layout Sections</h3>
                        <Badge variant="soft" className="bg-slate-100 text-slate-500">{templates.length} Templates</Badge>
                    </div>

                    {templates.length === 0 && (
                        <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <Layout className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">No templates created yet.</p>
                        </div>
                    )}

                    <div className="grid gap-3">
                        {[...templates].sort((a, b) => (a.order || 0) - (b.order || 0)).map((t, idx, sortedArray) => (
                            <Card key={t.id} className="group hover:border-primary/20 transition-all border border-slate-200 shadow-sm rounded-xl bg-white">
                                <CardContent className="p-4 flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0 border border-slate-100">
                                            <Layout className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-slate-900">{t.title}</h4>
                                            {t.description && (
                                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-md line-clamp-2">{t.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Sequence {t.order || idx + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-400 disabled:opacity-20"
                                            onClick={() => moveTemplateUp(t, idx)}
                                            disabled={idx === 0}
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-400 disabled:opacity-20"
                                            onClick={() => moveTemplateDown(t, idx)}
                                            disabled={idx === sortedArray.length - 1}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-400" onClick={() => startEdit(t)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon"
                                            className={`h-8 w-8 rounded-md text-slate-400 transition-colors ${pendingDeleteTemplateId === t.id
                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    : 'hover:bg-red-50 hover:text-red-600'
                                                }`}
                                            onClick={() => {
                                                if (pendingDeleteTemplateId === t.id) {
                                                    deleteTemplate(t.id);
                                                    setPendingDeleteTemplateId(null);
                                                    toast.success('Template deleted.');
                                                } else {
                                                    setPendingDeleteTemplateId(t.id);
                                                    toast.warning('Click again to confirm template deletion.', { duration: 3000 });
                                                    setTimeout(() => setPendingDeleteTemplateId(prev => prev === t.id ? null : prev), 3000);
                                                }
                                            }}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
