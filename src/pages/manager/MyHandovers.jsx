import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    Send,
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

    // Filter projects where user is Initiator, Contributor, or assigned to a section
    const myProjects = projects.filter(p =>
        p.members.some(m => m.userId === user.id && (m.ktRole === 'Initiator' || m.ktRole === 'Contributor')) ||
        p.sections.some(s => s.contributorId === user.id)
    );

    const filteredProjects = myProjects.filter(p =>
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
        <div className="px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700 font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Handovers</h1>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-lg">Manage sections assigned to you for contribution.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search handovers..."
                            className="pl-10 h-10 bg-white border-slate-200 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredProjects.length === 0 ? (
                    <Card className="border-dashed py-20 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center opacity-40">
                            <ShieldAlert className="w-12 h-12 mb-4 text-slate-400" />
                            <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No assigned handovers found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Name</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Role</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Completion</th>
                                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedProjects.map((p) => {
                                            const myRole = p.members.find(m => m.userId === user.id)?.ktRole;
                                            const completion = p.completion || 0;
                                            const status = p.status || 'Not Started';

                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => navigate(`/manager/my-handovers/${p.id}`)}>
                                                    <td className="p-4 py-5">
                                                        <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{p.name}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-md">
                                                            {myRole}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest w-fit border ${(status === 'Completed' || status === 'Signed Off')
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : status === 'In Progress'
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                : 'bg-slate-50 text-slate-400 border-slate-200'
                                                            }`}>
                                                            {status === 'Completed' || status === 'Signed Off' ? 'Signed Off' : (status || 'Active')}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${completion === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                    style={{ width: `${completion}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-600 min-w-[30px] text-right">{completion}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
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
                            <div className="flex items-center justify-center gap-2 pt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="rounded-lg h-9 w-9 p-0 border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                                </Button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`rounded-lg h-9 w-9 p-0 text-[11px] font-bold transition-all ${currentPage === i + 1
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
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
                                    className="rounded-lg h-9 w-9 p-0 border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
