import type { User, WorkOrder, Inspection, InspectionTemplate } from '@/lib/api';
import { formatDate, formatDateTime, formatPhoneNumber } from '@/lib/utils';

// CSV Export Functions
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string; formatter?: (value: any) => string }[]
) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // If no columns specified, use all keys from first object
  const columnsToUse = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    header: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    formatter: undefined as ((value: any) => string) | undefined,
  }));

  // Create CSV header
  const headers = columnsToUse.map(col => `"${col.header}"`).join(',');

  // Create CSV rows
  const rows = data.map(item => 
    columnsToUse.map(col => {
      let value = item[col.key];
      
      // Apply formatter if provided
      let formattedValue: any = value;
      if (col.formatter && value !== null && value !== undefined) {
        formattedValue = col.formatter(value);
      }
      
      // Handle different data types
      if (formattedValue === null || formattedValue === undefined) {
        return '""';
      } else if (typeof formattedValue === 'object') {
        return `"${JSON.stringify(formattedValue).replace(/"/g, '""')}"`;
      } else {
        return `"${String(formattedValue).replace(/"/g, '""')}"`;
      }
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  downloadFile(csvContent, filename, 'text/csv');
}

// Users Export
export function exportUsersToCSV(users: User[]) {
  const columns = [
    { key: 'name' as keyof User, header: 'Name' },
    { key: 'phoneNumber' as keyof User, header: 'Phone Number', formatter: formatPhoneNumber },
    { key: 'email' as keyof User, header: 'Email' },
    { key: 'role' as keyof User, header: 'Role' },
    { key: 'department' as keyof User, header: 'Department' },
    { key: 'location' as keyof User, header: 'Location' },
    { key: 'employeeId' as keyof User, header: 'Employee ID' },
    { key: 'supervisor' as keyof User, header: 'Supervisor' },
    { key: 'createdAt' as keyof User, header: 'Created Date', formatter: formatDate },
    { key: 'loginTime' as keyof User, header: 'Last Login', formatter: formatDateTime },
  ];

  exportToCSV(users, `users-export-${formatDate(new Date())}.csv`, columns);
}

// Work Orders Export
export function exportWorkOrdersToCSV(workOrders: WorkOrder[]) {
  const columns = [
    { key: 'workOrderId' as keyof WorkOrder, header: 'Work Order ID' },
    { key: 'title' as keyof WorkOrder, header: 'Title' },
    { key: 'description' as keyof WorkOrder, header: 'Description' },
    { key: 'status' as keyof WorkOrder, header: 'Status' },
    { key: 'priority' as keyof WorkOrder, header: 'Priority' },
    { key: 'assignedTo' as keyof WorkOrder, header: 'Assigned To' },
    { key: 'location' as keyof WorkOrder, header: 'Location' },
    { key: 'createdAt' as keyof WorkOrder, header: 'Created Date', formatter: formatDate },
    { key: 'dueDate' as keyof WorkOrder, header: 'Due Date', formatter: (date: string) => date ? formatDate(date) : '' },
    { key: 'updatedAt' as keyof WorkOrder, header: 'Last Updated', formatter: formatDateTime },
    { 
      key: 'inspections' as keyof WorkOrder, 
      header: 'Inspections Count', 
      formatter: (inspections: any[]) => String(inspections?.length || 0)
    },
  ];

  exportToCSV(workOrders, `work-orders-export-${formatDate(new Date())}.csv`, columns);
}

// Inspections Export
export function exportInspectionsToCSV(inspections: Inspection[]) {
  const columns = [
    { key: 'inspectionId' as keyof Inspection, header: 'Inspection ID' },
    { key: 'workOrderId' as keyof Inspection, header: 'Work Order ID' },
    { key: 'templateId' as keyof Inspection, header: 'Template ID' },
    { key: 'status' as keyof Inspection, header: 'Status' },
    { key: 'required' as keyof Inspection, header: 'Required', formatter: (value: boolean) => value ? 'Yes' : 'No' },
    { key: 'order' as keyof Inspection, header: 'Order' },
    { key: 'completedAt' as keyof Inspection, header: 'Completed At', formatter: (date: string) => date ? formatDateTime(date) : '' },
  ];

  exportToCSV(inspections, `inspections-export-${formatDate(new Date())}.csv`, columns);
}

// Templates Export
export function exportTemplatesToCSV(templates: InspectionTemplate[]) {
  const columns = [
    { key: 'templateId' as keyof InspectionTemplate, header: 'Template ID' },
    { key: 'name' as keyof InspectionTemplate, header: 'Name' },
    { key: 'description' as keyof InspectionTemplate, header: 'Description' },
    { key: 'createdAt' as keyof InspectionTemplate, header: 'Created Date', formatter: formatDate },
    { key: 'updatedAt' as keyof InspectionTemplate, header: 'Last Updated', formatter: formatDateTime },
    { 
      key: 'schemaJson' as keyof InspectionTemplate, 
      header: 'Schema', 
      formatter: (schema: any) => JSON.stringify(schema)
    },
  ];

  exportToCSV(templates, `templates-export-${formatDate(new Date())}.csv`, columns);
}

// JSON Export Functions
export function exportToJSON<T>(data: T[] | T, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

export function exportUsersToJSON(users: User[]) {
  exportToJSON(users, `users-export-${formatDate(new Date())}.json`);
}

export function exportWorkOrdersToJSON(workOrders: WorkOrder[]) {
  exportToJSON(workOrders, `work-orders-export-${formatDate(new Date())}.json`);
}

export function exportInspectionsToJSON(inspections: Inspection[]) {
  exportToJSON(inspections, `inspections-export-${formatDate(new Date())}.json`);
}

export function exportTemplatesToJSON(templates: InspectionTemplate[]) {
  exportToJSON(templates, `templates-export-${formatDate(new Date())}.json`);
}

// PDF Export Functions (simplified - would need a library like jsPDF for full implementation)
export function generateReportData(type: 'users' | 'workOrders' | 'inspections' | 'templates', data: any[]) {
  const reportDate = new Date().toISOString();
  
  return {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
    generatedAt: reportDate,
    generatedBy: 'Admin User', // This would come from auth context
    totalRecords: data.length,
    data: data,
    summary: generateSummary(type, data),
  };
}

function generateSummary(type: string, data: any[]) {
  switch (type) {
    case 'users':
      const roleDistribution = data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      return {
        totalUsers: data.length,
        roleDistribution,
        departmentDistribution: data.reduce((acc, user) => {
          if (user.department) {
            acc[user.department] = (acc[user.department] || 0) + 1;
          }
          return acc;
        }, {}),
      };
    
    case 'workOrders':
      return {
        totalWorkOrders: data.length,
        statusDistribution: data.reduce((acc, wo) => {
          acc[wo.status] = (acc[wo.status] || 0) + 1;
          return acc;
        }, {}),
        priorityDistribution: data.reduce((acc, wo) => {
          acc[wo.priority] = (acc[wo.priority] || 0) + 1;
          return acc;
        }, {}),
      };
    
    case 'inspections':
      return {
        totalInspections: data.length,
        statusDistribution: data.reduce((acc, inspection) => {
          acc[inspection.status] = (acc[inspection.status] || 0) + 1;
          return acc;
        }, {}),
        requiredVsOptional: {
          required: data.filter(i => i.required).length,
          optional: data.filter(i => !i.required).length,
        },
      };
    
    case 'templates':
      return {
        totalTemplates: data.length,
        averageItemsPerTemplate: data.reduce((sum, template) => {
          const schema = template.schemaJson;
          const itemCount = (schema?.header_items?.length || 0) + 
            (schema?.items?.reduce((acc: number, section: any) => acc + (section.items?.length || 0), 0) || 0);
          return sum + itemCount;
        }, 0) / data.length,
      };
    
    default:
      return { totalRecords: data.length };
  }
}

// Utility function to download files
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Bulk export functions
export function exportAllData(users: User[], workOrders: WorkOrder[], inspections: Inspection[], templates: InspectionTemplate[]) {
  const allData = {
    exportDate: new Date().toISOString(),
    users,
    workOrders,
    inspections,
    templates,
    summary: {
      totalUsers: users.length,
      totalWorkOrders: workOrders.length,
      totalInspections: inspections.length,
      totalTemplates: templates.length,
    },
  };

  exportToJSON(allData, `full-system-export-${formatDate(new Date())}.json`);
}
