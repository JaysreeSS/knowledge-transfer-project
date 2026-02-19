import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCog, ShieldCheck, User, FolderKanban, ChevronDown, ChevronUp, Zap, Trash2, Eye, EyeOff, AlertTriangle, X, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────
function DeleteConfirmDialog({ user, activeProjects = [], onConfirm, onCancel, isDeleting }) {
    if (!user) return null;
    const hasActiveProjects = activeProjects.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Dialog */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Close btn */}
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon + title */}
                <div className="p-6 pb-0 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${hasActiveProjects
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-red-50 border-red-100'
                        }`}>
                        <AlertTriangle className={`w-7 h-7 ${hasActiveProjects ? 'text-amber-500' : 'text-red-500'}`} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">Delete User Account</h2>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xs">
                        This will permanently remove <span className="font-semibold text-slate-800">{user.name}</span> and revoke their login access. This action cannot be undone.
                    </p>
                </div>

                {/* User info pill */}
                <div className="mx-6 mt-5 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{user.username} · <span className="capitalize">{user.role}</span></p>
                    </div>
                </div>

                {/* ── Active project warning ── */}
                {hasActiveProjects && (
                    <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-amber-200/60 bg-amber-100/50">
                            <TriangleAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                                Active in {activeProjects.length} project{activeProjects.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="px-3 py-2 space-y-1.5 max-h-36 overflow-y-auto">
                            {activeProjects.map(p => (
                                <div key={p.id} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span className="text-[11px] font-semibold text-amber-900 truncate">{p.name}</span>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 shrink-0">
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="px-3 py-2 border-t border-amber-200/60">
                            <p className="text-[10px] text-amber-700 leading-relaxed">
                                They will be <strong>removed from all projects</strong> and their assigned sections will become unassigned. You can reassign those sections afterwards.
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 h-10 rounded-xl font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-1 h-10 rounded-xl font-semibold text-white shadow-sm transition-all ${hasActiveProjects
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-red-500 hover:bg-red-600'
                            }`}
                    >
                        {isDeleting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Deleting…
                            </span>
                        ) : hasActiveProjects ? 'Yes, Remove & Delete' : 'Yes, Delete User'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserManagement({ isEmbedded = false }) {
    const { users, addUser, updateUser, deleteUser, isMockData } = useAdmin();
    const { projects } = useProjects();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedUserIds, setExpandedUserIds] = useState([]);

    // Delete dialog state
    const [deleteTarget, setDeleteTarget] = useState(null);       // full user object
    const [deleteActiveProjects, setDeleteActiveProjects] = useState([]); // active projects the target belongs to
    const [isDeleting, setIsDeleting] = useState(false);

    const PREDEFINED_ROLES = ['Developer', 'QA Engineer', 'Business Analyst', 'Support', 'Manager', 'System Admin'];
    const [isOtherRole, setIsOtherRole] = useState(false);
    const [customRole, setCustomRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',    // login identifier (used to log in to the app)
        email: '',       // email address for reminders/notifications only
        password: '',
        name: '',
        role: '',
        isAdmin: false
    });

    const handleSave = async () => {
        let finalRole = formData.role;

        if (isOtherRole) {
            if (!customRole.trim()) {
                toast.error('Please enter a custom role.');
                return;
            }
            const normalizedCustom = customRole.trim();
            if (PREDEFINED_ROLES.map(r => r.toLowerCase()).includes(normalizedCustom.toLowerCase())) {
                toast.error(`"${normalizedCustom}" is already a standard role. Please select it from the dropdown instead.`);
                return;
            }
            finalRole = normalizedCustom;
        }

        // Validation
        if (!formData.username || !formData.name || !finalRole) {
            toast.error('Please fill in all required fields (Username, Full Name, and Role).');
            return;
        }
        if (!editingId && !formData.password) {
            toast.error('Please enter a password for the new user.');
            return;
        }
        if (!editingId && formData.password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        const submissionData = {
            email: formData.email,
            username: formData.username,
            password: formData.password,
            name: formData.name,
            role: finalRole,
            isAdmin: finalRole === 'System Admin' || formData.isAdmin || false
        };

        let result;
        if (editingId) {
            result = await updateUser(editingId, submissionData);
        } else {
            result = await addUser(submissionData);
        }

        if (result.success) {
            toast.success(editingId
                ? 'User updated successfully.'
                : 'User created successfully! They can now log in with their email and password.'
            );
            resetForm();
        } else {
            toast.error(`Operation failed: ${result.error}`);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ username: '', email: '', password: '', name: '', role: '', isAdmin: false });
        setIsOtherRole(false);
        setCustomRole('');
        setShowPassword(false);
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        const isStandard = PREDEFINED_ROLES.includes(user.role);
        setFormData({
            email: user.email || '',
            username: user.username || '',
            password: '',
            name: user.name,
            role: isStandard ? user.role : 'other',
            isAdmin: user.isAdmin
        });
        if (!isStandard) {
            setIsOtherRole(true);
            setCustomRole(user.role);
        } else {
            setIsOtherRole(false);
            setCustomRole('');
        }
        setShowPassword(false);
        setIsAdding(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const result = await deleteUser(deleteTarget.id);
        setIsDeleting(false);
        setDeleteTarget(null);
        setDeleteActiveProjects([]);
        if (!result.success) {
            toast.error(`Failed to delete user: ${result.error}`);
        } else {
            toast.success('User deleted successfully.');
        }
    };

    // Compute active projects for a given user and open the delete dialog
    const openDeleteDialog = (e, user) => {
        e.stopPropagation();
        const active = projects.filter(p =>
            p.status !== 'Signed Off' &&
            (p.managerId === user.id || p.members.some(m => m.userId === user.id))
        ).map(p => ({ id: p.id, name: p.name, status: p.status }));
        setDeleteActiveProjects(active);
        setDeleteTarget(user);
    };

    return (
        <div className={`px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 ${isEmbedded ? 'px-0 py-0' : ''}`}>

            {/* Delete Confirm Dialog */}
            <DeleteConfirmDialog
                user={deleteTarget}
                activeProjects={deleteActiveProjects}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteActiveProjects([]); } }}
                isDeleting={isDeleting}
            />

            {!isEmbedded && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <header className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
                            Manage system users, assigned roles, and access controls.
                        </p>
                    </header>
                    {!isAdding && (
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-lg px-5 font-medium h-9 text-sm shrink-0 flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add User
                        </Button>
                    )}
                </div>
            )}

            {isMockData && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-amber-900 font-semibold text-sm">Demo Mode Active</h3>
                            <p className="text-amber-700/80 text-xs">Currently displaying mock data because the database is empty.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Form ── */}
            {isAdding && (
                <Card className="shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                        <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                            {editingId ? 'Edit User Profile' : 'Add New User'}
                        </CardTitle>
                        <CardDescription className="text-[11px] font-medium text-slate-400 mt-1">
                            {editingId
                                ? 'Update display name and assign functional roles.'
                                : 'Fill in details below. The user will be able to log in immediately with the provided credentials.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* 1. Username (login identifier) */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Username <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="e.g. user@ideassion.com"
                                    className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary/20"
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                    Used to log in to the app.
                                </p>
                            </div>

                            {/* 2. Password (only on create) */}
                            {!editingId && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min. 6 characters"
                                            className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary/20 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">User logs in with this password.</p>
                                </div>
                            )}

                            {/* 3. Full Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="border-slate-200 h-10 rounded-lg focus-visible:ring-primary/20"
                                />
                            </div>

                            {/* 4. Role */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    System Role <span className="text-red-400">*</span>
                                </label>
                                <div className="space-y-3">
                                    <select
                                        value={formData.role}
                                        onChange={e => {
                                            const newRole = e.target.value;
                                            setIsOtherRole(newRole === 'other');
                                            setFormData({ ...formData, role: newRole, isAdmin: newRole === 'System Admin' });
                                        }}
                                        className="w-full bg-white border border-slate-200 h-10 rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="Developer">Developer</option>
                                        <option value="QA Engineer">QA Engineer</option>
                                        <option value="Business Analyst">Business Analyst</option>
                                        <option value="Support">Support</option>
                                        <option value="Manager">Manager</option>
                                        <option value="System Admin">System Admin</option>
                                        <option value="other">Other...</option>
                                    </select>

                                    {isOtherRole && (
                                        <div className="animate-in slide-in-from-top-1 duration-200">
                                            <Input
                                                value={customRole}
                                                onChange={e => setCustomRole(e.target.value)}
                                                placeholder="Enter custom role"
                                                className="border-slate-200 h-10 rounded-lg text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 5. Email (for reminders only) */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="user@email.com"
                                    className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary/20"
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                    Used for automated email notifications.
                                </p>
                            </div>

                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end gap-3">
                        <Button variant="ghost" onClick={resetForm} className="rounded-lg font-medium px-4 h-9 text-sm transition-all">Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-lg px-6 font-medium h-9 text-sm">
                            {editingId ? 'Update Profile' : 'Create User'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* ── Categorized User List ── */}
            <div className="space-y-10 pb-20">
                {[
                    {
                        title: "Administrators",
                        items: users.filter(u => u.isAdmin || u.role === 'System Admin').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
                        icon: ShieldCheck,
                        color: "text-indigo-600",
                    },
                    {
                        title: "Managers & Team Leads",
                        items: users.filter(u => !u.isAdmin && u.role === 'Manager').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
                        icon: UserCog,
                        color: "text-emerald-600",
                    },
                    {
                        title: "Functional Team",
                        items: users.filter(u => !u.isAdmin && u.role !== 'Manager' && u.role !== 'System Admin').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
                        icon: User,
                        color: "text-blue-600",
                    }
                ].map((category) => category.items.length > 0 && (
                    <div key={category.title} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className={`p-1.5 rounded-md bg-white border border-slate-200 shadow-sm ${category.color}`}>
                                <category.icon className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{category.title}</h2>
                            <div className="h-[1px] flex-1 bg-slate-100 ml-4" />
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                {category.items.length} Users
                            </span>
                        </div>

                        <div className="grid gap-3">
                            {category.items.map((u) => {
                                const isExpanded = expandedUserIds.includes(u.id);
                                const isNonAdmin = !u.isAdmin && u.role !== 'System Admin';

                                const getGranularSectionProgress = (s) => {
                                    const hasText = !!s.content;
                                    const hasAttachments = (s.attachments || []).length > 0;
                                    const isReady = s.status === 'Ready for Review' || s.status === 'Understood';
                                    return (hasText ? 33 : 0) + (hasAttachments ? 33 : 0) + (isReady ? 34 : 0);
                                };

                                const userProjects = isNonAdmin ? projects.filter(p =>
                                    p.managerId === u.id ||
                                    p.members.some(m => m.userId === u.id)
                                ).map(p => {
                                    const membership = p.members.find(m => m.userId === u.id);
                                    const ktRole = membership?.ktRole || (p.managerId === u.id ? 'Manager' : 'Member');
                                    let status = 0;

                                    if (ktRole === 'Receiver') {
                                        const totalSections = p.sections.length;
                                        if (totalSections > 0) {
                                            const understood = p.sections.filter(s => s.status === 'Understood').length;
                                            status = Math.round((understood / totalSections) * 100);
                                        }
                                    } else if (ktRole === 'Manager') {
                                        status = p.completion || 0;
                                    } else if (ktRole === 'Contributor' || ktRole === 'Initiator') {
                                        const userSections = p.sections.filter(s => s.contributorId === u.id);
                                        if (userSections.length > 0) {
                                            const totalProgress = userSections.reduce((acc, s) => acc + getGranularSectionProgress(s), 0);
                                            status = Math.round(totalProgress / userSections.length);
                                        } else if (ktRole === 'Initiator') {
                                            status = p.completion || 0;
                                        }
                                    } else {
                                        status = p.completion || 0;
                                    }

                                    return { id: p.id, name: p.name, ktRole, status, projectStatus: p.status };
                                }) : [];

                                return (
                                    <div key={u.id} className="space-y-2">
                                        <Card
                                            className={`group transition-all duration-200 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white cursor-pointer ${isExpanded ? 'ring-1 ring-primary border-primary/20' : 'hover:border-slate-300 hover:shadow'}`}
                                            onClick={() => isNonAdmin && setExpandedUserIds(prev =>
                                                prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                                            )}
                                        >
                                            <div className="p-4 flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shrink-0 border border-slate-100">
                                                    <User className="w-4 h-4" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-slate-900 leading-none">{u.name}</h3>
                                                        <Badge variant="soft" className="capitalize">
                                                            {u.role || 'Contributor'}
                                                        </Badge>
                                                        {isNonAdmin && userProjects.length > 0 && (
                                                            <Badge variant="blue" className="text-[10px]">
                                                                {userProjects.length} Projects
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <p className="text-[11px] text-slate-400 font-medium">{u.username}</p>
                                                        <span className="text-slate-200">•</span>
                                                        <p className="text-[11px] text-slate-400 font-mono">{u.id.substring(0, 8)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Edit button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                                        onClick={(e) => { e.stopPropagation(); startEdit(u); }}
                                                    >
                                                        <UserCog className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* Delete button → opens dialog */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                                        onClick={(e) => openDeleteDialog(e, u)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {isNonAdmin && (
                                                        <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>

                                        {isExpanded && isNonAdmin && (
                                            <div className="px-3 pb-2 animate-in slide-in-from-top-1 duration-200">
                                                <Card className="border border-slate-200 shadow-md rounded-xl bg-slate-50/30 overflow-hidden">
                                                    <CardHeader className="p-4 bg-white/50 border-b border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <FolderKanban className="w-3.5 h-3.5 text-primary/70" />
                                                            <CardTitle className="text-xs font-semibold text-slate-700">Project Engagements</CardTitle>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                                                            {userProjects.length > 0 ? (
                                                                userProjects.map(proj => (
                                                                    <div key={proj.id} className="bg-white p-3 rounded-lg border border-slate-100 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-7 h-7 rounded-md bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                                                                <Zap className="w-3.5 h-3.5" />
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-xs font-semibold text-slate-800">{proj.name}</h4>
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <Badge variant="soft" className="text-[9px] py-0 px-1.5 h-4">{proj.ktRole}</Badge>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                                                                <span className="text-[10px] font-semibold text-slate-600">{proj.status}%</span>
                                                                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full transition-all duration-700 ${proj.status === 100 ? 'bg-emerald-500' : 'bg-primary/70'}`}
                                                                                        style={{ width: `${proj.status}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <Badge variant={proj.projectStatus === 'Completed' ? 'success' : 'blue'} className="text-[9px] h-5">
                                                                                {proj.projectStatus}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="py-8 text-center">
                                                                    <p className="text-[11px] font-medium text-slate-400">No active project engagements found.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
