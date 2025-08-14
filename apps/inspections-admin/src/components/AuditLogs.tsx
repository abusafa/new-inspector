import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  FileCheck,
  Settings,
  Trash2,
  Edit,
  Plus,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Database,
  Lock,
  Unlock
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'workorder' | 'inspection' | 'template' | 'system' | 'data';
  success: boolean;
  duration?: number; // in milliseconds
}

interface AuditStats {
  totalEntries: number;
  todayEntries: number;
  failedActions: number;
  uniqueUsers: number;
  criticalEvents: number;
  averageSessionDuration: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ user: string; count: number }>;
}

export function AuditLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: 'user_001',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          userRole: 'Safety Manager',
          action: 'inspection.approve',
          resource: 'inspection',
          resourceId: 'insp_001',
          details: 'Approved inspection "Daily Equipment Safety Check" with score 85/100',
          metadata: {
            inspectionId: 'insp_001',
            score: 85,
            maxScore: 100,
            previousStatus: 'pending-review',
            newStatus: 'approved'
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_abc123',
          severity: 'medium',
          category: 'inspection',
          success: true,
          duration: 2500
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          userId: 'user_002',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com',
          userRole: 'Inspector',
          action: 'inspection.complete',
          resource: 'inspection',
          resourceId: 'insp_002',
          details: 'Completed inspection "Fire Safety Check" with 3 findings',
          metadata: {
            inspectionId: 'insp_002',
            findings: 3,
            duration: 45,
            photos: 8
          },
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          sessionId: 'sess_def456',
          severity: 'low',
          category: 'inspection',
          success: true,
          duration: 1800
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          userId: 'user_003',
          userName: 'Mike Wilson',
          userEmail: 'mike.wilson@company.com',
          userRole: 'Inspector',
          action: 'auth.login_failed',
          resource: 'authentication',
          details: 'Failed login attempt - invalid credentials',
          metadata: {
            reason: 'invalid_credentials',
            attempts: 3
          },
          ipAddress: '192.168.1.110',
          userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
          sessionId: 'sess_ghi789',
          severity: 'high',
          category: 'auth',
          success: false,
          duration: 500
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          userId: 'user_001',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          userRole: 'Safety Manager',
          action: 'template.create',
          resource: 'template',
          resourceId: 'template_new_001',
          details: 'Created new inspection template "Monthly HVAC Check"',
          metadata: {
            templateName: 'Monthly HVAC Check',
            category: 'maintenance',
            questions: 15,
            sections: 3
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_abc123',
          severity: 'medium',
          category: 'template',
          success: true,
          duration: 12000
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          userId: 'system',
          userName: 'System',
          userEmail: 'system@company.com',
          userRole: 'System',
          action: 'system.backup',
          resource: 'database',
          details: 'Automated database backup completed successfully',
          metadata: {
            backupSize: '2.3GB',
            duration: '8 minutes',
            tables: 12,
            records: 45678
          },
          ipAddress: '127.0.0.1',
          userAgent: 'System/1.0',
          sessionId: 'system_backup',
          severity: 'low',
          category: 'system',
          success: true,
          duration: 480000
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          userId: 'user_004',
          userName: 'Lisa Davis',
          userEmail: 'lisa.davis@company.com',
          userRole: 'Admin',
          action: 'user.role_change',
          resource: 'user',
          resourceId: 'user_005',
          details: 'Changed user role from Inspector to Supervisor',
          metadata: {
            targetUser: 'David Brown',
            previousRole: 'Inspector',
            newRole: 'Supervisor',
            reason: 'promotion'
          },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          sessionId: 'sess_jkl012',
          severity: 'high',
          category: 'user',
          success: true,
          duration: 3500
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: 'user_006',
          userName: 'Unknown User',
          userEmail: 'unknown@external.com',
          userRole: 'Unknown',
          action: 'auth.unauthorized_access',
          resource: 'system',
          details: 'Attempted to access admin panel without proper permissions',
          metadata: {
            requestedPath: '/admin/users',
            requiredPermission: 'users.view',
            userPermissions: ['inspections.perform']
          },
          ipAddress: '203.0.113.42',
          userAgent: 'curl/7.68.0',
          sessionId: 'sess_unauthorized',
          severity: 'critical',
          category: 'auth',
          success: false,
          duration: 100
        }
      ];

      const mockStats: AuditStats = {
        totalEntries: mockLogs.length,
        todayEntries: mockLogs.filter(log => 
          new Date(log.timestamp).toDateString() === new Date().toDateString()
        ).length,
        failedActions: mockLogs.filter(log => !log.success).length,
        uniqueUsers: new Set(mockLogs.map(log => log.userId)).size,
        criticalEvents: mockLogs.filter(log => log.severity === 'critical').length,
        averageSessionDuration: 2500,
        topActions: [
          { action: 'inspection.complete', count: 15 },
          { action: 'inspection.approve', count: 8 },
          { action: 'auth.login', count: 25 },
          { action: 'template.create', count: 3 }
        ],
        topUsers: [
          { user: 'John Smith', count: 45 },
          { user: 'Sarah Johnson', count: 32 },
          { user: 'Mike Wilson', count: 28 }
        ]
      };

      setLogs(mockLogs);
      setStats(mockStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === 'all' || log.userId === userFilter;
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && log.success) ||
      (statusFilter === 'failed' && !log.success);
    
    const logDate = new Date(log.timestamp);
    const matchesDateRange = (!dateRange.from || logDate >= startOfDay(dateRange.from)) &&
                            (!dateRange.to || logDate <= endOfDay(dateRange.to));
    
    return matchesSearch && matchesUser && matchesAction && matchesCategory && 
           matchesSeverity && matchesStatus && matchesDateRange;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setUserFilter('all');
    setActionFilter('all');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date()
    });
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        'Timestamp,User,Action,Resource,Status,Severity,Details,IP Address',
        ...filteredLogs.map(log => [
          log.timestamp,
          log.userName,
          log.action,
          log.resource,
          log.success ? 'Success' : 'Failed',
          log.severity,
          `"${log.details.replace(/"/g, '""')}"`,
          log.ipAddress
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${filteredLogs.length} audit log entries`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export audit logs",
        variant: "destructive",
      });
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <User className="h-4 w-4" />;
    if (action.includes('create')) return <Plus className="h-4 w-4" />;
    if (action.includes('edit') || action.includes('update')) return <Edit className="h-4 w-4" />;
    if (action.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (action.includes('approve')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('view')) return <Eye className="h-4 w-4" />;
    if (action.includes('backup')) return <Database className="h-4 w-4" />;
    if (action.includes('unauthorized')) return <Lock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'workorder': return 'bg-green-100 text-green-800';
      case 'inspection': return 'bg-cyan-100 text-cyan-800';
      case 'template': return 'bg-pink-100 text-pink-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'data': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Complete system activity log for compliance and security monitoring
          </p>
        </div>
        <Button onClick={exportLogs} disabled={filteredLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.todayEntries}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failedActions}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.criticalEvents}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{formatDuration(stats.averageSessionDuration)}</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="user">User Management</SelectItem>
                <SelectItem value="workorder">Work Orders</SelectItem>
                <SelectItem value="inspection">Inspections</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
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
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div>
              <Label className="text-sm">Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "MMM d") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "MMM d") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div></div>
            
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Logs ({filteredLogs.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Shield className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Audit Logs Found</h3>
                <p className="text-muted-foreground">
                  No logs match your current filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <Card key={log.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                          <Badge className={getCategoryColor(log.category)}>
                            {log.category}
                          </Badge>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          {log.success ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.details}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </div>
                          <span>IP: {log.ipAddress}</span>
                          <span>Duration: {formatDuration(log.duration)}</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-auto p-0 text-xs"
                                onClick={() => setSelectedLog(log)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <LogDetailDialog log={selectedLog} />
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Actions</CardTitle>
                    <CardDescription>Most frequent actions in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topActions.map((item, index) => (
                        <div key={item.action} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            {getActionIcon(item.action)}
                            <span className="text-sm">{item.action}</span>
                          </div>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Users</CardTitle>
                    <CardDescription>Users with the most audit log entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topUsers.map((item, index) => (
                        <div key={item.user} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <User className="h-4 w-4" />
                            <span className="text-sm">{item.user}</span>
                          </div>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Security Summary</CardTitle>
                  <CardDescription>Security-related events and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {logs.filter(l => l.category === 'auth' && !l.success).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed Logins</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {logs.filter(l => l.action.includes('unauthorized')).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Unauthorized Access</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {logs.filter(l => l.severity === 'critical').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical Events</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Log Detail Dialog Component
function LogDetailDialog({ log }: { log: AuditLogEntry | null }) {
  if (!log) return null;

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogDescription>
          Detailed information about this audit log entry
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Timestamp</Label>
            <p className="text-sm">{format(new Date(log.timestamp), 'PPpp')}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Duration</Label>
            <p className="text-sm">{formatDuration(log.duration)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">User</Label>
            <p className="text-sm">{log.userName} ({log.userRole})</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm">{log.userEmail}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Action</Label>
            <p className="text-sm">{log.action}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Resource</Label>
            <p className="text-sm">{log.resource} {log.resourceId && `(${log.resourceId})`}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex items-center gap-2">
              {log.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{log.success ? 'Success' : 'Failed'}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Severity</Label>
            <Badge className={getSeverityColor(log.severity)}>
              {log.severity}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div>
          <Label className="text-sm font-medium">Details</Label>
          <p className="text-sm bg-muted p-3 rounded mt-2">{log.details}</p>
        </div>

        {/* Technical Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">IP Address</Label>
            <p className="text-sm font-mono">{log.ipAddress}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Session ID</Label>
            <p className="text-sm font-mono">{log.sessionId}</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">User Agent</Label>
          <p className="text-sm font-mono text-wrap break-all bg-muted p-2 rounded">
            {log.userAgent}
          </p>
        </div>

        {/* Metadata */}
        {Object.keys(log.metadata).length > 0 && (
          <div>
            <Label className="text-sm font-medium">Metadata</Label>
            <pre className="text-sm bg-muted p-3 rounded mt-2 overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function formatDuration(duration?: number) {
  if (!duration) return 'N/A';
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
  return `${(duration / 60000).toFixed(1)}m`;
}
