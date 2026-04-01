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
    ShieldAlert,
    Clock,
    Zap,
    Briefcase
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function MyHandovers() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // ACTIVE projects: Mode is ACTIVE and user is member (Excluding Receivers)
    const activeProjects = projects.filter(p =>
        p.lifecycleMode === 'ACTIVE' &&
        p.members.some(m => m.userId === user.id && m.ktRole !== 'Receiver')
    );

    // TRANSITION projects: Mode is TRANSITION and user is member (Excluding Receivers)
    const transitionProjects = projects.filter(p =>
        p.lifecycleMode === 'TRANSITION' &&
        p.members.some(m => m.userId === user.id && m.ktRole !== 'Receiver')
    );

    const filterFunc = (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const filteredActive = activeProjects.filter(filterFunc);
    const filteredTransition = transitionProjects.filter(filterFunc);

    const [activeTab, setActiveTab] = useState(localStorage.getItem('my_handovers_tab') || 'active');
    
    // Save phase tab to localStorage
    const handleSetActiveTab = (tab) => {
        setActiveTab(tab);
        localStorage.setItem('my_handovers_tab', tab);
        setCurrentPage(1);
    };
    const currentData = activeTab === 'active' ? filteredActive : filteredTransition;

    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const paginatedProjects = currentData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getMyRole = (p) => p.members.find(m => m.userId === user.id)?.ktRole || 'Member';

    return (
        <div className="px-4 sm:px-8 md:px-12 py-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans transition-colors">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">My Handovers</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-lg transition-colors">
                        Manage your assigned projects and transitions.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-primary/20 focus:border-primary text-sm font-medium dark:text-slate-200 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <Tabs value={activeTab} className="w-full space-y-6" onValueChange={handleSetActiveTab}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-px">
                    <TabsList className="h-auto p-0 bg-transparent gap-8 rounded-none border-none">
                        <TabsTrigger
                            value="active"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-4 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
                        >
                            Active <Badge variant="secondary" className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-bold">{activeProjects.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="transition"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-4 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
                        >
                            Transition <Badge variant="secondary" className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-bold">{transitionProjects.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="mt-0">
                    <ProjectList
                        projects={paginatedProjects}
                        user={user}
                        navigate={navigate}
                        mode="ACTIVE"
                    />
                </TabsContent>

                <TabsContent value="transition" className="mt-0">
                    <ProjectList
                        projects={paginatedProjects}
                        user={user}
                        navigate={navigate}
                        mode="TRANSITION"
                    />
                </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
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
    );
}

function ProjectList({ projects, user, navigate, mode }) {
    if (projects.length === 0) {
        return (
            <Card className="border-dashed py-20 bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
                <CardContent className="flex flex-col items-center justify-center opacity-40">
                    <ShieldAlert className="w-12 h-12 mb-4 text-slate-400 dark:text-slate-600" />
                    <p className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-label text-xs">
                        No {mode.toLowerCase()} projects found
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                        <tr>
                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Project name</th>
                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Mode / Role</th>
                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Status</th>
                            {mode === 'TRANSITION' && <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Deadline</th>}
                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500">Completion</th>
                            <th className="p-4 text-xs font-medium uppercase tracking-label text-slate-400 dark:text-slate-500 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                        {projects.map((p) => {
                            const member = p.members.find(m => m.userId === user.id);
                            const role = member?.ktRole || 'Member';
                            const displayCompletion = p.completion || 0;
                            const displayStatus = p.status || 'Active';

                            const handleClick = () => {
                                if (role === 'Receiver') {
                                    navigate(`/icr/onboardings/${p.id}`);
                                } else {
                                    navigate(`/icr/handovers/${p.id}`);
                                }
                            };

                            return (
                                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group" onClick={handleClick}>
                                    <td className="p-4 py-5 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-semibold truncate max-w-[280px]">{p.name}</span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[280px] italic">
                                                {p.description || 'No description provided.'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                {mode === 'ACTIVE' ? <Briefcase className="w-3 h-3 text-emerald-500" /> : <Zap className="w-3 h-3 text-amber-500" />}
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${mode === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {mode}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="w-fit text-[10px] font-medium py-0 px-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded tracking-label">
                                                {role}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-label w-fit border ${(displayStatus === 'Completed' || displayStatus === 'Signed Off')
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                            : mode === 'TRANSITION'
                                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                            }`}>
                                            {displayStatus}
                                        </div>
                                    </td>
                                    {mode === 'TRANSITION' && (
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold">
                                                    {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'No Limit'}
                                                </span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${displayCompletion === 100 ? 'bg-emerald-500' : (mode === 'TRANSITION' ? 'bg-amber-500' : 'bg-primary')}`}
                                                    style={{ width: `${displayCompletion}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 min-w-[30px] text-right">{displayCompletion}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-primary dark:group-hover:bg-primary/20 group-hover:text-white dark:group-hover:text-primary transition-all border dark:border-slate-800 shadow-sm">
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
        </div>
    );
}
