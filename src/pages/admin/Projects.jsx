import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Trash2, Eye, ShieldAlert, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { toast } from 'sonner';

export default function AdminProjects({ isEmbedded = false }) {
    const { projects, deleteProject } = useProjects();
    const { users } = useAdmin();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const itemsPerPage = 5;

    // Reset pagination when search term changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const sortedProjects = [...projects].sort((a, b) => {
        const statusOrder = { 'In Progress': 0, 'Ready': 0, 'Review': 0, 'Completed': 1, 'Signed Off': 1 };
        const statusA = statusOrder[a.status] ?? 0;
        const statusB = statusOrder[b.status] ?? 0;

        if (statusA !== statusB) return statusA - statusB;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    const filteredProjects = sortedProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = (e, id, status) => {
        e.stopPropagation();
        if (status !== 'Completed' && status !== 'Signed Off') {
            toast.error('Only signed-off KT projects can be deleted.');
            return;
        }
        if (pendingDeleteId === id) {
            // Second click = confirmed
            deleteProject(id);
            setPendingDeleteId(null);
            toast.success('Project deleted.');
        } else {
            // First click = arm the delete
            setPendingDeleteId(id);
            toast.warning('Click the delete button again to confirm deletion.', { duration: 3000 });
            // Auto-cancel after 3s
            setTimeout(() => setPendingDeleteId(prev => prev === id ? null : prev), 3000);
        }
    };

    return (
        <div className={`px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 ${isEmbedded ? 'px-4 sm:px-0 py-0' : ''}`}>

            {!isEmbedded && (
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
                    <div className="space-y-1 transition-colors">
                        <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">Projects management</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">Monitor and manage all active knowledge transfer initiatives.</p>
                    </div>
                    <div className="flex items-center gap-4 transition-colors">
                        <div className="relative w-80 group transition-colors">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search projects or managers..."
                                className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all font-medium dark:text-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>
            )}

            <div className="grid grid-cols-1 gap-6">
                {filteredProjects.length === 0 ? (
                    <Card className="border-dashed py-24 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border-slate-200 dark:border-slate-800 transition-colors">
                        <CardContent className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 transition-colors">
                            <ShieldAlert className="w-12 h-12 mb-4 opacity-20 transition-colors" />
                            <p className="font-medium text-sm transition-colors">No project records found matching your search</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Project detail</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Owner / manager</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Category</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-center">Status</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Progress</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Deadline</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-right pr-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {paginatedProjects.map((p) => {
                                            const displayCompletion = p.completion || 0;

                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/projects/${p.id}`, { state: { from: '/admin/projects' } })}>
                                                    <td className="p-4 py-5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{p.name}</span>
                                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[200px]">{p.description || 'No description provided.'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2.5 transition-colors">
                                                            {(() => {
                                                                const manager = users.find(u => u.id === p.managerId) || users.find(u => u.name === p.managerName) || { name: p.managerName };
                                                                return (
                                                                    <>
                                                                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors">
                                                                            {manager.name?.charAt(0) || 'M'}
                                                                        </div>
                                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">{manager.name}</span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {p.category && (
                                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider py-0 px-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 transition-colors">
                                                                {p.category}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center">
                                                            <Badge variant={(p.status === 'Completed' || p.status === 'Signed Off') ? 'success' : p.status === 'In Progress' ? 'blue' : 'soft'}>
                                                                {p.status === 'Completed' || p.status === 'Signed Off' ? 'Signed Off' : (p.status || 'Active')}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${displayCompletion === 100 ? 'bg-emerald-500' : 'bg-primary/70'}`}
                                                                    style={{ width: `${displayCompletion}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 min-w-[30px]">{displayCompletion}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors">
                                                            {p.deadline ? new Date(p.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`w-8 h-8 rounded-md transition-colors text-slate-400 ${pendingDeleteId === p.id
                                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                    : 'hover:bg-red-50 hover:text-red-600'
                                                                    }`}
                                                                onClick={(e) => handleDelete(e, p.id, p.status)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <div className="w-8 h-8 rounded-md flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </div>
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
                            <div className="flex items-center justify-between px-2 pt-2">
                                <p className="text-[11px] font-medium text-slate-400">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="rounded-lg h-8 w-8 p-0 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`rounded-lg h-8 w-8 p-0 text-[11px] font-semibold transition-all ${currentPage === i + 1 ? 'bg-primary text-white border-primary shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900'
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
                                        className="rounded-lg h-8 w-8 p-0 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
