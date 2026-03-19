import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCog, ShieldCheck, User, FolderKanban, Trash2, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/utils';

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
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Close btn */}
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon + title */}
                <div className="p-6 pb-0 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${hasActiveProjects
                        ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800'
                        : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800'
                        }`}>
                        <AlertTriangle className={`w-7 h-7 ${hasActiveProjects ? 'text-amber-500' : 'text-red-500'}`} />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">Delete User Account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs">
                        This will permanently remove <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span> and revoke their login access. This action cannot be undone.
                    </p>
                </div>

                {/* User info pill */}
                <div className="mx-6 mt-5 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium truncate">{user.username} · <span className="capitalize">{user.role}</span></p>
                    </div>
                </div>

                {/* ── Active project warning ── */}
                {hasActiveProjects && (
                    <div className="mx-6 mt-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 overflow-hidden animate-in fade-in duration-200 transition-colors">
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-amber-200/60 dark:border-amber-800/60 bg-amber-100/50 dark:bg-amber-900/40 transition-colors">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-200 uppercase tracking-label">
                                Active in {activeProjects.length} project{activeProjects.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="px-3 py-2 space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                            {activeProjects.map(p => (
                                <div key={p.id} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <AlertTriangle className="w-3 h-3 text-amber-500/70 dark:text-amber-500/50 shrink-0" />
                                        <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 truncate">{p.name}</span>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 shrink-0 transition-colors">
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="px-3 py-2 border-t border-amber-200/60 dark:border-amber-800/60 transition-colors">
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
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
                        className="flex-1 h-10 rounded-xl font-medium tracking-button border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-1 h-10 rounded-xl font-medium tracking-button text-sm text-white shadow-sm transition-all ${hasActiveProjects
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
                        ) : hasActiveProjects ? 'Yes, remove & delete' : 'Yes, delete user'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserManagement({ isEmbedded = false }) {
    const navigate = useNavigate();
    const { users, addUser, updateUser, deleteUser, isMockData } = useAdmin();
    const { projects } = useProjects();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedUserIds, setExpandedUserIds] = useState([]);
    const formRef = React.useRef(null);

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
        setIsAdding(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        if (!isStandard) {
            setIsOtherRole(true);
            setCustomRole(user.role);
        } else {
            setIsOtherRole(false);
            setCustomRole('');
        }
        setShowPassword(false);
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

    const openDeleteDialog = (e, user) => {
        e.stopPropagation();
        const active = projects.filter(p =>
            p.status !== 'Signed Off' &&
            (p.managerId === user.id || p.members.some(m => m.userId === user.id))
        ).map(p => ({ id: p.id, name: p.name, status: p.status }));
        setDeleteActiveProjects(active);
        setDeleteTarget(user);
    };

    const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
    const categories = [
        { title: 'System Administrators', items: sortedUsers.filter(u => u.isAdmin || u.role === 'System Admin') },
        { title: 'Managers', items: sortedUsers.filter(u => !u.isAdmin && u.role === 'Manager') },
        { title: 'Functional Roles', items: sortedUsers.filter(u => !u.isAdmin && u.role !== 'System Admin' && u.role !== 'Manager') },
    ];

    return (
        <div className={`px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 ${isEmbedded ? 'px-0 py-0' : ''}`}>
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
                        <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">User Management</h1>
                        <p className="text-muted-foreground dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg transition-colors">
                            Manage system users, assigned roles, and access controls.
                        </p>
                    </header>
                    {!isAdding && (
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-lg px-5 font-medium h-9 text-sm shrink-0 flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add user
                        </Button>
                    )}
                </div>
            )}

            {isMockData && (
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-amber-900 dark:text-amber-100 font-semibold text-sm">Demo Mode Active</h3>
                            <p className="text-amber-700/80 dark:text-amber-400/80 text-xs">Currently displaying mock data because the database is empty.</p>
                        </div>
                    </div>
                </div>
            )}

            {isAdding && (
                <div ref={formRef}>
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6">
                            <CardTitle className="text-lg font-semibold tracking-section-title text-slate-900 dark:text-slate-100">
                                {editingId ? 'Edit user profile' : 'Add new user'}
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground dark:text-slate-400 mt-1">
                                {editingId
                                    ? 'Update display name and assign functional roles.'
                                    : 'Fill in details below. The user will be able to log in immediately with the provided credentials.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500 transition-colors group-hover:text-primary">
                                        Username <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="e.g. user@ideassion.com"
                                        className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 focus-visible:ring-primary/20"
                                    />
                                    <p className="text-xs text-muted-foreground dark:text-slate-500 font-medium italic">Used to log in to the app.</p>
                                </div>

                                {!editingId && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500">
                                            Password <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Min. 6 characters"
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-primary/20 pr-10 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500">
                                        Full name <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border-slate-200 dark:border-slate-800 h-10 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-primary/20 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500">
                                        Role <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium text-slate-700 dark:text-slate-200"
                                        value={formData.role}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setIsOtherRole(val === 'other');
                                            setFormData({ ...formData, role: val });
                                        }}
                                    >
                                        <option value="" disabled className="dark:bg-slate-900">Select a role</option>
                                        {PREDEFINED_ROLES.map(role => (
                                            <option key={role} value={role} className="dark:bg-slate-900">{role}</option>
                                        ))}
                                        <option value="other" className="dark:bg-slate-900">Other...</option>
                                    </select>
                                </div>

                                {isOtherRole && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500">
                                            Custom Role Name <span className="text-red-400">*</span>
                                        </label>
                                        <Input
                                            value={customRole}
                                            onChange={e => setCustomRole(e.target.value)}
                                            placeholder="e.g. Lead Designer"
                                            className="border-slate-200 dark:border-slate-800 h-10 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-primary/20 transition-colors"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-label text-muted-foreground dark:text-slate-500">
                                        Email (Optional)
                                    </label>
                                    <Input
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="user@example.com"
                                        className="border-slate-200 dark:border-slate-800 h-10 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-primary/20 transition-colors"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={resetForm} className="font-medium h-10 rounded-xl px-6 text-sm dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">Cancel</Button>
                            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white font-medium h-10 rounded-xl px-8 shadow-sm text-sm">
                                {editingId ? 'Save changes' : 'Create user'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            <div className="space-y-10 pt-4">
                {categories.map((category) => (
                    <div key={category.title} className="space-y-5">
                        <div className="flex items-center gap-4 px-1 transition-colors">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 shrink-0">{category.title}</h2>
                            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800 transition-colors" />
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800 uppercase tracking-widest leading-none transition-colors">
                                {category.items.length} users
                            </span>
                        </div>

                        <div className="grid gap-3">
                            {category.items.map((u) => {
                                const isNonAdmin = !u.isAdmin && u.role !== 'System Admin';
                                const userProjectsCount = isNonAdmin ? projects.filter(p =>
                                    p.managerId === u.id || p.members.some(m => m.userId === u.id)
                                ).length : 0;

                                return (
                                    <div key={u.id} className="space-y-2">
                                        <Card
                                            className="group transition-all duration-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 cursor-pointer hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-md"
                                            onClick={() => isNonAdmin && navigate(`/admin/users/${u.id}/projects`)}
                                        >
                                            <div className="p-4 flex items-center gap-4">
                                                <Avatar className="w-10 h-10 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110">
                                                    <AvatarImage src={getAvatarUrl(u.avatar_url || u.name)} alt={u.name} />
                                                    <AvatarFallback className="bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 font-bold text-xs uppercase transition-colors">
                                                        {u.name?.substring(0, 2) || 'US'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-center gap-2 transition-colors">
                                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none transition-colors">{u.name}</h3>
                                                        <Badge variant="soft" className="capitalize text-xs font-medium tracking-label bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-colors">
                                                            {u.role || 'Contributor'}
                                                        </Badge>
                                                        {isNonAdmin && userProjectsCount > 0 && (
                                                            <Badge variant="blue" className="text-xs font-medium uppercase tracking-label transition-colors">
                                                                {userProjectsCount} projects
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium transition-colors">{u.username}</p>
                                                        <span className="text-slate-200 dark:text-slate-800">•</span>
                                                        <p className="text-xs text-muted-foreground dark:text-slate-500 font-mono transition-colors">{u.id.substring(0, 8)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 transition-colors">
                                                    {isNonAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15 rounded-lg px-3 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${u.id}/projects`); }}
                                                        >
                                                            <FolderKanban className="w-3.5 h-3.5" />
                                                            View Projects
                                                        </Button>
                                                    )}
                                                    <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-800 mx-1 transition-colors" />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); startEdit(u); }}
                                                    >
                                                        <UserCog className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                        onClick={(e) => openDeleteDialog(e, u)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
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
