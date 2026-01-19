'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { KnowledgeNode } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronRight, 
  Book, 
  Sparkles
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function SubjectSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.domainId;

  const [domain, setDomain] = useState<KnowledgeNode | null>(null);
  const [subjects, setSubjects] = useState<KnowledgeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch the Domain Details (Parent)
        const domainRes = await api.get(`/nodes/${domainId}/`);
        setDomain(domainRes.data);

        // 2. Fetch the Subjects (Children)
        const subjectsRes = await api.get(`/nodes/?parent=${domainId}`);
        
        // Unwrap the Django pagination result
        let rawList: KnowledgeNode[] = [];
        if (subjectsRes.data.results && Array.isArray(subjectsRes.data.results)) {
          rawList = subjectsRes.data.results;
        } else if (Array.isArray(subjectsRes.data)) {
          rawList = subjectsRes.data;
        }

        // --- CRITICAL FIX: STRICT FILTERING ---
        // We ensure that we ONLY show nodes that are children of the current ID.
        // This fixes the issue where the API might return "Root Domains" by mistake.
        const filteredSubjects = rawList.filter(node => node.parent === Number(domainId));

        // Sort by order just to be safe
        filteredSubjects.sort((a, b) => (a.order || 0) - (b.order || 0));

        console.log("Raw API Response:", rawList);
        console.log("Filtered Subjects:", filteredSubjects);
        
        setSubjects(filteredSubjects);
        
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (domainId) {
      fetchData();
    }
  }, [domainId]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (!domain) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Domain not found</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* --- BREADCRUMBS & HEADER --- */}
      <div className="space-y-4">
        <nav className="flex items-center text-sm text-slate-500 animate-fade-in">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            {domain.name}
          </span>
        </nav>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              {domain.name}
            </h1>
            <p className="text-slate-500 mt-1">
              Select a subject to begin your learning path.
            </p>
          </div>
          
          <button 
            onClick={() => router.back()}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* --- SUBJECTS LIST --- */}
      <div className="grid grid-cols-1 gap-4">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <SubjectItem key={subject.id} node={subject} index={index} domainId={domain.id} />
          ))
        ) : (
          <div className="bg-slate-50 rounded-xl p-12 text-center border border-dashed border-slate-300">
            <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Book className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Subjects Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-1">
              We found 0 items that are children of "{domain.name}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT ---
function SubjectItem({ node, index, domainId }: { node: KnowledgeNode, index: number, domainId: number }) {
  const style = { animationDelay: `${index * 75}ms` };

  return (
    <Link 
      href={`/courses/${domainId}/${node.id}`}
      className="group flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 animate-fade-in"
      style={style}
    >
      <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
        <Book className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
          {node.name}
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-4 mt-0.5">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {node.items_count ? `${node.items_count} Topics` : 'Start Learning'}
          </span>
        </p>
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <ChevronRight className="w-5 h-5" />
      </div>
    </Link>
  );
}
