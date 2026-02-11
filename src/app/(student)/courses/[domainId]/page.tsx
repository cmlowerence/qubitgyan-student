'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getChildren, getNode } from '@/lib/learning';
import { KnowledgeNode } from '@/types';
import { ChevronRight, LibraryBig } from 'lucide-react';

export default function SubjectSelectionPage() {
  const params = useParams();
  const domainId = Number(params.domainId);
  const [domain, setDomain] = useState<KnowledgeNode | null>(null);
  const [subjects, setSubjects] = useState<KnowledgeNode[]>([]);

  useEffect(() => {
    getNode(domainId).then(setDomain);
    getChildren(domainId).then(setSubjects);
  }, [domainId]);

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-3xl p-6 border border-slate-200 bg-white">
        <p className="text-sm text-slate-500">Domain</p>
        <h1 className="text-3xl font-black text-slate-900">{domain?.name || 'Loading...'}</h1>
        <p className="mt-2 text-slate-500">Pick a subject and open the new flat interactive explorer (no deep tree pain).</p>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Link
            href={`/courses/${domainId}/${subject.id}`}
            key={subject.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <LibraryBig className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg">{subject.name}</h2>
            </div>
            <p className="text-sm text-slate-500">Structured units with responsive video and PDF reading.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
              Open subject <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
