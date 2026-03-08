'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock3, 
  Loader2, 
  Activity, 
  History,
  Target,
  PlayCircle,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  ArrowRight
} from 'lucide-react';
import { getTracking } from '@/lib/learning';
import { cn } from '@/lib/utils';

// Extending the payload to include the new fields we will add to the backend
interface ExtendedTrackingPayload {
  id: number;
  resource: number;
  resource_title?: string;
  resource_type?: string;
  is_completed: boolean;
  last_accessed: string;
}

export default function TrackingPage() {
  const [items, setItems] = useState<ExtendedTrackingPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getTracking();
        // Sort by most recently accessed first
        const sortedData = data.sort((a, b) => 
          new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
        );
        setItems(sortedData);
      } catch (error) {
        console.error("Failed to load tracking data", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const completed = items.filter((item) => item.is_completed).length;
    return {
      total: items.length,
      completed,
      pending: Math.max(items.length - completed, 0),
      completionRate: items.length > 0 ? Math.round((completed / items.length) * 100) : 0
    };
  }, [items]);

  // Helper to grab the right icon based on resource type
  const getTypeIcon = (type?: string) => {
    if (!type) return <LinkIcon className="w-5 h-5" />;
    const t = type.toUpperCase();
    if (t.includes('VIDEO')) return <PlayCircle className="w-5 h-5" />;
    if (t.includes('DOC') || t.includes('PDF')) return <FileText className="w-5 h-5" />;
    if (t.includes('QUIZ') || t.includes('TEST')) return <HelpCircle className="w-5 h-5" />;
    return <LinkIcon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Activity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 font-sans">
      
      {/* Header Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -z-10 pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.25rem] flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Activity History</h1>
            <p className="text-slate-500 font-medium mt-1">Track your interactions and resume where you left off.</p>
          </div>
        </div>
      </section>

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
        <StatCard 
          title="Total Accessed" 
          value={summary.total.toString()} 
          icon={<History className="w-6 h-6 text-blue-500" />} 
          bg="bg-blue-50" 
          borderColor="border-blue-100" 
        />
        <StatCard 
          title="Completed" 
          value={summary.completed.toString()} 
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />} 
          bg="bg-emerald-50" 
          borderColor="border-emerald-100" 
        />
        <StatCard 
          title="In Progress" 
          value={summary.pending.toString()} 
          icon={<Clock3 className="w-6 h-6 text-amber-500" />} 
          bg="bg-amber-50" 
          borderColor="border-amber-100" 
        />
      </section>

      {/* Main List Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Recent Resources</h2>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
            {summary.completionRate}% Completion Rate
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <History className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">No activity recorded</p>
            <p className="text-slate-500 font-medium">Your accessed resources will appear here once you start learning.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const date = new Date(item.last_accessed);
              const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

              return (
                <Link 
                  href={`/resources/${item.resource}`} 
                  key={item.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                      {getTypeIcon(item.resource_type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {item.resource_title || `Resource #${item.resource}`}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="w-4 h-4 text-slate-400" />
                          {formattedDate} at {formattedTime}
                        </span>
                        {item.resource_type && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="uppercase tracking-wider text-[11px] font-bold">{item.resource_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                      item.is_completed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      {item.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                      {item.is_completed ? 'Completed' : 'In progress'}
                    </span>
                    
                    <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// --- Helper Component ---
function StatCard({ title, value, icon, bg, borderColor }: { title: string; value: string; icon: any; bg: string; borderColor: string }) {
  return (
    <div className={cn("rounded-[1.5rem] border p-5 flex flex-col justify-center bg-white shadow-sm hover:shadow-md transition-shadow", borderColor)}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
          {icon}
        </div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-3xl font-black text-slate-900 ml-1">{value}</p>
    </div>
  );
}