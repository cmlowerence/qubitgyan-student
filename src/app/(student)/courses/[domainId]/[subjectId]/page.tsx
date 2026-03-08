'use client';

import { ContentViewer } from '@/components/student/content-viewer';
import { getDescendantStudyNodes, getNode, getProgressSummary, getResources } from '@/lib/learning';
import { KnowledgeNode, Resource } from '@/types';
import { cn } from '@/lib/utils';
import { Search, Sparkles, LayoutList, ChevronLeft, LibraryBig, CheckCircle2, StarIcon, CircleCheck, EyeIcon } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function SubjectLearningPage() {
  const params = useParams();
  const queryParams = useSearchParams();
  const domainId = Number(params.domainId);
  const subjectId = Number(params.subjectId);
  const preselectedUnit = Number(queryParams.get('unit'));

  const [subject, setSubject] = useState<KnowledgeNode | null>(null);
  const [units, setUnits] = useState<KnowledgeNode[]>([]);
  const [activeUnit, setActiveUnit] = useState<KnowledgeNode | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    const load = async () => {
      const [subjectNode, unitList, progress] = await Promise.all([
        getNode(subjectId),
        getDescendantStudyNodes(subjectId),
        getProgressSummary(),
      ]);
      setSubject(subjectNode);
      setUnits(unitList);
      setCompletedIds(progress.completedResourceIds);
      setActiveUnit(unitList.find((u) => u.id === preselectedUnit) || unitList[0] || null);
    };
    load();
  }, [subjectId, preselectedUnit]);

  useEffect(() => {
    if (!activeUnit) {
      setResources([]);
      setActiveResource(null);
      return;
    }
    const loadUnitResources = async () => {
      let currentItems = await getResources(activeUnit.id);

      if (currentItems.length === 0) {
        for (const unit of units) {
          if (unit.id === activeUnit.id) continue;
          const fallbackItems = await getResources(unit.id);
          if (fallbackItems.length > 0) {
            setActiveUnit(unit);
            return;
          }
        }
      }
      const mapped = currentItems.map((item) => ({ ...item, is_completed: completedIds.has(item.id) }));
      setResources(mapped);
      setActiveResource(mapped[0] || null);
    };
    loadUnitResources();
  }, [activeUnit, completedIds, units]);

  const filteredUnits = useMemo(() => units.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())), [units, query]);
  const headerBgImage = (subject as any)?.thumbnail_url || (subject as any)?.image || 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 pb-8 min-h-[calc(100vh-9rem)] px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto pt-6">
      
      {/* Mobile Sidebar Toggle */}
      <div className="xl:hidden flex items-center justify-between bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
        <Link href={`/courses/${domainId}`} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-sm font-bold transition-colors">
           <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2.5 rounded-xl"
        >
          <LayoutList className="w-4 h-4" />
          {isSidebarOpen ? 'Hide Index' : 'Course Index'}
        </button>
      </div>

      <aside className={cn(
        "rounded-[2rem] border border-slate-200 bg-white p-5 xl:w-[340px] shrink-0 flex-col h-fit xl:sticky xl:top-8 shadow-sm",
        isSidebarOpen ? "flex" : "hidden xl:flex"
      )}>
        <div className="shrink-0 mb-6">
          <div className="relative rounded-[1.5rem] overflow-hidden mb-4 bg-slate-900 min-h-[120px] flex flex-col justify-end p-5">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${headerBgImage})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400 mb-1">Explorer</p>
              <h1 className="text-lg font-black text-white leading-tight line-clamp-2">{subject?.name || 'Loading...'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input className="bg-transparent outline-none w-full text-sm font-bold placeholder:text-slate-400 text-slate-800" placeholder="Search lessons..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto pr-2 flex-1 max-h-[50vh] xl:max-h-[calc(100vh-22rem)] custom-scrollbar">
          {filteredUnits.length === 0 ? (
            <div className="text-center py-8 text-sm font-medium text-slate-500">No lessons found.</div>
          ) : (
            filteredUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => { setActiveUnit(unit); setIsSidebarOpen(false); }}
                className={cn(
                  'w-full text-left rounded-[1.25rem] border px-5 py-4 transition-all duration-200 flex flex-col gap-1',
                  activeUnit?.id === unit.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                    : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700',
                )}
              >
                <p className="font-bold text-sm leading-snug line-clamp-2">{unit.name}</p>
                <p className={cn('text-[11px] font-bold tracking-wider uppercase', activeUnit?.id === unit.id ? 'text-indigo-200' : 'text-slate-400')}>
                  {unit.resource_count || 0} Resources
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-h-[600px] w-full max-w-full overflow-hidden shadow-sm">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-bold flex items-center gap-3 text-indigo-800 shrink-0 mb-6">
          <EyeIcon className="w-5 h-5 shrink-0 text-yellow-500" />
          <span className="truncate">Viewing: {activeUnit?.name || 'Select a lesson'}</span>
        </div>

        {resources.length > 0 ? (
          <div className="flex flex-col h-full flex-1">
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 -mx-2 px-2 shrink-0 custom-scrollbar">
              {resources.map((res) => {
                const isDone = completedIds.has(res.id);
                return (
                  <button
                    key={res.id}
                    onClick={() => setActiveResource(res)}
                    className={cn(
                      'rounded-xl px-5 py-3 whitespace-nowrap text-sm font-bold border-2 transition-all duration-200',
                      activeResource?.id === res.id 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {res.title} 
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex-1 rounded-2xl px-6 py-4 overflow-hidden border border-slate-200 bg-slate-50 relative">
              <ContentViewer
                resource={activeResource}
                nodeId={activeUnit?.id || 0}
                onComplete={() => setCompletedIds(prev => new Set(prev).add(activeResource!.id))}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50">
            <LibraryBig className="w-16 h-16 text-slate-300 mb-4" />
            <p className="font-black text-slate-800 text-xl mb-1">No content yet</p>
            <p className="text-sm font-medium">Resources will appear here once they are uploaded to this module.</p>
          </div>
        )}
      </section>
    </div>
  );
}