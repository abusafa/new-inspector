import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemHealthCard } from '@/components/settings/SystemHealthCard';
import { SystemConfigCard } from '@/components/settings/SystemConfigCard';
import { DataManagementCard } from '@/components/settings/DataManagementCard';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Bell, 
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  User,
  Palette,
  Globe,
  Mail,
  HardDrive,
  Clock,
  Key
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user: 'Emily Davis',
      action: 'LOGIN',
      resource: 'Authentication',
      details: 'Successful login',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      user: 'Admin User',
      action: 'UPDATE',
      resource: 'User',
      details: 'Updated user role for John Inspector',
      ipAddress: '192.168.1.101',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      user: 'Emily Davis',
      action: 'CREATE',
      resource: 'WorkOrder',
      details: 'Created work order WO-2024-001',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      user: 'John Inspector',
      action: 'COMPLETE',
      resource: 'Inspection',
      details: 'Completed inspection INS-2024-045',
      ipAddress: '192.168.1.102',
      userAgent: 'Mobile Safari 17.0'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      user: 'Admin User',
      action: 'DELETE',
      resource: 'Template',
      details: 'Deleted template TPL-OLD-001',
      ipAddress: '192.168.1.101',
      userAgent: 'Chrome 120.0.0.0'
    }
  ];

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'COMPLETE':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'CREATE':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'UPDATE':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'DELETE':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Key className="h-3 w-3" />;
      case 'CREATE':
        return <CheckCircle className="h-3 w-3" />;
      case 'UPDATE':
        return <RefreshCw className="h-3 w-3" />;
      case 'DELETE':
        return <AlertTriangle className="h-3 w-3" />;
      case 'COMPLETE':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Settings & Administration
          </h1>
          <p className="text-muted-foreground">
            System configuration, monitoring, and administrative tools
          </p>
        </div>
        {user && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {user.role}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SystemHealthCard />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Quick Settings
                </CardTitle>
                <CardDescription>
                  Commonly accessed system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('system')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Configuration
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('database')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Data Management
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('logs')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6 mt-6">
          <SystemConfigCard />
        </TabsContent>

        <TabsContent value="database" className="space-y-6 mt-6">
          <DataManagementCard />
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Access Control
              </CardTitle>
              <CardDescription>
                Configure security settings and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Password Policy</div>
                      <div className="text-sm text-muted-foreground">Configure password requirements</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Manage 2FA settings</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">IP Whitelist</div>
                      <div className="text-sm text-muted-foreground">Manage allowed IP addresses</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Session Management</div>
                      <div className="text-sm text-muted-foreground">Configure session timeouts</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Settings</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Security Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">SSL Enabled</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Firewall Active</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">2FA Optional</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Audit Enabled</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6 mt-6">
          {user && <UserProfile variant="card" showFullProfile={true} />}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Audit Logs</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAuditLogs}
                  disabled={loadingLogs}
                >
                  <RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardDescription>
                System activity and user action logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge className={`text-xs ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          <span className="ml-1">{log.action}</span>
                        </Badge>
                        <div>
                          <div className="font-medium">{log.user}</div>
                          <div className="text-sm text-muted-foreground">
                            {log.action.toLowerCase()} {log.resource.toLowerCase()} • {log.details}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-xs">{log.ipAddress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Logs Available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click refresh to load recent audit logs.
                  </p>
                  <Button onClick={loadAuditLogs}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Logs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}