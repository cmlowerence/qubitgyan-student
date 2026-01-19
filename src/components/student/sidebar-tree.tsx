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
  Loader2
} from 'lucide-react';

interface SidebarTreeProps {
  nodes: KnowledgeNode[];
  activeNodeId?: number;
  onSelect: (node: KnowledgeNode) => void;
  onLoadChildren: (node: KnowledgeNode) => Promise<void>;
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

interface TreeItemProps {
  node: KnowledgeNode;
  level: number;
  activeNodeId?: number;
  onSelect: (node: KnowledgeNode) => void;
  onLoadChildren: (node: KnowledgeNode) => Promise<void>;
}

function TreeItem({ node, level, activeNodeId, onSelect, onLoadChildren }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = activeNodeId === node.id;
  
  // LOGIC: If it's a container type, it CAN be expanded (it's a folder)
  // We don't rely on child count because the API might not send it initially.
  const isFolder = ['DOMAIN', 'SUBJECT', 'TOPIC'].includes(node.node_type);

  // 1. Handle Expand (Arrow Click)
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    // Lazy Load: If we don't have children yet, fetch them!
    if (!node.children || node.children.length === 0) {
      setIsLoading(true);
      try {
        await onLoadChildren(node);
      } catch (err) {
        console.error("Failed to load children", err);
        setIsOpen(false); // Close if failed
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 2. Handle Select (Text Click)
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <div className="select-none">
      <div 
        className={cn(
          "group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm cursor-pointer",
          level > 0 && "ml-4",
          isActive 
            ? "bg-blue-50 text-blue-700 font-semibold" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
        onClick={handleSelect} // Click row to select content
      >
        {/* EXPAND BUTTON (The Arrow) */}
        <div 
          onClick={handleToggle} 
          className="w-6 h-6 flex items-center justify-center -ml-2 rounded hover:bg-slate-200/50 transition-colors"
        >
          {isFolder ? (
            isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            ) : isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )
          ) : (
            <span className="w-3.5" /> // Spacer for files
          )}
        </div>

        {/* ICON */}
        {isFolder ? (
          isOpen ? <FolderOpen className="w-4 h-4 text-blue-600" /> : <Folder className="w-4 h-4 text-slate-400" />
        ) : (
          <FileText className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
        )}

        {/* NAME */}
        <span className="truncate flex-1">{node.name}</span>
      </div>

      {/* RECURSIVE CHILDREN */}
      {isOpen && node.children && (
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
