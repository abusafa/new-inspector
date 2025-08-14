import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Settings, 
  Mail, 
  Smartphone, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Calendar,
  FileCheck,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Filter,
  Search,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  event: string;
  conditions: NotificationCondition[];
  recipients: NotificationRecipient[];
  channels: NotificationChannel[];
  template: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  createdAt: string;
  createdBy: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: string | number;
}

interface NotificationRecipient {
  type: 'user' | 'role' | 'email';
  value: string;
  label: string;
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in_app';
  enabled: boolean;
  config?: Record<string, any>;
}

interface NotificationHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  event: string;
  recipients: string[];
  channels: string[];
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  metadata: Record<string, any>;
  errorMessage?: string;
}

const AVAILABLE_EVENTS = [
  {
    category: 'Inspections',
    events: [
      { id: 'inspection.completed', name: 'Inspection Completed', description: 'When an inspection is marked as completed' },
      { id: 'inspection.failed', name: 'Inspection Failed', description: 'When an inspection fails or has critical findings' },
      { id: 'inspection.overdue', name: 'Inspection Overdue', description: 'When an inspection passes its due date' },
      { id: 'inspection.approved', name: 'Inspection Approved', description: 'When a manager approves an inspection' },
      { id: 'inspection.rejected', name: 'Inspection Rejected', description: 'When a manager rejects an inspection' }
    ]
  },
  {
    category: 'Work Orders',
    events: [
      { id: 'workorder.created', name: 'Work Order Created', description: 'When a new work order is created' },
      { id: 'workorder.assigned', name: 'Work Order Assigned', description: 'When a work order is assigned to someone' },
      { id: 'workorder.due_soon', name: 'Work Order Due Soon', description: 'When a work order is due within 24 hours' },
      { id: 'workorder.completed', name: 'Work Order Completed', description: 'When all inspections in a work order are completed' }
    ]
  },
  {
    category: 'System',
    events: [
      { id: 'user.login_failed', name: 'Failed Login Attempt', description: 'When someone fails to log in multiple times' },
      { id: 'system.backup_failed', name: 'Backup Failed', description: 'When a system backup fails' },
      { id: 'system.maintenance', name: 'Maintenance Window', description: 'When system maintenance is scheduled' }
    ]
  }
];

export function NotificationCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState<Partial<NotificationRule>>({
    name: '',
    description: '',
    event: '',
    conditions: [],
    recipients: [],
    channels: [
      { type: 'email', enabled: true },
      { type: 'in_app', enabled: true },
      { type: 'sms', enabled: false },
      { type: 'push', enabled: false }
    ],
    template: '',
    isActive: true,
    priority: 'medium',
    frequency: 'immediate'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockRules: NotificationRule[] = [
        {
          id: '1',
          name: 'Critical Inspection Failures',
          description: 'Notify managers immediately when an inspection fails with critical findings',
          event: 'inspection.failed',
          conditions: [
            { field: 'severity', operator: 'equals', value: 'critical' }
          ],
          recipients: [
            { type: 'role', value: 'safety_manager', label: 'Safety Managers' },
            { type: 'role', value: 'supervisor', label: 'Supervisors' }
          ],
          channels: [
            { type: 'email', enabled: true },
            { type: 'sms', enabled: true },
            { type: 'in_app', enabled: true },
            { type: 'push', enabled: true }
          ],
          template: 'Critical inspection failure detected: {{inspection.name}} at {{location}}. Immediate attention required.',
          isActive: true,
          priority: 'critical',
          frequency: 'immediate',
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'Admin',
          lastTriggered: '2025-01-15T14:30:00Z',
          triggerCount: 23
        },
        {
          id: '2',
          name: 'Overdue Work Orders',
          description: 'Daily reminder for overdue work orders',
          event: 'workorder.overdue',
          conditions: [
            { field: 'days_overdue', operator: 'greater_than', value: 0 }
          ],
          recipients: [
            { type: 'role', value: 'inspector', label: 'Inspectors' },
            { type: 'role', value: 'supervisor', label: 'Supervisors' }
          ],
          channels: [
            { type: 'email', enabled: true },
            { type: 'in_app', enabled: true },
            { type: 'sms', enabled: false },
            { type: 'push', enabled: true }
          ],
          template: 'You have {{count}} overdue work orders. Please complete them as soon as possible.',
          isActive: true,
          priority: 'high',
          frequency: 'daily',
          createdAt: '2024-01-15T00:00:00Z',
          createdBy: 'Safety Manager',
          lastTriggered: '2025-01-15T08:00:00Z',
          triggerCount: 156
        },
        {
          id: '3',
          name: 'New Work Order Assignment',
          description: 'Notify inspectors when they are assigned new work orders',
          event: 'workorder.assigned',
          conditions: [],
          recipients: [
            { type: 'user', value: 'assigned_user', label: 'Assigned User' }
          ],
          channels: [
            { type: 'email', enabled: true },
            { type: 'in_app', enabled: true },
            { type: 'sms', enabled: false },
            { type: 'push', enabled: true }
          ],
          template: 'New work order assigned: {{workorder.title}}. Due: {{workorder.due_date}}',
          isActive: true,
          priority: 'medium',
          frequency: 'immediate',
          createdAt: '2024-02-01T00:00:00Z',
          createdBy: 'Safety Manager',
          lastTriggered: '2025-01-15T16:45:00Z',
          triggerCount: 89
        },
        {
          id: '4',
          name: 'Weekly Performance Summary',
          description: 'Weekly summary of inspection performance for managers',
          event: 'system.weekly_report',
          conditions: [],
          recipients: [
            { type: 'role', value: 'safety_manager', label: 'Safety Managers' },
            { type: 'role', value: 'admin', label: 'Administrators' }
          ],
          channels: [
            { type: 'email', enabled: true },
            { type: 'in_app', enabled: false },
            { type: 'sms', enabled: false },
            { type: 'push', enabled: false }
          ],
          template: 'Weekly Performance Report: {{completed_inspections}} inspections completed, {{completion_rate}}% completion rate.',
          isActive: true,
          priority: 'low',
          frequency: 'weekly',
          createdAt: '2024-03-01T00:00:00Z',
          createdBy: 'Admin',
          lastTriggered: '2025-01-13T00:00:00Z',
          triggerCount: 8
        }
      ];

      const mockHistory: NotificationHistory[] = [
        {
          id: '1',
          ruleId: '1',
          ruleName: 'Critical Inspection Failures',
          event: 'inspection.failed',
          recipients: ['sarah.manager@company.com', 'john.supervisor@company.com'],
          channels: ['email', 'sms', 'push'],
          status: 'sent',
          sentAt: '2025-01-15T14:30:00Z',
          metadata: {
            inspection: 'Fire Safety Check - Building A',
            location: 'Building A - 3rd Floor',
            severity: 'critical'
          }
        },
        {
          id: '2',
          ruleId: '2',
          ruleName: 'Overdue Work Orders',
          event: 'workorder.overdue',
          recipients: ['mike.inspector@company.com', 'lisa.supervisor@company.com'],
          channels: ['email', 'push'],
          status: 'sent',
          sentAt: '2025-01-15T08:00:00Z',
          metadata: {
            count: 3,
            overdue_days: [2, 1, 5]
          }
        },
        {
          id: '3',
          ruleId: '3',
          ruleName: 'New Work Order Assignment',
          event: 'workorder.assigned',
          recipients: ['david.inspector@company.com'],
          channels: ['email', 'push'],
          status: 'failed',
          sentAt: '2025-01-15T16:45:00Z',
          metadata: {
            workorder: 'Monthly Equipment Check',
            due_date: '2025-01-20'
          },
          errorMessage: 'SMTP server timeout'
        }
      ];

      setRules(mockRules);
      setHistory(mockHistory);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notification data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      if (!formData.name || !formData.event) {
        toast({
          title: "Error",
          description: "Name and event are required",
          variant: "destructive",
        });
        return;
      }

      const newRule: NotificationRule = {
        ...formData,
        id: Date.now().toString(),
        conditions: formData.conditions || [],
        recipients: formData.recipients || [],
        channels: formData.channels || [],
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User'
      } as NotificationRule;

      setRules(prev => [...prev, newRule]);
      setIsCreateModalOpen(false);
      resetForm();

      toast({
        title: "Rule Created",
        description: `${newRule.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notification rule",
        variant: "destructive",
      });
    }
  };

  const handleEditRule = async () => {
    try {
      if (!selectedRule || !formData.name || !formData.event) {
        return;
      }

      setRules(prev => prev.map(rule => 
        rule.id === selectedRule.id 
          ? { ...rule, ...formData } as NotificationRule
          : rule
      ));

      setIsEditModalOpen(false);
      setSelectedRule(null);
      resetForm();

      toast({
        title: "Rule Updated",
        description: `${formData.name} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification rule",
        variant: "destructive",
      });
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive } : rule
      ));

      toast({
        title: isActive ? "Rule Activated" : "Rule Deactivated",
        description: `The notification rule has been ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      toast({
        title: "Rule Deleted",
        description: "The notification rule has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const handleTestRule = async (ruleId: string) => {
    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;

      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Test Notification Sent",
        description: `Test notification sent for "${rule.name}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      event: '',
      conditions: [],
      recipients: [],
      channels: [
        { type: 'email', enabled: true },
        { type: 'in_app', enabled: true },
        { type: 'sms', enabled: false },
        { type: 'push', enabled: false }
      ],
      template: '',
      isActive: true,
      priority: 'medium',
      frequency: 'immediate'
    });
  };

  const openEditModal = (rule: NotificationRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      event: rule.event,
      conditions: [...rule.conditions],
      recipients: [...rule.recipients],
      channels: [...rule.channels],
      template: rule.template,
      isActive: rule.isActive,
      priority: rule.priority,
      frequency: rule.frequency
    });
    setIsEditModalOpen(true);
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = !searchTerm || 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && rule.isActive) ||
      (statusFilter === 'inactive' && !rule.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const filteredHistory = history.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.event.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (event: string) => {
    if (event.includes('inspection')) return <ClipboardList className="h-4 w-4" />;
    if (event.includes('workorder')) return <FileCheck className="h-4 w-4" />;
    if (event.includes('user')) return <Users className="h-4 w-4" />;
    if (event.includes('system')) return <Settings className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification Center</h1>
          <p className="text-muted-foreground">
            Configure intelligent notifications for system events and workflows
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <NotificationRuleDialog
            title="Create Notification Rule"
            formData={formData}
            setFormData={setFormData}
            onSave={handleCreateRule}
            onCancel={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
            <div className="text-sm text-muted-foreground">Total Rules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {rules.filter(r => r.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Rules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {history.filter(h => h.status === 'sent').length}
            </div>
            <div className="text-sm text-muted-foreground">Sent Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {history.filter(h => h.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                {activeTab === 'history' && (
                  <>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">
            <Settings className="h-4 w-4 mr-2" />
            Rules ({rules.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            History ({history.length})
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Zap className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {filteredRules.map(rule => (
              <NotificationRuleCard 
                key={rule.id} 
                rule={rule}
                onEdit={openEditModal}
                onDelete={handleDeleteRule}
                onToggle={handleToggleRule}
                onTest={handleTestRule}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {filteredHistory.map(entry => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getEventIcon(entry.event)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{entry.ruleName}</span>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Event: {entry.event}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Recipients: {entry.recipients.length}</span>
                          <span>Channels: {entry.channels.join(', ')}</span>
                          <span>{formatDistanceToNow(new Date(entry.sentAt), { addSuffix: true })}</span>
                        </div>
                        {entry.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {entry.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Configure email delivery settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Email Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>SMTP Server</Label>
                  <Input placeholder="smtp.company.com" />
                </div>
                <div>
                  <Label>From Address</Label>
                  <Input placeholder="safety@company.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
                <CardDescription>
                  Configure SMS delivery settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable SMS Notifications</Label>
                  <Switch />
                </div>
                <div>
                  <Label>SMS Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws">AWS SNS</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Configure push notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Push Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>Service Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Firebase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firebase">Firebase</SelectItem>
                      <SelectItem value="apns">Apple Push</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  In-App Notifications
                </CardTitle>
                <CardDescription>
                  Configure in-app notification behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable In-App Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sound Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>Retention Period (days)</Label>
                  <Input placeholder="30" type="number" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <NotificationRuleDialog
          title={`Edit ${selectedRule?.name}`}
          formData={formData}
          setFormData={setFormData}
          onSave={handleEditRule}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedRule(null);
            resetForm();
          }}
          isEdit={true}
        />
      </Dialog>
    </div>
  );
}

// Notification Rule Card Component
function NotificationRuleCard({ 
  rule, 
  onEdit, 
  onDelete, 
  onToggle,
  onTest
}: {
  rule: NotificationRule;
  onEdit: (rule: NotificationRule) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (ruleId: string, isActive: boolean) => void;
  onTest: (ruleId: string) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (event: string) => {
    if (event.includes('inspection')) return <ClipboardList className="h-4 w-4" />;
    if (event.includes('workorder')) return <FileCheck className="h-4 w-4" />;
    if (event.includes('user')) return <Users className="h-4 w-4" />;
    if (event.includes('system')) return <Settings className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  return (
    <Card className={`${rule.isActive ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getEventIcon(rule.event)}
              <CardTitle className="text-base">{rule.name}</CardTitle>
              <Badge className={getPriorityColor(rule.priority)}>
                {rule.priority}
              </Badge>
              {rule.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {rule.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event and Frequency */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Event:</span>
            <div className="font-medium">{rule.event}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Frequency:</span>
            <div className="font-medium capitalize">{rule.frequency}</div>
          </div>
        </div>

        {/* Recipients and Channels */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Recipients:</span>
            <div className="font-medium">{rule.recipients.length}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Channels:</span>
            <div className="font-medium">
              {rule.channels.filter(c => c.enabled).map(c => c.type).join(', ')}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Triggered:</span>
            <div className="font-medium">{rule.triggerCount} times</div>
          </div>
          <div>
            <span className="text-muted-foreground">Last Triggered:</span>
            <div className="font-medium">
              {rule.lastTriggered 
                ? formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true })
                : 'Never'
              }
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(rule.id, !rule.isActive)}
            className="flex-1"
          >
            {rule.isActive ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(rule.id)}
            disabled={!rule.isActive}
          >
            <Send className="h-3 w-3 mr-1" />
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(rule)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(rule.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Notification Rule Dialog Component
function NotificationRuleDialog({
  title,
  formData,
  setFormData,
  onSave,
  onCancel,
  isEdit = false
}: {
  title: string;
  formData: Partial<NotificationRule>;
  setFormData: (data: Partial<NotificationRule>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const updateChannel = (type: string, enabled: boolean) => {
    const updatedChannels = (formData.channels || []).map(channel =>
      channel.type === type ? { ...channel, enabled } : channel
    );
    setFormData({ ...formData, channels: updatedChannels });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Configure when and how notifications are sent
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Critical Inspection Alerts"
            />
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe when this notification should be sent..."
          />
        </div>

        {/* Event Selection */}
        <div>
          <Label htmlFor="event">Event *</Label>
          <Select value={formData.event} onValueChange={(value) => setFormData({ ...formData, event: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_EVENTS.map(category => (
                <div key={category.category}>
                  <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                    {category.category}
                  </div>
                  {category.events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Frequency */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Rule is active</Label>
          </div>
        </div>

        {/* Notification Channels */}
        <div>
          <Label className="text-base font-medium">Notification Channels</Label>
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            {(formData.channels || []).map(channel => (
              <div key={channel.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {channel.type === 'email' && <Mail className="h-4 w-4" />}
                  {channel.type === 'sms' && <Smartphone className="h-4 w-4" />}
                  {channel.type === 'push' && <Bell className="h-4 w-4" />}
                  {channel.type === 'in_app' && <Volume2 className="h-4 w-4" />}
                  <span className="capitalize">{channel.type.replace('_', ' ')}</span>
                </div>
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={(checked) => updateChannel(channel.type, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Message Template */}
        <div>
          <Label htmlFor="template">Message Template</Label>
          <Textarea
            id="template"
            value={formData.template || ''}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            placeholder="Enter your notification message template..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use variables like {`{{inspection.name}}`}, {`{{user.name}}`}, {`{{due_date}}`} in your template
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={!formData.name || !formData.event}
        >
          {isEdit ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </DialogContent>
  );
}
