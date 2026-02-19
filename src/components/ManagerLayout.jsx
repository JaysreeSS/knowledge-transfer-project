import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Folder, LogOut, LayoutDashboard, Send, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import logo from '../assets/logo.png';
import logoSmall from '../assets/logo-small.png';

export default function ManagerLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on navigation
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path) => {
        if (path === '/manager' && location.pathname === '/manager') return true;
        if (path !== '/manager' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <ScrollToTop />
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

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/manager')}>
                        <img src={logoSmall} alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-slate-900 tracking-tighter uppercase text-lg hidden sm:block">Knowledge<span className="text-primary italic">Transfer</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <TopNavItem
                            icon={<LayoutDashboard className="w-4 h-4" />}
                            label="Dashboard"
                            active={isActive('/manager') && location.pathname === '/manager'}
                            onClick={() => navigate('/manager')}
                        />
                        <TopNavItem
                            icon={<Folder className="w-4 h-4" />}
                            label="All Projects"
                            active={isActive('/manager/projects')}
                            onClick={() => navigate('/manager/projects')}
                        />
                        <TopNavItem
                            icon={<Send className="w-4 h-4" />}
                            label="My Handovers"
                            active={isActive('/manager/my-handovers')}
                            onClick={() => navigate('/manager/my-handovers')}
                        />
                    </nav>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role || 'Project Manager'}</p>
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

            {/* Mobile Menu Side Drawer */}
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
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <MobileNavItem
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard"
                        active={isActive('/manager') && location.pathname === '/manager'}
                        onClick={() => navigate('/manager')}
                    />
                    <MobileNavItem
                        icon={<Folder className="w-5 h-5" />}
                        label="All Projects"
                        active={isActive('/manager/projects')}
                        onClick={() => navigate('/manager/projects')}
                    />
                    <MobileNavItem
                        icon={<Send className="w-5 h-5" />}
                        label="My Handovers"
                        active={isActive('/manager/my-handovers')}
                        onClick={() => navigate('/manager/my-handovers')}
                    />
                </nav>

                <div className="p-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role || 'Manager'}</p>
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
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

function TopNavItem({ icon, label, active = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
        >
            {icon}
            <span className="mt-0.5">{label}</span>
        </button>
    )
}

function MobileNavItem({ icon, label, active = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all ${active ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
        >
            <div className={`${active ? 'text-primary' : 'text-slate-400'}`}>{icon}</div>
            <span>{label}</span>
        </button>
    )
}
