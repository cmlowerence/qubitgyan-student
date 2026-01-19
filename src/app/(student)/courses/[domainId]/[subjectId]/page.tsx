'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { KnowledgeNode, Resource } from '@/types';
import { SidebarTree } from '@/components/student/sidebar-tree';
import { ContentViewer } from '@/components/student/content-viewer';
import { useUi } from '@/components/providers/ui-provider';
import { ChevronLeft, Menu, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useUi();
  
  const subjectId = params.subjectId;

  // State
  const [subject, setSubject] = useState<KnowledgeNode | null>(null);
  const [treeNodes, setTreeNodes] = useState<KnowledgeNode[]>([]);
  const [activeNode, setActiveNode] = useState<KnowledgeNode | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu');

  // 1. INITIAL LOAD (Subject + Direct Children)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Subject Metadata
        const subjectRes = await api.get(`/nodes/${subjectId}/`);
        setSubject(subjectRes.data);

        // Fetch Level 1 Children (e.g. Topics inside Subject)
        const treeRes = await api.get(`/nodes/?parent=${subjectId}`);
        
        let nodesData: KnowledgeNode[] = [];
        if (treeRes.data.results && Array.isArray(treeRes.data.results)) {
          nodesData = treeRes.data.results;
        } else if (Array.isArray(treeRes.data)) {
          nodesData = treeRes.data;
        }
        
        // FILTER: Remove the Subject itself if API returns it
        nodesData = nodesData.filter(n => n.id !== Number(subjectId));
        
        // SORT
        nodesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setTreeNodes(nodesData);
      } catch (error) {
        console.error("Failed to load course data", error);
      } finally {
        setIsTreeLoading(false);
      }
    };

    if (subjectId) fetchData();
  }, [subjectId]);

  // 2. LAZY LOAD (Recursively fetch deeper levels)
  const handleLoadChildren = useCallback(async (parentNode: KnowledgeNode) => {
    // Safety check: if children exist, don't fetch again
    if (parentNode.children && parentNode.children.length > 0) return;

    try {
      console.log(`Lazy loading children for: ${parentNode.name} (${parentNode.id})`);
      
      // Request children of this specific parent
      const res = await api.get(`/nodes/?parent=${parentNode.id}`);
      
      let newChildren: KnowledgeNode[] = [];
      if (res.data.results && Array.isArray(res.data.results)) {
        newChildren = res.data.results;
      } else if (Array.isArray(res.data)) {
        newChildren = res.data;
      }

      // CRITICAL FIX: Filter out the parent itself to prevent infinite loops
      newChildren = newChildren.filter(child => child.id !== parentNode.id);
      
      // Sort
      newChildren.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Recursive State Update
      // We must walk the current tree, find the 'parentNode', and attach 'newChildren'
      const updateTreeRecursively = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
        return nodes.map(node => {
          if (node.id === parentNode.id) {
            return { ...node, children: newChildren }; // Attach here!
          }
          if (node.children) {
            return { ...node, children: updateTreeRecursively(node.children) }; // Keep digging
          }
          return node;
        });
      };

      setTreeNodes(prev => updateTreeRecursively(prev));

    } catch (error) {
      console.error("Error lazy loading", error);
      throw error;
    }
  }, []);

  // 3. FETCH CONTENT (When a node is selected)
  useEffect(() => {
    const fetchResource = async () => {
      if (!activeNode) return;

      setIsContentLoading(true);
      setActiveResource(null); 

      try {
        const response = await api.get(`/resources/?node=${activeNode.id}`);
        let resourcesList: Resource[] = [];
        if (response.data.results && Array.isArray(response.data.results)) {
          resourcesList = response.data.results;
        } else if (Array.isArray(response.data)) {
          resourcesList = response.data;
        }

        if (resourcesList.length > 0) {
          const sorted = resourcesList.sort((a, b) => (a.order || 0) - (b.order || 0));
          setActiveResource(sorted[0]);
        } else {
          setActiveResource(null);
        }
      } catch (error) {
        console.error("Failed to fetch resource", error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchResource();
  }, [activeNode]);

  // --- RENDER ---
  const handleNodeSelect = (node: KnowledgeNode) => {
    setActiveNode(node);
    setMobileView('content');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isTreeLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 animate-pulse">Loading course...</p>
      </div>
    );
  }

  if (!subject) return <div className="p-8">Subject not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{subject.name}</h1>
            {activeNode && <p className="text-xs text-blue-600 font-medium md:hidden">{activeNode.name}</p>}
          </div>
        </div>
        <button
          onClick={() => setMobileView('menu')}
          className={cn("md:hidden p-2 bg-slate-100 rounded-lg text-sm font-bold", mobileView === 'menu' ? "hidden" : "block")}
        >
          Menu
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative bg-slate-50">
        {/* SIDEBAR TREE */}
        <aside className={cn(
          "w-full md:w-80 bg-white border-r border-slate-200 flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300 md:translate-x-0",
          mobileView === 'content' ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Content</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SidebarTree 
              nodes={treeNodes} 
              activeNodeId={activeNode?.id} 
              onSelect={handleNodeSelect}
              onLoadChildren={handleLoadChildren}
            />
            {treeNodes.length === 0 && (
              <div className="text-center py-10 px-4 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No topics found.</p>
              </div>
            )}
          </div>
        </aside>

        {/* CONTENT VIEWER */}
        <main className={cn(
          "flex-1 flex flex-col bg-slate-50 w-full h-full absolute md:relative transition-transform duration-300 overflow-y-auto",
          mobileView === 'content' ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
          {activeNode ? (
            <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
              {isContentLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : (
                <ContentViewer 
                  resource={activeResource} 
                  nodeId={activeNode.id}
                  onComplete={() => showAlert({title:"Done!", message:"Marked as complete.", variant:"success"})}
                />
              )}
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                <Menu className="w-8 h-8 text-slate-400" />
              </div>
              <p>Select a topic to start learning.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
