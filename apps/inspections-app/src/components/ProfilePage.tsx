import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Shield, 
  Bell, 
  Smartphone, 
  Moon, 
  Sun, 
  Globe, 
  Download, 
  Upload,
  Key,
  Clock,
  CheckCircle2,
  Settings,
  Save,
  Camera,
  Edit3,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Theme context for managing app theme
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('safetycheck_theme');
    return saved || 'system';
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: 'john.smith@company.com',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'Inspector',
    department: 'Safety & Compliance',
    location: 'Warehouse District',
    employeeId: 'EMP-001',
    supervisor: 'Sarah Johnson'
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      workOrderUpdates: true,
      inspectionReminders: true,
      systemAlerts: true
    },
    preferences: {
      theme: currentTheme,
      language: localStorage.getItem('safetycheck_language') || 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      autoSave: true,
      offlineMode: true
    },
    privacy: {
      shareLocation: true,
      shareActivity: false,
      allowAnalytics: true
    }
  });

  // Apply theme changes
  React.useEffect(() => {
    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme(currentTheme);
    localStorage.setItem('safetycheck_theme', currentTheme);
  }, [currentTheme]);

  // Apply language and RTL changes
  React.useEffect(() => {
    const language = settings.preferences.language;
    const isRTL = language === 'ar';
    
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRTL);
    
    localStorage.setItem('safetycheck_language', language);
  }, [settings.preferences.language]);

  // Auto-save functionality
  React.useEffect(() => {
    if (settings.preferences.autoSave) {
      const autoSaveInterval = setInterval(() => {
        // Simulate auto-save
        console.log('Auto-saving form data...');
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [settings.preferences.autoSave]);

  // Offline mode functionality
  React.useEffect(() => {
    if (settings.preferences.offlineMode) {
      // Service worker registration disabled in StackBlitz environment
      // Register service worker for offline functionality
      // if ('serviceWorker' in navigator) {
      //   navigator.serviceWorker.register('/sw.js').catch(console.error);
      // }
    }
  }, [settings.preferences.offlineMode]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLoginTime = (loginTime: string) => {
    return new Date(loginTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (category: string, setting: string, value: any) => {
    // Handle theme changes
    if (category === 'preferences' && setting === 'theme') {
      setCurrentTheme(value);
    }

    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    
    // Apply changes immediately
    if (category === 'preferences') {
      if (setting === 'language') {
        const isRTL = value === 'ar';
        document.documentElement.lang = value;
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', isRTL);
        localStorage.setItem('safetycheck_language', value);
      }
      
      if (setting === 'dateFormat') {
        localStorage.setItem('safetycheck_dateFormat', value);
      }
      
      if (setting === 'timezone') {
        localStorage.setItem('safetycheck_timezone', value);
      }
    }

    toast({
      title: "Setting Updated",
      description: `${setting} has been updated.`,
    });
  };

  const handleExportData = () => {
    const exportData = {
      profile: profileData,
      settings: settings,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `profile_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl px-3">
      {/* Header (compact for mobile) */}
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 h-9 px-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight truncate">Profile & Settings</h1>
          <p className="text-muted-foreground text-xs">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 text-xs">
          <TabsTrigger value="profile" className="flex items-center gap-1 py-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 py-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1 py-2">
            <Settings className="h-4 w-4" />
            Prefs
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 py-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                  disabled={isSaving}
                  className="flex items-center gap-2 h-9 px-3"
                >
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-blue-600 text-white text-xl">
                        {getInitials(profileData.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold leading-tight">{profileData.name}</h3>
                    <p className="text-muted-foreground text-sm">{profileData.role}</p>
                    <Badge variant="outline" className="mt-1">
                      {profileData.employeeId}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phoneNumber}
                        disabled={true}
                        className="bg-muted h-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="role"
                        value={profileData.role}
                        disabled={true}
                        className="bg-muted h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                        disabled={!isEditing}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Account Verified</div>
                    <div className="text-sm text-muted-foreground">Phone number verified</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Last Login</div>
                    <div className="text-sm text-muted-foreground">{formatLoginTime(user.loginTime)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about updates and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">General Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications on your device</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">SMS Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via text message</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Work Order Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Work Order Updates</div>
                      <div className="text-sm text-muted-foreground">New assignments and status changes</div>
                    </div>
                    <Switch
                      checked={settings.notifications.workOrderUpdates}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'workOrderUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Inspection Reminders</div>
                      <div className="text-sm text-muted-foreground">Reminders for upcoming inspections</div>
                    </div>
                    <Switch
                      checked={settings.notifications.inspectionReminders}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'inspectionReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">System Alerts</div>
                      <div className="text-sm text-muted-foreground">Important system updates and maintenance</div>
                    </div>
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'systemAlerts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => handleSettingChange('preferences', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          English
                        </div>
                      </SelectItem>
                      <SelectItem value="ar">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          العربية (Arabic)
                        </div>
                      </SelectItem>
                      <SelectItem value="es">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Español
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Français
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => handleSettingChange('preferences', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="Europe/London">London Time (UTC+0)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris Time (UTC+1)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai Time (UTC+4)</SelectItem>
                      <SelectItem value="Asia/Riyadh">Riyadh Time (UTC+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => handleSettingChange('preferences', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">App Behavior</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-save</div>
                      <div className="text-sm text-muted-foreground">Automatically save form progress</div>
                    </div>
                    <Switch
                      checked={settings.preferences.autoSave}
                      onCheckedChange={(checked) => handleSettingChange('preferences', 'autoSave', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Offline Mode</div>
                      <div className="text-sm text-muted-foreground">Allow app to work without internet</div>
                    </div>
                    <Switch
                      checked={settings.preferences.offlineMode}
                      onCheckedChange={(checked) => handleSettingChange('preferences', 'offlineMode', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>Manage your account security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Account Security</h4>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your account is secured with SMS-based two-factor authentication.
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Change Phone Number</div>
                      <div className="text-sm text-muted-foreground">Update your login phone number</div>
                    </div>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Privacy Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Share Location</div>
                      <div className="text-sm text-muted-foreground">Allow location sharing for work orders</div>
                    </div>
                    <Switch
                      checked={settings.privacy.shareLocation}
                      onCheckedChange={(checked) => handleSettingChange('privacy', 'shareLocation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Share Activity</div>
                      <div className="text-sm text-muted-foreground">Share inspection activity with team</div>
                    </div>
                    <Switch
                      checked={settings.privacy.shareActivity}
                      onCheckedChange={(checked) => handleSettingChange('privacy', 'shareActivity', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-muted-foreground">Help improve the app with usage data</div>
                    </div>
                    <Switch
                      checked={settings.privacy.allowAnalytics}
                      onCheckedChange={(checked) => handleSettingChange('privacy', 'allowAnalytics', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export My Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Session Management</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-sm text-muted-foreground">Sign out of your account on this device</div>
                  </div>
                  <Button variant="outline" onClick={logout} className="h-9 px-3">
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-16" />
    </div>
  );
}