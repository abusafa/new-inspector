import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TouchCard, TouchStatsCard, TouchListItem, TouchButtonGroup } from '@/components/TouchComponents';
import { ActivityFeed } from '@/components/ActivityFeed';
import { RealTimeStatusBadge } from '@/components/RealTimeStatus';
import { useDashboardStats } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { WithPermission } from '@/components/auth/ProtectedRoute';
import { 
  FileCheck, 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw,
  ArrowRight,
  Zap
} from 'lucide-react';

export function MobileDashboard() {
  const { data: stats, loading, error, refetch } = useDashboardStats();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-muted rounded w-48 mb-2" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
          <RealTimeStatusBadge />
        </div>
        
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-6 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unable to fetch dashboard data. Please try again.
          </p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      label: 'New Work Order',
      icon: FileCheck,
      onClick: () => navigate('/work-orders'),
      variant: 'default' as const,
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      variant: 'outline' as const,
    },
    {
      label: 'Manage Users',
      icon: Users,
      onClick: () => navigate('/users'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold lg:text-2xl">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <RealTimeStatusBadge />
          </div>
          <p className="text-sm text-muted-foreground lg:text-base">
            {user?.role} Dashboard - Overview of inspections and work orders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? 'sm' : 'default'}
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <TouchStatsCard
          title="Total Work Orders"
          value={stats?.totalWorkOrders || 0}
          subtitle="All time"
          icon={FileCheck}
          color="blue"
          onClick={() => navigate('/work-orders')}
          trend={{ value: 12, isPositive: true }}
        />
        
        <TouchStatsCard
          title="Active Work Orders"
          value={stats?.activeWorkOrders || 0}
          subtitle="In progress"
          icon={Clock}
          color="yellow"
          onClick={() => navigate('/work-orders?status=active')}
          trend={{ value: 8, isPositive: true }}
        />
        
        <TouchStatsCard
          title="Completed Inspections"
          value={stats?.completedInspections || 0}
          subtitle="This month"
          icon={CheckCircle2}
          color="green"
          onClick={() => navigate('/inspections?status=completed')}
          trend={{ value: 15, isPositive: true }}
        />
        
        <TouchStatsCard
          title="Pending Inspections"
          value={stats?.pendingInspections || 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color="red"
          onClick={() => navigate('/inspections?status=pending')}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <TouchButtonGroup buttons={quickActions} />
        </CardContent>
      </Card>

      {/* Recent Activity & Navigation */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityFeed compact />
        </div>

        {/* Navigation Shortcuts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <TouchListItem
                  title="Work Orders"
                  subtitle={`${stats?.activeWorkOrders || 0} active`}
                  leftIcon={FileCheck}
                  onClick={() => navigate('/work-orders')}
                  rightContent={
                    <Badge variant="secondary">
                      {stats?.totalWorkOrders || 0}
                    </Badge>
                  }
                />
                
                <TouchListItem
                  title="Inspections"
                  subtitle={`${stats?.pendingInspections || 0} pending`}
                  leftIcon={ClipboardList}
                  onClick={() => navigate('/inspections')}
                  rightContent={
                    <Badge variant="outline">
                      {stats?.completedInspections || 0}
                    </Badge>
                  }
                />
                
                <WithPermission permission="users.view">
                  <TouchListItem
                    title="Users"
                    subtitle={`${stats?.totalUsers || 0} total users`}
                    leftIcon={Users}
                    onClick={() => navigate('/users')}
                  />
                </WithPermission>
                
                <WithPermission permission="analytics.view">
                  <TouchListItem
                    title="Analytics"
                    subtitle="View reports and insights"
                    leftIcon={BarChart3}
                    onClick={() => navigate('/analytics')}
                  />
                </WithPermission>
                
                <WithPermission permission="system.settings">
                  <TouchListItem
                    title="Settings"
                    subtitle="System configuration"
                    leftIcon={Settings}
                    onClick={() => navigate('/settings')}
                  />
                </WithPermission>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Templates</span>
                  <Badge variant="outline">{stats?.totalTemplates || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <Badge variant="outline">{stats?.totalUsers || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">System Health</span>
                  <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Work Orders */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/analytics')}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="space-y-1 p-4 pt-0">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <TouchListItem
                    key={activity.id}
                    title={activity.title}
                    subtitle={activity.description}
                    leftIcon={
                      activity.type === 'work_order_created' ? FileCheck :
                      activity.type === 'inspection_completed' ? CheckCircle2 :
                      activity.type === 'user_registered' ? Users :
                      Activity
                    }
                    rightContent={
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    }
                    showChevron={false}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
