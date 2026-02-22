import api from '@/lib/api';

export interface AdmissionPayload {
  student_first_name: string;
  student_last_name: string;
  email: string;
  phone: string;
  class_grade: string;
  learning_goal: string;
  guardian_name: string;
  guardian_phone: string;
  preferred_mode: string;
  address: string;
  notes: string;
}

export interface ProfilePayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_learning_minutes: number;
  last_active_date: string;
}

export interface GamificationPayload {
  current_streak: number;
  longest_streak: number;
  total_learning_minutes: number;
  last_active_date: string;
}

export interface NotificationPayload {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface BookmarkPayload {
  id: number;
  resource: number;
  resource_title: string;
  resource_type: string;
  created_at: string;
}

export interface TrackingPayload {
  id: number;
  resource: number;
  is_completed: boolean;
  last_accessed: string;
}

export interface QuizAnswerInput {
  question_id: number;
  option_id: number;
}

function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'results' in (data as Record<string, unknown>)) {
    return (((data as Record<string, unknown>).results as T[]) || []);
  }
  return [];
}

export const studentApi = {
  submitAdmission: async (payload: AdmissionPayload) => (await api.post('/public/admissions/', payload)).data,
  changePassword: async (old_password: string, new_password: string) => (await api.put('/public/change-password/', { old_password, new_password })).data,

  getMyProfile: async (): Promise<ProfilePayload | null> => {
    try {
      return (await api.get('/public/my-profile/')).data;
    } catch {
      return null;
    }
  },

  getGamification: async (): Promise<GamificationPayload | null> => {
    try {
      return (await api.get('/public/gamification/')).data;
    } catch {
      return null;
    }
  },

  getCourses: async <T>() => extractList<T>((await api.get('/public/courses/')).data),
  getMyCourses: async <T>() => extractList<T>((await api.get('/public/courses/my_courses/')).data),
  enrollInCourse: async (id: number) => (await api.post(`/public/courses/${id}/enroll/`)).data,

  getQuizById: async <T>(id: number): Promise<T> => (await api.get(`/public/quizzes/${id}/`)).data,
  submitQuizAttempt: async (quiz_id: number, answers: QuizAnswerInput[]) => (await api.post('/public/quiz-attempts/submit/', { quiz_id, answers })).data,
  getQuizAttempts: async <T>() => extractList<T>((await api.get('/public/quiz-attempts/')).data),

  getNotifications: async (): Promise<NotificationPayload[]> => extractList<NotificationPayload>((await api.get('/public/notifications/')).data),
  getUnreadNotificationCount: async (): Promise<number> => {
    const data = (await api.get('/public/notifications/unread_count/')).data;
    return data?.unread_count || 0;
  },
  markAllNotificationsRead: async () => (await api.post('/public/notifications/mark_all_read/')).data,

  getBookmarks: async (): Promise<BookmarkPayload[]> => extractList<BookmarkPayload>((await api.get('/public/bookmarks/')).data),
  addBookmark: async (resource: number): Promise<BookmarkPayload> => (await api.post('/public/bookmarks/', { resource })).data,
  removeBookmark: async (id: number) => (await api.delete(`/public/bookmarks/${id}/`)).data,

  getTracking: async (): Promise<TrackingPayload[]> => extractList<TrackingPayload>((await api.get('/public/tracking/')).data),
  createTracking: async (resource: number, is_completed = false): Promise<TrackingPayload> => (await api.post('/public/tracking/', { resource, is_completed })).data,
  updateTracking: async (id: number, payload: Partial<TrackingPayload>): Promise<TrackingPayload> => (await api.put(`/public/tracking/${id}/`, payload)).data,
};
