import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, FolderKanban, Bell, ChevronLeft, ChevronRight, User, LogOut, Check, X, Search, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
    const { projects } = useProjects();
    const { settings } = useAdmin();
    const { theme, toggleTheme } = useTheme();
    const { getModuleNotifications, deleteNotification, clearNotifications, hasUnread } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const mainRef = React.useRef(null);

    // Get admin notifications from the persistent Supabase store
    const notifications = getModuleNotifications('admin');
    const unread = hasUnread('admin');

    const handleClearNotifications = () => {
        clearNotifications('admin');
    };

    // Close mobile menu on navigation
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    React.useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0);
        }
    }, [location.pathname]);

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

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative transition-colors duration-300">
            {/* Extremely subtle galactic glow spot for light mode */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />

            {/* Desktop Sidebar */}
            <aside
                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 z-30 shadow-sm transition-all duration-300 hidden md:flex flex-col relative ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`absolute -right-3 ${collapsed ? 'top-20' : 'top-24'} -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary hover:border-primary transition-all duration-300 shadow-sm z-50 focus:outline-none`}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo Area */}
                <div className={`flex items-center px-6 border-b border-slate-100/50 dark:border-slate-800/50 transition-all duration-300 ${collapsed ? 'h-20 justify-center' : 'h-24 justify-center items-start'}`}>
                    <img
                        src={theme === 'dark' ? logoLight : logoSmall}
                        alt="Logo"
                        className={`transition-all duration-300 ${collapsed ? 'h-8 w-8' : 'h-10 w-auto'}`}
                    />
                    {!collapsed && (
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight ml-3 whitespace-nowrap">
                            {(() => {
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
                            })()}
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 px-4 py-8 space-y-1.5 ${collapsed ? '' : 'overflow-y-auto overflow-x-hidden'}`}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/admin'
                            ? location.pathname === '/admin'
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-primary/5 dark:bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'}
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'} ${collapsed ? '' : 'mr-3'}`} />

                                {!collapsed && (
                                    <span className={`text-[13px] font-bold tracking-tight truncate`}>{item.label}</span>
                                )}

                                {isActive && !collapsed && (
                                    <div className="absolute right-0 h-5 w-1 bg-primary rounded-l-full" />
                                )}

                                {collapsed && (
                                    <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-medium px-3 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                                        {item.label}
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-700"></div>
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Notifications & User Dropdown */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto bg-slate-50/10 dark:bg-slate-900/10 transition-all flex flex-col gap-3">
                    {/* Theme Toggle */}
                    <div className={collapsed ? "flex justify-center" : "px-2"}>
                        <button
                            onClick={toggleTheme}
                            className={`flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all group outline-none text-left ${collapsed ? 'p-2' : 'p-2.5 w-full'}`}
                        >
                            <div className="relative w-[18px] h-[18px] shrink-0">
                                <Sun className={`absolute inset-0 w-full h-full text-slate-400 group-hover:text-primary transition-all duration-300 ${theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
                                <Moon className={`absolute inset-0 w-full h-full text-slate-400 group-hover:text-primary transition-all duration-300 ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
                            </div>
                            {!collapsed && (
                                <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors capitalize">{theme} Mode</span>
                            )}
                        </button>
                    </div>
                    {/* Notification Bell */}
                    <div className={collapsed ? "flex justify-center" : "px-2"}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={() => { }}
                                    className={`relative flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all group outline-none text-left ${collapsed ? 'p-2' : 'p-2.5 w-full'}`}
                                >
                                    <Bell className="w-[18px] h-[18px] text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                    {!collapsed && (
                                        <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">Notifications</span>
                                    )}
                                    {notifications.length > 0 && unread && (
                                        <span className={`absolute bg-red-500 border-white rounded-full ${collapsed ? 'top-2.5 right-2.5 w-1.5 h-1.5' : 'top-3 right-3 w-2 h-2 border-2'}`}></span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side={collapsed ? "right" : "top"} align={collapsed ? "end" : "start"} sideOffset={12} className="w-[320px] p-0 shadow-2xl border-slate-200 dark:border-slate-700 ml-2 dark:bg-slate-900">
                                <div className="p-3 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-white dark:bg-slate-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity Log</span>
                                        {notifications.length > 0 && (
                                            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-none font-bold text-[9px] rounded-full px-1.5 py-0 h-4">
                                                {notifications.length}
                                            </Badge>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearNotifications}
                                            className="text-[9px] font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-wider"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <ScrollArea className={notifications.length > 0 ? "h-64" : "h-auto"}>
                                    <div className="flex flex-col">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-700/40 cursor-pointer group/item" onClick={() => navigate(`/admin/projects/${n.project_id}`)}>
                                                    <div className="flex gap-3 text-left">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'signoff' ? 'bg-green-50 dark:bg-green-900/30 text-green-500' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500'}`}>
                                                            {n.type === 'signoff' ? <Check size={14} /> : <FolderKanban size={14} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5 text-left">
                                                                <span className="text-[12px] font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">{n.project_name || n.title}</span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed text-left">
                                                                {n.body || n.title}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(n.id);
                                                            }}
                                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all shrink-0 font-bold"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <Bell className="w-5 h-5 text-slate-200 dark:text-slate-600" />
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest italic tracking-wider">No new activities</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center outline-none group">
                                {collapsed ? (
                                    <div className="mx-auto">
                                        <Avatar className="w-9 h-9 rounded-lg border border-purple-100 shadow-sm ring-2 ring-purple-50 group-hover:ring-purple-200 transition-all">
                                            <AvatarImage src={getAvatarUrl(user?.avatar_url || user?.name)} />
                                            <AvatarFallback className="bg-purple-50 text-purple-600 font-bold text-xs uppercase">
                                                {user?.name?.substring(0, 2) || 'AD'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-2 w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-sm group-hover:border-purple-200 dark:group-hover:border-purple-700 transition-all text-left">
                                        <Avatar className="w-9 h-9 min-w-[36px] rounded-lg border border-purple-100 dark:border-purple-800 shadow-sm ring-2 ring-purple-50 dark:ring-purple-900/30">
                                            <AvatarImage src={getAvatarUrl(user?.avatar_url || user?.name)} />
                                            <AvatarFallback className="bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-semibold text-xs uppercase">
                                                {user?.name?.substring(0, 2) || 'AD'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 text-[13px] leading-tight truncate">{user?.name}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5">{user?.role || 'Administrator'}</p>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side={collapsed ? "right" : "top"} align={collapsed ? "end" : "center"} sideOffset={12} className="w-56 p-2 shadow-xl border-slate-100">
                            <div className="px-2 py-2 mb-1">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Admin Account</p>
                            </div>
                            <DropdownMenuItem className="rounded-lg gap-3 py-2 text-xs font-bold text-slate-600 focus:bg-slate-50 focus:text-slate-900 cursor-pointer" onClick={() => navigate('/admin/account')}>
                                <User size={14} className="text-slate-400" /> My Account
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-lg gap-3 py-2 text-xs font-bold text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer text-left"
                            >
                                <LogOut size={14} /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 w-72 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl z-50 shadow-2xl transition-transform duration-300 transform md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-100/50 dark:border-slate-800/50">
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
                        {(() => {
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
                        })()}
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
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/10 dark:ring-primary/20'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                                    }`}
                            >
                                <Icon className={`w-[18px] h-[18px] mr-4 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                                <span className="font-medium text-[13px] tracking-tight">{item.label}</span>
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

            {/* Main Content Area */}
            <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 relative flex flex-col transition-colors duration-300">
                {/* Mobile Top Bar */}
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 flex items-center justify-between md:hidden sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-1 -ml-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <span className="h-0.5 w-full bg-current rounded-full" />
                                <span className="h-0.5 w-full bg-current rounded-full" />
                                <span className="h-0.5 w-full bg-current rounded-full" />
                            </div>
                        </button>
                        <div className="flex items-center gap-2">
                            <img src={theme === 'dark' ? logoLight : logoSmall} alt="Logo" className="h-7 w-auto" />
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
                                {(() => {
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
                                })()}
                            </span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="outline-none">
                                <Avatar className="w-8 h-8 rounded-lg border border-purple-100 shadow-sm ring-1 ring-purple-50 hover:ring-purple-200 transition-all">
                                    <AvatarImage src={getAvatarUrl(user?.avatar_url || user?.name)} />
                                    <AvatarFallback className="bg-purple-50 text-purple-600 font-bold text-[10px] uppercase">
                                        {user?.name?.substring(0, 2) || 'AD'}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="w-56 p-2 shadow-xl border-slate-100">
                            <div className="px-2 py-2 mb-1">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Account</p>
                            </div>
                            <DropdownMenuItem className="rounded-lg gap-3 py-2 text-xs font-bold text-slate-600 focus:bg-slate-50 focus:text-slate-900 cursor-pointer" onClick={() => navigate('/admin/account')}>
                                <User size={14} className="text-slate-400" /> My Account
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-lg gap-3 py-2 text-xs font-bold text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                            >
                                <LogOut size={14} /> Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <div key={location.pathname} className="flex-grow w-full animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
