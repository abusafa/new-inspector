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
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      
      // Try to get detailed error message from response body
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If parsing JSON fails, use default error message
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Handle non-JSON responses (e.g., for DELETE endpoints that return empty body)
      return {} as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors and other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Network error: Unable to connect to the server');
    }
    
    throw new ApiError(500, 'An unexpected error occurred');
  }
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

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: string;
  category: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  lastInspected?: string;
  nextInspectionDue?: string;
  createdAt: string;
  updatedAt: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  specifications?: any;
  notes?: string;
  workOrderCount?: number;
  recentWorkOrders?: any[];
}

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  estimatedDuration: number;
  defaultAssignee?: string;
  requiredSkills: string[];
  inspectionTemplateIds: string[];
  checklist: any;
  notifications: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  usageCount?: number;
  activeSchedules?: number;
}

export interface RecurringSchedule {
  id: string;
  name: string;
  description: string;
  workOrderTemplateId: string;
  assignedTo?: string;
  assignedGroup?: string;
  location?: string;
  priority: string;
  frequency: string;
  interval: number;
  startDate: string;
  endDate?: string;
  daysOfWeek: number[];
  dayOfMonth?: number;
  time?: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastGenerated?: string;
  nextDue?: string;
  totalGenerated: number;
  completedCount: number;
  overdueCount: number;
  workOrderTemplate?: WorkOrderTemplate;
}

export interface InspectionTemplate {
  id: string;
  templateId: string;
  name: string;
  description: string;
  schemaJson: any;
  createdAt: string;
  updatedAt: string;
  // Enhanced template management fields
  category: string;
  tags: string[];
  version: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
  // Template metadata
  estimatedDuration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  industry?: string;
  equipmentType?: string;
  // Version control
  parentId?: string;
  isLatestVersion: boolean;
  // Usage statistics
  usageCount?: number;
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
    list: (params?: {
      category?: string;
      status?: string;
      search?: string;
      tags?: string[];
      industry?: string;
      equipmentType?: string;
      createdBy?: string;
      isPublic?: boolean;
      difficulty?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }
      return fetchApi<{
        data: InspectionTemplate[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`/templates?${queryParams.toString()}`);
    },
    get: (id: string) => fetchApi<InspectionTemplate>(`/templates/${id}`),
    preview: (id: string) => fetchApi<{
      valid: boolean;
      errors: any[];
      template: any;
      metadata: {
        totalQuestions: number;
        totalSections: number;
        estimatedDuration?: number;
        difficulty?: string;
      };
    }>(`/templates/${id}/preview`),
    versions: (id: string) => fetchApi<any[]>(`/templates/${id}/versions`),
    categories: () => fetchApi<Array<{ name: string; count: number }>>('/templates/categories'),
    tags: () => fetchApi<Array<{ name: string; count: number }>>('/templates/tags'),
    create: (data: any) => fetchApi<InspectionTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi<InspectionTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    duplicate: (id: string, data: { name: string; description?: string; category?: string; createdBy?: string }) => 
      fetchApi<InspectionTemplate>(`/templates/${id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createVersion: (id: string, data: { version: string; createdBy?: string }) =>
      fetchApi<InspectionTemplate>(`/templates/${id}/new-version`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    publish: (id: string, publishedBy?: string) => fetchApi<InspectionTemplate>(`/templates/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ publishedBy }),
    }),
    archive: (id: string, archivedBy?: string) => fetchApi<InspectionTemplate>(`/templates/${id}/archive`, {
      method: 'PUT',
      body: JSON.stringify({ archivedBy }),
    }),
    delete: (id: string) => fetchApi<void>(`/templates/${id}`, {
      method: 'DELETE',
    }),
  },

  // Template Builder
  templateBuilder: {
    getComponents: () => fetchApi<any[]>('/template-builder/components'),
    getPatterns: () => fetchApi<any[]>('/template-builder/patterns'),
    generateFromPattern: (patternType: string, options: any) => 
      fetchApi<any>(`/template-builder/generate/${patternType}`, {
        method: 'POST',
        body: JSON.stringify(options),
      }),
    applyOperations: (templateId: string, operations: any[]) =>
      fetchApi<any>(`/template-builder/${templateId}/operations`, {
        method: 'POST',
        body: JSON.stringify({ operations }),
      }),
    addComponent: (templateId: string, data: {
      componentType: string;
      parentId?: string;
      position?: number;
      customConfig?: any;
    }) => fetchApi<any>(`/template-builder/${templateId}/add-component`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateItem: (templateId: string, itemId: string, data: any) =>
      fetchApi<any>(`/template-builder/${templateId}/update-item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    duplicateItem: (templateId: string, itemId: string, data: { parentId?: string; position?: number }) =>
      fetchApi<any>(`/template-builder/${templateId}/duplicate-item/${itemId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    moveItem: (templateId: string, itemId: string, data: { parentId?: string; position?: number }) =>
      fetchApi<any>(`/template-builder/${templateId}/move-item/${itemId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteItem: (templateId: string, itemId: string) =>
      fetchApi<any>(`/template-builder/${templateId}/delete-item/${itemId}`, {
        method: 'POST',
      }),
  },

  // Dashboard
  dashboard: {
    stats: () => fetchApi<DashboardStats>('/dashboard/stats'),
  },

  // Assets
  assets: {
    list: (params?: any) => fetchApi<{ data: Asset[]; pagination: any }>('/assets', { 
      method: 'GET',
      ...(params && { body: new URLSearchParams(params).toString() })
    }),
    get: (id: string) => fetchApi<Asset>(`/assets/${id}`),
    create: (data: Partial<Asset>) => fetchApi<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Asset>) => fetchApi<Asset>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/assets/${id}`, { method: 'DELETE' }),
    categories: () => fetchApi<{ name: string; count: number }[]>('/assets/categories'),
    types: () => fetchApi<{ name: string; count: number }[]>('/assets/types'),
    locations: () => fetchApi<string[]>('/assets/locations'),
    workOrders: (id: string, params?: any) => fetchApi<WorkOrder[]>(`/assets/${id}/work-orders`, {
      method: 'GET',
      ...(params && { body: new URLSearchParams(params).toString() })
    }),
    updateMaintenanceSchedule: (id: string, data: any) => fetchApi<Asset>(`/assets/${id}/maintenance-schedule`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  },
  
  // Work Order Templates
  workOrderTemplates: {
    list: (params?: any) => fetchApi<{ data: WorkOrderTemplate[]; pagination: any }>('/work-order-templates', { 
      method: 'GET',
      ...(params && { body: new URLSearchParams(params).toString() })
    }),
    get: (id: string) => fetchApi<WorkOrderTemplate>(`/work-order-templates/${id}`),
    create: (data: Partial<WorkOrderTemplate>) => fetchApi<WorkOrderTemplate>('/work-order-templates', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    update: (id: string, data: Partial<WorkOrderTemplate>) => fetchApi<WorkOrderTemplate>(`/work-order-templates/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    delete: (id: string) => fetchApi<void>(`/work-order-templates/${id}`, { method: 'DELETE' }),
    duplicate: (id: string, data: any) => fetchApi<WorkOrderTemplate>(`/work-order-templates/${id}/duplicate`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    createWorkOrder: (id: string, data: any) => fetchApi<WorkOrder>(`/work-order-templates/${id}/create-work-order`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    categories: () => fetchApi<{ name: string; count: number }[]>('/work-order-templates/categories'),
  },
  
  // Recurring Schedules
  recurringSchedules: {
    list: (params?: any) => fetchApi<{ data: RecurringSchedule[]; pagination: any }>('/recurring-schedules', { 
      method: 'GET',
      ...(params && { body: new URLSearchParams(params).toString() })
    }),
    get: (id: string) => fetchApi<RecurringSchedule>(`/recurring-schedules/${id}`),
    create: (data: Partial<RecurringSchedule>) => fetchApi<RecurringSchedule>('/recurring-schedules', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    update: (id: string, data: Partial<RecurringSchedule>) => fetchApi<RecurringSchedule>(`/recurring-schedules/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    delete: (id: string) => fetchApi<void>(`/recurring-schedules/${id}`, { method: 'DELETE' }),
    generateWorkOrder: (id: string, data?: any) => fetchApi<WorkOrder>(`/recurring-schedules/${id}/generate-work-order`, { 
      method: 'POST', 
      body: JSON.stringify(data || {}) 
    }),
    toggleActive: (id: string) => fetchApi<RecurringSchedule>(`/recurring-schedules/${id}/toggle-active`, { method: 'POST' }),
    getDueToday: () => fetchApi<RecurringSchedule[]>('/recurring-schedules/due-today'),
    getOverdue: () => fetchApi<RecurringSchedule[]>('/recurring-schedules/overdue'),
  },
};

export { ApiError };
