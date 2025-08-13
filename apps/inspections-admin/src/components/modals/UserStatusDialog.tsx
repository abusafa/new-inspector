import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MessageSquare
} from 'lucide-react';
import type { User } from '@/lib/api';
import { api } from '@/lib/api';

interface UserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onUpdate: () => void;
}

type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

interface StatusDefinition {
  id: UserStatus;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  canLogin: boolean;
}

const STATUS_DEFINITIONS: StatusDefinition[] = [
  {
    id: 'active',
    name: 'Active',
    description: 'User can access the system normally',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="h-4 w-4" />,
    canLogin: true
  },
  {
    id: 'inactive',
    name: 'Inactive',
    description: 'User account is disabled but can be reactivated',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <Pause className="h-4 w-4" />,
    canLogin: false
  },
  {
    id: 'suspended',
    name: 'Suspended',
    description: 'User access is temporarily restricted',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <XCircle className="h-4 w-4" />,
    canLogin: false
  },
  {
    id: 'pending',
    name: 'Pending',
    description: 'User account is awaiting approval or setup',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Clock className="h-4 w-4" />,
    canLogin: false
  }
];

export function UserStatusDialog({ open, onOpenChange, users, onUpdate }: UserStatusDialogProps) {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('active');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifyUsers, setNotifyUsers] = useState(true);

  const handleBulkStatusUpdate = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select users to update their status.",
        variant: "destructive",
      });
      return;
    }

    if ((selectedStatus === 'suspended' || selectedStatus === 'inactive') && !reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for status change.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const statusUpdate = {
        // For now, we'll store status info in the settings field as JSON
        // In a real app, you'd extend the User interface to include these fields
        settings: {
          status: selectedStatus,
          statusReason: reason.trim() || undefined,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdatedBy: 'Admin User'
        }
      };

      const promises = selectedUsers.map(userId => 
        api.users.update(userId, statusUpdate)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Status updated",
        description: `Successfully updated ${selectedUsers.length} user(s) to ${selectedStatus} status.`,
      });
      
      // In a real app, you might send notifications here if notifyUsers is true
      if (notifyUsers) {
        console.log('Would send notifications to affected users');
      }
      
      onUpdate();
      setSelectedUsers([]);
      setReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusDefinition = (status: UserStatus) => {
    return STATUS_DEFINITIONS.find(s => s.id === status) || STATUS_DEFINITIONS[0];
  };

  const getUserCurrentStatus = (user: User): UserStatus => {
    // In a real app, this would come from the user object
    // For now, we'll derive it from existing data or default to 'active'
    const settings = user.settings as any;
    return settings?.status || 'active';
  };

  const getStatusCounts = () => {
    const counts: Record<UserStatus, number> = {
      active: 0,
      inactive: 0,
      suspended: 0,
      pending: 0
    };

    users.forEach(user => {
      const status = getUserCurrentStatus(user);
      counts[status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const selectedStatusDef = getStatusDefinition(selectedStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Status Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Overview</CardTitle>
              <CardDescription>Current status distribution across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUS_DEFINITIONS.map((status) => (
                  <div key={status.id} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${status.bgColor} mb-2`}>
                      <span className={status.color}>{status.icon}</span>
                    </div>
                    <div className="font-semibold text-lg">{statusCounts[status.id]}</div>
                    <div className="text-sm text-muted-foreground">{status.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Status</CardTitle>
              <CardDescription>Select the status to apply to selected users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedStatus} onValueChange={(value: string) => setSelectedStatus(value as UserStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_DEFINITIONS.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <span className={status.color}>{status.icon}</span>
                        <span>{status.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className={`p-3 rounded-lg ${selectedStatusDef.bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={selectedStatusDef.color}>{selectedStatusDef.icon}</span>
                  <span className="font-medium">{selectedStatusDef.name}</span>
                  <Badge variant={selectedStatusDef.canLogin ? "default" : "secondary"}>
                    {selectedStatusDef.canLogin ? "Can Login" : "Cannot Login"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedStatusDef.description}
                </p>
              </div>

              {(selectedStatus === 'suspended' || selectedStatus === 'inactive') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Status Change *</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for this status change..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-users"
                  checked={notifyUsers}
                  onCheckedChange={(checked) => setNotifyUsers(checked as boolean)}
                />
                <label htmlFor="notify-users" className="text-sm font-medium">
                  Notify affected users about status change
                </label>
              </div>
            </CardContent>
          </Card>

          {/* User Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Select Users</CardTitle>
                  <CardDescription>Choose users to update their status</CardDescription>
                </div>
                <Badge variant="secondary">
                  {selectedUsers.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {users.map((user) => {
                  const currentStatus = getUserCurrentStatus(user);
                  const statusDef = getStatusDefinition(currentStatus);
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer"
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center gap-1">
                            <span className={`${statusDef.color} text-xs`}>
                              {statusDef.icon}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {statusDef.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            onClick={handleBulkStatusUpdate}
            disabled={selectedUsers.length === 0 || loading}
            className={selectedStatus === 'suspended' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {loading ? 'Updating...' : `Update ${selectedUsers.length} User(s)`}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
