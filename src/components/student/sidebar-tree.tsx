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
  PlayCircle
} from 'lucide-react';

interface SidebarTreeProps {
  nodes: KnowledgeNode[];
  activeNodeId?: number;
  onSelect: (node: KnowledgeNode) => void;
}

export function SidebarTree({ nodes, activeNodeId, onSelect }: SidebarTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeItem 
          key={node.id} 
          node={node} 
          level={0} 
          activeNodeId={activeNodeId}
          onSelect={onSelect}
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
}

function TreeItem({ node, level, activeNodeId, onSelect }: TreeItemProps) {
  // Logic: If a node has children, it's a "Folder". If not, it's a "File".
  const hasChildren = node.children && node.children.length > 0;
  
  // Auto-expand if the active node is inside this branch (advanced feature)
  // For now, we default to closed unless it's the top level
  const [isOpen, setIsOpen] = useState(level === 0);

  const isActive = activeNodeId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hasChildren) {
      // Toggle expansion for folders
      setIsOpen(!isOpen);
    } else {
      // Select the leaf node (content)
      onSelect(node);
    }
  };

  // Icon Selection Logic
  const getIcon = () => {
    if (hasChildren) {
      return isOpen ? <FolderOpen className="w-4 h-4 text-blue-600" /> : <Folder className="w-4 h-4 text-slate-400" />;
    }
    // You can customize this based on node_type if you want specific icons for Video vs PDF
    return <FileText className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />;
  };

  return (
    <div className="select-none">
      {/* 1. The Node Row */}
      <div 
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm",
          // Indentation based on depth level
          level > 0 && "ml-4",
          // Active State Styling
          isActive 
            ? "bg-blue-50 text-blue-700 font-semibold" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        {/* Expansion Arrow (Only for folders) */}
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren && (
            isOpen 
              ? <ChevronDown className="w-3 h-3 text-slate-400" /> 
              : <ChevronRight className="w-3 h-3 text-slate-400" />
          )}
        </span>

        {/* Node Icon */}
        {getIcon()}

        {/* Node Name (Truncated) */}
        <span className="truncate">{node.name}</span>
      </div>

      {/* 2. The Children (Rendered Recursively) */}
      {hasChildren && isOpen && (
        <div className="animate-in-scale origin-top">
          {node.children!.map((child) => (
            <TreeItem 
              key={child.id} 
              node={child} 
              level={level + 1} 
              activeNodeId={activeNodeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
