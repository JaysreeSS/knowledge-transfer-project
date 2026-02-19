import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, FolderKanban, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import Footer from "./Footer";
import logo from '../assets/logo.png';
import logoSmall from '../assets/logo-small.png';

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
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

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/templates', label: 'Sections', icon: FileText },
        { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside
                className={`bg-white border-r border-slate-200 z-30 shadow-sm transition-all duration-300 hidden md:flex flex-col relative ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`absolute -right-3 ${collapsed ? 'top-20' : 'top-24'} -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1.5 text-slate-400 hover:text-primary hover:border-primary transition-all duration-300 shadow-sm z-50 focus:outline-none`}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo Area */}
                <div className={`flex items-center px-6 border-b border-slate-50 transition-all duration-300 ${collapsed ? 'h-20 justify-center' : 'h-24 justify-center items-start'}`}>
                    <img
                        src={logoSmall}
                        alt="Logo"
                        className={`transition-all duration-300 ${collapsed ? 'h-8 w-8' : 'h-10 w-auto'}`}
                    />
                    {!collapsed && (
                        <span className="text-lg font-bold text-slate-900 tracking-tight ml-3 whitespace-nowrap">
                            Knowledge<span className="text-primary">Transfer</span>
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
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'} ${collapsed ? '' : 'mr-3'}`} />

                                {!collapsed && (
                                    <span className={`text-[13px] font-medium tracking-tight truncate`}>{item.label}</span>
                                )}

                                {isActive && !collapsed && (
                                    <div className="absolute right-0 h-5 w-1 bg-primary rounded-l-full" />
                                )}

                                {collapsed && (
                                    <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-medium px-3 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                                        {item.label}
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900"></div>
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50 transition-all duration-300">
                    {collapsed ? (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
                                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-primary/20 transition-all">
                                <div className="w-9 h-9 min-w-[36px] rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-slate-900 text-[13px] leading-tight truncate">{user?.name}</p>
                                    <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">{user?.role || 'Administrator'}</p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="w-full justify-center gap-2 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg font-medium text-xs h-9 shadow-sm bg-white"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 shadow-2xl transition-transform duration-300 transform md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-50">
                    <span className="text-xl font-bold text-slate-900 tracking-tight">
                        Knowledge<span className="text-primary">Transfer</span>
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
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Icon className={`w-[18px] h-[18px] mr-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                                <span className={`font-medium text-[13px] tracking-tight`}>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-4 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm h-11"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative flex flex-col">
                {/* Mobile Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between md:hidden sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-1 -ml-1 text-slate-500 hover:text-primary transition-colors"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <span className="h-0.5 w-full bg-current rounded-full" />
                                <span className="h-0.5 w-full bg-current rounded-full" />
                                <span className="h-0.5 w-full bg-current rounded-full" />
                            </div>
                        </button>
                        <div className="flex items-center gap-2">
                            <img src={logoSmall} alt="Logo" className="h-7 w-auto" />
                            <span className="text-lg font-bold text-slate-900 tracking-tight">Knowledge<span className="text-primary">Transfer</span></span>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        {user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                </header>

                <div className="flex-grow w-full">
                    <Outlet />
                </div>
                <Footer />
            </main>
        </div>
    );
}
