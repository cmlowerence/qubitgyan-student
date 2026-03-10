'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Loader2, 
  BellRing, 
  MailOpen, 
  CheckCircle2,
  Clock3
} from 'lucide-react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/learning';
import { useUi } from '@/components/providers/ui-provider';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationsPage() {
  const { showAlert } = useUi();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setItems(data as NotificationItem[]);
      } catch (error) {
        showAlert({ title: 'Error', message: 'Failed to load notifications.', variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [showAlert]);

  const unreadCount = useMemo(() => items.filter(item => !item.is_read).length, [items]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (error) {
      showAlert({ title: 'Action Failed', message: 'Could not update notifications.', variant: 'error' });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    setMarkingId(id);
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, is_read: true } : item));
    } catch (error) {
      console.error('Failed to mark notification as read');
    } finally {
      setMarkingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs sm:text-sm animate-pulse text-center">Loading Inbox...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 font-sans">
      
      {/* Header Section */}
      <section className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-50 rounded-full blur-[60px] sm:blur-[80px] -z-10 pointer-events-none" />
        
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shrink-0 relative mt-1 sm:mt-0">
            <BellRing className="w-6 h-6 sm:w-7 sm:h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Course updates, alerts, and personalized messages.</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead} 
            disabled={markingAll} 
            className="w-full md:w-auto rounded-xl bg-slate-900 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-bold text-white hover:bg-indigo-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25 active:scale-[0.98] whitespace-nowrap mt-2 md:mt-0"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            {markingAll ? 'Updating...' : 'Mark all as read'}
          </button>
        )}
      </section>

      {/* Main List Section */}
      <section className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MailOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">You&apos;re all caught up!</p>
            <p className="text-sm sm:text-base text-slate-500 font-medium">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const date = new Date(item.created_at);
              const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const isMarking = markingId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "relative p-4 sm:p-5 md:p-6 transition-all duration-300 flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 group",
                    item.is_read ? "bg-white hover:bg-slate-50" : "bg-indigo-50/30 hover:bg-indigo-50/60"
                  )}
                >
                  {/* Unread Indicator Line */}
                  {!item.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                  )}

                  <div className="flex items-start gap-3 sm:gap-4 md:gap-6 w-full">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1rem] flex items-center justify-center shrink-0 border transition-colors mt-0.5 sm:mt-0",
                      item.is_read 
                        ? "bg-slate-50 border-slate-200 text-slate-400" 
                        : "bg-white border-indigo-200 text-indigo-600 shadow-sm"
                    )}>
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-1 md:gap-2 mb-1">
                          <h3 className={cn(
                            "text-base sm:text-lg font-bold line-clamp-2 md:line-clamp-1 break-words",
                            item.is_read ? "text-slate-700" : "text-slate-900"
                          )}>
                            {item.title}
                          </h3>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0 md:pt-1 whitespace-nowrap">
                            <Clock3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {formattedDate} at {formattedTime}
                          </span>
                        </div>
                        
                        <p className={cn(
                          "text-xs sm:text-sm leading-relaxed",
                          item.is_read ? "text-slate-500" : "text-slate-700 font-medium"
                        )}>
                          {item.message}
                        </p>
                      </div>

                      {/* Action Button (Only show if unread) */}
                      {!item.is_read && (
                        <div className="shrink-0 flex items-center justify-end sm:justify-start mt-2 sm:mt-0">
                          <button
                            onClick={() => handleMarkSingleRead(item.id)}
                            disabled={isMarking}
                            title="Mark as read"
                            className="flex items-center gap-1.5 p-2 sm:p-2.5 text-[10px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg sm:rounded-full transition-colors disabled:opacity-50 active:scale-[0.98] sm:bg-transparent sm:hover:bg-indigo-100 sm:text-indigo-400 sm:p-2 w-full sm:w-auto justify-center"
                          >
                            {isMarking ? (
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                            )}
                            <span className="sm:hidden">Mark Read</span>
                          </button>
                        </div>
                      )}
                    </div>
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