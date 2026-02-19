import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, ChevronRight, ChevronLeft, UserPlus, FileText, Trash2, ShieldCheck, UserCircle } from 'lucide-react';
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
        <div className="p-4 sm:p-5 max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/manager/projects')}
                    className="h-8 px-0 text-slate-500 hover:text-primary hover:bg-transparent font-semibold text-xs transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Projects
                </Button>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            {step === 1 && (
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 border border-primary/10">
                            <FileText className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Project Details</CardTitle>
                        <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">Provide the core information about this transfer project.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. NextGen Portal Migration"
                                className="h-10 text-sm font-semibold border-slate-200 focus:ring-primary/20"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</Label>
                            <Textarea
                                id="desc"
                                placeholder="Provide context about the handover objective..."
                                className="min-h-[120px] resize-none text-sm border-slate-200 font-medium leading-relaxed"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Deadline (Optional)</Label>
                            <Input
                                id="deadline"
                                type="date"
                                className="h-10 text-sm border-slate-200 font-semibold"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <Button onClick={handleNext} disabled={!formData.name} className="h-10 px-8 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all uppercase tracking-widest text-[10px]">
                            Assign Team <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 2 && (
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 border border-orange-100">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Assign Team & Roles</CardTitle>
                        <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">Select the stakeholders for this knowledge transfer.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {availableUsers.map(u => {
                                const selected = formData.members.find(m => m.userId === u.id);
                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => toggleMember(u)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${selected ? 'border-orange-500 bg-orange-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{u.role}</p>
                                        </div>
                                        {selected && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>

                        {formData.members.length > 0 && (
                            <div className="space-y-4 pt-8 border-t border-slate-100">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Define KT Responsibilities</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {formData.members.map(m => (
                                        <div key={m.userId} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-sm text-slate-900">{m.name}</span>
                                            </div>
                                            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                                {['Initiator', 'Contributor', 'Receiver']
                                                    .filter(role => !(m.functionalRole === 'Manager' && role === 'Receiver'))
                                                    .map(role => (
                                                        <button
                                                            key={role}
                                                            onClick={() => updateMemberRole(m.userId, role)}
                                                            className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${m.ktRole === role ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
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
                    <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                        <Button variant="ghost" onClick={handleBack} className="h-10 px-6 font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest text-[10px]">
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={formData.members.length === 0} className="h-10 px-8 rounded-lg font-bold bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]">
                            Map Sections <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 3 && (
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 border border-emerald-100">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Section Mapping</CardTitle>
                        <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">Assign sections to their respective contributors.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map(t => {
                                const selected = formData.sections.find(s => s.id === t.id);
                                const currentContributorId = selected?.contributorId || '';

                                return (
                                    <div key={t.id} className={`p-6 rounded-xl border transition-all ${selected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 bg-white'}`}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleSection(t)}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-slate-900">{t.title}</span>
                                            </div>
                                            {selected && <Trash2 onClick={(e) => { e.stopPropagation(); toggleSection(t); }} className="w-4 h-4 text-slate-300 cursor-pointer hover:text-red-500 transition-colors" />}
                                        </div>

                                        {selected && (
                                            <div className="space-y-4 pl-12 border-l border-emerald-100 ml-4 pb-2">
                                                <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">ASSIGNED TO</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.members.filter(m => m.ktRole !== 'Receiver').length === 0 ? (
                                                        <p className="text-xs text-orange-600 font-bold bg-orange-50 p-3 rounded-lg border border-orange-100">No contributors/initiators available. Go back and assign roles.</p>
                                                    ) : (
                                                        formData.members.filter(m => m.ktRole !== 'Receiver').map(m => (
                                                            <button
                                                                key={m.userId}
                                                                onClick={() => assignContributor(t.id, m.userId)}
                                                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${currentContributorId === m.userId
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
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
                    <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                        <Button variant="ghost" onClick={handleBack} className="h-10 px-6 font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest text-[10px]">
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={formData.sections.length === 0 || formData.sections.some(s => !s.contributorId)}
                            className="h-10 px-8 rounded-lg font-bold bg-primary text-white shadow-sm hover:bg-primary/90 transition-all uppercase tracking-widest text-[10px]"
                        >
                            Finalize & Launch Project
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
