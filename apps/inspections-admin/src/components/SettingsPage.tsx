import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { 
  Settings,
  Database,
  Bell,
  Shield,
  Mail,
  Globe,
  Smartphone,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Save,
  Download,
  Upload,
  Trash2,
  Info
} from 'lucide-react';

interface SystemHealth {
  database: 'healthy' | 'degraded' | 'error';
  api: 'healthy' | 'degraded' | 'error';
  storage: number; // percentage used
  uptime: string;
}

function getHealthColor(status: string) {
  switch (status) {
    case 'healthy':
      return 'text-green-600';
    case 'degraded':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function getHealthIcon(status: string) {
  switch (status) {
    case 'healthy':
      return CheckCircle2;
    case 'degraded':
      return AlertTriangle;
    case 'error':
      return AlertTriangle;
    default:
      return Info;
  }
}

export function SettingsPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 45,
    uptime: '7 days, 14 hours',
  });
  const [loading, setLoading] = useState(false);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      const health = await api.health();
      setSystemHealth(prev => ({
        ...prev,
        database: health.status === 'ok' ? 'healthy' : 'degraded',
        api: 'healthy',
      }));
    } catch (error) {
      setSystemHealth(prev => ({
        ...prev,
        database: 'error',
        api: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            System configuration and administration
          </p>
        </div>
        <Button onClick={checkSystemHealth} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Check Health
        </Button>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Current system status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                systemHealth.database === 'healthy' ? 'bg-green-100' : 
                systemHealth.database === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {(() => {
                  const Icon = getHealthIcon(systemHealth.database);
                  return <Icon className={`h-4 w-4 ${getHealthColor(systemHealth.database)}`} />;
                })()}
              </div>
              <div>
                <p className="font-medium">Database</p>
                <p className={`text-sm capitalize ${getHealthColor(systemHealth.database)}`}>
                  {systemHealth.database}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                systemHealth.api === 'healthy' ? 'bg-green-100' : 
                systemHealth.api === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {(() => {
                  const Icon = getHealthIcon(systemHealth.api);
                  return <Icon className={`h-4 w-4 ${getHealthColor(systemHealth.api)}`} />;
                })()}
              </div>
              <div>
                <p className="font-medium">API</p>
                <p className={`text-sm capitalize ${getHealthColor(systemHealth.api)}`}>
                  {systemHealth.api}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <HardDrive className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Storage</p>
                <p className="text-sm text-muted-foreground">
                  {systemHealth.storage}% used
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Uptime</p>
                <p className="text-sm text-muted-foreground">
                  {systemHealth.uptime}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Name</label>
              <Input defaultValue="SafetyCheck Admin" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <Input defaultValue="Safety & Compliance Department" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Zone</label>
              <Input defaultValue="America/New_York" />
            </div>
            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">System alerts via email</p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Real-time browser alerts</p>
              </div>
              <Badge variant="secondary">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Alerts</p>
                <p className="text-sm text-muted-foreground">Critical system alerts</p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Notifications
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              User authentication and access control
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Enhanced security for admin accounts</p>
              </div>
              <Badge variant="default">Required</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Badge variant="secondary">30 minutes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password Policy</p>
                <p className="text-sm text-muted-foreground">Minimum requirements</p>
              </div>
              <Badge variant="default">Strong</Badge>
            </div>
            <Button className="w-full" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Manage Security
            </Button>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              External system connections and APIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Service</p>
                <p className="text-sm text-muted-foreground">SMTP configuration</p>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mobile App Sync</p>
                <p className="text-sm text-muted-foreground">Real-time data synchronization</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Service</p>
                <p className="text-sm text-muted-foreground">Automated data backups</p>
              </div>
              <Badge variant="default">Daily</Badge>
            </div>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Integrations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Backup, restore, and data maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Backup & Restore</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Create and manage system backups
              </p>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Data Export</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export system data for analysis
              </p>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Work Orders
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Maintenance</h4>
              <p className="text-sm text-muted-foreground mb-3">
                System cleanup and optimization
              </p>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                <Button className="w-full" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Version details and system specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Application Version</p>
              <p className="font-medium">v2.1.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Database Version</p>
              <p className="font-medium">PostgreSQL 15.2</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Node.js Version</p>
              <p className="font-medium">v18.17.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Environment</p>
              <Badge variant="secondary">Production</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
