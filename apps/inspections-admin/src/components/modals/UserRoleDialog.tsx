import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  User as UserIcon, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  FileText,
  ClipboardList,
  UserCheck,
  UserX,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { User } from '@/lib/api';
import { api } from '@/lib/api';

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onUpdate: () => void;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'workOrders' | 'inspections' | 'templates' | 'system';
  icon: React.ReactNode;
}

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isSystem: boolean;
}

const PERMISSIONS: Permission[] = [
  // Users
  { id: 'users.view', name: 'View Users', description: 'Can view user profiles and lists', category: 'users', icon: <Eye className="h-4 w-4" /> },
  { id: 'users.create', name: 'Create Users', description: 'Can create new user accounts', category: 'users', icon: <UserIcon className="h-4 w-4" /> },
  { id: 'users.edit', name: 'Edit Users', description: 'Can modify user profiles and settings', category: 'users', icon: <Edit className="h-4 w-4" /> },
  { id: 'users.delete', name: 'Delete Users', description: 'Can delete user accounts', category: 'users', icon: <Trash2 className="h-4 w-4" /> },
  { id: 'users.manage_roles', name: 'Manage Roles', description: 'Can assign and modify user roles', category: 'users', icon: <Shield className="h-4 w-4" /> },
  
  // Work Orders
  { id: 'workorders.view', name: 'View Work Orders', description: 'Can view work orders and assignments', category: 'workOrders', icon: <Eye className="h-4 w-4" /> },
  { id: 'workorders.create', name: 'Create Work Orders', description: 'Can create new work orders', category: 'workOrders', icon: <FileText className="h-4 w-4" /> },
  { id: 'workorders.edit', name: 'Edit Work Orders', description: 'Can modify work order details', category: 'workOrders', icon: <Edit className="h-4 w-4" /> },
  { id: 'workorders.delete', name: 'Delete Work Orders', description: 'Can delete work orders', category: 'workOrders', icon: <Trash2 className="h-4 w-4" /> },
  { id: 'workorders.assign', name: 'Assign Work Orders', description: 'Can assign work orders to users', category: 'workOrders', icon: <UserCheck className="h-4 w-4" /> },
  
  // Inspections
  { id: 'inspections.view', name: 'View Inspections', description: 'Can view inspection results and data', category: 'inspections', icon: <Eye className="h-4 w-4" /> },
  { id: 'inspections.create', name: 'Create Inspections', description: 'Can create new inspections', category: 'inspections', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'inspections.edit', name: 'Edit Inspections', description: 'Can modify inspection data', category: 'inspections', icon: <Edit className="h-4 w-4" /> },
  { id: 'inspections.delete', name: 'Delete Inspections', description: 'Can delete inspection records', category: 'inspections', icon: <Trash2 className="h-4 w-4" /> },
  { id: 'inspections.approve', name: 'Approve Inspections', description: 'Can approve and finalize inspections', category: 'inspections', icon: <CheckCircle className="h-4 w-4" /> },
  
  // Templates
  { id: 'templates.view', name: 'View Templates', description: 'Can view inspection templates', category: 'templates', icon: <Eye className="h-4 w-4" /> },
  { id: 'templates.create', name: 'Create Templates', description: 'Can create new inspection templates', category: 'templates', icon: <FileText className="h-4 w-4" /> },
  { id: 'templates.edit', name: 'Edit Templates', description: 'Can modify inspection templates', category: 'templates', icon: <Edit className="h-4 w-4" /> },
  { id: 'templates.delete', name: 'Delete Templates', description: 'Can delete inspection templates', category: 'templates', icon: <Trash2 className="h-4 w-4" /> },
  
  // System
  { id: 'system.settings', name: 'System Settings', description: 'Can access and modify system settings', category: 'system', icon: <Settings className="h-4 w-4" /> },
  { id: 'system.export', name: 'Data Export', description: 'Can export system data', category: 'system', icon: <FileText className="h-4 w-4" /> },
  { id: 'system.audit', name: 'Audit Logs', description: 'Can view system audit logs', category: 'system', icon: <Clock className="h-4 w-4" /> },
];

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access with all permissions',
    color: 'bg-red-500',
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.id)
  },
  {
    id: 'safety_manager',
    name: 'Safety Manager',
    description: 'Manages safety operations and inspections',
    color: 'bg-blue-500',
    isSystem: true,
    permissions: [
      'users.view', 'users.edit',
      'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.assign',
      'inspections.view', 'inspections.create', 'inspections.edit', 'inspections.approve',
      'templates.view', 'templates.create', 'templates.edit',
      'system.export'
    ]
  },
  {
    id: 'safety_supervisor',
    name: 'Safety Supervisor',
    description: 'Supervises safety inspections and work orders',
    color: 'bg-green-500',
    isSystem: true,
    permissions: [
      'users.view',
      'workorders.view', 'workorders.create', 'workorders.edit',
      'inspections.view', 'inspections.create', 'inspections.edit',
      'templates.view'
    ]
  },
  {
    id: 'inspector',
    name: 'Inspector',
    description: 'Performs inspections and reports findings',
    color: 'bg-purple-500',
    isSystem: true,
    permissions: [
      'workorders.view',
      'inspections.view', 'inspections.create', 'inspections.edit',
      'templates.view'
    ]
  },
  {
    id: 'maintenance_lead',
    name: 'Maintenance Lead',
    description: 'Manages maintenance operations',
    color: 'bg-orange-500',
    isSystem: true,
    permissions: [
      'users.view',
      'workorders.view', 'workorders.create', 'workorders.edit',
      'inspections.view',
      'templates.view'
    ]
  }
];

export function UserRoleDialog({ open, onOpenChange, users, onUpdate }: UserRoleDialogProps) {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'assign' | 'permissions'>('assign');

  const handleBulkRoleAssignment = async () => {
    if (selectedUsers.length === 0 || !selectedRole) {
      toast({
        title: "Selection required",
        description: "Please select users and a role to assign.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const promises = selectedUsers.map(userId => 
        api.users.update(userId, { role: selectedRole })
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Roles updated",
        description: `Successfully updated ${selectedUsers.length} user(s) to ${selectedRole} role.`,
      });
      
      onUpdate();
      setSelectedUsers([]);
      setSelectedRole('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to update roles:', error);
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

  const getRoleDefinition = (roleId: string) => {
    return ROLE_DEFINITIONS.find(r => r.id === roleId) || ROLE_DEFINITIONS[0];
  };

  const getPermissionsByCategory = (category: string) => {
    return PERMISSIONS.filter(p => p.category === category);
  };

  const renderRoleAssignment = () => (
    <div className="space-y-6">
      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Role</CardTitle>
          <CardDescription>Choose the role to assign to selected users</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_DEFINITIONS.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${role.color}`} />
                    <span>{role.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedRole && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getRoleDefinition(selectedRole).color}`} />
                <span className="font-medium">{getRoleDefinition(selectedRole).name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getRoleDefinition(selectedRole).description}
              </p>
              <div className="mt-2">
                <Badge variant="outline">
                  {getRoleDefinition(selectedRole).permissions.length} permissions
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Select Users</CardTitle>
              <CardDescription>Choose users to assign the selected role</CardDescription>
            </div>
            <Badge variant="secondary">
              {selectedUsers.length} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => toggleUserSelection(user.id)}
              >
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email} • {user.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6">
      {['users', 'workOrders', 'inspections', 'templates', 'system'].map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base capitalize flex items-center gap-2">
              {category === 'users' && <Users className="h-4 w-4" />}
              {category === 'workOrders' && <FileText className="h-4 w-4" />}
              {category === 'inspections' && <ClipboardList className="h-4 w-4" />}
              {category === 'templates' && <Settings className="h-4 w-4" />}
              {category === 'system' && <Shield className="h-4 w-4" />}
              {category.replace(/([A-Z])/g, ' $1')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {getPermissionsByCategory(category).map((permission) => (
                <div key={permission.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  {permission.icon}
                  <div className="flex-1">
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-sm text-muted-foreground">{permission.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Role Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={viewMode === 'assign' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('assign')}
          >
            Assign Roles
          </Button>
          <Button
            variant={viewMode === 'permissions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('permissions')}
          >
            View Permissions
          </Button>
        </div>

        {viewMode === 'assign' ? renderRoleAssignment() : renderPermissions()}

        <DialogFooter>
          {viewMode === 'assign' && (
            <Button
              onClick={handleBulkRoleAssignment}
              disabled={selectedUsers.length === 0 || !selectedRole || loading}
            >
              {loading ? 'Updating...' : `Update ${selectedUsers.length} User(s)`}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
