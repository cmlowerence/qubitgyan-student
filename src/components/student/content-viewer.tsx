'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  FileText, 
  PlayCircle, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';
import api from '@/lib/api';

interface ContentViewerProps {
  resource: Resource | null; // It might be null if a topic has no resources attached yet
  nodeId: number;
  onComplete?: () => void;
}

export function ContentViewer({ resource, nodeId, onComplete }: ContentViewerProps) {
  const { showConfirm, showAlert } = useUi();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(resource?.is_completed || false);

  // --- HELPER: FORMAT DRIVE LINKS ---
  const getEmbedUrl = (url?: string, type?: string) => {
    if (!url) return '';
    
    // Google Drive Magic: Convert /view to /preview for clean embedding
    if (url.includes('drive.google.com')) {
      return url.replace('/view', '/preview');
    }
    
    // YouTube Magic: Convert watch?v= to embed/
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

  // --- HANDLER: MARK COMPLETE ---
  const handleMarkComplete = async () => {
    if (isCompleted) return;

    // Optimistic UI update (feels faster)
    setIsCompleted(true);
    setIsCompleting(true);

    try {
      // API call to mark progress
      await api.post('/progress/', {
        resource: resource?.id,
        is_completed: true
      });
      
      // Optional: Trigger parent callback (e.g., to show a "Next Lesson" toast)
      if (onComplete) onComplete();

    } catch (error) {
      console.error("Failed to mark complete", error);
      // Revert if failed
      setIsCompleted(false);
      showAlert({ 
        title: "Error", 
        message: "Could not save progress. Please check your internet.", 
        variant: "error" 
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // --- EMPTY STATE (No Resource) ---
  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>No content has been uploaded for this topic yet.</p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(resource.google_drive_id || resource.external_url);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. TITLE HEADER */}
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

      {/* 2. THE PLAYER / VIEWER */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 relative aspect-video group">
        
        {resource.resource_type === 'LINK' ? (
          // Link Type: Show a big button instead of iframe
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
          // Video/PDF Type: iFrame
          <iframe 
            src={embedUrl} 
            className="w-full h-full border-0 bg-slate-50"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={resource.title}
          />
        )}
      </div>

      {/* 3. ACTION BAR */}
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
