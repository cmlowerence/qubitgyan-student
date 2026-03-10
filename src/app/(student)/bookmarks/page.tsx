'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookmarkCheck, 
  CheckCircle2, 
  Clock3, 
  Loader2, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  Link as LinkIcon, 
  Trash2,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { getBookmarks, getTracking, removeBookmark } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';
import { cn } from '@/lib/utils';

// --- Types ---
interface BookmarkItem {
  bookmarkId: number;
  resourceId: number;
  title: string;
  type: string;
  completed: boolean;
  lastAccessed?: string;
}

export default function BookmarksPage() {
  const { showAlert, showConfirm } = useUi();
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bookmarksData, trackingData] = await Promise.all([getBookmarks(), getTracking()]);
        const trackingByResource = new Map(trackingData.map((item: any) => [item.resource, item]));

        const formattedBookmarks = bookmarksData.map((bookmark: any) => {
          const progress = trackingByResource.get(bookmark.resource);
          return {
            bookmarkId: bookmark.id,
            resourceId: bookmark.resource,
            title: bookmark.resource_title || 'Untitled Resource',
            type: bookmark.resource_type || 'RESOURCE',
            completed: Boolean(progress?.is_completed),
            lastAccessed: progress?.last_accessed,
          };
        });

        setBookmarks(formattedBookmarks);
      } catch (error) {
        showAlert({ title: 'Error', message: 'Failed to load your bookmarks.', variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showAlert]);

  const handleRemoveBookmark = async (bookmarkId: number, title: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Bookmark?',
      message: `Are you sure you want to remove "${title}" from your saved resources?`,
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (confirmed) {
      setRemovingId(bookmarkId);
      try {
        await removeBookmark(bookmarkId);
        setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== bookmarkId));
      } catch (error) {
        showAlert({ title: 'Action Failed', message: 'Could not remove bookmark.', variant: 'error' });
      } finally {
        setRemovingId(null);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('VIDEO')) return <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (t.includes('DOC') || t.includes('PDF')) return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (t.includes('QUIZ') || t.includes('TEST')) return <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs sm:text-sm animate-pulse text-center">Loading Bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 font-sans">
      
      {/* Header Section */}
      <section className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-50 rounded-full blur-[60px] sm:blur-[80px] -z-10 pointer-events-none" />
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">Saved Resources</h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium mt-1 leading-snug">Quickly access your most important study materials.</p>
          </div>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-slate-600 text-xs sm:text-sm whitespace-nowrap w-fit">
          {bookmarks.length} {bookmarks.length === 1 ? 'Item' : 'Items'} Saved
        </div>
      </section>

      {/* Main List Section */}
      <section>
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-dashed border-slate-300 p-10 sm:p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-3 sm:mb-4">
              <BookMarked className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5 sm:mb-2">No bookmarks yet</h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md">
              When you find a helpful video, document, or assessment, save it to easily review it later.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookmarks.map((item) => {
              const isRemoving = removingId === item.bookmarkId;

              return (
                <div 
                  key={item.bookmarkId} 
                  className={cn(
                    "group relative bg-white border border-slate-200 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-200",
                    isRemoving && "opacity-50 pointer-events-none scale-95"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 md:gap-5 w-full sm:w-auto flex-1 min-w-0">
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors mt-0.5 sm:mt-0">
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 md:line-clamp-1 group-hover:text-indigo-700 transition-colors leading-snug sm:leading-normal mb-1 sm:mb-0">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <span className="text-slate-400">{item.type}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0" />
                        
                        {item.completed ? (
                          <span className="text-emerald-600 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="text-amber-500 flex items-center gap-1 shrink-0">
                            <Clock3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> In Progress
                          </span>
                        )}

                        {item.lastAccessed && (
                          <>
                            <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0" />
                            <span className="text-slate-400 normal-case tracking-normal font-medium flex items-center gap-1 shrink-0">
                              Last viewed: {new Date(item.lastAccessed).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end sm:justify-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <button 
                      onClick={() => handleRemoveBookmark(item.bookmarkId, item.title)}
                      className="p-2 sm:p-2.5 md:p-3 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg sm:rounded-xl transition-colors shrink-0"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <Link 
                      href={`/resources/${item.resourceId}`} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-95"
                    >
                      Open <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}