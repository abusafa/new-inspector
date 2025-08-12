import { WorkOrder } from '@/types/inspection';

export const sampleWorkOrders: WorkOrder[] = [
  {
    work_order_id: "wo_001",
    title: "Daily Equipment Safety Check - Warehouse A",
    description: "Complete all required safety inspections for warehouse equipment before shift start",
    created_at: "2025-01-21T08:00:00Z",
    due_date: "2025-01-21T18:00:00Z",
    status: "pending",
    assigned_to: "John Smith",
    location: "Warehouse A - Loading Dock",
    priority: "high",
    inspections: [
      {
        inspection_id: "insp_001",
        template_id: "template_1a2b3c4d5e6f7g8h",
        template_name: "Daily Forklift Safety Check",
        template_description: "A pre-use checklist to ensure the forklift is safe for operation",
        status: "not-started",
        required: true,
        order: 1
      },
      {
        inspection_id: "insp_002",
        template_id: "template_2b3c4d5e6f7g8h9i",
        template_name: "Loading Dock Safety Inspection",
        template_description: "Verify loading dock safety equipment and procedures",
        status: "not-started",
        required: true,
        order: 2
      },
      {
        inspection_id: "insp_003",
        template_id: "template_3c4d5e6f7g8h9i0j",
        template_name: "Emergency Equipment Check",
        template_description: "Monthly check of fire extinguishers and emergency exits",
        status: "not-started",
        required: false,
        order: 3
      }
    ]
  },
  {
    work_order_id: "wo_002",
    title: "Weekly Facility Safety Audit - Building B",
    description: "Comprehensive weekly safety audit covering all areas of Building B",
    created_at: "2025-01-20T09:00:00Z",
    due_date: "2025-01-22T17:00:00Z",
    status: "in-progress",
    assigned_to: "Sarah Johnson",
    location: "Building B - All Floors",
    priority: "medium",
    inspections: [
      {
        inspection_id: "insp_004",
        template_id: "template_4d5e6f7g8h9i0j1k",
        template_name: "HVAC System Check",
        template_description: "Inspect heating, ventilation, and air conditioning systems",
        status: "completed",
        required: true,
        completed_at: "2025-01-20T14:30:00Z",
        order: 1
      },
      {
        inspection_id: "insp_005",
        template_id: "template_5e6f7g8h9i0j1k2l",
        template_name: "Electrical Safety Inspection",
        template_description: "Check electrical panels, outlets, and safety equipment",
        status: "in-progress",
        required: true,
        order: 2
      }
    ]
  },
  {
    work_order_id: "wo_003",
    title: "Monthly Equipment Maintenance - Production Line",
    description: "Complete monthly maintenance checks on production line equipment",
    created_at: "2025-01-19T07:00:00Z",
    due_date: "2025-01-25T16:00:00Z",
    status: "completed",
    assigned_to: "Mike Rodriguez",
    location: "Production Floor - Line 1",
    priority: "critical",
    inspections: [
      {
        inspection_id: "insp_006",
        template_id: "template_6f7g8h9i0j1k2l3m",
        template_name: "Conveyor Belt Safety Check",
        template_description: "Inspect conveyor belt safety guards and emergency stops",
        status: "completed",
        required: true,
        completed_at: "2025-01-19T11:15:00Z",
        order: 1
      },
      {
        inspection_id: "insp_007",
        template_id: "template_7g8h9i0j1k2l3m4n",
        template_name: "Machine Guard Inspection",
        template_description: "Verify all machine guards are properly installed and secure",
        status: "completed",
        required: true,
        completed_at: "2025-01-19T15:45:00Z",
        order: 2
      }
    ]
  }
];