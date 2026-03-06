// src/app/(student)/courses/[domainId]/[subjectId]/page.tsx
'use client';

import { ContentViewer } from '@/components/student/content-viewer';
import { getDescendantStudyNodes, getNode, getProgressSummary, getResources } from '@/lib/learning';
import { KnowledgeNode, Resource } from '@/types';
import { cn } from '@/lib/utils';
import { Search, Sparkles, LayoutList, ChevronLeft, LibraryBig } from 'lucide-react';
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
      setActiveUnit(unitList.find((unit) => unit.id === preselectedUnit) || unitList[0] || null);
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
      const currentItems = await getResources(activeUnit.id);

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

  const filteredUnits = useMemo(() => units.filter((unit) => unit.name.toLowerCase().includes(query.toLowerCase())), [units, query]);

  return (
    <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 pb-8 min-h-[calc(100vh-9rem)] px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
      
      {/* Mobile Sidebar Toggle */}
      <div className="xl:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <Link href={`/courses/${domainId}`} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-sm font-medium">
           <ChevronLeft className="w-4 h-4" /> Back to Modules
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <LayoutList className="w-4 h-4" />
          {isSidebarOpen ? 'Hide Lessons' : 'Show Lessons'}
        </button>
      </div>

      <aside className={cn(
        "rounded-3xl border border-slate-200 bg-white p-4 xl:w-[320px] 2xl:w-[380px] shrink-0 flex-col h-fit xl:sticky xl:top-8",
        isSidebarOpen ? "flex" : "hidden xl:flex"
      )}>
        <div className="shrink-0 mb-4">
          <p className="text-xs uppercase font-bold tracking-[0.15em] text-slate-400">Current Module</p>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 leading-tight">{subject?.name || 'Loading...'}</h1>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-slate-200 transition-shadow">
            <Search className="w-4 h-4 text-slate-400" />
            <input className="bg-transparent outline-none w-full text-sm font-medium placeholder:text-slate-400" placeholder="Search lessons..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto pr-2 flex-1 max-h-[50vh] xl:max-h-[calc(100vh-16rem)] custom-scrollbar">
          {filteredUnits.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">No lessons found.</div>
          ) : (
            filteredUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => {
                  setActiveUnit(unit);
                  setIsSidebarOpen(false); 
                }}
                className={cn(
                  'w-full text-left rounded-2xl border px-4 py-3.5 transition-all duration-200',
                  activeUnit?.id === unit.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <p className="font-bold text-sm leading-snug">{unit.name}</p>
                <p className={cn('text-xs mt-1.5 font-medium', activeUnit?.id === unit.id ? 'text-slate-400' : 'text-slate-500')}>
                  {unit.resource_count || 0} Resources
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 flex-1 flex flex-col min-h-[600px] w-full max-w-full overflow-hidden">
        <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm font-medium flex items-center gap-2.5 text-fuchsia-800 shrink-0 mb-4">
          <Sparkles className="w-4 h-4 shrink-0 text-fuchsia-600" />
          <span className="truncate">Currently viewing resources for <strong className="font-bold">{activeUnit?.name || '...'}</strong></span>
        </div>

        {resources.length > 0 ? (
          <div className="flex flex-col h-full flex-1">
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-2 px-2 shrink-0 custom-scrollbar">
              {resources.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => setActiveResource(resource)}
                  className={cn(
                    'rounded-xl px-5 py-2.5 whitespace-nowrap text-sm font-bold border transition-all duration-200',
                    activeResource?.id === resource.id 
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {resource.title}
                    {completedIds.has(resource.id) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50/50 relative">
              <ContentViewer
                resource={activeResource}
                nodeId={activeUnit?.id || 0}
                onComplete={() =>
                  setCompletedIds((prev) => {
                    const next = new Set(prev);
                    if (activeResource) next.add(activeResource.id);
                    return next;
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl border border-dashed border-slate-300 p-10 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50">
            <LibraryBig className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">No content available</p>
            <p className="text-sm mt-1">There are no resources uploaded for this lesson yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}