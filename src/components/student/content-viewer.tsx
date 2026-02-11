'use client';

import { useMemo, useState } from 'react';
import { Resource } from '@/types';
import { CheckCircle, ExternalLink, FileText, PlayCircle } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ContentViewerProps {
  resource: Resource | null;
  nodeId: number;
  onComplete?: () => void;
}

function toEmbedUrl(resource: Resource): string | null {
  if (resource.preview_link) return resource.preview_link;
  if (!resource.external_url) return null;

  const youtubeMatch = resource.external_url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  if (resource.resource_type === 'PDF' && resource.external_url.endsWith('.pdf')) {
    return `${resource.external_url}#toolbar=0&view=FitH`;
  }

  return resource.external_url;
}

export function ContentViewer({ resource, nodeId, onComplete }: ContentViewerProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(Boolean(resource?.is_completed));

  const embedUrl = useMemo(() => (resource ? toEmbedUrl(resource) : null), [resource]);

  const handleMarkComplete = async () => {
    if (!resource) return;

    setIsCompleting(true);
    try {
      await api.post('/progress/', { resource: resource.id, is_completed: true, node: nodeId });
      setIsCompleted(true);
      onComplete?.();
    } catch {
      setIsCompleted(true);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!resource) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Choose a resource to start learning.</div>;
  }

  const isPdf = resource.resource_type === 'PDF';
  const isVideo = resource.resource_type === 'VIDEO';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{resource.resource_type}</p>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900">{resource.title}</h2>
        </div>
        {isCompleted && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold"><CheckCircle className="w-3 h-3" />Completed</span>}
      </div>

      {isVideo && embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={resource.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      {isPdf && embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <iframe src={embedUrl} title={resource.title} className="w-full h-[70vh] min-h-[480px]" />
        </div>
      ) : null}

      {!isVideo && !isPdf && resource.content_text && (
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-700">{resource.content_text}</article>
      )}

      {resource.external_url && !isVideo && !isPdf && !resource.content_text && (
        <a
          href={resource.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 font-semibold"
        >
          Open resource <ExternalLink className="w-4 h-4" />
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleMarkComplete}
          disabled={isCompleting || isCompleted}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all',
            isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800',
          )}
        >
          <CheckCircle className="w-4 h-4" />
          {isCompleting ? 'Saving...' : isCompleted ? 'Completed' : 'Mark as complete'}
        </button>

        {resource.external_url && (
          <a href={resource.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            {resource.resource_type === 'VIDEO' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />} Open original
          </a>
        )}
      </div>
    </div>
  );
}
