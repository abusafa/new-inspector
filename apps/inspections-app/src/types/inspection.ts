export interface InspectionTemplate {
  template_id: string;
  name: string;
  description: string;
  header_items: HeaderItem[];
  items: InspectionItem[];
}

export interface HeaderItem {
  item_id: string;
  type: 'datetime' | 'text';
  label: string;
  options: {
    required?: boolean;
    default_to_current_time?: boolean;
  };
}

export interface InspectionItem {
  item_id: string;
  type: 'section' | 'question' | 'text' | 'signature';
  label: string;
  items?: InspectionItem[];
  parent_id?: string;
  options?: {
    required?: boolean;
    allow_photos?: boolean;
  };
  response_set?: ResponseSet;
  conditions?: Condition[];
}

export interface ResponseSet {
  type: 'multiple-choice';
  responses: Response[];
}

export interface Response {
  id: string;
  label: string;
  score: number | null;
  color: 'green' | 'red' | 'grey';
}

export interface Condition {
  field: 'response';
  operator: 'is';
  value: string;
}

export interface InspectionData {
  [key: string]: string | File[] | boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  file: File;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface ItemAttachments {
  media: MediaItem[];
  notes: NoteItem[];
  actions: ActionItem[];
}

export interface InspectionResult {
  template_id: string;
  completed_at: string;
  inspector: string;
  equipment_id?: string;
  total_score: number;
  max_score: number;
  passed: boolean;
  data: InspectionData;
}

export interface WorkOrder {
  work_order_id: string;
  title: string;
  description: string;
  created_at: string;
  due_date?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assigned_to: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  inspections: WorkOrderInspection[];
}

export interface WorkOrderInspection {
  inspection_id: string;
  template_id: string;
  template_name: string;
  template_description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'pending-review' | 'approved' | 'rejected';
  required: boolean;
  completed_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  result?: InspectionResult;
  order: number;
  approval_notes?: string;
  corrective_actions?: CorrectiveAction[];
}

export interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  completed_at?: string;
  work_order_id?: string; // Link to generated work order
}