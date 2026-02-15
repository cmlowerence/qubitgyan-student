import api from '@/lib/api';
import { Course } from '@/types';
import { getDescendantStudyNodes, getResources, getProgressSummary } from './learning';

function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'results' in (data as any)) {
    return (data as any).results as T[];
  }
  return [];
}

// Cache based on the exact Node ID instead of string names for perfect accuracy
const resourceIdsCache = new Map<number, number[]>();

export async function getCourseResourceIds(rootNodeId: number | null | undefined): Promise<number[]> {
  if (!rootNodeId) return [];
  if (resourceIdsCache.has(rootNodeId)) return resourceIdsCache.get(rootNodeId)!;

  try {
    // Include root node + all descendants
    const descendants = await getDescendantStudyNodes(rootNodeId);
    const nodeIds = [rootNodeId, ...descendants.map((d) => d.id)];

    // Fetch resources for all these nodes
    const resourcesPerNode = await Promise.all(nodeIds.map((id) => getResources(id)));
    const ids = new Set<number>();
    
    for (const list of resourcesPerNode) {
      for (const r of list) ids.add(r.id);
    }
    
    const arr = Array.from(ids);
    resourceIdsCache.set(rootNodeId, arr);
    return arr;
  } catch (err) {
    console.debug('getCourseResourceIds failed', err);
    resourceIdsCache.set(rootNodeId, []);
    return [];
  }
}

export async function getCourseProgress(course: Course): Promise<{ total: number; completed: number; percent: number; rootNodeId?: number | null }> {
  try {
    // Directly use the root_node ID provided by the Django Serializer
    // (Cast to any just in case it's not strictly typed in your types/index.ts yet)
    const rootNodeId = (course as any).root_node || null;
    
    const resourceIds = await getCourseResourceIds(rootNodeId);
    const progress = await getProgressSummary();
    
    const completedSet = progress.completedResourceIds || new Set<number>();
    const completed = resourceIds.filter((id) => completedSet.has(id)).length;
    const total = resourceIds.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { total, completed, percent, rootNodeId };
  } catch (err) {
    console.debug('getCourseProgress failed', err);
    return { total: 0, completed: 0, percent: 0, rootNodeId: null };
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    const { data } = await api.get('/public/courses/');
    return extractList<Course>(data);
  } catch (err) {
    console.debug('getCourses failed', err);
    return [];
  }
}

export async function getMyCourses(): Promise<Course[]> {
  try {
    const { data } = await api.get('/public/courses/my_courses/');
    return extractList<Course>(data);
  } catch (err) {
    console.debug('getMyCourses failed', err);
    return [];
  }
}

export async function enrollInCourse(courseId: number): Promise<{ status: string } | null> {
  try {
    const { data } = await api.post(`/public/courses/${courseId}/enroll/`);
    return data as { status: string };
  } catch (err) {
    console.debug('enrollInCourse failed', err);
    return null;
  }
}