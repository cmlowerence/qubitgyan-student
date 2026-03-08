// src/lib/learning.ts
import api from '@/lib/api';
import { studentApi } from '@/lib/student-api';
import { KnowledgeNode, Resource, StudentProgress, Course } from '@/types';

export interface SearchNode {
  id: number;
  name: string;
  href: string;
  type: KnowledgeNode['node_type'];
}


function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'results' in data && Array.isArray((data as { results?: unknown[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}


// ============================================================================
// 🧠 SMART IN-MEMORY CACHE
// ============================================================================
const treeCache = new Map<number, KnowledgeNode>();

function populateCache(node: KnowledgeNode) {
  if (!node) return;
  treeCache.set(node.id, node);
  if (node.children && node.children.length > 0) {
    node.children.forEach(populateCache);
  }
}


export function clearLearningCache() {
  treeCache.clear();
}


// ============================================================================


function flattenNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const flat: KnowledgeNode[] = [];
  const walk = (items: KnowledgeNode[]) => {
    for (const item of items) {
      flat.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(nodes);
  return flat;
}

export async function getDomains(forceRefresh = false): Promise<KnowledgeNode[]> {
  try {
    // Fetch domains with depth to grab the initial structure
    const { data } = await api.get('/manager/nodes/?depth=10');
    const nodes = extractList<KnowledgeNode>(data);
    
    if (forceRefresh) clearLearningCache();
    nodes.forEach(populateCache);

    return nodes
      .filter((node) => node.parent === null && node.node_type === 'DOMAIN')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return [];
  }
}

export async function getNode(nodeId: number, forceRefresh = false): Promise<KnowledgeNode | null> {
  if (!forceRefresh && treeCache.has(nodeId)) {
    return treeCache.get(nodeId)!;
  }

  try {
    // FIX: Add ?depth=10 so hard refreshes pull the entire nested branch
    const { data } = await api.get(`/manager/nodes/${nodeId}/?depth=10`);
    const node = data as KnowledgeNode;
    
    populateCache(node);
    return node;
  } catch {
    return null;
  }
}

export async function getChildren(parentId: number): Promise<KnowledgeNode[]> {
  const parentNode = await getNode(parentId);
  if (!parentNode || !parentNode.children) return [];

  return parentNode.children
    .filter((node) => node.id !== parentId) 
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getDescendantStudyNodes(subjectId: number): Promise<KnowledgeNode[]> {
  const subjectNode = await getNode(subjectId);
  if (!subjectNode || !subjectNode.children) return [];

  const descendants = flattenNodes(subjectNode.children);

  return descendants
    .filter((node) => (node.resource_count || 0) > 0 || (node.items_count || 0) > 0 || node.node_type === 'TOPIC')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getResources(nodeId: number): Promise<Resource[]> {
  try {
    const { data } = await api.get(`/resources/?node=${nodeId}`);
    return extractList<Resource>(data).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return [];
  }
}

export async function getProgressSummary() {
  try {
    const { data } = await api.get('/progress/');
    const entries = extractList<StudentProgress>(data);
    const completed = entries.filter((entry) => entry.is_completed);
    
    const uniqueDays = new Set(completed.map((entry) => new Date(entry.last_accessed).toISOString().slice(0, 10)));
    
    return {
      completedResourceIds: new Set(completed.map((entry) => entry.resource)),
      completedCount: completed.length,
      streakDays: uniqueDays.size, 
      recent: completed.sort((a, b) => +new Date(b.last_accessed) - +new Date(a.last_accessed)).slice(0, 5),
    };
  } catch {
    return { completedResourceIds: new Set<number>(), completedCount: 0, streakDays: 0, recent: [] as StudentProgress[] };
  }
}


export async function saveResumeTimestamp(resourceId: number, seconds: number) {
  try {
    localStorage.setItem(`resume_${resourceId}`, String(Math.floor(seconds)));
  } catch {}
}

export async function getPublishedCourses(): Promise<Course[]> {
  try {
    const { data } = await api.get('/public/courses/');
    return extractList<Course>(data);
  } catch {
    return [];
  }
}

export async function getMyCourses(): Promise<Course[]> {
  try {
    const { data } = await api.get('/public/courses/my_courses/');
    return extractList<Course>(data);
  } catch {
    return [];
  }
}

export async function enrollInCourse(courseId: number): Promise<boolean> {
  try {
    await api.post(`/public/courses/${courseId}/enroll/`);
    return true;
  } catch {
    return false;
  }
}

export async function pingGamification(minutes: number = 5) {
  try {
    const { data } = await api.get('/public/gamification/');
    return data;
  } catch {
    return null;
  }
}

export async function getCourseProgress(course: Course) {
  try {
    const progressSummary = await getProgressSummary();
    const completedSet = progressSummary.completedResourceIds;
    const rootNodeId = (course as any).root_node; 
    
    if (!rootNodeId) return { total: 0, completed: 0, percent: 0, rootNodeId: null };

    const descendants = await getDescendantStudyNodes(rootNodeId);
    
    let totalResources = 0;
    let completedResources = 0;

    for (const node of descendants) {
      if ((node.resource_count || 0) > 0) {
        const nodeResources = await getResources(node.id);
        totalResources += nodeResources.length;
        
        nodeResources.forEach(res => {
          if (completedSet.has(res.id)) {
            completedResources += 1;
          }
        });
      }
    }

    const percent = totalResources === 0 ? 0 : Math.round((completedResources / totalResources) * 100);

    return {
      total: totalResources,
      completed: completedResources,
      percent,
      rootNodeId
    };

  } catch {
    return { total: 0, completed: 0, percent: 0, rootNodeId: null };
  }
}

export async function getMyProfile() {
  return studentApi.getMyProfile();
}

export async function changePassword(old_password: string, new_password: string) {
  return studentApi.changePassword(old_password, new_password);
}

export async function getNotifications() {
  return studentApi.getNotifications();
}

export async function getUnreadNotificationCount() {
  return studentApi.getUnreadNotificationCount();
}

export async function markAllNotificationsRead() {
  return studentApi.markAllNotificationsRead();
}

export async function markNotificationRead(id: number) {
  await api.post(`/public/notifications/${id}/mark_read/`);
}

export async function getBookmarks() {
  return studentApi.getBookmarks();
}

export async function addBookmark(resourceId: number) {
  return studentApi.addBookmark(resourceId);
}

export async function removeBookmark(bookmarkId: number) {
  await studentApi.removeBookmark(bookmarkId);
}

export interface AttemptResponse {
  id: number;
  question: number;
  question_text: string;
  selected_option: number | null;
  selected_option_text: string | null;
  is_correct: boolean;
}

export interface QuizAttemptRecord {
  id: number;
  quiz: number;
  quiz_title: string;
  start_time: string;
  end_time: string | null;
  total_score: number;
  is_completed: boolean;
  responses: AttemptResponse[];
}

export async function getQuizAttempts(): Promise<QuizAttemptRecord[]> {
  try {
    const { data } = await api.get('/public/quiz-attempts/');
    return extractList<QuizAttemptRecord>(data);
  } catch {
    return [];
  }
}

export async function searchGlobal(query: string): Promise<SearchNode[]> {
  if (!query.trim()) return [];
  
  try {
    const { data } = await api.get(`/global-search/?search=${encodeURIComponent(query)}`);
    const results = extractList<any>(data);
    
    return results.map((item: any) => ({
      id: item.id,
      name: item.name || item.title || 'Untitled', 
      type: item.node_type || item.resource_type || 'RESULT',
      href: item.url || `/courses/${item.domain_id || item.id}`, 
    }));
  } catch {
    return [];
  }
}

export async function getTracking() {
  return studentApi.getTracking();
}

