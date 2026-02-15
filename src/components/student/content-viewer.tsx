'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Resource } from '@/types';
import { AlertCircle, CheckCircle, ExternalLink, FileText, PlayCircle } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useUi } from '@/components/providers/ui-provider';
import { saveResumeTimestamp } from '@/lib/learning';

interface ContentViewerProps {
  resource: Resource | null;
  nodeId: number;
  onComplete?: () => void;
}

function getYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }

    const v = parsed.searchParams.get('v');
    if (v) return v;

    const pathMatch = parsed.pathname.match(/\/embed\/([\w-]{11})/);
    if (pathMatch?.[1]) return pathMatch[1];
  } catch {
    return null;
  }

  return null;
}

function toEmbedUrl(resource: Resource): string | null {
  if (resource.preview_link) return resource.preview_link;
  if (!resource.external_url) return null;

  const youtubeId = getYoutubeId(resource.external_url);
  if (youtubeId) return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;

  if (resource.resource_type === 'PDF' && resource.external_url.endsWith('.pdf')) {
    return `${resource.external_url}#toolbar=0&view=FitH`;
  }

  return resource.external_url;
}

function isPlayableVideo(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export function ContentViewer({ resource, nodeId, onComplete }: ContentViewerProps) {
  const { showAlert } = useUi();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(Boolean(resource?.is_completed));
  const [iframeError, setIframeError] = useState(false);
  const embedUrl = useMemo(() => (resource ? toEmbedUrl(resource) : null), [resource]);

  // Refs used for video resume / throttled server saves
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastServerSaveRef = useRef<number>(0);

  useEffect(() => {
    setIsCompleted(Boolean(resource?.is_completed));
    setIframeError(false);

    // If there is a saved resume timestamp locally, attempt to restore for HTML5 videos
    try {
      if (resource && resource.resource_type === 'VIDEO') {
        const key = `resume_${resource.id}`;
        const raw = localStorage.getItem(key);
        const saved = raw ? Number(raw) : 0;
        const el = videoRef.current;
        if (el && saved > 0) {
          const setIfReady = () => {
            try {
              if (!isNaN(el.duration) && el.duration > 0) {
                el.currentTime = Math.min(saved, el.duration - 0.1);
              } else {
                el.currentTime = saved;
              }
            } catch {}
          };

          if (el.readyState >= 1) setIfReady();
          else el.addEventListener('loadedmetadata', setIfReady, { once: true });
        }
      }
    } catch (err) {
      /* ignore localStorage failures */
    }
  }, [resource]);

  // Attach listeners to HTML5 <video> to save resume position periodically
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !resource) return;

    const key = `resume_${resource.id}`;

    const onTimeUpdate = () => {
      const t = Math.floor(el.currentTime || 0);
      try {
        localStorage.setItem(key, String(t));
      } catch {}

      const now = Date.now();
      // throttle server saves to once every 5s
      if (now - lastServerSaveRef.current > 5000) {
        lastServerSaveRef.current = now;
        saveResumeTimestamp(resource.id, t);
      }
    };

    const onPause = () => {
      const t = Math.floor(el.currentTime || 0);
      try {
        localStorage.setItem(key, String(t));
      } catch {}
      saveResumeTimestamp(resource.id, t);
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('pause', onPause);

    const onBeforeUnload = () => {
      try {
        localStorage.setItem(key, String(Math.floor(el.currentTime || 0)));
      } catch {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('pause', onPause);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [resource]);

  const handleMarkComplete = async () => {
    if (!resource) return;
    setIsCompleting(true);
    try {
      await api.post('/progress/', { resource: resource.id, is_completed: true, node: nodeId });
      setIsCompleted(true);
      onComplete?.();

      // clear client-side resume and inform server that resume is reset
      try {
        localStorage.removeItem(`resume_${resource.id}`);
        await saveResumeTimestamp(resource.id, 0);
      } catch {}

      await showAlert({
        title: 'Progress saved',
        message: 'Great work! This resource has been marked as completed.',
        variant: 'success',
      });
    } catch {
      await showAlert({
        title: 'Saved locally',
        message: 'We could not reach the server right now. Your completion is kept in this session.',
        variant: 'warning',
      });
      setIsCompleted(true);
      onComplete?.();
    } finally {
      setIsCompleting(false);
    }
  };

  if (!resource) return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Choose a resource to start learning.</div>;

  const isPdf = resource.resource_type === 'PDF';
  const isVideo = resource.resource_type === 'VIDEO';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{resource.resource_type}</p>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900">{resource.title}</h2>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
            <CheckCircle className="w-3 h-3" />Completed
          </span>
        )}
      </div>

      {isVideo && embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
          {iframeError ? (
            <div className="bg-slate-950 text-slate-100 p-5 sm:p-7 space-y-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4" />Embedded player unavailable
              </p>
              <p className="text-sm text-slate-300">This source blocks in-app playback on some browsers. You can still open and watch it in a new tab.</p>
              {resource.external_url && (
                <a href={resource.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
                  Open video directly <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : isPlayableVideo(embedUrl) ? (
            <video ref={videoRef} controls playsInline className="w-full max-h-[72vh] bg-black">
              <source src={embedUrl} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="space-y-2">
              <p className="px-3 pt-3 text-xs text-slate-300">If the player does not load, use "Open original" below.</p>
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={resource.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                onError={() => setIframeError(true)}
                onLoad={() => setIframeError(false)}
                allowFullScreen
              />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {isPdf && embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <iframe src={embedUrl} title={resource.title} className="w-full h-[75vh] min-h-[460px]" />
        </div>
      ) : null}

      {!isVideo && !isPdf && resource.content_text && <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-700">{resource.content_text}</article>}

      {resource.external_url && !resource.content_text && !isVideo && !isPdf && (
        <a href={resource.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 font-semibold">
          Open resource <ExternalLink className="w-4 h-4" />
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleMarkComplete}
          disabled={isCompleting || isCompleted}
          className={cn('inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all', isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800')}
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
