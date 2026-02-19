import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Send,
    Inbox,
    LogOut
} from 'lucide-react';
import logo from '../assets/logo.png';
import logoSmall from '../assets/logo-small.png';

export default function ICRLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on navigation
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { path: '/icr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/icr/handovers', label: 'My Handovers', icon: Send },
        { path: '/icr/onboardings', label: 'My Onboardings', icon: Inbox },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="font-sans min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-5 md:px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors md:hidden"
                    >
                        <div className="w-6 h-5 flex flex-col justify-between">
                            <span className="h-0.5 w-full bg-current rounded-full" />
                            <span className="h-0.5 w-full bg-current rounded-full" />
                            <span className="h-0.5 w-2/3 bg-current rounded-full" />
                        </div>
                    </button>

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/icr/dashboard')}>
                        <img src={logoSmall} alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-slate-900 tracking-tighter uppercase text-lg hidden sm:block">Knowledge<span className="text-primary italic">Transfer</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="mt-0.5">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role || 'Team Member'}</p>
                        </div>
                        <div className="md:hidden w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] border border-primary/10">
                            {user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl hover:bg-red-50 hover:text-red-600 hidden md:flex">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-[70] shadow-2xl transition-transform duration-300 transform md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-50">
                    <img src={logoSmall} alt="Logo" className="h-8 w-auto" />
                    <span className="font-bold text-slate-900 tracking-tighter uppercase text-lg ml-3">Knowledge<span className="text-primary italic">Transfer</span></span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto p-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <LogOut size={20} className="rotate-180" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role || 'Member'}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm h-12"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>
        </div>
    );
}
