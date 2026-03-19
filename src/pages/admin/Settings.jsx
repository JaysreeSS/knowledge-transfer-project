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
    Layout,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
    const { settings, updateSettings } = useAdmin();
    const [isLoading, setIsLoading] = useState(false);

    // Initial State - System Info
    const [systemSettings, setSystemSettings] = useState({
        portalName: localStorage.getItem('s_portal_name') || 'Knowledge Transfer',
        orgName: localStorage.getItem('s_org_name') || 'Ideassion Technology Solutions',
        supportEmail: localStorage.getItem('s_support_email') || ''
    });

    // Project Logic
    const [projectSettings, setProjectSettings] = useState({
        defaultPeriod: parseInt(localStorage.getItem('p_default_period') || '30'),
        categories: JSON.parse(localStorage.getItem('p_categories') || '["Development", "Design", "DevOps", "QA", "Management"]')
    });

    const [newCategory, setNewCategory] = useState('');

    // Notifications
    const [notificationSettings, setNotificationSettings] = useState({
        enableAnnouncements: localStorage.getItem('n_system_announcements') === 'true',
        emailAlerts: localStorage.getItem('n_email_alerts') !== 'false'
    });

    // Appearance
    const [appearance, setAppearance] = useState({
        themeColor: localStorage.getItem('a_theme_color') || '#7c3aed',
        sidebarStyle: localStorage.getItem('a_sidebar_style') || 'glass'
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
                categories: settings.categories
            });
            setNotificationSettings({
                enableAnnouncements: settings.enable_announcements,
                emailAlerts: settings.enable_email_alerts
            });
            setAppearance({
                themeColor: settings.theme_color,
                sidebarStyle: settings.sidebar_style
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
                    categories: projectSettings.categories
                };
            } else if (section === 'notifications') {
                updates = {
                    enable_announcements: notificationSettings.enableAnnouncements,
                    enable_email_alerts: notificationSettings.emailAlerts
                };
            } else if (section === 'appearance') {
                updates = {
                    theme_color: appearance.themeColor,
                    sidebar_style: appearance.sidebarStyle
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

    const addCategory = () => {
        if (!newCategory.trim()) return;
        if (projectSettings.categories.includes(newCategory.trim())) {
            toast.error('Category already exists');
            return;
        }
        setProjectSettings(prev => ({
            ...prev,
            categories: [...prev.categories, newCategory.trim()]
        }));
        setNewCategory('');
    };

    const removeCategory = (cat) => {
        setProjectSettings(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== cat)
        }));
    };

    return (
        <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 transition-colors">
            <div className="flex flex-col gap-1.5 transition-colors">
                <div className="flex items-center gap-3 transition-colors">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">System Settings</h1>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium ml-13 transition-colors">Configure portal preferences, branding, and global project logic.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl mb-8 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
                    <TabsTrigger value="general" className="rounded-lg gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Globe size={14} /> General
                    </TabsTrigger>
                    <TabsTrigger value="project" className="rounded-lg gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Briefcase size={14} /> Project Logic
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Bell size={14} /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Palette size={14} /> Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-slate-100 dark:hover:text-slate-200 transition-all">
                        <Shield size={14} /> Security
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="animate-in fade-in-50 duration-500 outline-none transition-colors">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6 transition-colors">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Branding & Contact</CardTitle>
                            <CardDescription className="dark:text-slate-400 transition-colors">Update the outward facing identity of your portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Portal Display Name</Label>
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
                                    <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Organization Name</Label>
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
                                    <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Support Contact Email</Label>
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
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Life-Cycle & Categorization</CardTitle>
                                <CardDescription className="dark:text-slate-400 transition-colors">Manage how projects are classified and their default timelines.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <div className="max-w-md space-y-2.5">
                                    <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Default Project Duration (Days)</Label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="number"
                                            value={projectSettings.defaultPeriod}
                                            onChange={(e) => setProjectSettings(prev => ({ ...prev, defaultPeriod: e.target.value }))}
                                            className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl dark:text-slate-200"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">Used to calculate target completion dates for new projects.</p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Project Categories</Label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl min-h-[100px] items-start">
                                        {projectSettings.categories.map((cat) => (
                                            <Badge key={cat} variant="secondary" className="pl-3 pr-1 py-1 gap-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                {cat}
                                                <button onClick={() => removeCategory(cat)} className="hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 max-w-md">
                                        <Input
                                            placeholder="Add new category..."
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                                            className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-200"
                                        />
                                        <Button onClick={addCategory} variant="secondary" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                                            <Plus size={16} />
                                        </Button>
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
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Communication Preferences</CardTitle>
                            <CardDescription className="dark:text-slate-400 transition-colors">Control how the system interacts with its users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-colors">
                                        <Bell size={16} className="text-primary" /> Create Global Announcement
                                    </h3>
                                    <div className="space-y-3">
                                        <Input placeholder="Announcement Title..." className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 rounded-xl dark:text-slate-200 transition-colors" />
                                        <textarea
                                            placeholder="What's happening? This will be shown to all modules..."
                                            className="w-full min-h-[100px] p-3 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-primary/20 focus:border-primary dark:text-slate-200 outline-none transition-all"
                                        />
                                        <div className="flex justify-end gap-3">
                                            <Button variant="ghost" className="h-9 px-4 text-xs font-bold uppercase tracking-wider dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">Preview</Button>
                                            <Button className="h-9 px-6 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-sm transition-all">Post Broadcast</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 group hover:border-primary/20 transition-all">
                                    <div className="space-y-0.5 transition-colors">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors">Email Notifications</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 transition-colors">Automatically send alerts for project sign-offs and deadlines.</p>
                                    </div>
                                    <div
                                        onClick={() => setNotificationSettings(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
                                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${notificationSettings.emailAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-200 rounded-full transition-all duration-200 ${notificationSettings.emailAlerts ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button onClick={() => handleSave('notifications')} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-10 gap-2">
                                    <Save size={16} /> Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="animate-in fade-in-50 duration-500 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Interface & Theme</CardTitle>
                            <CardDescription className="dark:text-slate-400">Customize the look and feel of your portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Brand Primary Color</Label>
                                <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <input
                                        type="color"
                                        value={appearance.themeColor}
                                        onChange={(e) => setAppearance(prev => ({ ...prev, themeColor: e.target.value }))}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{appearance.themeColor}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">Selected Theme Accent</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Sidebar Style</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['glass', 'solid'].map((style) => (
                                        <div
                                            key={style}
                                            onClick={() => setAppearance(prev => ({ ...prev, sidebarStyle: style }))}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2 ${appearance.sidebarStyle === style ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                        >
                                            <Layout className={`w-5 h-5 ${appearance.sidebarStyle === style ? 'text-primary' : 'text-slate-400'}`} />
                                            <p className="text-sm font-bold capitalize text-slate-900 dark:text-slate-100">{style}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Modern {style} effect</p>
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
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Roles & Access Control</CardTitle>
                                <CardDescription className="dark:text-slate-400 transition-colors">Define how users interact with the system.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 transition-colors">
                                <div className="grid gap-4">
                                    {[
                                        { role: 'System Admin', desc: 'Full access to all modules, users, and templates.', color: 'purple' },
                                        { role: 'Manager', desc: 'Can create and oversee projects. Access to manager dashboard.', color: 'blue' },
                                        { role: 'Functional Role', desc: 'Assigned as members to projects. Can complete tasks.', color: 'slate' }
                                    ].map((r) => (
                                        <div key={r.role} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-primary/20">
                                            <div className={`w-10 h-10 rounded-xl bg-${r.color}-50 dark:bg-${r.color}-900/20 flex items-center justify-center shrink-0`}>
                                                <Shield size={18} className={`text-${r.color}-600`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.role}</p>
                                                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-white dark:bg-slate-800">Default Role</Badge>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{r.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-6">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Security Protocols</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid gap-6">
                                    <div className="p-4 border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl flex gap-4 items-start transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                            <Lock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-300">MFA & Single Sign-On</p>
                                            <p className="text-[11px] text-blue-700 dark:text-blue-500 leading-relaxed mt-0.5">Contact technical support to enable SAML or OAuth2 integrations for your organization.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Inactivity Logout (Minutes)</Label>
                                        <div className="relative group max-w-xs">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                value="120"
                                                disabled
                                                className="pl-10 h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettings;
