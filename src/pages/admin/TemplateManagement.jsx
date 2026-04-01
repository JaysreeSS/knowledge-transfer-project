import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, ChevronLeft, Layout, Lock, Info, ExternalLink, Paperclip, Loader2, Pencil, ChevronUp, ChevronDown, Search } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');

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
        <div className={`px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ${isEmbedded ? 'px-0 py-0' : ''}`}>

            {!isEmbedded && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all">
                    <header className="space-y-1 transition-colors">
                        <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">Section templates</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">Define and manage standardized sections for knowledge transfer projects.</p>
                    </header>
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all font-medium dark:text-slate-200"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Creation panel */}
                <div className="md:col-span-1">
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/50 sticky top-8 transition-colors">
                        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                            <CardTitle className="text-lg font-semibold tracking-section-title text-slate-900 dark:text-slate-100">{editingId ? 'Edit section template' : 'New section template'}</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{editingId ? 'Modify existing template details.' : 'Define a new required section.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Section title</label>
                                <Input
                                    placeholder="e.g. Compliance Checks"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="border-slate-200 dark:border-slate-800 rounded-lg h-10 text-sm focus-visible:ring-primary/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Instructions / info</label>
                                <Textarea
                                    placeholder="Describe what information is needed..."
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    className="border-slate-200 dark:border-slate-800 rounded-lg min-h-[120px] resize-none text-sm focus-visible:ring-primary/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors font-medium leading-relaxed"
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={handleAdd}
                                    disabled={saving || !newTitle.trim()}
                                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-medium h-9 text-sm shadow-sm"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Save section template' : 'Add section template')}
                                </Button>
                                {editingId && (
                                    <Button
                                        onClick={() => {
                                            setEditingId(null);
                                            setNewTitle('');
                                            setNewDescription('');
                                        }}
                                        variant="ghost"
                                        className="w-full mt-2 h-9 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
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
                    <div className="flex items-center justify-between px-1 transition-colors">
                        <h3 className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 transition-colors">Ordered layout sections</h3>
                        <Badge variant="soft" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">{templates.length} Templates</Badge>
                    </div>

                    {templates.length === 0 && (
                        <div className="text-center py-20 text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                            <Layout className="w-10 h-10 mx-auto mb-4 opacity-20 transition-colors" />
                            <p className="text-sm font-medium transition-colors">No templates created yet.</p>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {[...templates].filter(t => 
                            t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ).sort((a, b) => (a.order || 0) - (b.order || 0)).map((t, idx, sortedArray) => (
                            <Card key={t.id} className="group hover:border-primary/20 transition-all border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-800/50">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 border border-slate-100 dark:border-slate-800 transition-colors">
                                            <Layout className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1 transition-colors flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors truncate">{t.title}</h4>
                                            {t.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-md line-clamp-2 transition-colors">{t.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 transition-colors">
                                                <span className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800 transition-colors">Sequence {t.order || idx + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 sm:ml-4 sm:pt-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 disabled:opacity-20"
                                            onClick={() => moveTemplateUp(t, idx)}
                                            disabled={idx === 0}
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 disabled:opacity-20"
                                            onClick={() => moveTemplateDown(t, idx)}
                                            disabled={idx === sortedArray.length - 1}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600" onClick={() => startEdit(t)}>
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
