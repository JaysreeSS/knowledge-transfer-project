import React, { useState, useEffect, useContext } from 'react';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Globe,
    Shield,
    Bell,
    Palette,
    Briefcase,
    Save,
    Plus,
    X,
    Mail,
    Building2,
    Clock,
    EyeOff,
    ChevronDown,
    Settings2,
    CheckCircle,
    Users,
    Layout,
    AlignLeft,
    AlignRight,
    Monitor,
    LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
    const { settings, updateSettings } = useAdmin();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Initial State - System Info
    const [expandedRole, setExpandedRole] = useState('System Admin');
    const [rolePermissions, setRolePermissions] = useState({
        'System Admin': {
            manageUsers: true,
            editTemplates: true,
            deleteProjects: true,
            systemAudit: true,
            branding: true
        },
        'Manager': {
            createProjects: true,
            assignMembers: true,
            editHandovers: true,
            exportReports: true,
            deleteProjects: false
        },
        'Functional Role': {
            viewTasks: true,
            updateProgress: true,
            addComments: true,
            requestClarification: true,
            viewAnalytics: false
        }
    });

    const [systemSettings, setSystemSettings] = useState({
        portalName: localStorage.getItem('s_portal_name') || 'Knowledge Transfer',
        orgName: localStorage.getItem('s_org_name') || 'Technology Solutions',
        supportEmail: localStorage.getItem('s_support_email') || ''
    });

    // Project Logic
    const [projectSettings, setProjectSettings] = useState({
        defaultPeriod: parseInt(localStorage.getItem('p_default_period') || '30'),
        requireReview: localStorage.getItem('p_require_review') === 'true',
        allowContributorSections: localStorage.getItem('p_allow_contributor_sections') !== 'false', // Default to true
        autoFreeze: localStorage.getItem('p_auto_freeze') === 'true'
    });

    const [newCategory, setNewCategory] = useState('');

    // Notifications
    const [notificationSettings, setNotificationSettings] = useState({
        enableAnnouncements: localStorage.getItem('n_system_announcements') === 'true'
    });

    // Appearance
    const [appearance, setAppearance] = useState({
        themeColor: localStorage.getItem('a_theme_color') || '#7c3aed',
        sidebarStyle: localStorage.getItem('a_sidebar_style') || 'glass',
        borderRadius: localStorage.getItem('a_border_radius') || 'rounded-xl',
        sidebarPosition: localStorage.getItem('a_sidebar_position') || 'left'
    });

    // Sync state with DB settings when they load
    useEffect(() => {
        if (settings) {
            setSystemSettings({
                portalName: settings.portal_name,
                orgName: settings.org_name,
                supportEmail: settings.support_email
            });
            setProjectSettings({
                defaultPeriod: settings.default_project_period,
                requireReview: settings.require_review,
                allowContributorSections: settings.allow_contributor_sections,
                autoFreeze: settings.auto_freeze
            });
            setNotificationSettings({
                enableAnnouncements: settings.enable_announcements
            });
            setAppearance({
                themeColor: settings.theme_color,
                sidebarStyle: settings.sidebar_style,
                borderRadius: settings.border_radius || 'rounded-xl',
                sidebarPosition: settings.sidebar_position || 'left'
            });
        }
    }, [settings]);

    const handleSave = async (section) => {
        setIsLoading(true);
        try {
            let updates = {};
            if (section === 'general') {
                updates = {
                    portal_name: systemSettings.portalName,
                    org_name: systemSettings.orgName,
                    support_email: systemSettings.supportEmail
                };
            } else if (section === 'project') {
                updates = {
                    default_project_period: parseInt(projectSettings.defaultPeriod),
                    require_review: projectSettings.requireReview,
                    allow_contributor_sections: projectSettings.allowContributorSections,
                    auto_freeze: projectSettings.autoFreeze
                };
            } else if (section === 'notifications') {
                updates = {
                    enable_announcements: notificationSettings.enableAnnouncements
                };
            } else if (section === 'appearance') {
                updates = {
                    theme_color: appearance.themeColor,
                    sidebar_style: appearance.sidebarStyle,
                    border_radius: appearance.borderRadius,
                    sidebar_position: appearance.sidebarPosition
                };
            }

            const result = await updateSettings(updates);
            if (result.success) {
                toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-colors">
            <div className="flex flex-col gap-1.5 transition-colors">
                <div className="flex items-center gap-4 transition-colors">
                <h1 id="admin-settings-title" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">System Settings</h1>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">Configure portal preferences, branding, and global project logic.</p>
            </div>

            <div className="md:hidden mb-8 bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Configuration Category</Label>
                <select 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-10 px-3 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 focus:outline-none transition-all"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                >
                    <option value="general">General Settings</option>
                    <option value="project">Project Logic</option>
                    <option value="notifications">Notifications</option>
                    <option value="appearance">Appearance</option>
                    <option value="security">Security</option>
                </select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList id="admin-settings-tabs" className="hidden md:inline-flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl mb-8 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm w-fit transition-all duration-300">
                    <TabsTrigger value="general" className="rounded-lg gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Globe size={14} /> General
                    </TabsTrigger>
                    <TabsTrigger value="project" className="rounded-lg gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Briefcase size={14} /> Project Logic
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Bell size={14} /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Palette size={14} /> Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Shield size={14} /> Security
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="animate-in fade-in-50 duration-500 outline-none transition-colors">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6 transition-colors">
                            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Branding & Contact</CardTitle>
                            <CardDescription className="dark:text-slate-400 transition-colors">Update the outward facing identity of your portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Portal Display Name</Label>
                                    <div className="relative group">
                                        <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            value={systemSettings.portalName}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, portalName: e.target.value }))}
                                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl dark:text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Organization Name</Label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            value={systemSettings.orgName}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, orgName: e.target.value }))}
                                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl dark:text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Support Contact Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            value={systemSettings.supportEmail}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl dark:text-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button onClick={() => handleSave('general')} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-10 gap-2">
                                    <Save size={16} /> Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Project Settings */}
                <TabsContent value="project" className="animate-in fade-in-50 duration-500 outline-none transition-colors">
                    <div className="grid gap-6 transition-colors">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6 transition-colors">
                                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Life-Cycle & Categorization</CardTitle>
                                <CardDescription className="dark:text-slate-400 transition-colors">Manage how projects are classified and their default timelines.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <div className="max-w-md space-y-2.5">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Default Project Duration (Days)</Label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="number"
                                            value={projectSettings.defaultPeriod}
                                            onChange={(e) => setProjectSettings(prev => ({ ...prev, defaultPeriod: e.target.value }))}
                                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl dark:text-slate-200"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">Used to calculate target completion dates for new projects.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                    <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Strict Workflow</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">Manager Review</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">Require manager approval for each section before completion is marked.</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <div
                                                onClick={() => setProjectSettings(prev => ({ ...prev, requireReview: !prev.requireReview }))}
                                                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${projectSettings.requireReview ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${projectSettings.requireReview ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Self-Service</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">Flexible Sections</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">Allow contributors to add new sections during the project lifecycle.</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <div
                                                onClick={() => setProjectSettings(prev => ({ ...prev, allowContributorSections: !prev.allowContributorSections }))}
                                                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${projectSettings.allowContributorSections ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${projectSettings.allowContributorSections ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Auto-Governance</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">Project Freeze</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">Automatically lock all project edits once the deadline has passed.</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <div
                                                onClick={() => setProjectSettings(prev => ({ ...prev, autoFreeze: !prev.autoFreeze }))}
                                                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${projectSettings.autoFreeze ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${projectSettings.autoFreeze ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div className="pt-4 flex justify-end">
                                    <Button onClick={() => handleSave('project')} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-10 gap-2">
                                        <Save size={16} /> Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="animate-in fade-in-50 duration-500 outline-none transition-colors">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6 transition-colors">
                            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Communication Preferences</CardTitle>
                            <CardDescription className="dark:text-slate-400 transition-colors">Control how the system interacts with its users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                        <Bell size={16} className="text-primary" /> Create Global Announcement
                                    </h3>
                                    <div className="space-y-3">
                                        <Input placeholder="Announcement Title..." className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 rounded-xl dark:text-slate-200 transition-colors" />
                                        <textarea
                                            placeholder="What's happening? This will be shown to all modules..."
                                            className="w-full min-h-[100px] p-3 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-primary/20 focus:border-primary dark:text-slate-200 outline-none transition-all"
                                        />
                                        <div className="flex justify-end gap-4">
                                            <Button variant="ghost" className="h-9 px-4 text-xs font-semibold uppercase tracking-wider dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">Preview</Button>
                                            <Button className="h-9 px-6 text-xs font-semibold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-sm transition-all">Post Broadcast</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="animate-in fade-in-50 duration-500 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6">
                            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Interface & Theme</CardTitle>
                            <CardDescription className="dark:text-slate-400">Customize the look and feel of your portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Brand Primary Color</Label>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#0891b2'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setAppearance(prev => ({ ...prev, themeColor: color }))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${appearance.themeColor === color ? 'border-slate-900 dark:border-white ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <input
                                        type="color"
                                        value={appearance.themeColor}
                                        onChange={(e) => setAppearance(prev => ({ ...prev, themeColor: e.target.value }))}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                    <div>
                                        <Input
                                            value={appearance.themeColor}
                                            onChange={(e) => setAppearance(prev => ({ ...prev, themeColor: e.target.value }))}
                                            className="h-8 w-24 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0 dark:text-slate-100"
                                        />
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">Custom Hex Code</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Sidebar Strategy</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'glass', label: 'Glass', icon: LayoutDashboard },
                                            { id: 'solid', label: 'Solid', icon: Monitor }
                                        ].map((style) => (
                                            <div
                                                key={style.id}
                                                onClick={() => setAppearance(prev => ({ ...prev, sidebarStyle: style.id }))}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2 ${appearance.sidebarStyle === style.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                            >
                                                <style.icon className={`w-5 h-5 ${appearance.sidebarStyle === style.id ? 'text-primary' : 'text-slate-400'}`} />
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{style.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Sidebar position</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'left', label: 'Left Side', icon: AlignLeft },
                                            { id: 'right', label: 'Right Side', icon: AlignRight }
                                        ].map((pos) => (
                                            <div
                                                key={pos.id}
                                                onClick={() => setAppearance(prev => ({ ...prev, sidebarPosition: pos.id }))}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2 ${appearance.sidebarPosition === pos.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                            >
                                                <pos.icon className={`w-5 h-5 ${appearance.sidebarPosition === pos.id ? 'text-primary' : 'text-slate-400'}`} />
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{pos.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Component Edge Radius</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'rounded-none', label: 'Sharp', desc: 'Enterprise' },
                                        { id: 'rounded-xl', label: 'Standard', desc: 'Modern' },
                                        { id: 'rounded-2xl', label: 'Rounded', desc: 'Friendly' },
                                        { id: 'rounded-full', label: 'Pill', desc: 'Playful' }
                                    ].map((radius) => (
                                        <div
                                            key={radius.id}
                                            onClick={() => setAppearance(prev => ({ ...prev, borderRadius: radius.id }))}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${appearance.borderRadius === radius.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                        >
                                            <div className={`w-8 h-4 bg-slate-200 dark:bg-slate-700 mb-2 ${radius.id}`} />
                                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{radius.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{radius.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={() => handleSave('appearance')} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-10 gap-2">
                                    <Save size={16} /> Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="animate-in fade-in-50 duration-500 outline-none transition-colors">
                    <div className="grid gap-6 transition-colors">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6 transition-colors">
                                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Roles & Access Control</CardTitle>
                                <CardDescription className="dark:text-slate-400 transition-colors">Define permissions and module access for each system role.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4 transition-colors">
                                {[
                                    { id: 'System Admin', role: 'System Admin', desc: 'Full administrative control over all system modules.', icon: Shield },
                                    { id: 'Manager', role: 'Manager', desc: 'Project oversight and operational management.', icon: Briefcase },
                                    { id: 'Functional Role', role: 'Functional Role', desc: 'Contributor level access for project execution.', icon: Users }
                                ].map((r) => (
                                    <div key={r.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${expandedRole === r.id ? 'border-primary ring-1 ring-primary/10 bg-white dark:bg-slate-900/40' : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                        <button
                                            onClick={() => setExpandedRole(expandedRole === r.id ? null : r.id)}
                                            className="w-full p-4 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${expandedRole === r.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <r.icon size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-sm font-semibold transition-colors ${expandedRole === r.id ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{r.role}</p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{r.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${expandedRole === r.id ? 'rotate-180 text-primary' : ''}`} />
                                        </button>

                                        {expandedRole === r.id && (
                                            <div className="px-5 pb-5 pt-1 animate-in slide-in-from-top-2 duration-300">
                                                <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4 mx-4" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 px-4">
                                                    {Object.entries(rolePermissions[r.id]).map(([permission, value]) => (
                                                        <div key={permission} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50">
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize tracking-tight">
                                                                    {permission.replace(/([A-Z])/g, ' $1').trim()}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Allow user to {permission.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}</p>
                                                            </div>
                                                            <div
                                                                onClick={() => {
                                                                    setRolePermissions(prev => ({
                                                                        ...prev,
                                                                        [r.id]: { ...prev[r.id], [permission]: !value }
                                                                    }));
                                                                }}
                                                                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                            >
                                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-end pt-4 px-4">
                                                    <Button size="sm" variant="ghost" className="text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5">
                                                        Apply to all Users
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettings;
