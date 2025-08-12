import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

// Frontend mock data for users (from useAuth.ts)
const mockUsers = [
  {
    phoneNumber: '(555) 123-4567',
    name: 'John Smith',
    role: 'Inspector',
    email: 'john.smith@company.com',
    department: 'Safety & Compliance',
    location: 'Warehouse District',
    employeeId: 'EMP-001',
    supervisor: 'Sarah Johnson',
  },
  {
    phoneNumber: '(555) 987-6543',
    name: 'Sarah Johnson',
    role: 'Safety Supervisor',
    email: 'sarah.johnson@company.com',
    department: 'Safety & Compliance',
    location: 'Building B',
    employeeId: 'EMP-002',
    supervisor: 'Mike Rodriguez',
  },
  {
    phoneNumber: '(555) 456-7890',
    name: 'Mike Rodriguez',
    role: 'Maintenance Lead',
    email: 'mike.rodriguez@company.com',
    department: 'Maintenance',
    location: 'Production Floor',
    employeeId: 'EMP-003',
    supervisor: 'Emily Davis',
  },
  {
    phoneNumber: '(555) 321-0987',
    name: 'Emily Davis',
    role: 'Safety Manager',
    email: 'emily.davis@company.com',
    department: 'Safety & Compliance',
    location: 'Main Office',
    employeeId: 'EMP-004',
    supervisor: null,
  },
];

// Frontend sample template data
const frontendSampleTemplate = {
  template_id: 'template_1a2b3c4d5e6f7g8h',
  name: 'Daily Forklift Safety Check',
  description: 'A pre-use checklist to ensure the forklift is safe for operation, to be completed at the start of each shift.',
  header_items: [
    {
      item_id: 'item_header_001',
      type: 'datetime',
      label: 'Date and Time of Inspection',
      options: {
        required: true,
        default_to_current_time: true,
      },
    },
    {
      item_id: 'item_header_002',
      type: 'text',
      label: 'Inspector Name',
      options: {
        required: true,
      },
    },
    {
      item_id: 'item_header_003',
      type: 'text',
      label: 'Forklift ID / Serial Number',
      options: {
        required: true,
      },
    },
  ],
  items: [
    {
      item_id: 'section_001',
      type: 'section',
      label: 'Pre-Operation Check (Engine Off)',
      items: [
        {
          item_id: 'question_001',
          type: 'question',
          label: 'Tires in good condition (no major cuts, gouges, or low pressure)?',
          options: {
            required: true,
          },
          response_set: {
            type: 'multiple-choice',
            responses: [
              { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
              { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              { id: 'resp_na', label: 'N/A', score: null, color: 'grey' },
            ],
          },
        },
        {
          item_id: 'question_002',
          type: 'question',
          label: 'Forks, mast, and overhead guard are not damaged or cracked?',
          options: {
            required: true,
          },
          response_set: {
            type: 'multiple-choice',
            responses: [
              { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
              { id: 'resp_no', label: 'No', score: 0, color: 'red' },
            ],
          },
        },
        {
          item_id: 'question_003_logic_parent',
          type: 'question',
          label: 'Any signs of fluid leaks (oil, coolant, hydraulic fluid)?',
          options: {
            required: true,
          },
          response_set: {
            type: 'multiple-choice',
            responses: [
              { id: 'resp_no_leaks', label: 'No', score: 1, color: 'green' },
              { id: 'resp_yes_leaks', label: 'Yes', score: 0, color: 'red' },
            ],
          },
        },
        {
          item_id: 'question_003a_logic_child',
          type: 'text',
          label: 'Describe the leak location and severity. (Add Photo)',
          parent_id: 'question_003_logic_parent',
          options: {
            allow_photos: true,
          },
          conditions: [
            {
              field: 'response',
              operator: 'is',
              value: 'resp_yes_leaks',
            },
          ],
        },
      ],
    },
    {
      item_id: 'section_002',
      type: 'section',
      label: 'Operational Check (Engine On)',
      items: [
        {
          item_id: 'question_004',
          type: 'question',
          label: 'Horn, lights, and backup alarm are working correctly?',
          options: {
            required: true,
          },
          response_set: {
            type: 'multiple-choice',
            responses: [
              { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
              { id: 'resp_no', label: 'No', score: 0, color: 'red' },
            ],
          },
        },
        {
          item_id: 'question_005',
          type: 'question',
          label: 'Steering and braking systems are responsive?',
          options: {
            required: true,
          },
          response_set: {
            type: 'multiple-choice',
            responses: [
              { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
              { id: 'resp_no', label: 'No', score: 0, color: 'red' },
            ],
          },
        },
      ],
    },
    {
      item_id: 'section_003',
      type: 'section',
      label: 'Final Sign-off',
      items: [
        {
          item_id: 'signature_001',
          type: 'signature',
          label: 'Inspector Signature',
          options: {
            required: true,
          },
        },
      ],
    },
  ],
};

// Additional mock templates for the other work order inspections
const additionalMockTemplates = [
  {
    template_id: 'template_2b3c4d5e6f7g8h9i',
    name: 'Loading Dock Safety Inspection',
    description: 'Verify loading dock safety equipment and procedures',
    header_items: [
      {
        item_id: 'item_header_001',
        type: 'datetime',
        label: 'Date and Time of Inspection',
        options: { required: true, default_to_current_time: true },
      },
      {
        item_id: 'item_header_002',
        type: 'text',
        label: 'Inspector Name',
        options: { required: true },
      },
    ],
    items: [
      {
        item_id: 'section_001',
        type: 'section',
        label: 'Loading Dock Safety Check',
        items: [
          {
            item_id: 'question_001',
            type: 'question',
            label: 'Are dock levelers functioning properly?',
            options: { required: true },
            response_set: {
              type: 'multiple-choice',
              responses: [
                { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    template_id: 'template_3c4d5e6f7g8h9i0j',
    name: 'Emergency Equipment Check',
    description: 'Monthly check of fire extinguishers and emergency exits',
    header_items: [
      {
        item_id: 'item_header_001',
        type: 'datetime',
        label: 'Date and Time of Inspection',
        options: { required: true, default_to_current_time: true },
      },
      {
        item_id: 'item_header_002',
        type: 'text',
        label: 'Inspector Name',
        options: { required: true },
      },
    ],
    items: [
      {
        item_id: 'section_001',
        type: 'section',
        label: 'Emergency Equipment',
        items: [
          {
            item_id: 'question_001',
            type: 'question',
            label: 'Are fire extinguishers charged and accessible?',
            options: { required: true },
            response_set: {
              type: 'multiple-choice',
              responses: [
                { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    template_id: 'template_4d5e6f7g8h9i0j1k',
    name: 'HVAC System Check',
    description: 'Inspect heating, ventilation, and air conditioning systems',
    header_items: [
      {
        item_id: 'item_header_001',
        type: 'datetime',
        label: 'Date and Time of Inspection',
        options: { required: true, default_to_current_time: true },
      },
      {
        item_id: 'item_header_002',
        type: 'text',
        label: 'Inspector Name',
        options: { required: true },
      },
    ],
    items: [
      {
        item_id: 'section_001',
        type: 'section',
        label: 'HVAC System',
        items: [
          {
            item_id: 'question_001',
            type: 'question',
            label: 'Are all HVAC units operating normally?',
            options: { required: true },
            response_set: {
              type: 'multiple-choice',
              responses: [
                { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    template_id: 'template_5e6f7g8h9i0j1k2l',
    name: 'Electrical Safety Inspection',
    description: 'Check electrical panels, outlets, and safety equipment',
    header_items: [
      {
        item_id: 'item_header_001',
        type: 'datetime',
        label: 'Date and Time of Inspection',
        options: { required: true, default_to_current_time: true },
      },
      {
        item_id: 'item_header_002',
        type: 'text',
        label: 'Inspector Name',
        options: { required: true },
      },
    ],
    items: [
      {
        item_id: 'section_001',
        type: 'section',
        label: 'Electrical Safety',
        items: [
          {
            item_id: 'question_001',
            type: 'question',
            label: 'Are all electrical panels properly labeled and accessible?',
            options: { required: true },
            response_set: {
              type: 'multiple-choice',
              responses: [
                { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    template_id: 'template_6f7g8h9i0j1k2l3m',
    name: 'Conveyor Belt Safety Check',
    description: 'Inspect conveyor belt safety guards and emergency stops',
    header_items: [
      {
        item_id: 'item_header_001',
        type: 'datetime',
        label: 'Date and Time of Inspection',
        options: { required: true, default_to_current_time: true },
      },
      {
        item_id: 'item_header_002',
        type: 'text',
        label: 'Inspector Name',
        options: { required: true },
      },
    ],
    items: [
      {
        item_id: 'section_001',
        type: 'section',
        label: 'Conveyor Safety',
        items: [
          {
            item_id: 'question_001',
            type: 'question',
            label: 'Are all safety guards in place and secure?',
            options: { required: true },
            response_set: {
              type: 'multiple-choice',
              responses: [
                { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    template_id: 'template_7g8h9i0j1k2l3m4n',
    name: 'Machine Guard Inspection',
    description: 'Verify all machine guards are properly installed and secure',
    header_items: [
      {
        item_id: 'item_header_001',
        type: 'datetime',
        label: 'Date and Time of Inspection',
        options: { required: true, default_to_current_time: true },
      },
      {
        item_id: 'item_header_002',
        type: 'text',
        label: 'Inspector Name',
        options: { required: true },
      },
    ],
    items: [
      {
        item_id: 'section_001',
        type: 'section',
        label: 'Machine Guards',
        items: [
          {
            item_id: 'question_001',
            type: 'question',
            label: 'Are all machine guards properly installed?',
            options: { required: true },
            response_set: {
              type: 'multiple-choice',
              responses: [
                { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                { id: 'resp_no', label: 'No', score: 0, color: 'red' },
              ],
            },
          },
        ],
      },
    ],
  },
];

function loadAllTemplateJsons(): any[] {
  // __dirname is .../apps/inspections-server/prisma → go up 3 levels to repo root
  const repoRoot = path.resolve(__dirname, '../../../');
  const dir = path.join(
    repoRoot,
    'sample_data/successful_data/iauditor_templates'
  );
  const results: any[] = [];
  
  // Add the frontend sample template first
  results.push(frontendSampleTemplate);
  
  // Add additional mock templates
  results.push(...additionalMockTemplates);
  
  // Load additional templates from files
  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.json'))
      .map((f) => path.join(dir, f));
    for (const file of files) {
      try {
        const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
        
        // Generate template_id if missing
        if (!json.template_id) {
          const filename = path.basename(file, '.json');
          json.template_id = `template_${filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
        }
        
        // Skip if we already have this template_id
        if (results.some(t => t.template_id === json.template_id)) {
          continue;
        }
        
        // Ensure name/description exist; derive from filename if missing
        if (!json.name) {
          json.name = path.basename(file, '.json');
        }
        if (!json.description) {
          json.description = 'Imported inspection template';
        }
        results.push(json);
      } catch (e) {
        console.warn('Skipping invalid JSON template:', file, e);
      }
    }
  }
  
  return results;
}

async function main() {
  // Clear existing data (idempotent-ish for dev seeds)
  await prisma.inspection.deleteMany({});
  await prisma.inspectionTemplate.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users from frontend mock data
  const createdUsers = [];
  for (const userData of mockUsers) {
    const user = await prisma.user.create({
      data: {
        phoneNumber: userData.phoneNumber,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        department: userData.department,
        location: userData.location,
        employeeId: userData.employeeId,
        supervisor: userData.supervisor,
        settings: {
          notifications: {
            pushNotifications: true,
            emailNotifications: true,
            smsNotifications: false,
            workOrderUpdates: true,
            inspectionReminders: true,
            systemAlerts: true,
          },
          preferences: {
            theme: 'system',
            language: 'en',
            timezone: 'America/New_York',
            dateFormat: 'MM/DD/YYYY',
            autoSave: true,
            offlineMode: true,
          },
          privacy: {
            shareLocation: true,
            shareActivity: false,
            allowAnalytics: true,
          },
        },
      },
    });
    createdUsers.push(user);
  }

  // Templates: load all JSON templates from repo and insert each
  const jsonTemplates = loadAllTemplateJsons();
  const createdTemplates = [] as { id: string; templateId: string; name: string }[];
  for (const tpl of jsonTemplates) {
    const created = await prisma.inspectionTemplate.create({
      data: {
        templateId: tpl.template_id,
        name: tpl.name,
        description: tpl.description ?? 'Imported inspection template',
        schemaJson: tpl,
      },
    });
    createdTemplates.push({ 
      id: created.id, 
      templateId: created.templateId,
      name: created.name 
    });
  }

  // Helper function to find template by templateId
  const findTemplate = (templateId: string) => 
    createdTemplates.find(t => t.templateId === templateId);

  // Work Orders matching frontend sample data exactly
  const wo1 = await prisma.workOrder.create({
    data: {
      workOrderId: 'wo_001',
      title: 'Daily Equipment Safety Check - Warehouse A',
      description: 'Complete all required safety inspections for warehouse equipment before shift start',
      assignedTo: 'John Smith',
      status: 'pending',
      priority: 'high',
      location: 'Warehouse A - Loading Dock',
      createdAt: new Date('2025-01-21T08:00:00Z'),
      dueDate: new Date('2025-01-21T18:00:00Z'),
      inspections: {
        create: [
          {
            inspectionId: 'insp_001',
            templateId: findTemplate('template_1a2b3c4d5e6f7g8h')!.id,
            status: 'not-started',
            required: true,
            order: 1,
          },
          {
            inspectionId: 'insp_002',
            templateId: findTemplate('template_2b3c4d5e6f7g8h9i')!.id,
            status: 'not-started',
            required: true,
            order: 2,
          },
          {
            inspectionId: 'insp_003',
            templateId: findTemplate('template_3c4d5e6f7g8h9i0j')!.id,
            status: 'not-started',
            required: false,
            order: 3,
          },
        ],
      },
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      workOrderId: 'wo_002',
      title: 'Weekly Facility Safety Audit - Building B',
      description: 'Comprehensive weekly safety audit covering all areas of Building B',
      assignedTo: 'Sarah Johnson',
      status: 'in-progress',
      priority: 'medium',
      location: 'Building B - All Floors',
      createdAt: new Date('2025-01-20T09:00:00Z'),
      dueDate: new Date('2025-01-22T17:00:00Z'),
      inspections: {
        create: [
          {
            inspectionId: 'insp_004',
            templateId: findTemplate('template_4d5e6f7g8h9i0j1k')!.id,
            status: 'completed',
            required: true,
            order: 1,
            completedAt: new Date('2025-01-20T14:30:00Z'),
          },
          {
            inspectionId: 'insp_005',
            templateId: findTemplate('template_5e6f7g8h9i0j1k2l')!.id,
            status: 'in-progress',
            required: true,
            order: 2,
          },
        ],
      },
    },
  });

  const wo3 = await prisma.workOrder.create({
    data: {
      workOrderId: 'wo_003',
      title: 'Monthly Equipment Maintenance - Production Line',
      description: 'Complete monthly maintenance checks on production line equipment',
      assignedTo: 'Mike Rodriguez',
      status: 'completed',
      priority: 'critical',
      location: 'Production Floor - Line 1',
      createdAt: new Date('2025-01-19T07:00:00Z'),
      dueDate: new Date('2025-01-25T16:00:00Z'),
      inspections: {
        create: [
          {
            inspectionId: 'insp_006',
            templateId: findTemplate('template_6f7g8h9i0j1k2l3m')!.id,
            status: 'completed',
            required: true,
            order: 1,
            completedAt: new Date('2025-01-19T11:15:00Z'),
          },
          {
            inspectionId: 'insp_007',
            templateId: findTemplate('template_7g8h9i0j1k2l3m4n')!.id,
            status: 'completed',
            required: true,
            order: 2,
            completedAt: new Date('2025-01-19T15:45:00Z'),
          },
        ],
      },
    },
  });

  console.log('Seeded users:', createdUsers.map((u) => `${u.name} (${u.phoneNumber})`).join(', '));
  console.log('Seeded templates:', createdTemplates.map((t) => `${t.name} (${t.templateId})`).join(', '));
  console.log('Seeded work orders:', wo1.workOrderId, wo2.workOrderId, wo3.workOrderId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });