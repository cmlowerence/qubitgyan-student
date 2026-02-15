import api from '@/lib/api';
import { Course } from '@/types';
import { getSearchNodes, getDescendantStudyNodes, getResources, getProgressSummary } from './learning';

function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'results' in (data as any)) return (data as any).results as T[];
  return [];
}

const resourceIdsCache = new Map<string, number[]>();
const rootNameToNodeIdCache = new Map<string, number | null>();

async function resolveRootNodeIdByName(rootName?: string): Promise<number | null> {
  if (!rootName) return null;
  if (rootNameToNodeIdCache.has(rootName)) return rootNameToNodeIdCache.get(rootName) || null;

  try {
    const nodes = await getSearchNodes();
    const match = nodes.find((n) => n.name === rootName && n.type === 'DOMAIN');
    if (match) {
      // href format: /courses/<domainId> or /courses/<domainId>/<subjectId>?unit=<id>
      const parts = match.href.split('/').filter(Boolean);
      const maybeId = parts[1];
      const id = maybeId ? Number(maybeId) : null;
      rootNameToNodeIdCache.set(rootName, id);
      return id;
    }
  } catch (err) {
    console.debug('resolveRootNodeIdByName failed', err);
  }

  rootNameToNodeIdCache.set(rootName, null);
  return null;
}

export async function getCourseResourceIds(rootNodeName?: string): Promise<number[]> {
  if (!rootNodeName) return [];
  if (resourceIdsCache.has(rootNodeName)) return resourceIdsCache.get(rootNodeName)!;

  try {
    const nodeId = await resolveRootNodeIdByName(rootNodeName);
    if (!nodeId) return [];

    // include root node + descendants
    const descendants = await getDescendantStudyNodes(nodeId);
    const nodeIds = [nodeId, ...descendants.map((d) => d.id)];

    const resourcesPerNode = await Promise.all(nodeIds.map((id) => getResources(id)));
    const ids = new Set<number>();
    for (const list of resourcesPerNode) {
      for (const r of list) ids.add(r.id);
    }
    const arr = Array.from(ids);
    resourceIdsCache.set(rootNodeName, arr);
    return arr;
  } catch (err) {
    console.debug('getCourseResourceIds failed', err);
    resourceIdsCache.set(rootNodeName, []);
    return [];
  }
}

export async function getCourseProgress(course: Course): Promise<{ total: number; completed: number; percent: number; rootNodeId?: number | null }> {
  try {
    const resourceIds = await getCourseResourceIds(course.root_node_name);
    const progress = await getProgressSummary();
    const completedSet = progress.completedResourceIds || new Set<number>();
    const completed = resourceIds.filter((id) => completedSet.has(id)).length;
    const total = resourceIds.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const rootNodeId = await resolveRootNodeIdByName(course.root_node_name);
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
