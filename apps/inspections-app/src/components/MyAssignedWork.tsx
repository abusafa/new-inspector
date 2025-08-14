import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  MapPin,
  User,
  FileCheck,
  Play,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WorkOrder, WorkOrderInspection } from '../types/inspection';
import { useAuth } from '@/hooks/useAuth';

interface MyAssignedWorkProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
  onStartInspection: (workOrder: WorkOrder, inspection: WorkOrderInspection) => void;
}

export function MyAssignedWork({ workOrders, onSelectWorkOrder, onStartInspection }: MyAssignedWorkProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('today');

  // Filter work orders assigned to current user
  const myWorkOrders = useMemo(() => {
    return workOrders.filter(wo => wo.assigned_to === user?.name);
  }, [workOrders, user?.name]);

  // Apply filters
  const filteredWorkOrders = useMemo(() => {
    let filtered = myWorkOrders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(wo => 
        wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(wo => wo.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }

    return filtered;
  }, [myWorkOrders, searchTerm, priorityFilter, statusFilter]);

  // Categorize work orders by urgency
  const categorizedWork = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    return {
      overdue: filteredWorkOrders.filter(wo => {
        if (!wo.due_date) return false;
        return new Date(wo.due_date) < now && wo.status !== 'completed';
      }),
      today: filteredWorkOrders.filter(wo => {
        if (!wo.due_date) return false;
        const dueDate = new Date(wo.due_date);
        return dueDate >= now && dueDate <= todayEnd;
      }),
      upcoming: filteredWorkOrders.filter(wo => {
        if (!wo.due_date) return false;
        const dueDate = new Date(wo.due_date);
        return dueDate > todayEnd;
      }),
      noDueDate: filteredWorkOrders.filter(wo => !wo.due_date)
    };
  }, [filteredWorkOrders]);

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const calculateProgress = (workOrder: WorkOrder) => {
    const total = workOrder.inspections.length;
    const completed = workOrder.inspections.filter(i => i.status === 'completed').length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextInspection = (workOrder: WorkOrder): WorkOrderInspection | null => {
    return workOrder.inspections
      .filter(i => i.status === 'not-started')
      .sort((a, b) => a.order - b.order)[0] || null;
  };

  const WorkOrderCard = ({ workOrder }: { workOrder: WorkOrder }) => {
    const progress = calculateProgress(workOrder);
    const nextInspection = getNextInspection(workOrder);
    const isOverdue = workOrder.due_date && new Date(workOrder.due_date) < new Date() && workOrder.status !== 'completed';

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base line-clamp-1">{workOrder.title}</CardTitle>
                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
              <CardDescription className="text-sm line-clamp-2">
                {workOrder.description}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge className={getPriorityColor(workOrder.priority)}>
                {workOrder.priority}
              </Badge>
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {workOrder.inspections.filter(i => i.status === 'completed').length} of {workOrder.inspections.length} inspections completed
            </div>
          </div>

          {/* Location and Due Date */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {workOrder.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{workOrder.location}</span>
              </div>
            )}
            {workOrder.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className={`truncate ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                  {formatDate(workOrder.due_date)}
                </span>
              </div>
            )}
          </div>

          {/* Next Inspection */}
          {nextInspection && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Next: {nextInspection.template_name}</div>
                  <div className="text-xs text-muted-foreground">{nextInspection.template_description}</div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => onStartInspection(workOrder, nextInspection)}
                  className="flex items-center gap-1"
                >
                  <Play className="h-3 w-3" />
                  Start
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelectWorkOrder(workOrder)}
              className="flex-1 flex items-center gap-1"
            >
              <FileCheck className="h-3 w-3" />
              View Details
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTabCount = (category: keyof typeof categorizedWork) => {
    return categorizedWork[category].length;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{getTabCount('overdue')}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{getTabCount('today')}</div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{getTabCount('upcoming')}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{myWorkOrders.length}</div>
            <div className="text-sm text-muted-foreground">Total Assigned</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setPriorityFilter('all');
              setStatusFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Work Orders */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Overdue ({getTabCount('overdue')})
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today ({getTabCount('today')})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({getTabCount('upcoming')})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            All ({myWorkOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-4">
          {categorizedWork.overdue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Overdue Work</h3>
                <p className="text-muted-foreground">Great job staying on top of your assignments!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categorizedWork.overdue.map(workOrder => (
                <WorkOrderCard key={workOrder.work_order_id} workOrder={workOrder} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {categorizedWork.today.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nothing Due Today</h3>
                <p className="text-muted-foreground">You're all caught up for today!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categorizedWork.today.map(workOrder => (
                <WorkOrderCard key={workOrder.work_order_id} workOrder={workOrder} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {categorizedWork.upcoming.map(workOrder => (
              <WorkOrderCard key={workOrder.work_order_id} workOrder={workOrder} />
            ))}
            {categorizedWork.noDueDate.map(workOrder => (
              <WorkOrderCard key={workOrder.work_order_id} workOrder={workOrder} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredWorkOrders.map(workOrder => (
              <WorkOrderCard key={workOrder.work_order_id} workOrder={workOrder} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
