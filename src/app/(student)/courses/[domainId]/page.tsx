'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChildren, getNode } from '@/lib/learning';
import { KnowledgeNode } from '@/types';
import { ChevronRight, LibraryBig, Loader2, ArrowLeft, Layers } from 'lucide-react';

const MODULE_PLACEHOLDER = 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=800&auto=format&fit=crop';

export default function SubjectSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = Number(params.domainId);
  const [domain, setDomain] = useState<KnowledgeNode | null>(null);
  const [subjects, setSubjects] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domainId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [domainData, subjectsData] = await Promise.all([getNode(domainId), getChildren(domainId)]);
        setDomain(domainData);
        setSubjects(subjectsData);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [domainId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Modules...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      <button onClick={() => router.push('/courses')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <section className="rounded-[2.5rem] bg-white p-8 md:p-12 border border-slate-200 shadow-sm mb-10 flex flex-col md:flex-row md:items-center gap-8">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shrink-0">
          <Layers className="w-10 h-10" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-2">Track Overview</p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900">{domain?.name || 'Curriculum'}</h1>
          <p className="mt-3 text-slate-500 text-lg font-medium max-w-2xl">Select a module below to open the interactive explorer and begin your learning journey.</p>
        </div>
      </section>

      {subjects.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-slate-300 p-16 text-center text-slate-500 bg-white">
          <LibraryBig className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-xl text-slate-900 mb-2">No modules available</p>
          <p className="text-base font-medium">Learning materials have not been added to this track yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => {
            if (subject.id === domainId) return null;
            const bgImage = (subject as any).thumbnail_url || (subject as any).image || MODULE_PLACEHOLDER;
            
            return (
              <Link
                href={`/courses/${domainId}/${subject.id}`}
                key={subject.id}
                className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-6 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 group flex flex-col justify-end min-h-[260px]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-auto">
                    <div className="w-12 h-12 rounded-[1rem] bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                      <LibraryBig className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h2 className="font-bold text-xl leading-tight text-white group-hover:text-indigo-300 transition-colors">{subject.name}</h2>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                      Enter Explorer <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}