import api from '@/lib/api';
import { studentApi } from '@/lib/student-api';
import { KnowledgeNode, Resource, StudentProgress, Course } from '@/types';

export interface SearchNode {
  id: number;
  name: string;
  href: string;
  type: KnowledgeNode['node_type'];
}

// --- CORE UTILS ---

function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'results' in data && Array.isArray((data as { results?: unknown[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

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

async function getTreeAndFlat() {
  const { data } = await api.get('/nodes/');
  const tree = extractList<KnowledgeNode>(data);
  return { tree, flat: flattenNodes(tree) };
}

function getAncestorChain(nodeId: number, map: Map<number, KnowledgeNode>): KnowledgeNode[] {
  const chain: KnowledgeNode[] = [];
  let cursor = map.get(nodeId);
  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parent ? map.get(cursor.parent) : undefined;
  }
  return chain;
}



// --- NODE & RESOURCE FETCHING ---

export async function getDomains(): Promise<KnowledgeNode[]> {
  try {
    const { flat } = await getTreeAndFlat();
    return flat.filter((node) => node.parent === null && node.node_type === 'DOMAIN');
  } catch (error) {
    console.error("Failed to fetch domains", error);
    return [];
  }
}

export async function getChildren(parentId: number): Promise<KnowledgeNode[]> {
  try {
    const { flat } = await getTreeAndFlat();
    return flat
      .filter((node) => node.parent === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return [];
  }
}

export async function getDescendantStudyNodes(subjectId: number): Promise<KnowledgeNode[]> {
  try {
    const { flat } = await getTreeAndFlat();
    const byParent = new Map<number, KnowledgeNode[]>();
    flat.forEach((node) => {
      if (node.parent == null) return;
      const list = byParent.get(node.parent) || [];
      list.push(node);
      byParent.set(node.parent, list);
    });

    const queue = [...(byParent.get(subjectId) || [])];
    const descendants: KnowledgeNode[] = [];
    while (queue.length) {
      const node = queue.shift()!;
      descendants.push(node);
      queue.push(...(byParent.get(node.id) || []));
    }

    const study = descendants.filter((node) => ['SECTION', 'TOPIC', 'SUBTOPIC'].includes(node.node_type) || (node.resource_count || 0) > 0);
    return study.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return [];
  }
}

export async function getNode(nodeId: number): Promise<KnowledgeNode | null> {
  try {
    const { flat } = await getTreeAndFlat();
    return flat.find((node) => node.id === nodeId) || null;
  } catch {
    return null;
  }
}

export async function getResources(nodeId: number): Promise<Resource[]> {
  try {
    const { data } = await api.get(`/resources/?node=${nodeId}`);
    return extractList<Resource>(data).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return [];
  }
}


// --- PROGRESS & TRACKING ---

export async function getProgressSummary() {
  try {
    const { data } = await api.get('/progress/');
    const entries = extractList<StudentProgress>(data);
    const completed = entries.filter((entry) => entry.is_completed);
    
    // Streak logic is now handled by backend, but we can compute recent local UI streaks here if needed.
    // For real streak, we will hit the gamification profile endpoint.
    const uniqueDays = new Set(completed.map((entry) => new Date(entry.last_accessed).toISOString().slice(0, 10)));
    
    return {
      completedResourceIds: new Set(completed.map((entry) => entry.resource)),
      completedCount: completed.length,
      streakDays: uniqueDays.size, 
      recent: completed
        .sort((a, b) => +new Date(b.last_accessed) - +new Date(a.last_accessed))
        .slice(0, 5),
    };
  } catch {
    return { completedResourceIds: new Set<number>(), completedCount: 0, streakDays: 0, recent: [] as StudentProgress[] };
  }
}

export async function saveResumeTimestamp(resourceId: number, seconds: number) {
  try {
    localStorage.setItem(`resume_${resourceId}`, String(Math.floor(seconds)));
  } catch {}

  try {
    await api.post('/public/tracking/save_timestamp/', { 
      resource_id: resourceId, 
      resume_timestamp: Math.floor(seconds) 
    });
  } catch (err) {
    console.debug('saveResumeTimestamp failed on server, saved locally', err);
  }
}

// --- NEW V2 API CONTRACT METHODS ---

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
    const { data } = await api.post('/public/gamification/ping/', { minutes });
    return data;
  } catch (error) {
    console.error('Gamification ping failed', error);
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

  } catch (error) {
    console.error("Error calculating course progress", error);
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
  } catch (error) {
    console.error('Failed to fetch quiz attempts', error);
    return [];
  }
}

export async function searchGlobal(query: string): Promise<SearchNode[]> {
  if (!query.trim()) return [];
  
  try {
    // Uses standard DRF search query parameter (?search=)
    const { data } = await api.get(`/global-search/?search=${encodeURIComponent(query)}`);
    const results = extractList<any>(data);
    
    return results.map((item: any) => ({
      id: item.id,
      name: item.name || item.title || 'Untitled', // Handles both Nodes and Resources
      type: item.node_type || item.resource_type || 'RESULT',
      href: item.url || `/courses/${item.domain_id || item.id}`, 
    }));
  } catch (error) {
    console.error('Global search failed', error);
    return [];
  }
}
export async function getTracking() {
  return studentApi.getTracking();
}
