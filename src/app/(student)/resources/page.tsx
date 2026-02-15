'use client';

import { useEffect, useState } from 'react';
import { getBookmarks, removeBookmark } from '@/lib/learning';
import { BookmarkMinus, PlayCircle, FileText, FileQuestion, Link as LinkIcon, Loader2, Bookmark } from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';

interface BookmarkData {
  id: number;
  resource: number;
  resource_title: string;
  resource_type: string;
  created_at: string;
}

export default function SavedResourcesPage() {
  const { showAlert, showConfirm } = useUi();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const data = await getBookmarks();
      setBookmarks(data);
      setIsLoading(false);
    };
    fetchBookmarks();
  }, []);

  const handleRemove = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Remove Bookmark?',
      message: 'Are you sure you want to remove this from your saved resources?',
      confirmText: 'Remove',
      variant: 'warning'
    });

    if (!confirmed) return;

    try {
      await removeBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      showAlert({ title: 'Removed', message: 'Bookmark removed successfully.', variant: 'success' });
    } catch (error) {
      showAlert({ title: 'Error', message: 'Could not remove bookmark.', variant: 'error' });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle className="w-6 h-6 text-rose-500" />;
      case 'PDF': return <FileText className="w-6 h-6 text-blue-500" />;
      case 'QUIZ': return <FileQuestion className="w-6 h-6 text-violet-500" />;
      default: return <LinkIcon className="w-6 h-6 text-slate-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        <p className="font-semibold text-lg">Loading your library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-amber-500 fill-amber-500/20" /> 
          Saved Resources
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Quick access to the materials you've bookmarked for later review.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900">Your library is empty</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            When you find a video, PDF, or quiz you want to keep handy, click the "Save for later" button to bookmark it here.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {bookmarks.map((bookmark) => {
            const date = new Date(bookmark.created_at).toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', year: 'numeric' 
            });

            return (
              <div key={bookmark.id} className="group rounded-3xl border border-slate-200 bg-white p-5 flex flex-col hover:shadow-xl hover:shadow-violet-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                    {getIcon(bookmark.resource_type)}
                  </div>
                  <button 
                    onClick={() => handleRemove(bookmark.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove bookmark"
                  >
                    <BookmarkMinus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 relative z-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{bookmark.resource_type}</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 group-hover:text-violet-700 transition-colors">
                    {bookmark.resource_title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 relative z-10">
                  <span>Saved on {date}</span>
                </div>

                {/* Decorative background accent */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}