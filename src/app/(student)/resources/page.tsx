'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getChildren, getDomains } from '@/lib/learning';
import { KnowledgeNode } from '@/types';
import { FileSearch, FolderOpen } from 'lucide-react';

export default function ResourcesPage() {
  const [domains, setDomains] = useState<KnowledgeNode[]>([]);

  useEffect(() => {
    getDomains().then(setDomains);
  }, []);

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6">
        <h1 className="text-3xl font-black">Resource Hub</h1>
        <p className="text-cyan-100 mt-2">Access notes, videos, and guides from one clean library interface.</p>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        {domains.map((domain) => (
          <DomainResourceCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  );
}

function DomainResourceCard({ domain }: { domain: KnowledgeNode }) {
  const [subjectCount, setSubjectCount] = useState(0);

  useEffect(() => {
    getChildren(domain.id).then((subjects) => setSubjectCount(subjects.length));
  }, [domain.id]);

  return (
    <Link href={`/courses/${domain.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
          <FolderOpen className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full">{subjectCount} subjects</span>
      </div>
      <h2 className="text-xl font-bold mt-3 text-slate-900">{domain.name}</h2>
      <p className="text-sm text-slate-500 mt-2 flex items-center gap-2"><FileSearch className="w-4 h-4" />Open resource explorer</p>
    </Link>
  );
}
