import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Send,
    Inbox,
    LogOut,
    Bell,
    Settings,
    User,
    CreditCard,
    Users as UsersIcon,
    Palette,
    UserPlus,
    CheckCircle2,
    Search,
    ChevronDown,
    Menu,
    X,
    MessageSquare,
    AlertCircle,
    ChevronLeft,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjects } from '../contexts/ProjectContext.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import ScrollToTop from './ScrollToTop';
import { getAvatarUrl } from '../lib/utils';
import logo from '../assets/logo.png';
import logoSmall from '../assets/logo-small.png';
import logoLight from '/favicon-light.png';

export default function ICRLayout() {
    const { user, logout } = useAuth();
    const { projects } = useProjects();
    const { settings } = useAdmin();
    const { theme, toggleTheme } = useTheme();
    const { getModuleNotifications, deleteNotification, clearNotifications, hasUnread } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get ICR notifications from the persistent Supabase store
    const notifications = getModuleNotifications('icr');
    const unread = hasUnread('icr');

    const handleClearNotifications = () => {
        clearNotifications('icr');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { path: '/icr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/icr/handovers', label: 'My Handovers', icon: Send },
        { path: '/icr/onboardings', label: 'My Onboardings', icon: Inbox },
    ];

    const portalNameComponent = (() => {
        const portalName = settings?.portal_name || localStorage.getItem('s_portal_name') || 'Knowledge Transfer';
        const words = portalName.split(' ');
        if (words.length > 1) {
            return (
                <>
                    {words[0]}<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-gradient-x">{words.slice(1).join(' ')}</span>
                </>
            );
        }
        return portalName;
    })();

    return (
        <div className="font-sans min-h-screen bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
            <ScrollToTop />

            {/* Extremely subtle galactic glow spot for light mode */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="h-16 bg-white dark:bg-slate-900 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-within:z-50 transition-colors">
                <div className="w-full px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/icr/dashboard')}>
                            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
                                <img src={theme === 'dark' ? logoLight : logoSmall} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-lg">
                                {portalNameComponent}
                            </span>
                        </div>

                        {/* Main Nav */}
                        <nav className="hidden lg:flex items-center gap-7">
                            {navItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`text-sm font-medium transition-all px-4 py-2 rounded-xl relative group ${isActive
                                            ? 'bg-primary/5 dark:bg-primary/20 text-primary font-semibold ring-1 ring-primary/20 shadow-sm'
                                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Mobile Menu Toggle (hidden on lg) */}
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all group outline-none"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            <div className="relative w-5 h-5">
                                <Sun className={`absolute inset-0 w-full h-full text-slate-400 group-hover:text-primary transition-all duration-300 ${theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
                                <Moon className={`absolute inset-0 w-full h-full text-slate-400 group-hover:text-primary transition-all duration-300 ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
                            </div>
                        </button>

                        {/* Notifications */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={() => { }}
                                    className="relative flex items-center gap-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all group outline-none text-left p-2.5"
                                >
                                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                    {notifications.length > 0 && unread && (
                                        <span className={`absolute bg-red-500 border-white rounded-full top-3 right-3 w-2 h-2 border-2`}></span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[380px] p-0 dark:bg-slate-900 dark:border-slate-700" align="end" sideOffset={12}>
                                <div className="p-4 border-b border-slate-50 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Notifications</span>
                                        {notifications.length > 0 && (
                                            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-none font-semibold text-xs rounded-full px-2">
                                                {notifications.length}
                                            </Badge>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearNotifications}
                                            className="text-xs font-semibold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-wider"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                <ScrollArea className={notifications.length > 0 ? "h-[350px]" : "h-auto"}>
                                    <div className="flex flex-col">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-700/40 cursor-pointer group/item" onClick={() => navigate(n.type === 'clarify' ? `/icr/handovers/${n.project_id}` : `/icr/onboardings/${n.project_id}`)}>
                                                    <div className="flex gap-4">
                                                        <Avatar className="w-9 h-9 border border-purple-100 shadow-sm ring-2 ring-purple-50">
                                                            <AvatarImage src={getAvatarUrl(n.project_name || n.title)} />
                                                            <AvatarFallback className="bg-purple-50 text-purple-400 text-xs font-semibold">{(n.project_name || n.title || 'KT').substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{n.project_name || n.title}</span>
                                                                <span className="text-xs text-slate-400 font-medium">{new Date(n.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                                                                {n.body || n.title}
                                                            </p>
                                                            <div className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ring-1 ring-slate-100 dark:ring-slate-700 w-fit px-2 py-0.5 rounded bg-white dark:bg-slate-800">
                                                                {n.project_name}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(n.id);
                                                            }}
                                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <Bell className="w-6 h-6 text-slate-200 dark:text-slate-600" />
                                                </div>
                                                <p className="text-xs font-semibold text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">All caught up</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>

                        {/* User Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group outline-none">
                                    <Avatar className="w-10 h-10 rounded-xl border border-primary/10 group-hover:border-primary/30 ring-2 ring-primary/5 transition-all">
                                        <AvatarImage src={getAvatarUrl(user?.avatar_url || user?.name, settings?.theme_color?.replace('#', '') || localStorage.getItem('a_theme_color')?.replace('#', ''))} />
                                        <AvatarFallback className="bg-primary/5 text-primary font-semibold text-xs uppercase">
                                            {user?.name?.substring(0, 2) || 'MN'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Tooltip on Hover */}
                                    <div className="absolute top-[120%] right-0 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white py-2 px-4 rounded-xl shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap border border-white/10 text-right">
                                        <p className="text-sm font-semibold leading-none">{user?.name}</p>
                                        <p className="text-[10px] font-semibold text-slate-400 capitalize tracking-tight mt-1.5">{user?.role || 'Member'}</p>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900/90 dark:bg-slate-800/95 rotate-45 border-l border-t border-white/10" />
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={14} className="w-56 p-2 shadow-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                                <DropdownMenuItem className="rounded-lg gap-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 focus:bg-primary/5 focus:text-primary cursor-pointer transition-colors" onClick={() => navigate('/icr/account')}>
                                    <User size={16} /> My Account
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="rounded-lg gap-4 py-2 text-sm font-medium text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 cursor-pointer transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 ${settings?.sidebar_position === 'right' ? 'right-0' : 'left-0'} w-72 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl z-[70] shadow-2xl transition-transform duration-300 transform md:hidden flex flex-col ${isMobileMenuOpen 
                    ? 'translate-x-0' 
                    : settings?.sidebar_position === 'right' ? 'translate-x-full' : '-translate-x-full'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-100/60 dark:border-slate-800/60">
                    <img src={theme === 'dark' ? logoLight : logoSmall} alt="Logo" className="h-8 w-auto" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tighter uppercase text-lg ml-4">
                        {portalNameComponent}
                    </span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto p-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100/60 dark:border-slate-800/60 space-y-4 bg-slate-50/40 dark:bg-slate-800/20">
                    <div className="flex items-center gap-4 px-2">
                        <Avatar className="w-10 h-10 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-sm ring-2 ring-purple-50 dark:ring-purple-900/30">
                            <AvatarImage src={getAvatarUrl(user?.name)} />
                            <AvatarFallback className="bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-semibold text-sm uppercase">
                                {user?.name?.substring(0, 2) || 'MN'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{user?.role || 'Member'}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-4 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-semibold text-sm h-12"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10">
                <div key={location.pathname} className="animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
