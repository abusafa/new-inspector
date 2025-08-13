import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';

interface SystemMetrics {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  version: string;
  lastUpdated: string;
  services: {
    api: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
    notifications: 'online' | 'offline' | 'degraded';
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  stats: {
    activeUsers: number;
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

export function SystemHealthCard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      // Simulate API call - in a real app, this would fetch from your monitoring service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: SystemMetrics = {
        status: 'healthy',
        uptime: '15 days, 8 hours',
        version: 'v2.1.4',
        lastUpdated: new Date().toISOString(),
        services: {
          api: 'online',
          database: 'online',
          storage: 'online',
          notifications: 'degraded'
        },
        performance: {
          cpu: 45,
          memory: 62,
          disk: 78,
          network: 23
        },
        stats: {
          activeUsers: 24,
          totalRequests: 15420,
          errorRate: 0.02,
          avgResponseTime: 245
        }
      };

      setMetrics(mockMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      toast({
        title: "Failed to fetch system health",
        description: "Unable to retrieve system metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-red-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading && !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>System Health</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(metrics.status)}>
              {getStatusIcon(metrics.status)}
              <span className="ml-1 capitalize">{metrics.status}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSystemHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Version</div>
            <div className="font-semibold">{metrics.version}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Uptime</div>
            <div className="font-semibold">{metrics.uptime}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Active Users</div>
            <div className="font-semibold">{metrics.stats.activeUsers}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Error Rate</div>
            <div className="font-semibold">{(metrics.stats.errorRate * 100).toFixed(2)}%</div>
          </div>
        </div>

        <Separator />

        {/* Services Status */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Server className="h-4 w-4" />
            Services
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(metrics.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm capitalize">{service}</span>
                <Badge className={`text-xs ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status}</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Performance
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">CPU Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics.performance.cpu} className="w-20" />
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.performance.cpu)}`}>
                  {metrics.performance.cpu}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics.performance.memory} className="w-20" />
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.performance.memory)}`}>
                  {metrics.performance.memory}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Disk Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics.performance.disk} className="w-20" />
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.performance.disk)}`}>
                  {metrics.performance.disk}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Network Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics.performance.network} className="w-20" />
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.performance.network)}`}>
                  {metrics.performance.network}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{metrics.stats.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{metrics.stats.avgResponseTime}ms</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
