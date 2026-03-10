// src/components/student/content-viewer.tsx
'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Resource } from '@/types';
import { 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  FileText, 
  PlayCircle, 
  Bookmark, 
  BookmarkCheck,
  CheckCircle2,
  LinkIcon
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useUi } from '@/components/providers/ui-provider';
import { saveResumeTimestamp, getBookmarks, addBookmark, removeBookmark } from '@/lib/learning';
import { QuizViewer } from '@/components/student/quiz-viewer';

interface ContentViewerProps {
  resource: Resource | null;
  nodeId: number;
  onComplete?: () => void;
}

function getYoutubeId(url: string): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtu.be')) return parsedUrl.pathname.slice(1);
    if (parsedUrl.hostname.includes('youtube.com')) {
      if (parsedUrl.pathname === '/watch') return parsedUrl.searchParams.get('v');
      if (parsedUrl.pathname.startsWith('/embed/')) return parsedUrl.pathname.split('/')[2];
      if (parsedUrl.pathname.startsWith('/shorts/')) return parsedUrl.pathname.split('/')[2];
    }
  } catch (err) {}

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function toEmbedUrl(resource: Resource): string | null {
  const targetUrl = resource.external_url || resource.preview_link;
  if (!targetUrl) return null;

  const youtubeId = getYoutubeId(targetUrl);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;

  if (resource.resource_type === 'PDF' && /\.pdf(\?.*)?$/i.test(targetUrl)) {
    return `${targetUrl}#toolbar=0&view=FitH`;
  }

  return targetUrl;
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

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastServerSaveRef = useRef<number>(0);

  useEffect(() => {
    setIsCompleted(Boolean(resource?.is_completed));
    setIframeError(false);

    const checkBookmark = async () => {
      if (!resource) return;
      try {
        const bookmarks = await getBookmarks();
        const existing = bookmarks.find((b: any) => b.resource === resource.id);
        if (existing) {
          setIsBookmarked(true);
          setBookmarkId(existing.id);
        } else {
          setIsBookmarked(false);
          setBookmarkId(null);
        }
      } catch (error) {}
    };
    checkBookmark();

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
    } catch (err) {}
  }, [resource]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !resource) return;

    const key = `resume_${resource.id}`;

    const onTimeUpdate = () => {
      const t = Math.floor(el.currentTime || 0);
      try { localStorage.setItem(key, String(t)); } catch {}

      const now = Date.now();
      if (now - lastServerSaveRef.current > 5000) {
        lastServerSaveRef.current = now;
        saveResumeTimestamp(resource.id, t);
      }
    };

    const onPause = () => {
      const t = Math.floor(el.currentTime || 0);
      try { localStorage.setItem(key, String(t)); } catch {}
      saveResumeTimestamp(resource.id, t);
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('pause', onPause);

    const onBeforeUnload = () => {
      try { localStorage.setItem(key, String(Math.floor(el.currentTime || 0))); } catch {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('pause', onPause);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [resource]);

  const handleToggleBookmark = async () => {
    if (!resource) return;
    setIsBookmarking(true);
    try {
      if (isBookmarked && bookmarkId) {
        await removeBookmark(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
        showAlert({ title: 'Removed', message: 'Resource removed from your saved items.', variant: 'info' });
      } else {
        const newBookmark = await addBookmark(resource.id);
        setIsBookmarked(true);
        setBookmarkId(newBookmark.id);
        showAlert({ title: 'Saved!', message: 'Resource added to your bookmarks.', variant: 'success' });
      }
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to update bookmark.', variant: 'error' });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!resource) return;
    setIsCompleting(true);
    try {
      await api.post('/progress/', { resource: resource.id, is_completed: true, node: nodeId });
      setIsCompleted(true);
      onComplete?.();

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

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center p-6 sm:p-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 border border-slate-200">
          <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
        </div>
        <p className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Select a Lesson</p>
        <p className="text-xs sm:text-sm font-medium text-slate-500">Choose a resource from the index to start learning.</p>
      </div>
    );
  }

  const normalizedType = resource.resource_type?.toUpperCase();
  const isPdf = normalizedType === 'PDF';
  const isVideo = normalizedType === 'VIDEO';
  const isQuiz = normalizedType === 'QUIZ';

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 sm:p-5 lg:px-8 border-b border-slate-100 flex flex-col gap-2.5 sm:gap-4 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
            {resource.resource_type}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight break-words">{resource.title}</h2>
      </div>

      <div className="flex-1 p-3 sm:p-5 lg:px-8 bg-slate-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
          {isVideo && embedUrl ? (
            <div className="rounded-xl sm:rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-900/5 bg-slate-900">
              {iframeError ? (
                <div className="bg-slate-950 text-slate-100 p-6 sm:p-8 text-center space-y-3 sm:space-y-4 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mb-1 sm:mb-2" />
                  <p className="font-bold text-base sm:text-lg">Embedded player unavailable</p>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md">This video provider restricts in-app playback. You can securely watch it by opening the original link.</p>
                  {resource.external_url && (
                    <a href={resource.external_url} target="_blank" rel="noopener noreferrer" className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors">
                      Watch on YouTube <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  )}
                </div>
              ) : isPlayableVideo(embedUrl) ? (
                <video ref={videoRef} controls playsInline className="w-full aspect-video bg-black rounded-xl sm:rounded-[1.5rem]">
                  <source src={embedUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full aspect-video relative">
                  <iframe
                    src={embedUrl}
                    title={resource.title}
                    className="absolute inset-0 w-full h-full rounded-xl sm:rounded-[1.5rem]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : null}

          {isPdf && embedUrl ? (
            <div className="rounded-xl sm:rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-md bg-white">
              <iframe src={embedUrl} title={resource.title} className="w-full h-[65vh] sm:h-[75vh] min-h-[400px] sm:min-h-[500px]" />
            </div>
          ) : null}

          {isQuiz && (
            <div className="bg-white rounded-xl sm:rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <QuizViewer resource={resource} onComplete={onComplete} />
            </div>
          )}

          {!isVideo && !isPdf && !isQuiz && resource.content_text && (
            <article className="rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-8 prose prose-sm sm:prose-base prose-slate max-w-none shadow-sm break-words">
              {resource.content_text}
            </article>
          )}

          {resource.external_url && !resource.content_text && !isVideo && !isPdf && !isQuiz && (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-[1.5rem] border border-slate-200 shadow-sm px-4">
              <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">External Link</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-5 sm:mb-6">This resource points to an external website or file.</p>
              <a href={resource.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white w-full sm:w-auto px-6 py-3 text-sm font-bold hover:bg-indigo-600 transition-colors shadow-lg active:scale-95">
                Open Resource <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

        </div>
      </div>

      <div className="p-4 sm:p-5 lg:px-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!isQuiz && (
            <button
              onClick={handleMarkComplete}
              disabled={isCompleting || isCompleted}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 sm:py-2.5 text-sm font-bold transition-all w-full sm:w-auto', 
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-md active:scale-95'
              )}
            >
              <CheckCircle className="w-4 h-4" />
              {isCompleting ? 'Saving...' : isCompleted ? 'Completed' : 'Mark as Complete'}
            </button>
          )}

          <button
            onClick={handleToggleBookmark}
            disabled={isBookmarking}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 sm:py-2.5 text-sm font-bold transition-all border active:scale-95 w-full sm:w-auto', 
              isBookmarked 
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            )}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isBookmarked ? 'Saved' : 'Save for Later'}
          </button>
        </div>

        {resource.external_url && !isQuiz && (
          <a 
            href={resource.external_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 sm:py-2.5 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors w-full sm:w-auto active:scale-95"
          >
            {resource.resource_type === 'VIDEO' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />} 
            Open Original <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}