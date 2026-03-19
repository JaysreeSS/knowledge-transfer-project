import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '../lib/utils';
import { User, Mail, Shield, UserCircle, Edit2, Check, X, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function MyAccount() {
    const { user, updateProfile } = useAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    const handleUpdateName = async () => {
        if (!newName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        try {
            const result = await updateProfile({ name: newName });
            if (result.success) {
                toast.success('Profile name updated successfully');
                setIsEditingName(false);
            } else {
                toast.error(result.error || 'Failed to update name');
            }
        } catch (error) {
            toast.error('An error occurred while updating name');
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwords.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            const result = await updateProfile({ password: passwords.new });
            if (result.success) {
                toast.success('Password changed successfully');
                setIsChangingPassword(false);
                setPasswords({ new: '', confirm: '' });
            } else {
                toast.error(result.error || 'Failed to change password');
            }
        } catch (error) {
            toast.error('An error occurred while changing password');
        }
    };

    const AVATAR_PRESETS = [
        { seed: 'reaction_happy', label: 'Happy' },
        { seed: 'reaction_thumbs_up', label: 'Thumbs Up' },
        { seed: 'reaction_waving', label: 'Waving' },
        { seed: 'reaction_thinking', label: 'Thinking' },
        { seed: 'reaction_focused', label: 'Focused' },
        { seed: 'reaction_cool', label: 'Cool' },
        { seed: 'reaction_success', label: 'Success' },
        { seed: 'reaction_idea', label: 'Idea' },
        { seed: 'reaction_growth', label: 'Growth' },
        { seed: 'reaction_working', label: 'Working' },
        { seed: 'reaction_celebrate', label: 'Celebrate' },
        { seed: 'reaction_winner', label: 'Winner' }
    ];

    const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);

    const handleUpdateAvatar = async (seed) => {
        try {
            const result = await updateProfile({ avatar_url: seed });
            if (result.success) {
                toast.success('Avatar updated successfully');
                setIsSelectingAvatar(false);
            } else {
                toast.error(result.error || 'Failed to update avatar');
            }
        } catch (error) {
            toast.error('An error occurred while updating avatar');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-8 space-y-8 transition-colors">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-80 space-y-6 shrink-0">
                    {/* Profile Card */}
                    <Card className="shadow-xl border-slate-100 dark:border-slate-800 overflow-hidden relative group bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                        <div className="h-24 bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                        <CardContent className="pt-0 -mt-12 flex flex-col items-center pb-8">
                            <div className="relative cursor-pointer group/avatar transition-colors" onClick={() => setIsSelectingAvatar(!isSelectingAvatar)}>
                                <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-lg ring-2 ring-purple-100 dark:ring-purple-900/30 ring-offset-2 transition-transform group-hover/avatar:scale-105">
                                    <AvatarImage src={getAvatarUrl(user?.avatar_url || user?.name)} />
                                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xl font-bold transition-colors">
                                        {user?.name?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <Edit2 className="text-white w-5 h-5 transition-colors" />
                                </div>
                            </div>

                            {isSelectingAvatar && (
                                <div className="mt-6 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl w-full animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Professional Reactions</h4>
                                        <button onClick={() => setIsSelectingAvatar(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2.5">
                                        {AVATAR_PRESETS.map((item) => (
                                            <button
                                                key={item.seed}
                                                onClick={() => handleUpdateAvatar(item.seed)}
                                                title={item.label}
                                                className={`relative w-full aspect-square rounded-xl border-2 transition-all p-1.5 group/item hover:border-purple-500 ${user?.avatar_url === item.seed ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-100 dark:ring-purple-900/30' : 'border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <img src={getAvatarUrl(item.seed)} alt={item.label} className="w-full h-full transform transition-transform group-hover/item:scale-110" />
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                    {item.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="w-full mt-8 flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-purple-200 dark:hover:border-purple-900/50">
                                <UserCircle size={16} className="text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] dark:text-slate-300 transition-colors">UID: {user?.id?.substring(0, 8)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings - Moved from right column */}
                    <Card className="shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                        <CardHeader className="bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-slate-100">
                                <Lock className="text-purple-500 w-5 h-5" /> Security settings
                            </CardTitle>
                            <CardDescription className="text-xs font-medium dark:text-slate-400">Update password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isChangingPassword ? (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">New Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="Min. 6 characters"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 h-10 rounded-lg focus-visible:ring-purple-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Confirm Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="Retype password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 h-10 rounded-lg focus-visible:ring-purple-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button className="bg-purple-600 hover:bg-purple-700 font-bold h-10 rounded-lg shadow-md shadow-purple-100" onClick={handleChangePassword}>
                                            Save New Password
                                        </Button>
                                        <Button variant="ghost" className="font-bold text-slate-400 hover:text-slate-600 h-10 rounded-lg" onClick={() => setIsChangingPassword(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 font-bold gap-2 h-10 rounded-lg transition-all"
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    <KeyRound size={16} /> Change password
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Account Details Area */}
                <div className="flex-1 w-full">
                    <Card className="shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                        <CardHeader className="bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-slate-100">
                                <UserCircle className="text-purple-500 w-5 h-5" /> Account Details
                            </CardTitle>
                            <CardDescription className="text-xs font-medium dark:text-slate-400">Manage your personal information and how it appears to others.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Full Name</Label>
                                    {isEditingName ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/50 focus-visible:ring-purple-500 font-bold text-sm dark:text-slate-200 transition-colors"
                                            />
                                            <Button size="icon" className="shrink-0 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 h-10 w-10 rounded-lg text-white" onClick={handleUpdateName}>
                                                <Check size={16} />
                                            </Button>
                                            <Button size="icon" variant="outline" className="shrink-0 h-10 w-10 rounded-lg border-slate-200 dark:border-slate-700 dark:text-slate-400" onClick={() => { setIsEditingName(false); setNewName(user?.name || ''); }}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm transition-colors">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.name}</span>
                                            <Button variant="ghost" size="sm" className="h-8 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-bold gap-2 rounded-lg transition-all" onClick={() => setIsEditingName(true)}>
                                                <Edit2 size={12} /> Edit
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Username (Login ID)</Label>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-400 dark:text-slate-600 flex items-center justify-between transition-colors">
                                        {user?.username}
                                        <Lock size={14} className="opacity-40" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic font-medium">Username is fixed and used for authentication.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address</Label>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-slate-200 transition-colors">
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Primary Role</Label>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-slate-200 capitalize transition-colors">
                                        {user?.role}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
