import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Plus, Folder, LogOut, ArrowRight, ChevronLeft, ChevronRight, Search, Eye, ShieldAlert, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AllProjects() {
    const { user, logout } = useAuth();
    const { projects, fetchProjects } = useProjects();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [phaseTab, setPhaseTab] = useState(localStorage.getItem('projects_phase_tab') || 'ACTIVE'); // 'ACTIVE' or 'TRANSITION'
    
    // Save phase tab to localStorage
    const handleSetPhaseTab = (tab) => {
        setPhaseTab(tab);
        localStorage.setItem('projects_phase_tab', tab);
        setCurrentPage(1);
    };
    const [sortBy, setSortBy] = useState('Newest First');
    const itemsPerPage = 5;

    // Refresh projects on mount and when search term changes
    React.useEffect(() => {
        fetchProjects(true);
        setCurrentPage(1);
    }, [searchTerm, fetchProjects]);

    const managerProjects = projects.filter(p => p.managerId === user.id && p.lifecycleMode === phaseTab);

    const sortedProjects = [...managerProjects].sort((a, b) => {
        if (sortBy === 'Newest First') return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
        if (sortBy === 'Oldest First') return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
        if (sortBy === 'Completion %') return (b.completion || 0) - (a.completion || 0);
        if (sortBy === 'Status') return (a.status || '').localeCompare(b.status || '');
        if (sortBy === 'Recently Updated') return new Date(b.updated_at || b.createdAt || 0) - new Date(a.updated_at || a.createdAt || 0);
        return 0;
    });

    const filteredProjects = sortedProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="font-sans transition-colors">
            <main className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-colors">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 transition-colors">
                    <div className="space-y-1 transition-colors">
                        <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">
                            All projects
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg transition-colors">
                            Manage and track every project handover.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 transition-colors w-full md:w-auto">
                        <div className="relative w-full md:w-72 group transition-colors">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-10 h-10 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary text-sm font-medium dark:text-slate-200 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select 
                                className="flex-1 sm:flex-none h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none font-medium text-slate-600 dark:text-slate-300 focus:ring-primary/20 transition-all"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option>Newest First</option>
                                <option>Oldest First</option>
                                <option>Deadline</option>
                                <option>Completion %</option>
                                <option>Status</option>
                                <option>Recently Updated</option>
                            </select>
                            <Button 
                                id="manager-create-project-btn"
                                onClick={() => navigate('/manager/create-project')} 
                                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 px-6 font-medium text-sm tracking-button shadow-sm transition-all whitespace-nowrap"
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> New project
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex items-center justify-end border-b border-slate-200 dark:border-slate-800 mb-6 font-sans">
                    <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 mb-2">
                        <button 
                            onClick={() => handleSetPhaseTab('ACTIVE')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${phaseTab === 'ACTIVE' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Active Phase
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${phaseTab === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {projects.filter(p => p.managerId === user.id && p.lifecycleMode === 'ACTIVE').length}
                            </span>
                        </button>
                        <button 
                            onClick={() => handleSetPhaseTab('TRANSITION')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${phaseTab === 'TRANSITION' ? 'bg-white dark:bg-slate-800 text-orange-600 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Transition Phase
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${phaseTab === 'TRANSITION' ? 'bg-orange-600/10 text-orange-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {projects.filter(p => p.managerId === user.id && p.lifecycleMode === 'TRANSITION').length}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredProjects.length === 0 ? (
                        <Card className="border border-dashed border-slate-200 dark:border-slate-800 py-24 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                            <CardContent className="flex flex-col items-center justify-center">
                                <ShieldAlert className="w-12 h-12 mb-4 text-slate-200 dark:text-slate-600" />
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-label">No project records found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden backdrop-blur-sm">
                                <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 w-[50%]">Project details</th>
                                                {phaseTab === 'ACTIVE' ? (
                                                    <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-center">Created At</th>
                                                ) : (
                                                    <>
                                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-center">Deadline</th>
                                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-center">Status</th>
                                                    </>
                                                )}
                                                <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Completion</th>
                                                <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {paginatedProjects.map((p) => {
                                                const displayCompletion = p.completion || 0;
                                                const displayDeadline = p.deadline ? new Date(p.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline';

                                                return (
                                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group" onClick={() => navigate(`/manager/projects/${p.id}`, { state: { from: '/manager/projects' } })}>
                                                        <td className="p-4 py-5 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-semibold truncate max-w-[320px]">{p.name}</span>
                                                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[320px] italic">
                                                                    {p.description || 'No description provided.'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center transition-colors">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-label text-nowrap">
                                                                    {phaseTab === 'ACTIVE' ? (p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A') : displayDeadline}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {phaseTab === 'TRANSITION' && (
                                                            <td className="p-4 text-center transition-colors">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-label text-nowrap">
                                                                        {p.status || 'Active'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1 w-32 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full transition-all duration-1000 ${displayCompletion === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                        style={{ width: `${displayCompletion}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[35px] text-right">{displayCompletion}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all border dark:border-slate-800 ml-auto">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4 transition-colors">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="rounded-lg h-9 w-9 p-0 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`rounded-lg h-9 w-9 p-0 font-semibold text-xs transition-all ${currentPage === i + 1 ? 'shadow-sm' : 'border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-slate-500 dark:text-slate-400 translate-colors'
                                                }`}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="rounded-lg h-9 w-9 p-0 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
