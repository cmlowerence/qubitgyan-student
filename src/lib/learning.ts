import api from '@/lib/api';
import { KnowledgeNode, Resource } from '@/types';

const sampleDomains: KnowledgeNode[] = [
  { id: 101, name: 'Physics Mastery', node_type: 'DOMAIN', parent: null, order: 1, is_active: true },
  { id: 102, name: 'Math Intelligence', node_type: 'DOMAIN', parent: null, order: 2, is_active: true },
  { id: 103, name: 'Computer Science', node_type: 'DOMAIN', parent: null, order: 3, is_active: true },
];

const sampleSubjects: Record<number, KnowledgeNode[]> = {
  101: [
    { id: 201, name: 'Mechanics', node_type: 'SUBJECT', parent: 101, order: 1, is_active: true },
    { id: 202, name: 'Electromagnetism', node_type: 'SUBJECT', parent: 101, order: 2, is_active: true },
  ],
  102: [
    { id: 203, name: 'Calculus', node_type: 'SUBJECT', parent: 102, order: 1, is_active: true },
    { id: 204, name: 'Algebra', node_type: 'SUBJECT', parent: 102, order: 2, is_active: true },
  ],
  103: [
    { id: 205, name: 'Data Structures', node_type: 'SUBJECT', parent: 103, order: 1, is_active: true },
    { id: 206, name: 'Web Engineering', node_type: 'SUBJECT', parent: 103, order: 2, is_active: true },
  ],
};

const sampleUnits: Record<number, KnowledgeNode[]> = {
  201: [
    { id: 301, name: 'Vectors & Motion', node_type: 'TOPIC', parent: 201, order: 1, is_active: true },
    { id: 302, name: 'Newton Laws', node_type: 'TOPIC', parent: 201, order: 2, is_active: true },
  ],
  205: [
    { id: 303, name: 'Array Patterns', node_type: 'TOPIC', parent: 205, order: 1, is_active: true },
    { id: 304, name: 'Linked Lists', node_type: 'TOPIC', parent: 205, order: 2, is_active: true },
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
    {
      id: 502,
      title: 'Motion Formula Handbook',
      resource_type: 'PDF',
      node: 301,
      external_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      order: 2,
    },
  ],
  303: [
    {
      id: 503,
      title: 'Array Cheatsheet',
      resource_type: 'ARTICLE',
      node: 303,
      content_text:
        'Learn two-pointer, sliding window, and prefix sum techniques. Start with brute force, then optimize with space-time trade-offs.',
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

export async function getDomains(): Promise<KnowledgeNode[]> {
  try {
    const { data } = await api.get('/nodes/');
    const nodes = extractList<KnowledgeNode>(data);
    const domains = nodes.filter((node) => node.parent === null || node.node_type === 'DOMAIN');
    return domains.length ? domains : sampleDomains;
  } catch {
    return sampleDomains;
  }
}

export async function getChildren(parentId: number): Promise<KnowledgeNode[]> {
  try {
    const { data } = await api.get(`/nodes/?parent=${parentId}`);
    const nodes = extractList<KnowledgeNode>(data)
      .filter((node) => node.parent === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (nodes.length) return nodes;
  } catch {
    // fallthrough to local samples
  }

  return sampleSubjects[parentId] || sampleUnits[parentId] || [];
}

export async function getNode(nodeId: number): Promise<KnowledgeNode | null> {
  try {
    const { data } = await api.get(`/nodes/${nodeId}/`);
    return data as KnowledgeNode;
  } catch {
    const all = [...sampleDomains, ...Object.values(sampleSubjects).flat(), ...Object.values(sampleUnits).flat()];
    return all.find((node) => node.id === nodeId) || null;
  }
}

export async function getResources(nodeId: number): Promise<Resource[]> {
  try {
    const { data } = await api.get(`/resources/?node=${nodeId}`);
    const resources = extractList<Resource>(data).sort((a, b) => (a.order || 0) - (b.order || 0));
    return resources.length ? resources : sampleResources[nodeId] || [];
  } catch {
    return sampleResources[nodeId] || [];
  }
}
