'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { KnowledgeNode } from '@/types';
import Link from 'next/link';
import { BookOpen, ArrowRight, Layers, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<KnowledgeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // We add a filter to try and get only roots from the server if supported
        // But we will also filter client-side to be safe.
        const { data } = await api.get('/nodes/');
        
        let allNodes: KnowledgeNode[] = [];

        // 1. Handle DRF Pagination (The likely culprit)
        if (data.results && Array.isArray(data.results)) {
          allNodes = data.results;
        } else if (Array.isArray(data)) {
          allNodes = data;
        }

        // 2. Filter for DOMAINS (Nodes with no parent)
        // Adjust this logic if your backend treats 'parent' differently (e.g. 0 instead of null)
        const rootNodes = allNodes.filter(node => 
          node.parent === null || node.node_type === 'DOMAIN'
        );

        console.log("Raw Data:", data); // Debug log in browser console
        console.log("Filtered Domains:", rootNodes);

        setDomains(rootNodes);
      } catch (error) {
        console.error("Failed to fetch domains", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  // --- SKELETON LOADING ---
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-blue-200 mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, {user?.first_name || 'Scholar'}!
          </h1>
          
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Your journey to mastery continues. Select a domain below to access your learning materials.
          </p>
        </div>
      </section>


      {/* --- DOMAIN GRID --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Available Domains
          </h2>
        </div>

        {domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, index) => (
              <DomainCard key={domain.id} node={domain} index={index} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Domains Found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              We couldn't find any courses. If you are an admin, please ensure you have created "Domain" level nodes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// --- DOMAIN CARD COMPONENT ---
function DomainCard({ node, index }: { node: KnowledgeNode, index: number }) {
  const animationDelay = `${index * 100}ms`;

  return (
    <Link 
      href={`/courses/${node.id}`}
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in block h-full flex flex-col"
      style={{ animationDelay }}
    >
      <div className="h-48 bg-slate-100 relative overflow-hidden">
        {node.thumbnail_url ? (
          <img 
            src={node.thumbnail_url} 
            alt={node.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex items-center justify-center",
            node.id % 3 === 0 ? "from-blue-100 to-indigo-100 text-blue-500" :
            node.id % 3 === 1 ? "from-emerald-100 to-teal-100 text-emerald-500" :
            "from-amber-100 to-orange-100 text-amber-500"
          )}>
            <Layers className="w-16 h-16 opacity-50" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 shadow-sm">
            DOMAIN
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {node.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
          Master the fundamentals of {node.name}. Click to explore.
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Explore
          </span>
          <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
