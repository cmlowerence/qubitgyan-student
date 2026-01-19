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
  Loader2,
  Database
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
  // FIX: Force Folder logic
  // 1. If it has children already -> Folder
  // 2. If backend says items_count > 0 -> Folder
  // 3. If it is a DOMAIN, SUBJECT, or TOPIC type -> ALWAYS Folder (allows lazy loading)
  const isContainerType = ['DOMAIN', 'SUBJECT', 'TOPIC'].includes(node.node_type);
  const isFolder = 
    (node.children && node.children.length > 0) || 
    (node.items_count && node.items_count > 0) ||
    isContainerType;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = activeNodeId === node.id;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFolder) {
      if (isOpen) {
        setIsOpen(false);
        return;
      }

      setIsOpen(true);

      // Fetch if empty
      if (!node.children || node.children.length === 0) {
        setIsLoading(true);
        try {
          await onLoadChildren(node);
        } catch (err) {
          console.error("Failed to load children", err);
          setIsOpen(false); 
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Leaf node -> Play Content
      onSelect(node);
    }
  };

  const getIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    if (isFolder) {
      return isOpen 
        ? <FolderOpen className="w-4 h-4 text-blue-600" /> 
        : <Folder className="w-4 h-4 text-slate-400" />;
    }
    return <FileText className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />;
  };

  return (
    <div className="select-none">
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
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {isFolder && (
            isOpen 
              ? <ChevronDown className="w-3 h-3 text-slate-400" /> 
              : <ChevronRight className="w-3 h-3 text-slate-400" />
          )}
        </span>

        {getIcon()}
        <span className="truncate">{node.name}</span>
      </div>

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
