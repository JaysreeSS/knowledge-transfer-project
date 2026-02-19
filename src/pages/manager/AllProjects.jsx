import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Plus, Folder, LogOut, ChevronLeft, ChevronRight, Search, Eye, ShieldAlert, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AllProjects() {
    const { user, logout } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset pagination when search term changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const managerProjects = projects.filter(p => p.managerId === user.id);

    const filteredProjects = managerProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <main className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            All Projects
                        </h1>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
                            Manage and track every project handover.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-10 h-10 bg-white border-slate-200 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => navigate('/manager/create-project')} className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 px-6 font-bold uppercase tracking-widest text-[10px] shadow-sm">
                            <Plus className="w-3.5 h-3.5 mr-2" /> New Project
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {filteredProjects.length === 0 ? (
                        <Card className="border border-dashed border-slate-200 py-24 bg-slate-50/50 rounded-xl">
                            <CardContent className="flex flex-col items-center justify-center">
                                <ShieldAlert className="w-12 h-12 mb-4 text-slate-200" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No project records found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Name</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Deadline</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Completion</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginatedProjects.map((p) => {
                                            const displayCompletion = p.completion || 0;
                                            const displayStatus = p.status || 'Not Started';

                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/manager/projects/${p.id}`)}>
                                                    <td className="p-4 py-5 font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                                        {p.name}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest w-fit border ${(displayStatus === 'Completed' || displayStatus === 'Signed Off')
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : displayStatus === 'In Progress'
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                : 'bg-slate-50 text-slate-400 border-slate-200'
                                                            }`}>
                                                            {displayStatus === 'Completed' || displayStatus === 'Signed Off' ? 'Signed Off' : (displayStatus || 'Active')}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${displayCompletion === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                    style={{ width: `${displayCompletion}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 min-w-[35px] text-right">{displayCompletion}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all ml-auto">
                                                            <Eye className="w-4 h-4" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="rounded-lg h-9 w-9 p-0 border-slate-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`rounded-lg h-9 w-9 p-0 font-bold text-[11px] ${currentPage === i + 1 ? 'shadow-sm' : 'border-slate-200 text-slate-500'
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
                                        className="rounded-lg h-9 w-9 p-0 border-slate-200"
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
