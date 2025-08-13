import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Save, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Mail,
  Shield,
  Database,
  Clock,
  Palette
} from 'lucide-react';

interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'system';
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowSelfRegistration: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    backupLocation: string;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowedIPs: string[];
  };
}

export function SystemConfigCard() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const defaultConfig: SystemConfig = {
    general: {
      siteName: 'SafetyInspect Admin',
      siteDescription: 'Comprehensive safety inspection management system',
      adminEmail: 'admin@company.com',
      timezone: 'America/New_York',
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      theme: 'system'
    },
    security: {
      sessionTimeout: 480, // 8 hours in minutes
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowSelfRegistration: false,
      ipWhitelist: []
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      smtpServer: 'smtp.company.com',
      smtpPort: 587,
      smtpUsername: 'noreply@company.com',
      smtpPassword: ''
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      backupLocation: '/backups'
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'System is currently under maintenance. Please check back later.',
      allowedIPs: ['127.0.0.1']
    }
  };

  useEffect(() => {
    // Simulate loading config from API
    const loadConfig = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, this would be an API call
        const savedConfig = localStorage.getItem('systemConfig');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        } else {
          setConfig(defaultConfig);
        }
      } catch (error) {
        console.error('Failed to load config:', error);
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would be an API call
      localStorage.setItem('systemConfig', JSON.stringify(config));
      
      toast({
        title: "Settings saved",
        description: "System configuration has been updated successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setHasChanges(true);
    toast({
      title: "Settings reset",
      description: "Configuration has been reset to defaults.",
    });
  };

  if (loading || !config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>System Configuration</CardTitle>
          </div>
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
        <CardDescription>
          Configure system settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Site Name
                </label>
                <Input
                  value={config.general.siteName}
                  onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                  placeholder="Enter site name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site Description</label>
                <Textarea
                  value={config.general.siteDescription}
                  onChange={(e) => updateConfig('general', 'siteDescription', e.target.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    value={config.general.adminEmail}
                    onChange={(e) => updateConfig('general', 'adminEmail', e.target.value)}
                    placeholder="admin@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </label>
                  <Select
                    value={config.general.timezone}
                    onValueChange={(value) => updateConfig('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={config.general.language}
                    onValueChange={(value) => updateConfig('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select
                    value={config.general.dateFormat}
                    onValueChange={(value) => updateConfig('general', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </label>
                  <Select
                    value={config.general.theme}
                    onValueChange={(value) => updateConfig('general', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value) || 480)}
                    min="15"
                    max="1440"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Login Attempts</label>
                  <Input
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                    min="3"
                    max="10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Password Length</label>
                  <Input
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value) || 8)}
                    min="6"
                    max="32"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Require Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Force all users to enable 2FA</div>
                  </div>
                  <Switch
                    checked={config.security.requireTwoFactor}
                    onCheckedChange={(checked) => updateConfig('security', 'requireTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Allow Self Registration</div>
                    <div className="text-sm text-muted-foreground">Allow users to create their own accounts</div>
                  </div>
                  <Switch
                    checked={config.security.allowSelfRegistration}
                    onCheckedChange={(checked) => updateConfig('security', 'allowSelfRegistration', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Send notifications via email</div>
                </div>
                <Switch
                  checked={config.notifications.emailEnabled}
                  onCheckedChange={(checked) => updateConfig('notifications', 'emailEnabled', checked)}
                />
              </div>

              {config.notifications.emailEnabled && (
                <div className="grid gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SMTP Server</label>
                      <Input
                        value={config.notifications.smtpServer}
                        onChange={(e) => updateConfig('notifications', 'smtpServer', e.target.value)}
                        placeholder="smtp.company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">SMTP Port</label>
                      <Input
                        type="number"
                        value={config.notifications.smtpPort}
                        onChange={(e) => updateConfig('notifications', 'smtpPort', parseInt(e.target.value) || 587)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={config.notifications.smtpUsername}
                        onChange={(e) => updateConfig('notifications', 'smtpUsername', e.target.value)}
                        placeholder="noreply@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={config.notifications.smtpPassword}
                        onChange={(e) => updateConfig('notifications', 'smtpPassword', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Send browser push notifications</div>
                </div>
                <Switch
                  checked={config.notifications.pushEnabled}
                  onCheckedChange={(checked) => updateConfig('notifications', 'pushEnabled', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Automatic Backups</div>
                  <div className="text-sm text-muted-foreground">Automatically backup system data</div>
                </div>
                <Switch
                  checked={config.backup.autoBackup}
                  onCheckedChange={(checked) => updateConfig('backup', 'autoBackup', checked)}
                />
              </div>

              {config.backup.autoBackup && (
                <div className="grid gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Backup Frequency</label>
                      <Select
                        value={config.backup.backupFrequency}
                        onValueChange={(value) => updateConfig('backup', 'backupFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Retention Days</label>
                      <Input
                        type="number"
                        value={config.backup.retentionDays}
                        onChange={(e) => updateConfig('backup', 'retentionDays', parseInt(e.target.value) || 30)}
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Backup Location</label>
                    <Input
                      value={config.backup.backupLocation}
                      onChange={(e) => updateConfig('backup', 'backupLocation', e.target.value)}
                      placeholder="/backups"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    Maintenance Mode
                    {config.maintenance.maintenanceMode && (
                      <Badge variant="destructive">Active</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Put the system in maintenance mode</div>
                </div>
                <Switch
                  checked={config.maintenance.maintenanceMode}
                  onCheckedChange={(checked) => updateConfig('maintenance', 'maintenanceMode', checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Message</label>
                <Textarea
                  value={config.maintenance.maintenanceMessage}
                  onChange={(e) => updateConfig('maintenance', 'maintenanceMessage', e.target.value)}
                  placeholder="Enter maintenance message"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                You have unsaved changes
              </div>
            )}
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
