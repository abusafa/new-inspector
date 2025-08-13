import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealTime } from '@/contexts/RealTimeContext';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Activity, 
  User, 
  FileCheck, 
  ClipboardList, 
  UserPlus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'work_order' | 'inspection' | 'user' | 'system' | 'template';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'completed' | 'login' | 'logout';
  user: string;
  target?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function ActivityFeed({ compact = false }: { compact?: boolean }) {
  const { subscribe, isConnected } = useRealTime();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'work_order' | 'inspection' | 'user' | 'system'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Initialize with mock activities
    const initialActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'work_order',
        action: 'created',
        user: 'Sarah Johnson',
        target: 'Safety Inspection - Building A',
        description: 'Created new work order for routine safety inspection',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: { priority: 'high', department: 'Safety' }
      },
      {
        id: '2',
        type: 'inspection',
        action: 'completed',
        user: 'John Smith',
        target: 'Fire Safety Check - Building C',
        description: 'Completed fire safety inspection with 3 minor findings',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        metadata: { score: 87, findings: 3 }
      },
      {
        id: '3',
        type: 'user',
        action: 'login',
        user: 'Mike Wilson',
        description: 'Logged into the system',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'work_order',
        action: 'assigned',
        user: 'Lisa Davis',
        target: 'Equipment Maintenance - Elevator B2',
        description: 'Assigned maintenance work order to David Brown',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        metadata: { assignee: 'David Brown', estimatedHours: 4 }
      },
      {
        id: '5',
        type: 'system',
        action: 'updated',
        user: 'System',
        description: 'Automated backup completed successfully',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        metadata: { size: '2.3GB', duration: '12 minutes' }
      },
      {
        id: '6',
        type: 'inspection',
        action: 'created',
        user: 'Sarah Johnson',
        target: 'Monthly Quality Review',
        description: 'Scheduled monthly quality inspection for next week',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        metadata: { dueDate: '2024-01-20', department: 'Quality' }
      }
    ];

    setActivities(initialActivities);

    // Subscribe to real-time updates
    const unsubscribe = subscribe((update) => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: update.type,
        action: update.action,
        user: update.data.assignedTo || update.data.completedBy || update.data.name || 'System',
        target: update.data.title,
        description: generateDescription(update),
        timestamp: update.timestamp,
        metadata: update.data
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep max 50 activities
    });

    return () => unsubscribe();
  }, [subscribe]);

  const generateDescription = (update: any): string => {
    switch (update.type) {
      case 'work_order':
        switch (update.action) {
          case 'created': return `Created new work order: ${update.data.title}`;
          case 'assigned': return `Assigned work order to ${update.data.assignedTo}`;
          case 'completed': return `Completed work order: ${update.data.title}`;
          case 'updated': return `Updated work order: ${update.data.title}`;
          default: return `${update.action} work order: ${update.data.title}`;
        }
      case 'inspection':
        switch (update.action) {
          case 'created': return `Created new inspection: ${update.data.title}`;
          case 'completed': return `Completed inspection: ${update.data.title}`;
          case 'updated': return `Updated inspection: ${update.data.title}`;
          default: return `${update.action} inspection: ${update.data.title}`;
        }
      case 'user':
        return `${update.data.action || update.action}`;
      case 'system':
        return update.data.message || `System ${update.action}`;
      default:
        return `${update.action} ${update.type}`;
    }
  };

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'work_order':
        return action === 'completed' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <FileCheck className="h-4 w-4 text-blue-600" />;
      case 'inspection':
        return action === 'completed' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <ClipboardList className="h-4 w-4 text-purple-600" />;
      case 'user':
        return action === 'login' ? 
          <User className="h-4 w-4 text-green-600" /> : 
          <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Activity className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string, action: string) => {
    if (action === 'completed') return 'border-l-green-500';
    if (action === 'deleted') return 'border-l-red-500';
    
    switch (type) {
      case 'work_order': return 'border-l-blue-500';
      case 'inspection': return 'border-l-purple-500';
      case 'user': return 'border-l-green-500';
      case 'system': return 'border-l-gray-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredActivities = activities.filter(activity => {
    return filter === 'all' || activity.type === filter;
  });

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {filteredActivities.slice(0, 10).map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type, activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>Real-time system activity and updates</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Live updates' : 'Disconnected'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {['all', 'work_order', 'inspection', 'user', 'system'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType as any)}
                className="text-xs"
              >
                {filterType === 'all' ? 'All' : 
                 filterType.split('_').map(word => 
                   word.charAt(0).toUpperCase() + word.slice(1)
                 ).join(' ')}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                <div className="space-y-3 pl-6">
                  {dateActivities.map((activity, index) => (
                    <div key={activity.id}>
                      <div className={`border-l-4 pl-4 pb-3 ${getActivityColor(activity.type, activity.action)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getActivityIcon(activity.type, activity.action)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{activity.user}</span>
                                <Badge variant="outline" className="text-xs">
                                  {activity.type.replace('_', ' ')}
                                </Badge>
                                <Badge 
                                  variant={activity.action === 'completed' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {activity.action}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {activity.description}
                              </p>
                              {activity.target && (
                                <p className="text-xs text-blue-600 font-medium mb-1">
                                  {activity.target}
                                </p>
                              )}
                              {activity.metadata && (
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  {activity.metadata.priority && (
                                    <span>Priority: {activity.metadata.priority}</span>
                                  )}
                                  {activity.metadata.department && (
                                    <span>• {activity.metadata.department}</span>
                                  )}
                                  {activity.metadata.assignee && (
                                    <span>• Assigned to: {activity.metadata.assignee}</span>
                                  )}
                                  {activity.metadata.score && (
                                    <span>• Score: {activity.metadata.score}%</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                      {index < dateActivities.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
