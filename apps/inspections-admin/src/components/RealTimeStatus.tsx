import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useRealTime } from '@/contexts/RealTimeContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Users, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  activeUsers: number;
  totalSessions: number;
  avgResponseTime: number;
  systemLoad: number;
  uptime: string;
  lastUpdate: string;
}

export function RealTimeStatus() {
  const { isConnected, notifications, subscribe } = useRealTime();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 12,
    totalSessions: 847,
    avgResponseTime: 145,
    systemLoad: 23,
    uptime: '99.9%',
    lastUpdate: new Date().toISOString()
  });
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: string;
    status: 'connected' | 'disconnected';
  }>>([]);

  useEffect(() => {
    // Track connection status changes
    const newStatus = {
      timestamp: new Date().toISOString(),
      status: isConnected ? 'connected' as const : 'disconnected' as const
    };
    
    setConnectionHistory(prev => [newStatus, ...prev.slice(0, 9)]); // Keep last 10 status changes
    
    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        avgResponseTime: Math.max(50, prev.avgResponseTime + Math.floor(Math.random() * 20) - 10),
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.floor(Math.random() * 10) - 5)),
        lastUpdate: new Date().toISOString()
      }));
    }, 5000);

    return () => clearInterval(metricsInterval);
  }, [isConnected]);

  const getConnectionQuality = () => {
    if (!isConnected) return { label: 'Disconnected', color: 'bg-red-500', textColor: 'text-red-600' };
    if (metrics.avgResponseTime < 100) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-600' };
    if (metrics.avgResponseTime < 200) return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { label: 'Poor', color: 'bg-red-500', textColor: 'text-red-600' };
  };

  const connectionQuality = getConnectionQuality();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <div className={`w-2 h-2 rounded-full ${connectionQuality.color} animate-pulse`} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          System Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-4 space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Connection</span>
            </div>
            <Badge 
              className={`${connectionQuality.color} text-white`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* Connection Quality */}
          {isConnected && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quality</span>
              <Badge variant="outline" className={connectionQuality.textColor}>
                {connectionQuality.label}
              </Badge>
            </div>
          )}

          {/* System Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Active Users</span>
              </div>
              <span className="text-xs font-medium">{metrics.activeUsers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Response Time</span>
              </div>
              <span className="text-xs font-medium">{metrics.avgResponseTime}ms</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">System Load</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{metrics.systemLoad}%</span>
                <div className="w-12 h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      metrics.systemLoad > 80 ? 'bg-red-500' :
                      metrics.systemLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.systemLoad}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Uptime</span>
              </div>
              <span className="text-xs font-medium">{metrics.uptime}</span>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Recent Activity</h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="text-xs p-2 bg-muted/50 rounded">
                  <div className="font-medium truncate">{notification.title}</div>
                  <div className="text-muted-foreground truncate">{notification.message}</div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Connection History */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Connection History</h4>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {connectionHistory.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      entry.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="capitalize">{entry.status}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for dashboard widgets
export function RealTimeStatusBadge() {
  const { isConnected } = useRealTime();
  
  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {isConnected ? 'Live' : 'Offline'}
    </Badge>
  );
}

// Simple indicator for headers
export function RealTimeIndicator() {
  const { isConnected } = useRealTime();
  
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
      <span className="text-xs text-muted-foreground">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
