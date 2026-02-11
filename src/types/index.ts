// --- USER & AUTH ---
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string; // Added 'username' as it is central to your auth now
  avatar_url?: string;
  is_suspended: boolean;
  is_staff?: boolean;
}

// --- KNOWLEDGE TREE ---
export interface KnowledgeNode {
  id: number;
  name: string;
  node_type: 'DOMAIN' | 'SUBJECT' | 'SECTION' | 'TOPIC' | 'SUBTOPIC';
  parent: number | null;
  order: number;
  thumbnail_url?: string;
  is_active: boolean; // From Serializer
  
  // These come from the 'get_children' method in your serializer
  children?: KnowledgeNode[]; 
  resource_count?: number; 
  items_count?: number; 
}

// --- RESOURCES (PDFs, Videos, etc.) ---
export interface Resource {
  id: number;
  title: string;
  resource_type: 'VIDEO' | 'PDF' | 'ARTICLE' | 'LINK';
  node: number;
  node_name?: string; // ReadOnly field from serializer
  
  // Content Links
  google_drive_id?: string;
  external_url?: string;
  preview_link?: string; // The specific field from your backend logic
  content_text?: string;
  
  // Contexts (Program/Exam tags)
  context_ids?: number[];
  
  // Frontend State (Not from ResourceSerializer, but useful for UI)
  is_completed?: boolean; 
  order?: number;
}

// --- PROGRESS TRACKING ---
export interface StudentProgress {
  id: number;
  resource: number;
  is_completed: boolean;
  last_accessed: string; // ISO Date string
}
