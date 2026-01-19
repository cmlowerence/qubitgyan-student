'use client';

import React, { useState } from 'react';
import { KnowledgeNode } from '@/types';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen,
  Loader2 // Loading spinner
} from 'lucide-react';

interface SidebarTreeProps {
  nodes: KnowledgeNode[];
  activeNodeId?: number;
  onSelect: (node: KnowledgeNode) => void;
  onLoadChildren: (node: KnowledgeNode) => Promise<void>; // NEW: Function to ask parent for data
}

export function SidebarTree({ nodes, activeNodeId, onSelect, onLoadChildren }: SidebarTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeItem 
          key={node.id} 
          node={node} 
          level={0} 
          activeNodeId={activeNodeId}
          onSelect={onSelect}
          onLoadChildren={onLoadChildren}
        />
      ))}
    </div>
  );
}

// --- RECURSIVE ITEM COMPONENT ---

interface TreeItemProps {
  node: KnowledgeNode;
  level: number;
  activeNodeId?: number;
  onSelect: (node: KnowledgeNode) => void;
  onLoadChildren: (node: KnowledgeNode) => Promise<void>;
}

function TreeItem({ node, level, activeNodeId, onSelect, onLoadChildren }: TreeItemProps) {
  // LOGIC FIX: Trust 'items_count' OR existing children.
  // If items_count > 0, it IS a folder, even if children[] is currently empty.
  const isFolder = (node.children && node.children.length > 0) || (node.items_count && node.items_count > 0);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = activeNodeId === node.id;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFolder) {
      // If closing, just close.
      if (isOpen) {
        setIsOpen(false);
        return;
      }

      // If opening...
      setIsOpen(true);

      // Check if we need to fetch data?
      // If we have items_count > 0 BUT children array is empty/undefined, we must fetch.
      if ((!node.children || node.children.length === 0) && node.items_count && node.items_count > 0) {
        setIsLoading(true);
        try {
          await onLoadChildren(node);
        } catch (err) {
          console.error("Failed to load children", err);
          // Optional: Close if failed
          setIsOpen(false); 
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // It's a leaf node (File) -> Play Content
      onSelect(node);
    }
  };

  // Icon Selection
  const getIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    if (isFolder) {
      return isOpen ? <FolderOpen className="w-4 h-4 text-blue-600" /> : <Folder className="w-4 h-4 text-slate-400" />;
    }
    return <FileText className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />;
  };

  return (
    <div className="select-none">
      {/* 1. The Node Row */}
      <div 
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm",
          level > 0 && "ml-4",
          isActive 
            ? "bg-blue-50 text-blue-700 font-semibold" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        {/* Expansion Arrow */}
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {isFolder && (
            isOpen 
              ? <ChevronDown className="w-3 h-3 text-slate-400" /> 
              : <ChevronRight className="w-3 h-3 text-slate-400" />
          )}
        </span>

        {/* Node Icon */}
        {getIcon()}

        {/* Node Name */}
        <span className="truncate">{node.name}</span>
        
        {/* Debug/Count Badge (Optional - helps see structure) */}
        {isFolder && !isOpen && node.items_count ? (
            <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                {node.items_count}
            </span>
        ) : null}
      </div>

      {/* 2. The Children (Rendered Recursively) */}
      {isFolder && isOpen && node.children && (
        <div className="animate-in-scale origin-top border-l border-slate-100 ml-5">
          {node.children.map((child) => (
            <TreeItem 
              key={child.id} 
              node={child} 
              level={level + 1} 
              activeNodeId={activeNodeId}
              onSelect={onSelect}
              onLoadChildren={onLoadChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}
