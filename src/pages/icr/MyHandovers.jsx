import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    ShieldAlert
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MyHandovers() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter projects where user is Initiator or Contributor
    const myProjects = projects.filter(p =>
        p.members.some(m => m.userId === user.id && (m.ktRole === 'Initiator' || m.ktRole === 'Contributor'))
    );

    const sortedProjects = [...myProjects].sort((a, b) => {
        const statusOrder = { 'In Progress': 0, 'Ready': 0, 'Review': 0, 'Completed': 1, 'Signed Off': 1 };
        const statusA = statusOrder[a.status] ?? 0;
        const statusB = statusOrder[b.status] ?? 0;

        if (statusA !== statusB) return statusA - statusB;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    const filteredProjects = sortedProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset pagination when search term changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700 font-sans transition-colors">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">My Handovers</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-lg transition-colors">Manage sections assigned to you for contribution.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search handovers..."
                            className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary text-sm font-medium dark:text-slate-200 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredProjects.length === 0 ? (
                    <Card className="border-dashed py-20 bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
                        <CardContent className="flex flex-col items-center justify-center opacity-40">
                            <ShieldAlert className="w-12 h-12 mb-4 text-slate-400 dark:text-slate-600" />
                            <p className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-label text-xs">No assigned handovers found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden backdrop-blur-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Project name</th>
                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Your role</th>
                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Status</th>
                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Deadline</th>
                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Completion</th>
                                        <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                    {paginatedProjects.map((p) => {
                                        const myRole = p.members.find(m => m.userId === user.id)?.ktRole;
                                        const displayCompletion = p.completion || 0;
                                        const displayStatus = p.status || 'Not Started';

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group" onClick={() => navigate(`/icr/handovers/${p.id}`)}>
                                                <td className="p-4 py-5">
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{p.name}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md tracking-label border dark:border-slate-800">
                                                        {myRole}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-label w-fit border ${(displayStatus === 'Completed' || displayStatus === 'Signed Off')
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                                        : displayStatus === 'In Progress'
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                                                        }`}>
                                                        {displayStatus === 'Completed' || displayStatus === 'Signed Off' ? 'Signed off' : (displayStatus || 'Active')}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${displayCompletion === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                style={{ width: `${displayCompletion}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[30px] text-right">{displayCompletion}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-primary dark:group-hover:bg-primary/20 group-hover:text-white dark:group-hover:text-primary transition-all border dark:border-slate-800">
                                                            <ChevronRight className="w-4 h-4 transition-colors" />
                                                        </div>
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
                            <div className="flex items-center justify-center gap-2 pt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="rounded-lg h-9 w-9 p-0 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </Button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`rounded-lg h-9 w-9 p-0 text-xs font-medium transition-all ${currentPage === i + 1
                                            ? 'bg-primary dark:bg-primary text-white shadow-sm'
                                            : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
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
                                    className="rounded-lg h-9 w-9 p-0 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
