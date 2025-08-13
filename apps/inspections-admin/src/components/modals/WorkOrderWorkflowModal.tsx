import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  GitBranch, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Settings
} from 'lucide-react';

interface WorkOrder {
  id: string;
  workOrderId: string;
  title: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
  description: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'skipped';
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  completedAt?: string;
  notes?: string;
  dependencies: string[];
  isRequired: boolean;
}

interface WorkflowAction {
  type: 'approve' | 'reject' | 'reassign' | 'escalate' | 'pause' | 'resume' | 'skip';
  reason: string;
  assignTo?: string;
  notes?: string;
}

interface WorkOrderWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder;
  onUpdateWorkflow: (workOrderId: string, action: WorkflowAction) => void;
}

const WORKFLOW_TEMPLATES = {
  'safety-inspection': [
    { id: '1', name: 'Initial Assessment', estimatedHours: 1, dependencies: [], isRequired: true },
    { id: '2', name: 'Documentation Review', estimatedHours: 0.5, dependencies: ['1'], isRequired: true },
    { id: '3', name: 'Field Inspection', estimatedHours: 2, dependencies: ['2'], isRequired: true },
    { id: '4', name: 'Photo Documentation', estimatedHours: 0.5, dependencies: ['3'], isRequired: true },
    { id: '5', name: 'Report Generation', estimatedHours: 1, dependencies: ['4'], isRequired: true },
    { id: '6', name: 'Supervisor Review', estimatedHours: 0.5, dependencies: ['5'], isRequired: true },
    { id: '7', name: 'Client Notification', estimatedHours: 0.25, dependencies: ['6'], isRequired: false }
  ],
  'maintenance': [
    { id: '1', name: 'Work Order Review', estimatedHours: 0.5, dependencies: [], isRequired: true },
    { id: '2', name: 'Parts & Tools Preparation', estimatedHours: 1, dependencies: ['1'], isRequired: true },
    { id: '3', name: 'Safety Lockout', estimatedHours: 0.5, dependencies: ['2'], isRequired: true },
    { id: '4', name: 'Maintenance Work', estimatedHours: 3, dependencies: ['3'], isRequired: true },
    { id: '5', name: 'Testing & Verification', estimatedHours: 1, dependencies: ['4'], isRequired: true },
    { id: '6', name: 'Documentation', estimatedHours: 0.5, dependencies: ['5'], isRequired: true }
  ],
  'compliance': [
    { id: '1', name: 'Compliance Check', estimatedHours: 1, dependencies: [], isRequired: true },
    { id: '2', name: 'Documentation Audit', estimatedHours: 2, dependencies: ['1'], isRequired: true },
    { id: '3', name: 'Corrective Actions', estimatedHours: 1.5, dependencies: ['2'], isRequired: false },
    { id: '4', name: 'Final Review', estimatedHours: 0.5, dependencies: ['2', '3'], isRequired: true },
    { id: '5', name: 'Compliance Report', estimatedHours: 1, dependencies: ['4'], isRequired: true }
  ]
};

const MOCK_USERS = [
  'John Smith',
  'Sarah Johnson', 
  'Mike Wilson',
  'Lisa Davis',
  'David Brown'
];

export function WorkOrderWorkflowModal({ isOpen, onClose, workOrder, onUpdateWorkflow }: WorkOrderWorkflowModalProps) {
  const { toast } = useToast();
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedAction, setSelectedAction] = useState<WorkflowAction['type'] | ''>('');
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Initialize workflow based on work order type
  useEffect(() => {
    if (isOpen && workOrder) {
      // Determine workflow template based on work order title/category
      let template = WORKFLOW_TEMPLATES['safety-inspection'];
      if (workOrder.title.toLowerCase().includes('maintenance')) {
        template = WORKFLOW_TEMPLATES['maintenance'];
      } else if (workOrder.title.toLowerCase().includes('compliance')) {
        template = WORKFLOW_TEMPLATES['compliance'];
      }

      // Convert template to workflow steps with mock progress
      const steps: WorkflowStep[] = template.map((step, index) => ({
        ...step,
        status: index === 0 ? 'in-progress' : index < Math.floor(Math.random() * template.length) ? 'completed' : 'pending',
        assignedTo: index <= currentStep ? workOrder.assignedTo : undefined,
        actualHours: index < currentStep ? step.estimatedHours + (Math.random() * 0.5 - 0.25) : undefined,
        completedAt: index < currentStep ? new Date(Date.now() - (template.length - index) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        notes: index < currentStep ? `Completed ${step.name.toLowerCase()} successfully` : undefined
      }));

      setWorkflowSteps(steps);
      
      // Find current step
      const currentIndex = steps.findIndex(step => step.status === 'in-progress');
      setCurrentStep(currentIndex >= 0 ? currentIndex : steps.findIndex(step => step.status === 'pending'));
    }
  }, [isOpen, workOrder]);

  const handleActionSubmit = () => {
    if (!selectedAction || !actionReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an action and provide a reason.",
        variant: "destructive",
      });
      return;
    }

    const action: WorkflowAction = {
      type: selectedAction as WorkflowAction['type'],
      reason: actionReason,
      assignTo: assignTo || undefined,
      notes: actionNotes || undefined
    };

    onUpdateWorkflow(workOrder.id, action);
    
    toast({
      title: "Workflow action applied",
      description: `${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} action has been applied to the work order.`,
    });

    // Reset form
    setSelectedAction('');
    setActionReason('');
    setActionNotes('');
    setAssignTo('');
    onClose();
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'skipped': return <RefreshCw className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200';
      case 'skipped': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getWorkflowProgress = () => {
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / workflowSteps.length) * 100);
  };

  const getTotalEstimatedHours = () => {
    return workflowSteps.reduce((total, step) => total + step.estimatedHours, 0);
  };

  const getTotalActualHours = () => {
    return workflowSteps.reduce((total, step) => total + (step.actualHours || 0), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Work Order Workflow - {workOrder?.workOrderId}
          </DialogTitle>
          <DialogDescription>
            Track and manage the workflow progress for this work order.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Work Order Summary */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workOrder?.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(workOrder?.priority || '')}>
                      {workOrder?.priority}
                    </Badge>
                    <Badge variant="secondary">
                      {getWorkflowProgress()}% Complete
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{workOrder?.assignedTo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {workOrder?.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Time</p>
                      <p className="font-medium">{getTotalEstimatedHours()}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Time</p>
                      <p className="font-medium">{getTotalActualHours().toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{getWorkflowProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getWorkflowProgress()}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Workflow Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Connection Line */}
                      {index < workflowSteps.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                      )}
                      
                      <div className={`p-4 border rounded-lg ${
                        step.status === 'in-progress' ? 'border-blue-200 bg-blue-50' : 
                        step.status === 'completed' ? 'border-green-200 bg-green-50' : 
                        'border-gray-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getStepStatusIcon(step.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{step.name}</h4>
                              <Badge className={getStepStatusColor(step.status)}>
                                {step.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Est: {step.estimatedHours}h
                                {step.actualHours && ` | Actual: ${step.actualHours.toFixed(1)}h`}
                              </div>
                              {step.assignedTo && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {step.assignedTo}
                                </div>
                              )}
                            </div>
                            
                            {step.completedAt && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Completed: {new Date(step.completedAt).toLocaleString()}
                              </p>
                            )}
                            
                            {step.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <MessageSquare className="h-3 w-3 inline mr-1" />
                                {step.notes}
                              </div>
                            )}
                            
                            {step.dependencies.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <span>Depends on: </span>
                                {step.dependencies.map((depId, i) => {
                                  const depStep = workflowSteps.find(s => s.id === depId);
                                  return (
                                    <span key={depId}>
                                      {depStep?.name}
                                      {i < step.dependencies.length - 1 ? ', ' : ''}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Workflow Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={selectedAction} onValueChange={(value: any) => setSelectedAction(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Approve Current Step
                        </div>
                      </SelectItem>
                      <SelectItem value="reject">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Reject & Send Back
                        </div>
                      </SelectItem>
                      <SelectItem value="reassign">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          Reassign Work Order
                        </div>
                      </SelectItem>
                      <SelectItem value="escalate">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          Escalate Issue
                        </div>
                      </SelectItem>
                      <SelectItem value="pause">
                        <div className="flex items-center gap-2">
                          <Pause className="h-4 w-4 text-gray-600" />
                          Pause Workflow
                        </div>
                      </SelectItem>
                      <SelectItem value="resume">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-green-600" />
                          Resume Workflow
                        </div>
                      </SelectItem>
                      <SelectItem value="skip">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-gray-600" />
                          Skip Current Step
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAction === 'reassign' && (
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select value={assignTo} onValueChange={setAssignTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_USERS.map((user) => (
                          <SelectItem key={user} value={user}>{user}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <Textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Explain the reason for this action"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Add any additional notes or instructions"
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleActionSubmit} 
                  className="w-full"
                  disabled={!selectedAction || !actionReason.trim()}
                >
                  Apply Action
                </Button>
              </CardContent>
            </Card>

            {/* Workflow History */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Step completed</p>
                      <p className="text-xs text-muted-foreground">Field Inspection completed by {workOrder?.assignedTo}</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                    <Play className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Step started</p>
                      <p className="text-xs text-muted-foreground">Photo Documentation started</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                    <User className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Work order assigned</p>
                      <p className="text-xs text-muted-foreground">Assigned to {workOrder?.assignedTo}</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
