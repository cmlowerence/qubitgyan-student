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
    if (!type) return <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
    const t = type.toUpperCase();
    if (t.includes('VIDEO')) return <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
    if (t.includes('DOC') || t.includes('PDF')) return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
    if (t.includes('QUIZ') || t.includes('TEST')) return <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
    return <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs sm:text-sm animate-pulse text-center">Loading Activity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 font-sans">
      
      {/* Header Section */}
      <section className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-50 rounded-full blur-[60px] sm:blur-[80px] -z-10 pointer-events-none" />
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">Activity History</h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium mt-1 leading-snug">Track your interactions and resume where you left off.</p>
          </div>
        </div>
      </section>

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10">
        <StatCard 
          title="Total Accessed" 
          value={summary.total.toString()} 
          icon={<History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />} 
          bg="bg-blue-50" 
          borderColor="border-blue-100" 
        />
        <StatCard 
          title="Completed" 
          value={summary.completed.toString()} 
          icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />} 
          bg="bg-emerald-50" 
          borderColor="border-emerald-100" 
        />
        <StatCard 
          title="In Progress" 
          value={summary.pending.toString()} 
          icon={<Clock3 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />} 
          bg="bg-amber-50" 
          borderColor="border-amber-100" 
        />
      </section>

      {/* Main List Section */}
      <section className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">Recent Resources</h2>
          <span className="text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
            {summary.completionRate}% Completion Rate
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <History className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">No activity recorded</p>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Your accessed resources will appear here once you start learning.</p>
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
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 hover:bg-slate-50 transition-colors active:bg-slate-100/50 sm:active:bg-slate-50"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors mt-0.5 sm:mt-0">
                      {getTypeIcon(item.resource_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-700 transition-colors line-clamp-2 md:line-clamp-1 leading-snug sm:leading-normal mb-1 sm:mb-0">
                        {item.resource_title || `Resource #${item.resource}`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Clock3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          <span className="hidden sm:inline">{formattedDate} at {formattedTime}</span>
                          <span className="sm:hidden">{formattedDate}</span>
                        </span>
                        {item.resource_type && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                            <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-bold shrink-0">{item.resource_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide",
                      item.is_completed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      {item.is_completed ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {item.is_completed ? 'Completed' : 'In progress'}
                    </span>
                    
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
    <div className={cn("rounded-2xl sm:rounded-[1.5rem] border p-4 sm:p-5 flex flex-col justify-center bg-white shadow-sm hover:shadow-md transition-shadow", borderColor)}>
      <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
        <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0", bg)}>
          {icon}
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{title}</p>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 ml-0.5 sm:ml-1 leading-none sm:leading-normal">{value}</p>
    </div>
  );
}