import api from '@/lib/api';
import { KnowledgeNode, Resource, StudentProgress } from '@/types';

interface SearchNode {
  id: number;
  name: string;
  href: string;
  type: KnowledgeNode['node_type'];
}

const sampleDomains: KnowledgeNode[] = [
  { id: 101, name: 'Physics Mastery', node_type: 'DOMAIN', parent: null, order: 1, is_active: true },
  { id: 102, name: 'Math Intelligence', node_type: 'DOMAIN', parent: null, order: 2, is_active: true },
];

const sampleSubjects: Record<number, KnowledgeNode[]> = {
  101: [{ id: 201, name: 'Mechanics', node_type: 'SUBJECT', parent: 101, order: 1, is_active: true }],
  102: [{ id: 202, name: 'Calculus', node_type: 'SUBJECT', parent: 102, order: 1, is_active: true }],
  201: [
    { id: 301, name: 'Vectors & Motion', node_type: 'SECTION', parent: 201, order: 1, is_active: true },
    { id: 302, name: 'Newton Laws', node_type: 'TOPIC', parent: 201, order: 2, is_active: true },
  ],
};

const sampleResources: Record<number, Resource[]> = {
  301: [
    {
      id: 501,
      title: 'Vectors Visual Lecture',
      resource_type: 'VIDEO',
      node: 301,
      external_url: 'https://www.youtube.com/watch?v=7UuNQvQbV4w',
      preview_link: 'https://www.youtube.com/embed/7UuNQvQbV4w',
      order: 1,
    },
  ],
};

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

function toSearchNodes(flat: KnowledgeNode[]): SearchNode[] {
  const map = new Map(flat.map((node) => [node.id, node]));
  return flat
    .map((node) => {
      const chain = getAncestorChain(node.id, map);
      const domain = chain.find((item) => item.node_type === 'DOMAIN');
      const subject = chain.find((item) => item.node_type === 'SUBJECT');
      if (!domain) return null;

      if (node.node_type === 'DOMAIN') {
        return { id: node.id, name: node.name, href: `/courses/${node.id}`, type: node.node_type };
      }

      if (subject) {
        return {
          id: node.id,
          name: chain.map((item) => item.name).join(' • '),
          href: `/courses/${domain.id}/${subject.id}?unit=${node.id}`,
          type: node.node_type,
        };
      }

      return { id: node.id, name: node.name, href: `/courses/${domain.id}`, type: node.node_type };
    })
    .filter(Boolean) as SearchNode[];
}

export async function getDomains(): Promise<KnowledgeNode[]> {
  try {
    const { flat } = await getTreeAndFlat();
    const domains = flat.filter((node) => node.parent === null && node.node_type === 'DOMAIN');
    return domains.length ? domains : sampleDomains;
  } catch {
    return sampleDomains;
  }
}

export async function getChildren(parentId: number): Promise<KnowledgeNode[]> {
  try {
    const { flat } = await getTreeAndFlat();
    const children = flat
      .filter((node) => node.parent === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (children.length) return children;
  } catch {
    // fallback
  }

  return sampleSubjects[parentId] || [];
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
    return sampleSubjects[subjectId] || [];
  }
}

export async function getNode(nodeId: number): Promise<KnowledgeNode | null> {
  try {
    const { flat } = await getTreeAndFlat();
    return flat.find((node) => node.id === nodeId) || null;
  } catch {
    const all = [...sampleDomains, ...Object.values(sampleSubjects).flat()];
    return all.find((node) => node.id === nodeId) || null;
  }
}

export async function getResources(nodeId: number): Promise<Resource[]> {
  try {
    const { data } = await api.get(`/resources/?node=${nodeId}`);
    return extractList<Resource>(data).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return sampleResources[nodeId] || [];
  }
}

export async function getSearchNodes(): Promise<SearchNode[]> {
  try {
    const { flat } = await getTreeAndFlat();
    return toSearchNodes(flat);
  } catch {
    const flat = [...sampleDomains, ...Object.values(sampleSubjects).flat()];
    return toSearchNodes(flat);
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
      recent: completed
        .sort((a, b) => +new Date(b.last_accessed) - +new Date(a.last_accessed))
        .slice(0, 5),
    };
  } catch {
    return { completedResourceIds: new Set<number>(), completedCount: 0, streakDays: 0, recent: [] as StudentProgress[] };
  }
}

export type { SearchNode };
