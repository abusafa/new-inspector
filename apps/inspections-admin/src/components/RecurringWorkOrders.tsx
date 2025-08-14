import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon,
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  RotateCcw,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RecurringSchedule {
  id: string;
  name: string;
  description: string;
  templateIds: string[];
  assignedTo?: string;
  assignedGroup?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Scheduling
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // Every N days/weeks/months
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[]; // For weekly schedules (0=Sunday, 6=Saturday)
  dayOfMonth?: number; // For monthly schedules (1-31)
  time?: string; // HH:MM format
  
  // Status
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  lastGenerated?: string;
  nextDue?: string;
  
  // Statistics
  totalGenerated: number;
  completedCount: number;
  overdueCount: number;
}

interface ScheduledWorkOrder {
  id: string;
  scheduleId: string;
  scheduleName: string;
  workOrderId: string;
  title: string;
  dueDate: string;
  assignedTo?: string;
  location?: string;
  priority: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  createdAt: string;
}

export function RecurringWorkOrders() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [upcomingWorkOrders, setUpcomingWorkOrders] = useState<ScheduledWorkOrder[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<RecurringSchedule | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schedules');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState<Partial<RecurringSchedule>>({
    name: '',
    description: '',
    templateIds: [],
    assignedTo: '',
    assignedGroup: '',
    location: '',
    priority: 'medium',
    frequency: 'weekly',
    interval: 1,
    startDate: new Date().toISOString().split('T')[0],
    time: '09:00',
    isActive: true,
    daysOfWeek: [1], // Monday by default
    dayOfMonth: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockSchedules: RecurringSchedule[] = [
        {
          id: '1',
          name: 'Daily Equipment Safety Check',
          description: 'Daily inspection of all warehouse equipment before shift start',
          templateIds: ['template_1a2b3c4d5e6f7g8h'],
          assignedGroup: 'Safety Inspectors',
          location: 'All Warehouses',
          priority: 'high',
          frequency: 'daily',
          interval: 1,
          startDate: '2025-01-01',
          time: '08:00',
          isActive: true,
          createdAt: '2024-12-01T10:00:00Z',
          createdBy: 'Safety Manager',
          lastGenerated: '2025-01-21T08:00:00Z',
          nextDue: '2025-01-22T08:00:00Z',
          totalGenerated: 21,
          completedCount: 19,
          overdueCount: 2
        },
        {
          id: '2',
          name: 'Weekly Fire Safety Inspection',
          description: 'Comprehensive fire safety audit of all buildings',
          templateIds: ['template_2b3c4d5e6f7g8h9i'],
          assignedTo: 'Fire Safety Officer',
          location: 'All Buildings',
          priority: 'critical',
          frequency: 'weekly',
          interval: 1,
          startDate: '2025-01-06',
          daysOfWeek: [1], // Monday
          time: '14:00',
          isActive: true,
          createdAt: '2024-11-15T10:00:00Z',
          createdBy: 'Facility Manager',
          lastGenerated: '2025-01-20T14:00:00Z',
          nextDue: '2025-01-27T14:00:00Z',
          totalGenerated: 7,
          completedCount: 6,
          overdueCount: 1
        },
        {
          id: '3',
          name: 'Monthly HVAC Maintenance',
          description: 'Monthly inspection and maintenance of HVAC systems',
          templateIds: ['template_3c4d5e6f7g8h9i0j'],
          assignedTo: 'HVAC Technician',
          location: 'All Buildings',
          priority: 'medium',
          frequency: 'monthly',
          interval: 1,
          startDate: '2025-01-01',
          dayOfMonth: 1,
          time: '10:00',
          isActive: false,
          createdAt: '2024-10-01T10:00:00Z',
          createdBy: 'Maintenance Manager',
          lastGenerated: '2025-01-01T10:00:00Z',
          nextDue: '2025-02-01T10:00:00Z',
          totalGenerated: 4,
          completedCount: 4,
          overdueCount: 0
        }
      ];

      const mockUpcoming: ScheduledWorkOrder[] = [
        {
          id: '1',
          scheduleId: '1',
          scheduleName: 'Daily Equipment Safety Check',
          workOrderId: 'wo_auto_001',
          title: 'Daily Equipment Safety Check - 2025-01-22',
          dueDate: '2025-01-22T08:00:00Z',
          assignedTo: 'John Smith',
          location: 'Warehouse A',
          priority: 'high',
          status: 'pending',
          createdAt: '2025-01-21T08:00:00Z'
        },
        {
          id: '2',
          scheduleId: '2',
          scheduleName: 'Weekly Fire Safety Inspection',
          workOrderId: 'wo_auto_002',
          title: 'Weekly Fire Safety Inspection - Week 4',
          dueDate: '2025-01-27T14:00:00Z',
          assignedTo: 'Fire Safety Officer',
          location: 'Building B',
          priority: 'critical',
          status: 'pending',
          createdAt: '2025-01-20T14:00:00Z'
        }
      ];

      setSchedules(mockSchedules);
      setUpcomingWorkOrders(mockUpcoming);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recurring schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const newSchedule: RecurringSchedule = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        totalGenerated: 0,
        completedCount: 0,
        overdueCount: 0,
        nextDue: calculateNextDue(formData as RecurringSchedule)
      } as RecurringSchedule;

      setSchedules(prev => [...prev, newSchedule]);
      setIsCreateModalOpen(false);
      resetForm();

      toast({
        title: "Schedule Created",
        description: `${newSchedule.name} has been created and will start generating work orders`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recurring schedule",
        variant: "destructive",
      });
    }
  };

  const handleToggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, isActive }
          : schedule
      ));

      toast({
        title: isActive ? "Schedule Activated" : "Schedule Paused",
        description: `The schedule has been ${isActive ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      
      toast({
        title: "Schedule Deleted",
        description: "The recurring schedule has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const calculateNextDue = (schedule: RecurringSchedule): string => {
    const start = parseISO(schedule.startDate);
    const now = new Date();
    
    switch (schedule.frequency) {
      case 'daily':
        return addDays(now, schedule.interval).toISOString();
      case 'weekly':
        return addWeeks(now, schedule.interval).toISOString();
      case 'monthly':
        return addMonths(now, schedule.interval).toISOString();
      default:
        return addDays(now, 1).toISOString();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      templateIds: [],
      assignedTo: '',
      assignedGroup: '',
      location: '',
      priority: 'medium',
      frequency: 'weekly',
      interval: 1,
      startDate: new Date().toISOString().split('T')[0],
      time: '09:00',
      isActive: true,
      daysOfWeek: [1],
      dayOfMonth: 1
    });
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !searchTerm || 
      schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && schedule.isActive) ||
      (statusFilter === 'inactive' && !schedule.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getFrequencyDisplay = (schedule: RecurringSchedule) => {
    const { frequency, interval, daysOfWeek, dayOfMonth, time } = schedule;
    
    let display = `Every ${interval > 1 ? `${interval} ` : ''}${frequency}`;
    
    if (frequency === 'weekly' && daysOfWeek) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = daysOfWeek.map(d => days[d]).join(', ');
      display += ` on ${dayNames}`;
    } else if (frequency === 'monthly' && dayOfMonth) {
      display += ` on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
    }
    
    if (time) {
      display += ` at ${time}`;
    }
    
    return display;
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Work Orders</h1>
          <p className="text-muted-foreground">
            Automate recurring inspections and maintenance tasks
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <CreateScheduleDialog 
            formData={formData}
            setFormData={setFormData}
            onSave={handleCreateSchedule}
            onCancel={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {schedules.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Schedules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {schedules.reduce((sum, s) => sum + s.totalGenerated, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Work Orders Generated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {upcomingWorkOrders.length}
            </div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {schedules.reduce((sum, s) => sum + s.overdueCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedules</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">
            <RotateCcw className="h-4 w-4 mr-2" />
            Schedules ({schedules.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Upcoming ({upcomingWorkOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Schedules Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first recurring schedule to automate work order generation
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchedules.map(schedule => (
                <ScheduleCard 
                  key={schedule.id} 
                  schedule={schedule}
                  onToggle={handleToggleSchedule}
                  onDelete={handleDeleteSchedule}
                  onEdit={setSelectedSchedule}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {upcomingWorkOrders.map(workOrder => (
              <Card key={workOrder.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{workOrder.title}</h3>
                      <p className="text-sm text-muted-foreground">{workOrder.scheduleName}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Due {format(parseISO(workOrder.dueDate), 'MMM d, yyyy HH:mm')}
                        </div>
                        {workOrder.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {workOrder.assignedTo}
                          </div>
                        )}
                        {workOrder.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {workOrder.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(workOrder.priority)}>
                        {workOrder.priority}
                      </Badge>
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Schedule Card Component
function ScheduleCard({ 
  schedule, 
  onToggle, 
  onDelete, 
  onEdit 
}: {
  schedule: RecurringSchedule;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (schedule: RecurringSchedule) => void;
}) {
  const completionRate = schedule.totalGenerated > 0 
    ? (schedule.completedCount / schedule.totalGenerated) * 100 
    : 100;

  return (
    <Card className={`${schedule.isActive ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-1">{schedule.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {schedule.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={getPriorityColor(schedule.priority)}>
              {schedule.priority}
            </Badge>
            {schedule.isActive ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Frequency */}
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">Frequency</span>
          </div>
          <p className="text-muted-foreground">
            {getFrequencyDisplay(schedule)}
          </p>
        </div>

        {/* Assignment */}
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">Assigned To</span>
          </div>
          <p className="text-muted-foreground">
            {schedule.assignedTo || schedule.assignedGroup || 'Unassigned'}
          </p>
        </div>

        {/* Location */}
        {schedule.location && (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Location</span>
            </div>
            <p className="text-muted-foreground">{schedule.location}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion Rate</span>
            <span className="font-medium">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{schedule.completedCount} completed</span>
            <span>{schedule.totalGenerated} total</span>
          </div>
        </div>

        {/* Next Due */}
        {schedule.nextDue && (
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                Next: {format(parseISO(schedule.nextDue), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(schedule.id, !schedule.isActive)}
            className="flex-1"
          >
            {schedule.isActive ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(schedule)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(schedule.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Create Schedule Dialog Component
function CreateScheduleDialog({
  formData,
  setFormData,
  onSave,
  onCancel
}: {
  formData: Partial<RecurringSchedule>;
  setFormData: (data: Partial<RecurringSchedule>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    formData.startDate ? parseISO(formData.startDate) : new Date()
  );

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Recurring Schedule</DialogTitle>
        <DialogDescription>
          Set up a recurring schedule to automatically generate work orders
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Schedule Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Daily Equipment Safety Check"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this recurring schedule is for..."
            />
          </div>
        </div>

        {/* Assignment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignedTo">Assigned To (Individual)</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo || ''}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="e.g., John Smith"
            />
          </div>
          
          <div>
            <Label htmlFor="assignedGroup">Assigned Group</Label>
            <Input
              id="assignedGroup"
              value={formData.assignedGroup || ''}
              onChange={(e) => setFormData({ ...formData, assignedGroup: e.target.value })}
              placeholder="e.g., Safety Inspectors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Warehouse A"
            />
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Schedule Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="interval">Repeat Every</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                value={formData.interval || 1}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${
                      !startDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setFormData({ 
                        ...formData, 
                        startDate: date ? format(date, 'yyyy-MM-dd') : ''
                      });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <Label>Days of Week</Label>
              <div className="flex gap-2 mt-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant={formData.daysOfWeek?.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = formData.daysOfWeek || [];
                      const updated = current.includes(index)
                        ? current.filter(d => d !== index)
                        : [...current, index];
                      setFormData({ ...formData, daysOfWeek: updated });
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {formData.frequency === 'monthly' && (
            <div>
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth || 1}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Start schedule immediately</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!formData.name}>
          Create Schedule
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function getFrequencyDisplay(schedule: RecurringSchedule) {
  const { frequency, interval, daysOfWeek, dayOfMonth, time } = schedule;
  
  let display = `Every ${interval > 1 ? `${interval} ` : ''}${frequency}`;
  
  if (frequency === 'weekly' && daysOfWeek) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNames = daysOfWeek.map(d => days[d]).join(', ');
    display += ` on ${dayNames}`;
  } else if (frequency === 'monthly' && dayOfMonth) {
    display += ` on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
  }
  
  if (time) {
    display += ` at ${time}`;
  }
  
  return display;
}

function getOrdinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'bg-red-500 text-white';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}
