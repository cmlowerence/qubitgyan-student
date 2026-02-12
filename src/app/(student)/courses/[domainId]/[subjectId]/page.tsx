'use client';

import { ContentViewer } from '@/components/student/content-viewer';
import { getDescendantStudyNodes, getNode, getProgressSummary, getResources } from '@/lib/learning';
import { KnowledgeNode, Resource } from '@/types';
import { cn } from '@/lib/utils';
import { Search, Sparkles } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function SubjectLearningPage() {
  const params = useParams();
  const queryParams = useSearchParams();
  const subjectId = Number(params.subjectId);
  const preselectedUnit = Number(queryParams.get('unit'));

  const [subject, setSubject] = useState<KnowledgeNode | null>(null);
  const [units, setUnits] = useState<KnowledgeNode[]>([]);
  const [activeUnit, setActiveUnit] = useState<KnowledgeNode | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState('');

  useEffect(() => {
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

    getResources(activeUnit.id).then((items) => {
      const mapped = items.map((item) => ({ ...item, is_completed: completedIds.has(item.id) }));
      setResources(mapped);
      setActiveResource(mapped[0] || null);
    });
  }, [activeUnit, completedIds]);

  const filteredUnits = useMemo(() => units.filter((unit) => unit.name.toLowerCase().includes(query.toLowerCase())), [units, query]);

  return (
    <div className="grid xl:grid-cols-[360px,1fr] gap-4 lg:gap-5 pb-8 min-h-[calc(100vh-9rem)]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-4 h-fit xl:sticky xl:top-8">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subject</p>
        <h1 className="text-2xl font-black text-slate-900 mt-1">{subject?.name || 'Loading...'}</h1>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 border border-slate-200">
          <Search className="w-4 h-4 text-slate-500" />
          <input className="bg-transparent outline-none w-full text-sm" placeholder="Search lesson/unit..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>

        <div className="mt-4 space-y-2 max-h-[45vh] sm:max-h-[55vh] overflow-y-auto pr-1">
          {filteredUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => setActiveUnit(unit)}
              className={cn(
                'w-full text-left rounded-2xl border px-4 py-3 transition-all',
                activeUnit?.id === unit.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 hover:border-slate-300',
              )}
            >
              <p className="font-semibold">{unit.name}</p>
              <p className={cn('text-xs mt-1', activeUnit?.id === unit.id ? 'text-slate-200' : 'text-slate-500')}>Open resources</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 space-y-4">
        <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm flex items-center gap-2 text-fuchsia-700">
          <Sparkles className="w-4 h-4" />
          Fast explorer view for lessons and resources.
        </div>

        {resources.length > 0 ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {resources.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => setActiveResource(resource)}
                  className={cn(
                    'rounded-xl px-4 py-2 whitespace-nowrap text-sm font-semibold border transition-all',
                    activeResource?.id === resource.id ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
                  )}
                >
                  {resource.title}
                </button>
              ))}
            </div>
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
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">No resources available for this lesson yet.</div>
        )}
      </section>
    </div>
  );
}
