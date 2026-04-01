import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, FolderKanban, Bell, ChevronLeft, ChevronRight, User, LogOut, Check, X, Search, Settings, Sun, Moon, HelpCircle, Zap, PlayCircle } from 'lucide-react';
import { useAuth, useAuth as useAuthTour } from '../contexts/AuthContext';
import GuidedTour from './GuidedTour';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import logo from '../assets/logo.png';
import logoSmall from '../assets/logo-small.png';
import logoLight from '/favicon-light.png';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjects } from '@/contexts/ProjectContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useNotifications } from '@/contexts/NotificationContext';
import ScrollToTop from './ScrollToTop';
import LoadingScreen from './LoadingScreen.jsx';

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
    const { projects, loading } = useProjects();
    
    const { settings } = useAdmin();
    const { theme, toggleTheme } = useTheme();
    const { getModuleNotifications, markAsRead, markAllAsRead, hasUnread } = useNotifications();
    const [manualTourCount, setManualTourCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const mainRef = React.useRef(null);
    
    // Close mobile menu on navigation
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    React.useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0);
        }
    }, [location.pathname]);

    if (loading) return <LoadingScreen />;

    // Get admin notifications from the persistent Supabase store
    const notifications = getModuleNotifications('admin');
    const unread = hasUnread('admin');

    const handleClearNotifications = () => {
        markAllAsRead('admin');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/templates', label: 'Sections', icon: FileText },
        { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const portalNameComponent = (() => {
        const portalName = settings?.portal_name || localStorage.getItem('s_portal_name') || 'Knowledge Transfer';
        const words = portalName.split(' ');
        if (words.length > 1) {
            return (
                <>
                    {words[0]} <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary dark:from-primary dark:via-white/50 dark:to-primary/80 animate-gradient-x font-bold">{words.slice(1).join(' ')}</span>
                </>
            );
        }
        return portalName;
    })();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative transition-colors duration-300">
            {/* Extremely subtle galactic glow spot for light mode */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />

            {/* Top Navbar */}
            <header className="h-16 min-h-[4rem] flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-1 -ml-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors md:hidden"
                    >
                        <div className="w-5 h-4 flex flex-col justify-between">
                            <span className="h-0.5 w-full bg-current rounded-full" />
                            <span className="h-0.5 w-full bg-current rounded-full" />
                            <span className="h-0.5 w-full bg-current rounded-full" />
                        </div>
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <img
                            src={theme === 'dark' ? logoLight : logoSmall}
                            alt="Logo"
                            className="h-8 w-auto transition-all"
                        />
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap hidden sm:block">
                            {portalNameComponent}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 h-full">
                    {/* Help & Support */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                id="admin-help-trigger"
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group"
                                title="Help & Support"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={14} className="w-56 p-2 shadow-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                            <DropdownMenuItem 
                                className="rounded-lg gap-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 focus:bg-primary/5 focus:text-primary cursor-pointer transition-colors"
                                onClick={() => setManualTourCount(prev => prev + 1)}
                            >
                                <Zap size={16} /> Start Guided Tour
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group lg:flex"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <Sun className={`absolute w-full h-full transition-all duration-500 ${theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
                            <Moon className={`absolute w-full h-full transition-all duration-500 ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
                        </div>
                    </button>

                    {/* Notification Bell */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button id="admin-notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                                <Bell className="w-5 h-5 transition-colors" />
                                {notifications.length > 0 && unread && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-800 shadow-sm animate-in zoom-in duration-300">
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={12} collisionPadding={16} className="w-[calc(100vw-32px)] sm:w-[340px] p-0 shadow-2xl border-slate-200/60 dark:border-slate-700/60 overflow-hidden dark:bg-slate-900 mx-auto">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-white dark:bg-slate-800/50">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Activity Log</span>
                                {notifications.length > 0 && (
                                    <button onClick={handleClearNotifications} className="text-[10px] font-semibold text-slate-400 hover:text-primary uppercase tracking-wider">Clear all</button>
                                )}
                            </div>
                            <ScrollArea className={notifications.length > 0 ? "h-64" : "h-auto"}>
                                <div className="flex flex-col">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-50 dark:border-slate-800/40 cursor-pointer" onClick={() => navigate(`/admin/projects/${n.project_id}`)}>
                                                <div className="flex gap-3">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'signoff' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' : 'bg-primary/5 dark:bg-primary/20 text-primary'}`}>
                                                        {n.type === 'signoff' ? <Check size={12} /> : <FolderKanban size={12} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{n.project_name || n.title}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1" title={n.body || n.title}>{n.body || n.title}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-slate-400 dark:text-slate-600">
                                            <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                            <p className="text-xs font-medium uppercase tracking-widest">No notifications</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    <div className="w-px h-6 bg-slate-200/50 dark:bg-slate-800/50 mx-1" />

                    {/* User Account Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group outline-none">
                                <Avatar className="w-10 h-10 rounded-xl border border-primary/10 group-hover:border-primary/30 ring-2 ring-primary/5 transition-all">
                                    <AvatarImage src={getAvatarUrl(user?.avatar_url || user?.name, settings?.theme_color?.replace('#', '') || localStorage.getItem('a_theme_color')?.replace('#', ''))} />
                                    <AvatarFallback className="bg-primary/5 text-primary font-semibold text-xs uppercase">
                                        {user?.name?.substring(0, 2) || 'AD'}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Tooltip on Hover */}
                                <div className="absolute top-[120%] right-0 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white py-2 px-4 rounded-xl shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap border border-white/10">
                                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-2">{user?.role || 'Administrator'}</p>
                                    {/* Tooltip Arrow */}
                                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900/90 dark:bg-slate-800/95 rotate-45 border-l border-t border-white/10" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={14} className="w-60 p-2 shadow-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                            <DropdownMenuItem className="rounded-lg gap-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 focus:bg-primary/5 focus:text-primary cursor-pointer transition-colors" onClick={() => navigate('/admin/account')}>
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
            </header>

            <div className={`flex flex-1 relative ${settings?.sidebar_position === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Desktop Sidebar */}
                <aside
                    onMouseEnter={() => setCollapsed(false)}
                    onMouseLeave={() => setCollapsed(true)}
                    className={`z-40 shadow-xl transition-all duration-300 hidden md:flex flex-col sticky top-16 h-[calc(100vh-64px)] ${
                        settings?.sidebar_position === 'right' ? 'right-0 border-l' : 'left-0 border-r'
                    } border-slate-200/60 dark:border-slate-800/60 ${
                        (settings?.sidebar_style || localStorage.getItem('a_sidebar_style')) === 'solid' 
                            ? 'bg-white dark:bg-slate-900' 
                            : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl'
                    } ${collapsed ? 'w-20' : 'w-max min-w-[220px] shadow-2xl transition-all duration-300'}`}
                >
                    {/* Navigation */}
                    <nav className={`flex-1 px-3 py-8 space-y-1.5 ${collapsed ? '' : 'overflow-y-auto overflow-x-hidden'}`}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.path === '/admin'
                                ? location.pathname === '/admin'
                                : location.pathname.startsWith(item.path);

                            return (
                                <NavLink
                                    key={item.path}
                                    id={`admin-nav-${item.label.toLowerCase()}`}
                                    to={item.path}
                                    className={`
                                        flex items-center w-full px-5 py-3 rounded-xl transition-all duration-200 group relative
                                        ${isActive
                                            ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm ring-1 ring-primary/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'}
                                        ${collapsed ? 'justify-center px-0' : ''}
                                    `}
                                >
                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'} ${collapsed ? '' : 'mr-4'}`} />

                                    {!collapsed && (
                                        <span className={`text-sm font-medium tracking-tight whitespace-nowrap`}>{item.label}</span>
                                    )}

                                    {isActive && !collapsed && (
                                        <div className="absolute right-0 h-5 w-1 bg-primary rounded-l-full" />
                                    )}

                                    {collapsed && (
                                        <div className={`absolute ${settings?.sidebar_position === 'right' ? 'right-[calc(100%+12px)]' : 'left-[calc(100%+12px)]'} top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap`}>
                                            {item.label}
                                            <div className={`absolute ${settings?.sidebar_position === 'right' ? '-right-1 border-l-4 border-l-slate-900 dark:border-l-slate-700' : '-left-1 border-r-4 border-r-slate-900 dark:border-r-slate-700'} top-1/2 -translate-y-1/2 border-y-4 border-y-transparent`}></div>
                                        </div>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main ref={mainRef} className="flex-1 bg-slate-50 dark:bg-slate-950 relative flex flex-col transition-colors duration-300">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 ${settings?.sidebar_position === 'right' ? 'right-0' : 'left-0'} w-72 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl z-50 shadow-2xl transition-transform duration-300 transform md:hidden flex flex-col ${isMobileMenuOpen 
                    ? 'translate-x-0' 
                    : settings?.sidebar_position === 'right' ? 'translate-x-full' : '-translate-x-full'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-100/50 dark:border-slate-800/50">
                    <img src={theme === 'dark' ? logoLight : logoSmall} alt="Logo" className="h-8 w-auto" />
                    <span className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap ml-4">
                        {portalNameComponent}
                    </span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto p-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/admin'
                            ? location.pathname === '/admin'
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-4 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/10 dark:ring-primary/20'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 mr-4 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                                <span className="font-medium text-sm tracking-tight">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/20">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-4 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium text-sm h-11"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Role-based Guided Tour */}
            {console.log("[AdminLayout] Injecting GuidedTour...")}
            <GuidedTour 
                role={user?.role || 'System Admin'} 
                manualStartCount={manualTourCount} 
            />
        </div>
    );
}
