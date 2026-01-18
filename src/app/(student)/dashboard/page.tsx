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
        // Fetch the full tree. The top level items are DOMAINS.
        const { data } = await api.get('/nodes/');
        
        // Filter just in case, though the tree root should be domains
        // Ensure we only show top-level nodes here
        const rootNodes = Array.isArray(data) ? data : []; 
        setDomains(rootNodes);
      } catch (error) {
        console.error("Failed to fetch domains", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  // --- 1. SKELETON LOADING STATE (For smooth UX) ---
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
      
      {/* --- 2. HERO / WELCOME SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
        {/* Decorative Background Circles */}
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
            Your journey to mastery continues. Select a domain below to access your learning materials and track your progress.
          </p>

          {/* Stat Cards (Hardcoded for now, can be dynamic later) */}
          <div className="flex gap-6">
            <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/5 backdrop-blur-sm">
              <span className="block text-2xl font-bold">{domains.length}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Active Domains</span>
            </div>
          </div>
        </div>
      </section>


      {/* --- 3. DOMAIN GRID --- */}
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
              It looks like no courses have been published yet. Please check back later.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// --- SUB-COMPONENT: DOMAIN CARD ---
// I've included this here so you don't need to create a separate file yet.
function DomainCard({ node, index }: { node: KnowledgeNode, index: number }) {
  // We use the index to stagger animations
  const animationDelay = `${index * 100}ms`;

  return (
    <Link 
      href={`/courses/${node.id}`}
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in block h-full flex flex-col"
      style={{ animationDelay }}
    >
      {/* 1. Image / Thumbnail Area */}
      <div className="h-48 bg-slate-100 relative overflow-hidden">
        {node.thumbnail_url ? (
          <img 
            src={node.thumbnail_url} 
            alt={node.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Fallback Gradient if no image
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex items-center justify-center",
            // Give different colors based on ID so they don't look identical
            node.id % 3 === 0 ? "from-blue-100 to-indigo-100 text-blue-500" :
            node.id % 3 === 1 ? "from-emerald-100 to-teal-100 text-emerald-500" :
            "from-amber-100 to-orange-100 text-amber-500"
          )}>
            <Layers className="w-16 h-16 opacity-50" />
          </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 shadow-sm">
            DOMAIN
          </span>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {node.name}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
          Master the fundamentals of {node.name}. Click to explore subjects and topics.
        </p>

        {/* 3. Action Footer */}
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
