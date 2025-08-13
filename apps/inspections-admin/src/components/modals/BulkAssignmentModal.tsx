import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  UserCheck,
  Zap,
  Settings,
  FileText
} from 'lucide-react';

interface WorkOrder {
  id: string;
  workOrderId: string;
  title: string;
  priority: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
}

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string[];
  currentWorkload: number; // hours
  maxCapacity: number; // hours per week
  availability: 'available' | 'busy' | 'unavailable';
}

interface BulkAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrders: WorkOrder[];
  onAssign: (assignments: Assignment[]) => void;
}

interface Assignment {
  workOrderId: string;
  assignedTo: string;
  dueDate?: string;
  priority?: string;
  notes?: string;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Senior Inspector',
    department: 'Safety',
    skills: ['Safety Certification', 'Equipment Operation', 'Technical Writing'],
    currentWorkload: 25,
    maxCapacity: 40,
    availability: 'available'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Safety Manager',
    department: 'Safety',
    skills: ['Safety Certification', 'Environmental Assessment', 'First Aid Certified'],
    currentWorkload: 35,
    maxCapacity: 40,
    availability: 'busy'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    role: 'Maintenance Supervisor',
    department: 'Maintenance',
    skills: ['Mechanical Skills', 'Electrical Knowledge', 'Equipment Operation'],
    currentWorkload: 15,
    maxCapacity: 40,
    availability: 'available'
  },
  {
    id: '4',
    name: 'Lisa Davis',
    role: 'Quality Inspector',
    department: 'Quality',
    skills: ['Technical Writing', 'Photography', 'Environmental Assessment'],
    currentWorkload: 30,
    maxCapacity: 35,
    availability: 'available'
  },
  {
    id: '5',
    name: 'David Brown',
    role: 'Inspector',
    department: 'Operations',
    skills: ['Safety Certification', 'Photography'],
    currentWorkload: 38,
    maxCapacity: 40,
    availability: 'busy'
  }
];

export function BulkAssignmentModal({ isOpen, onClose, workOrders, onAssign }: BulkAssignmentModalProps) {
  const { toast } = useToast();
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'auto' | 'balanced'>('manual');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [autoAssignCriteria, setAutoAssignCriteria] = useState({
    considerSkills: true,
    considerWorkload: true,
    considerAvailability: true,
    balanceWorkload: false
  });

  useEffect(() => {
    if (isOpen) {
      // Initialize assignments for all work orders
      const initialAssignments = workOrders.map(wo => ({
        workOrderId: wo.id,
        assignedTo: wo.assignedTo || '',
        dueDate: wo.dueDate || '',
        priority: wo.priority,
        notes: ''
      }));
      setAssignments(initialAssignments);
      setSelectedWorkOrders(workOrders.map(wo => wo.id));
    }
  }, [isOpen, workOrders]);

  const handleSubmit = () => {
    const validAssignments = assignments.filter(assignment => 
      selectedWorkOrders.includes(assignment.workOrderId) && assignment.assignedTo
    );

    if (validAssignments.length === 0) {
      toast({
        title: "No assignments to process",
        description: "Please select work orders and assign them to users.",
        variant: "destructive",
      });
      return;
    }

    onAssign(validAssignments);
    toast({
      title: "Bulk assignment completed",
      description: `${validAssignments.length} work orders have been assigned.`,
    });
    onClose();
  };

  const updateAssignment = (workOrderId: string, updates: Partial<Assignment>) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.workOrderId === workOrderId 
        ? { ...assignment, ...updates }
        : assignment
    ));
  };

  const applyBulkChanges = () => {
    if (!bulkAssignee) {
      toast({
        title: "No assignee selected",
        description: "Please select an assignee for bulk assignment.",
        variant: "destructive",
      });
      return;
    }

    selectedWorkOrders.forEach(workOrderId => {
      updateAssignment(workOrderId, {
        assignedTo: bulkAssignee,
        dueDate: bulkDueDate || undefined,
        notes: bulkNotes || undefined
      });
    });

    toast({
      title: "Bulk changes applied",
      description: `${selectedWorkOrders.length} work orders updated.`,
    });
  };

  const autoAssign = () => {
    const availableUsers = MOCK_USERS.filter(user => 
      !autoAssignCriteria.considerAvailability || user.availability === 'available'
    );

    if (availableUsers.length === 0) {
      toast({
        title: "No available users",
        description: "No users meet the auto-assignment criteria.",
        variant: "destructive",
      });
      return;
    }

    const workOrdersToAssign = workOrders.filter(wo => selectedWorkOrders.includes(wo.id));
    
    // Simple round-robin assignment for demo
    let userIndex = 0;
    
    workOrdersToAssign.forEach(workOrder => {
      const user = availableUsers[userIndex % availableUsers.length];
      updateAssignment(workOrder.id, {
        assignedTo: user.name,
        dueDate: bulkDueDate || undefined,
        notes: 'Auto-assigned based on availability and workload'
      });
      userIndex++;
    });

    toast({
      title: "Auto-assignment completed",
      description: `${workOrdersToAssign.length} work orders auto-assigned.`,
    });
  };

  const balancedAssign = () => {
    const availableUsers = MOCK_USERS.filter(user => 
      user.availability === 'available' && user.currentWorkload < user.maxCapacity
    ).sort((a, b) => a.currentWorkload - b.currentWorkload);

    if (availableUsers.length === 0) {
      toast({
        title: "No users available for balanced assignment",
        description: "All users are at capacity or unavailable.",
        variant: "destructive",
      });
      return;
    }

    const workOrdersToAssign = workOrders.filter(wo => selectedWorkOrders.includes(wo.id));
    
    workOrdersToAssign.forEach(workOrder => {
      // Find user with lowest current workload
      const bestUser = availableUsers[0];
      updateAssignment(workOrder.id, {
        assignedTo: bestUser.name,
        dueDate: bulkDueDate || undefined,
        notes: 'Assigned based on balanced workload distribution'
      });
      
      // Update mock workload for next iteration
      bestUser.currentWorkload += workOrder.estimatedHours || 2;
      availableUsers.sort((a, b) => a.currentWorkload - b.currentWorkload);
    });

    toast({
      title: "Balanced assignment completed",
      description: `${workOrdersToAssign.length} work orders assigned with workload balancing.`,
    });
  };

  const toggleWorkOrderSelection = (workOrderId: string) => {
    setSelectedWorkOrders(prev => 
      prev.includes(workOrderId) 
        ? prev.filter(id => id !== workOrderId)
        : [...prev, workOrderId]
    );
  };

  const selectAllWorkOrders = () => {
    setSelectedWorkOrders(workOrders.map(wo => wo.id));
  };

  const deselectAllWorkOrders = () => {
    setSelectedWorkOrders([]);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'unavailable': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getWorkloadPercentage = (user: User) => {
    return Math.round((user.currentWorkload / user.maxCapacity) * 100);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Work Order Assignment
          </DialogTitle>
          <DialogDescription>
            Assign multiple work orders to team members using manual selection or automated distribution.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Assignment Mode Selection */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Assignment Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('manual')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      assignmentMode === 'manual' 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <UserCheck className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium">Manual Assignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Manually select assignees for each work order
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('auto')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      assignmentMode === 'auto' 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Zap className="h-8 w-8 text-orange-600 mb-2" />
                    <h3 className="font-medium">Auto Assignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically assign based on availability and skills
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('balanced')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      assignmentMode === 'balanced' 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Target className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-medium">Balanced Assignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Distribute workload evenly across team members
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Orders Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Work Orders ({selectedWorkOrders.length}/{workOrders.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllWorkOrders}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllWorkOrders}>
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {workOrders.map((workOrder) => {
                    const assignment = assignments.find(a => a.workOrderId === workOrder.id);
                    const isSelected = selectedWorkOrders.includes(workOrder.id);
                    
                    return (
                      <div
                        key={workOrder.id}
                        className={`p-3 border rounded-lg transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleWorkOrderSelection(workOrder.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{workOrder.title}</h4>
                              <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
                                {workOrder.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              ID: {workOrder.workOrderId}
                            </p>
                            
                            {assignmentMode === 'manual' && isSelected && (
                              <div className="grid gap-2 md:grid-cols-2 mt-3">
                                <Select
                                  value={assignment?.assignedTo || ''}
                                  onValueChange={(value) => updateAssignment(workOrder.id, { assignedTo: value })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MOCK_USERS.map((user) => (
                                      <SelectItem key={user.id} value={user.name}>
                                        <div className="flex items-center gap-2">
                                          <span>{user.name}</span>
                                          <Badge className={getAvailabilityColor(user.availability)}>
                                            {user.availability}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <input
                                  type="date"
                                  className="h-8 px-3 border border-input rounded-md text-sm"
                                  value={assignment?.dueDate || ''}
                                  onChange={(e) => updateAssignment(workOrder.id, { dueDate: e.target.value })}
                                />
                              </div>
                            )}
                            
                            {assignment?.assignedTo && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                  <CheckCircle className="h-3 w-3" />
                                  Assigned to {assignment.assignedTo}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members & Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {MOCK_USERS.map((user) => (
                    <div key={user.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{user.name}</h4>
                        <Badge className={getAvailabilityColor(user.availability)}>
                          {user.availability}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {user.role} • {user.department}
                      </p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Workload</span>
                          <span>{getWorkloadPercentage(user)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              getWorkloadPercentage(user) > 90 
                                ? 'bg-red-500' 
                                : getWorkloadPercentage(user) > 70 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(getWorkloadPercentage(user), 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {user.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {assignmentMode === 'manual' && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Bulk Assignee</Label>
                    <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_USERS.map((user) => (
                          <SelectItem key={user.id} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={bulkDueDate}
                      onChange={(e) => setBulkDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                      placeholder="Add notes for bulk assignment"
                      rows={2}
                    />
                  </div>
                  <Button onClick={applyBulkChanges} className="w-full">
                    Apply to Selected ({selectedWorkOrders.length})
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Auto Assignment Actions */}
            {(assignmentMode === 'auto' || assignmentMode === 'balanced') && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Assignment Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Due Date (Optional)</Label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={bulkDueDate}
                      onChange={(e) => setBulkDueDate(e.target.value)}
                    />
                  </div>
                  
                  {assignmentMode === 'auto' && (
                    <Button onClick={autoAssign} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Auto Assign ({selectedWorkOrders.length})
                    </Button>
                  )}
                  
                  {assignmentMode === 'balanced' && (
                    <Button onClick={balancedAssign} className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Balance Assign ({selectedWorkOrders.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Apply Assignments ({assignments.filter(a => selectedWorkOrders.includes(a.workOrderId) && a.assignedTo).length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
