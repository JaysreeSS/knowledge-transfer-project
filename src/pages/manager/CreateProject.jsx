import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, ChevronRight, ChevronLeft, ArrowLeft, UserPlus, FileText, Trash2, ShieldCheck, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProject() {
    const { user } = useAuth();
    const { users, templates } = useAdmin();
    const { createProject } = useProjects();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        deadline: '',
        members: [], // { userId, ktRole, functionalRole }
        sections: [] // { id, title, contributorId }
    });



    // Auto-calculate deadline based on settings
    useEffect(() => {
        if (!formData.deadline) {
            const days = parseInt(localStorage.getItem('p_default_period') || '30');
            const date = new Date();
            date.setDate(date.getDate() + days);
            const formatted = date.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, deadline: formatted }));
        }
    }, [formData.name]); // Trigger when name starts being typed

    const availableUsers = users.filter(u => !u.isAdmin && u.role !== 'System Admin');

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleMember = (u) => {
        if (formData.members.find(m => m.userId === u.id)) {
            setFormData({ ...formData, members: formData.members.filter(m => m.userId !== u.id) });
        } else {
            setFormData({
                ...formData,
                members: [...formData.members, { userId: u.id, name: u.name, ktRole: 'Contributor', functionalRole: u.role }]
            });
        }
    };

    const updateMemberRole = (userId, ktRole) => {
        // Enforce max 2 initiators
        if (ktRole === 'Initiator') {
            const currentInitiators = formData.members.filter(m => m.ktRole === 'Initiator').length;
            const isAlreadyInitiator = formData.members.find(m => m.userId === userId)?.ktRole === 'Initiator';
            if (currentInitiators >= 2 && !isAlreadyInitiator) {
                toast.error('You can select only up to 2 Initiators.');
                return;
            }
        }
        setFormData({
            ...formData,
            members: formData.members.map(m => m.userId === userId ? { ...m, ktRole } : m)
        });
    };

    const toggleSection = (template) => {
        if (formData.sections.find(s => s.id === template.id)) {
            setFormData({ ...formData, sections: formData.sections.filter(s => s.id !== template.id) });
        } else {
            setFormData({
                ...formData,
                sections: [...formData.sections, { id: template.id, title: template.title, contributorId: '' }]
            });
        }
    };

    const assignContributor = (sectionId, contributorId) => {
        setFormData({
            ...formData,
            sections: formData.sections.map(s => s.id === sectionId ? { ...s, contributorId } : s)
        });
    };

    const handleSubmit = async () => {
        const projectData = {
            ...formData,
            managerId: user.id,
            managerName: user.name
        };
        await createProject(projectData);
        navigate('/dashboard');
    };

    return (
        <div className="p-4 sm:p-5 max-w-4xl mx-auto space-y-5 transition-colors">
            <div className="flex items-center justify-between transition-colors">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/manager/projects')}
                    className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all shrink-0"
                    title="Back to projects"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <div className="flex gap-2 transition-colors">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    ))}
                </div>
            </div>

            {step === 1 && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-4 border border-primary/10 dark:border-primary/20">
                            <FileText className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100">Project details</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Provide the core information about this transfer project.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 transition-colors">
                        <div className="space-y-2 transition-colors">
                            <Label htmlFor="name" className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 transition-colors">Project name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. NextGen Portal Migration"
                                className="h-10 text-sm font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary/20"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc" className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Description</Label>
                            <Textarea
                                id="desc"
                                placeholder="Provide context about the handover objective..."
                                className="min-h-[120px] resize-none text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium leading-relaxed"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-colors">
                            <div className="space-y-2 transition-colors">
                                <Label htmlFor="deadline" className="text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 transition-colors">Target deadline</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    className="h-10 text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold color-scheme-dark"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button onClick={handleNext} disabled={!formData.name} className="h-10 px-8 rounded-lg font-medium tracking-button bg-slate-900 dark:bg-primary text-white hover:bg-slate-800 dark:hover:bg-primary/90 shadow-sm transition-all text-sm">
                            Assign team <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 2 && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center mb-4 border border-orange-100 dark:border-orange-800">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100">Assign team & roles</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Select the stakeholders for this knowledge transfer.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {availableUsers.map(u => {
                                const selected = formData.members.find(m => m.userId === u.id);
                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => toggleMember(u)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${selected ? 'border-orange-500 dark:border-orange-600 bg-orange-50/40 dark:bg-orange-900/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${selected ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0 transition-colors">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors">{u.name}</p>
                                            <p className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 transition-colors">{u.role}</p>
                                        </div>
                                        {selected && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 transition-colors" />}
                                    </div>
                                );
                            })}
                        </div>

                        {formData.members.length > 0 && (
                            <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Define kt responsibilities</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {formData.members.map(m => (
                                        <div key={m.userId} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{m.name}</span>
                                            </div>
                                            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                                                {['Initiator', 'Contributor', 'Receiver']
                                                    .filter(role => !(m.functionalRole === 'Manager' && role === 'Receiver'))
                                                    .map(role => (
                                                        <button
                                                            key={role}
                                                            onClick={() => updateMemberRole(m.userId, role)}
                                                            className={`px-4 py-2 text-xs font-medium uppercase tracking-label rounded-md transition-all ${m.ktRole === role ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                                                                }`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                        <Button variant="ghost" onClick={handleBack} className="h-10 px-6 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs tracking-button">
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={formData.members.length === 0} className="h-10 px-8 rounded-lg font-medium tracking-button bg-slate-900 dark:bg-orange-600 text-white shadow-sm hover:bg-slate-800 dark:hover:bg-orange-700 transition-all text-sm">
                            Map sections <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 3 && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100">Section mapping</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Assign sections to their respective contributors.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map(t => {
                                const selected = formData.sections.find(s => s.id === t.id);
                                const currentContributorId = selected?.contributorId || '';

                                return (
                                    <div key={t.id} className={`p-6 rounded-xl border transition-all ${selected ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleSection(t)}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selected ? 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">{t.title}</span>
                                            </div>
                                            {selected && <Trash2 onClick={(e) => { e.stopPropagation(); toggleSection(t); }} className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors" />}
                                        </div>

                                        {selected && (
                                            <div className="space-y-4 pl-12 border-l border-emerald-100 dark:border-emerald-800 ml-4 pb-2">
                                                <Label className="text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-600">Assigned to</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.members.filter(m => m.ktRole !== 'Receiver').length === 0 ? (
                                                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800">No contributors/initiators available. Go back and assign roles.</p>
                                                    ) : (
                                                        formData.members.filter(m => m.ktRole !== 'Receiver').map(m => (
                                                            <button
                                                                key={m.userId}
                                                                onClick={() => assignContributor(t.id, m.userId)}
                                                                className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-label border transition-all ${currentContributorId === m.userId
                                                                    ? 'bg-emerald-600 dark:bg-emerald-700 border-emerald-600 dark:border-emerald-800 text-white shadow-sm'
                                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                                                                    }`}
                                                            >
                                                                {m.name} ({m.ktRole})
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                        <Button variant="ghost" onClick={handleBack} className="h-10 px-6 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs tracking-button">
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={formData.sections.length === 0 || formData.sections.some(s => !s.contributorId)}
                            className="h-10 px-8 rounded-lg font-medium bg-primary text-white shadow-sm hover:bg-primary/90 transition-all text-sm tracking-button"
                        >
                            Finalize & launch project
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
