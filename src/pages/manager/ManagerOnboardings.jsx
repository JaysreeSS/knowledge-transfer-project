import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Inbox, 
    ChevronRight, 
    ChevronLeft, 
    ShieldAlert 
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ManagerOnboardings() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter projects where user is the Receiver (ICR)
    const myProjects = projects.filter(p => 
        p.members.some(m => m.userId === user.id && m.ktRole === 'Receiver')
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
        <div className="px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700 font-sans transition-colors">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 transition-colors">
                <div className="space-y-1 transition-colors">
                    <h1 className="text-2xl font-semibold tracking-page-title text-slate-900 dark:text-slate-100 transition-colors">My onboardings</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-lg transition-colors">Review and sign off on projects you are joining.</p>
                </div>
                <div className="flex items-center gap-4 transition-colors">
                    <div className="relative w-64 group transition-colors">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search onboardings..." 
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
                            <p className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-label text-xs">No onboardings found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
                                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Project name</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Your role</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Status</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400">Completion</th>
                                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-500 dark:text-slate-400 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                        {paginatedProjects.map((p) => {
                                            const ktRole = p.members.find(m => m.userId === user.id)?.ktRole;
                                            
                                            return (
                                                <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer" onClick={() => navigate(`/manager/projects/${p.id}`)}>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800 transition-colors">
                                                                <Inbox className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{p.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">{p.description || "Knowledge transition details."}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="soft" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded transition-colors">
                                                            {ktRole}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Completed' || p.status === 'Signed Off' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {p.status === 'Completed' || p.status === 'Signed Off' ? 'Signed Off' : (p.status || 'Active')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3 max-w-[120px]">
                                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                                                <div 
                                                                    className="h-full bg-primary transition-all duration-500" 
                                                                    style={{ width: `${p.completion || 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                                                                {p.completion || 0}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Showing <span className="text-slate-900 dark:text-slate-200 font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900 dark:text-slate-200 font-semibold">{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</span> of <span className="text-slate-900 dark:text-slate-200 font-semibold">{filteredProjects.length}</span> results
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
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
