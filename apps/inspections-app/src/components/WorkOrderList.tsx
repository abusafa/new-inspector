import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Filter,
  Navigation,
  AlertCircle,
  TrendingUp,
  Users,
  ClipboardList,
  X,
  Edit3
} from 'lucide-react';
import { WorkOrder } from '@/types/inspection';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
}

export function WorkOrderList({ workOrders, onSelectWorkOrder }: WorkOrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('due-date');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const overdue = workOrders.filter(wo => wo.status === 'overdue').length;
    const highPriority = workOrders.filter(wo => wo.priority === 'high' || wo.priority === 'critical').length;
    const inProgress = workOrders.filter(wo => wo.status === 'in-progress').length;
    const completed = workOrders.filter(wo => wo.status === 'completed').length;
    
    return { overdue, highPriority, inProgress, completed };
  }, [workOrders]);

  // Get unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(workOrders.map(wo => wo.assigned_to)));
  }, [workOrders]);

  // Filter and sort work orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = workOrders.filter(wo => {
      const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || wo.assigned_to === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due-date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'created-date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [workOrders, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy]);

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white border-red-600';
      case 'high':
        return 'bg-orange-500 text-white border-orange-500';
      case 'medium':
        return 'bg-yellow-500 text-white border-yellow-500';
      default:
        return 'bg-slate-400 text-white border-slate-400';
    }
  };

  const getStatusIcon = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'overdue':
        return AlertTriangle;
      case 'in-progress':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getDueDateColor = (dueDate?: string, status?: WorkOrder['status']) => {
    if (status === 'completed') return 'text-muted-foreground';
    if (!dueDate) return 'text-muted-foreground';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'text-red-600 font-semibold'; // Overdue
    if (diffHours < 24) return 'text-orange-600 font-semibold'; // Due soon
    return 'text-foreground';
  };

  const calculateProgress = (workOrder: WorkOrder) => {
    const completed = workOrder.inspections.filter(i => i.status === 'completed').length;
    return workOrder.inspections.length > 0 ? (completed / workOrder.inspections.length) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDirections = (location: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
    window.open(mapsUrl, '_blank');
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(filteredAndSortedOrders.map(wo => wo.work_order_id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedOrders(new Set());
    }
  };

  const handleCardTap = (workOrder: WorkOrder, event: React.MouseEvent) => {
    if (isSelectMode) {
      event.preventDefault();
      const isSelected = selectedOrders.has(workOrder.work_order_id);
      handleSelectOrder(workOrder.work_order_id, !isSelected);
    } else {
      onSelectWorkOrder(workOrder);
    }
  };
  const MetricCard = ({ title, value, icon: Icon, color, onClick }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    onClick?: () => void;
  }) => (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${onClick ? 'hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Overdue"
          value={metrics.overdue}
          icon={AlertTriangle}
          color="text-red-600"
          onClick={() => setStatusFilter('overdue')}
        />
        <MetricCard
          title="High Priority"
          value={metrics.highPriority}
          icon={TrendingUp}
          color="text-orange-600"
          onClick={() => setPriorityFilter('high')}
        />
        <MetricCard
          title="In Progress"
          value={metrics.inProgress}
          icon={Clock}
          color="text-blue-600"
          onClick={() => setStatusFilter('in-progress')}
        />
        <MetricCard
          title="Completed"
          value={metrics.completed}
          icon={CheckCircle2}
          color="text-green-600"
          onClick={() => setStatusFilter('completed')}
        />
      </div>

      {/* Mobile Header with Search and Filter */}
      <div className="flex items-center gap-2 px-1">
        {/* Search */}
        {isSearchExpanded ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => {
                  setIsSearchExpanded(false);
                  setSearchTerm('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setIsSearchExpanded(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[400px]">
                <SheetHeader>
                  <SheetTitle>Filter Work Orders</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific work orders
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignee</label>
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Assignees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {uniqueAssignees.map(assignee => (
                          <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due-date">Due Date</SelectItem>
                        <SelectItem value="created-date">Created</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex-1" />
            
            {/* Select Mode Toggle */}
            <Button
              variant={isSelectMode ? "default" : "ghost"}
              size="sm"
              onClick={toggleSelectMode}
              className="h-9 px-3"
            >
              {isSelectMode ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Select
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Select All in Select Mode */}
      {isSelectMode && filteredAndSortedOrders.length > 0 && (
        <div className="flex items-center gap-2 px-2">
          <Checkbox
            checked={selectedOrders.size === filteredAndSortedOrders.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select all ({filteredAndSortedOrders.length})
          </span>
        </div>
      )}

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredAndSortedOrders.map((workOrder) => {
          const progress = calculateProgress(workOrder);
          const completedInspections = workOrder.inspections.filter(i => i.status === 'completed').length;
          const isCompleted = workOrder.status === 'completed';
          const isSelected = selectedOrders.has(workOrder.work_order_id);
          
          return (
            <Card 
              key={workOrder.work_order_id}
              className={`cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                isCompleted ? 'opacity-75' : ''
              } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md border border-border hover:border-blue-300'}`}
              onClick={(e) => handleCardTap(workOrder, e)}
            >
              <CardContent className="p-3">
                {/* Header Row */}
                <div className="flex items-start gap-2 mb-2">
                  {isSelectMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectOrder(workOrder.work_order_id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm leading-tight mb-1 ${isCompleted ? 'line-through' : ''}`}>
                      {workOrder.title}
                    </h3>
                    
                    {/* Status and Priority Badges */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge className={`${getStatusColor(workOrder.status)} text-xs px-2 py-0.5`} variant="secondary">
                        {workOrder.status === 'in-progress' ? 'IN PROGRESS' : workOrder.status.toUpperCase()}
                      </Badge>
                      <Badge className={`${getPriorityColor(workOrder.priority)} text-xs px-2 py-0.5`} variant="secondary">
                        {workOrder.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Key Context Row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{workOrder.assigned_to}</span>
                  </div>
                  {workOrder.due_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={getDueDateColor(workOrder.due_date, workOrder.status)}>
                        Due: {formatDate(workOrder.due_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thin Progress Bar */}
                <Progress value={progress} className="h-1 bg-muted" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Action Bar for Select Mode */}
      {isSelectMode && selectedOrders.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <span className="text-sm font-medium">
              {selectedOrders.size} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Reassign</Button>
              <Button variant="outline" size="sm">Update Status</Button>
              <Button size="sm">Complete</Button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredAndSortedOrders.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No work orders found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Bottom spacing for select mode */}
      {isSelectMode && selectedOrders.size > 0 && <div className="h-20" />}
    </div>
  );
}