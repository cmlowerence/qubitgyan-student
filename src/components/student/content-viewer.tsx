'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';
import api from '@/lib/api';

interface ContentViewerProps {
  resource: Resource | null;
  nodeId: number;
  onComplete?: () => void;
}

export function ContentViewer({ resource, nodeId, onComplete }: ContentViewerProps) {
  const { showAlert } = useUi();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(resource?.is_completed || false);

  const handleMarkComplete = async () => {
    if (isCompleted) return;
    setIsCompleted(true);
    setIsCompleting(true);

    try {
      await api.post('/progress/', {
        resource: resource?.id,
        is_completed: true
      });
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to mark complete", error);
      setIsCompleted(false);
      showAlert({ 
        title: "Error", 
        message: "Could not save progress.", 
        variant: "error" 
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No content has been uploaded for this topic yet.</p>
      </div>
    );
  }

  // USE THE BACKEND FIELD DIRECTLY
  // If preview_link is missing, fall back to external_url
  const embedUrl = resource.preview_link || resource.external_url;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider",
              resource.resource_type === 'VIDEO' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              {resource.resource_type}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
            {resource.title}
          </h2>
        </div>
      </div>

      {/* PLAYER */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 relative aspect-video group">
        
        {resource.resource_type === 'LINK' || !embedUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <a 
              href={resource.external_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
            >
              Open Resource <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <iframe 
            src={embedUrl} 
            className="w-full h-full border-0 bg-slate-50"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={resource.title}
          />
        )}
      </div>

      {/* FOOTER ACTION */}
      <div className="flex justify-end">
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted || isCompleting}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-md active:scale-95",
            isCompleted 
              ? "bg-emerald-100 text-emerald-700 cursor-default shadow-none" 
              : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg"
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Completed
            </>
          ) : (
            <>
              {isCompleting ? "Saving..." : "Mark as Complete"}
              {!isCompleting && <CheckCircle className="w-5 h-5 opacity-50" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
