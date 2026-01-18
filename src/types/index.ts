export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_suspended: boolean;
}

// The Recursive Knowledge Node
export interface KnowledgeNode {
  id: number;
  name: string;
  node_type: 'DOMAIN' | 'SUBJECT' | 'TOPIC' | 'SUBTOPIC';
  parent: number | null;
  order: number;
  thumbnail_url?: string;
  children?: KnowledgeNode[]; // For frontend tree structure
}

export interface Resource {
  id: number;
  title: string;
  resource_type: 'VIDEO' | 'PDF' | 'ARTICLE' | 'LINK';
  google_drive_id?: string;
  external_url?: string;
  is_completed?: boolean; // We will attach this manually from StudentProgress
}
