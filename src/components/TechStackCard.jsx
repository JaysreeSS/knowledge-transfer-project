import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Server, Database, Globe, Cpu } from 'lucide-react';

const techIcons = {
    'Frontend': Globe,
    'Backend': Server,
    'Database': Database,
    'Infrastructure': Cpu,
    'Other': Code
};

export default function TechStackCard({ stack = [], className = "" }) {
    if (!stack || stack.length === 0) return null;

    // Grouping by category if provided, otherwise showing as a list
    const grouped = stack.reduce((acc, tech) => {
        const cat = tech.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tech);
        return acc;
    }, {});

    return (
        <Card className={`border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 backdrop-blur-sm ${className}`}>
            <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-primary" /> Tech Stack & Tools
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                {Object.entries(grouped).map(([category, items]) => {
                    const Icon = techIcons[category] || techIcons['Other'];
                    return (
                        <div key={category} className="space-y-2">
                            <div className="flex items-center gap-2 opacity-60">
                                <Icon className="w-3 h-3 text-slate-400" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{category}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {items.map((item, idx) => (
                                    <Badge 
                                        key={idx} 
                                        variant="soft" 
                                        className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-none px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                                    >
                                        {item.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
