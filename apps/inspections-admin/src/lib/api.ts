const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4300';

class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Types
export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  role: string;
  email?: string;
  department?: string;
  location?: string;
  employeeId?: string;
  supervisor?: string;
  createdAt: string;
  updatedAt: string;
  loginTime: string;
  settings?: any;
}

export interface WorkOrder {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  status: string;
  assignedTo: string;
  location?: string;
  priority: string;
  inspections: Inspection[];
}

export interface Inspection {
  id: string;
  inspectionId: string;
  workOrderId: string;
  templateId: string;
  status: string;
  required: boolean;
  order: number;
  completedAt?: string;
  resultJson?: any;
  template?: InspectionTemplate;
  workOrder?: WorkOrder;
}

export interface InspectionTemplate {
  id: string;
  templateId: string;
  name: string;
  description: string;
  schemaJson: any;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalWorkOrders: number;
  activeWorkOrders: number;
  completedInspections: number;
  pendingInspections: number;
  totalUsers: number;
  totalTemplates: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'work_order_created' | 'inspection_completed' | 'user_registered';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

// API Client
export const api = {
  // Health check
  health: () => fetchApi<{ status: string }>('/health'),

  // Users
  users: {
    list: () => fetchApi<User[]>('/users'),
    get: (id: string) => fetchApi<User>(`/users/${id}`),
    create: (data: Partial<User>) => fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<User>) => fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
  },

  // Work Orders
  workOrders: {
    list: () => fetchApi<WorkOrder[]>('/work-orders'),
    get: (id: string) => fetchApi<WorkOrder>(`/work-orders/${id}`),
    create: (data: Partial<WorkOrder>) => fetchApi<WorkOrder>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<WorkOrder>) => fetchApi<WorkOrder>(`/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi<void>(`/work-orders/${id}`, {
      method: 'DELETE',
    }),
  },

  // Inspections
  inspections: {
    list: () => fetchApi<Inspection[]>('/inspections'),
    get: (id: string) => fetchApi<Inspection>(`/inspections/${id}`),
    create: (data: Partial<Inspection>) => fetchApi<Inspection>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Inspection>) => fetchApi<Inspection>(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi<void>(`/inspections/${id}`, {
      method: 'DELETE',
    }),
    complete: (id: string, resultJson: any) => fetchApi<Inspection>(`/inspections/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ resultJson }),
    }),
  },

  // Templates
  templates: {
    list: () => fetchApi<InspectionTemplate[]>('/templates'),
    get: (id: string) => fetchApi<InspectionTemplate>(`/templates/${id}`),
    create: (data: Partial<InspectionTemplate>) => fetchApi<InspectionTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<InspectionTemplate>) => fetchApi<InspectionTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi<void>(`/templates/${id}`, {
      method: 'DELETE',
    }),
  },

  // Dashboard
  dashboard: {
    stats: () => fetchApi<DashboardStats>('/dashboard/stats'),
  },
};

export { ApiError };
