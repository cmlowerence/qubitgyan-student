'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { KnowledgeNode } from '@/types';
import { SidebarTree } from '@/components/student/sidebar-tree';
import { 
  ChevronLeft, 
  Menu, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId;

  // --- State ---
  const [subject, setSubject] = useState<KnowledgeNode | null>(null);
  const [treeNodes, setTreeNodes] = useState<KnowledgeNode[]>([]);
  const [activeNode, setActiveNode] = useState<KnowledgeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mobile View State: 'menu' (tree) or 'content' (video/pdf)
  const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu');

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Subject Details
        const subjectRes = await api.get(`/nodes/${subjectId}/`);
        setSubject(subjectRes.data);

        // 2. Fetch the Tree (Topics -> Subtopics)
        // We assume the backend returns the nested 'children' list here
        const treeRes = await api.get(`/nodes/?parent=${subjectId}`);
        setTreeNodes(treeRes.data);
      } catch (error) {
        console.error("Failed to load course data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (subjectId) fetchData();
  }, [subjectId]);

  // --- Handlers ---
  const handleNodeSelect = (node: KnowledgeNode) => {
    setActiveNode(node);
    // On mobile, switch to content view immediately after selection
    setMobileView('content');
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 animate-pulse">Loading course material...</p>
      </div>
    );
  }

  if (!subject) return <div className="p-8">Subject not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
      
      {/* --- HEADER BAR (Sticky) --- */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title="Back to Subjects"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {subject.name}
            </h1>
            {activeNode && (
              <p className="text-xs text-blue-600 font-medium md:hidden">
                Current: {activeNode.name}
              </p>
            )}
          </div>
        </div>

        {/* Mobile: Toggle back to menu if reading content */}
        <button
          onClick={() => setMobileView('menu')}
          className={cn(
            "md:hidden p-2 bg-slate-100 rounded-lg text-slate-700 text-sm font-semibold",
            mobileView === 'menu' ? "hidden" : "block"
          )}
        >
          Menu
        </button>
      </header>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden relative bg-slate-50">
        
        {/* 1. LEFT SIDEBAR (The Tree) */}
        <aside className={cn(
          "w-full md:w-80 bg-white border-r border-slate-200 flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300 md:translate-x-0",
          // Mobile Logic: Slide out if viewing content
          mobileView === 'content' ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Course Structure
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <SidebarTree 
              nodes={treeNodes} 
              activeNodeId={activeNode?.id} 
              onSelect={handleNodeSelect} 
            />
            
            {treeNodes.length === 0 && (
              <div className="text-center py-10 px-4">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No topics added yet.</p>
              </div>
            )}
          </div>
        </aside>

        {/* 2. RIGHT CONTENT AREA (The Viewer) */}
        <main className={cn(
          "flex-1 flex flex-col bg-slate-50 w-full h-full absolute md:relative transition-transform duration-300",
          // Mobile Logic: Slide in from right
          mobileView === 'content' ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
          {activeNode ? (
            // --- PLACEHOLDER FOR CONTENT VIEWER ---
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Title Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-3 inline-block">
                    {activeNode.node_type}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeNode.name}
                  </h2>
                </div>

                {/* Content Placeholder Box */}
                <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center text-white shadow-xl">
                  <div className="text-center">
                    <p className="text-lg font-medium">Content Viewer Loading...</p>
                    <p className="text-sm text-slate-400 mt-2">
                      (We will build this component next)
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // --- EMPTY STATE (No selection) ---
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                <Menu className="w-8 h-8 text-slate-400" />
              </div>
              <p>Select a topic from the sidebar to start learning.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
