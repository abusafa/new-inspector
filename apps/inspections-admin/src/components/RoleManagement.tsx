import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Settings,
  FileCheck,
  ClipboardList,
  BarChart3,
  Search,
  Filter,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'users' | 'workorders' | 'inspections' | 'templates' | 'analytics';
  icon: React.ReactNode;
  isSystemCritical?: boolean; // Cannot be removed from system admin roles
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isSystemRole: boolean; // Cannot be deleted
  isActive: boolean;
  userCount: number;
  createdAt: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
}

interface RoleAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // System Permissions
  {
    id: 'system.admin',
    name: 'System Administration',
    description: 'Full system access and configuration',
    category: 'system',
    icon: <Crown className="h-4 w-4" />,
    isSystemCritical: true
  },
  {
    id: 'system.settings',
    name: 'System Settings',
    description: 'Manage system configuration and settings',
    category: 'system',
    icon: <Settings className="h-4 w-4" />
  },
  {
    id: 'system.audit',
    name: 'Audit Logs',
    description: 'View system audit logs and user activities',
    category: 'system',
    icon: <Eye className="h-4 w-4" />
  },

  // User Management
  {
    id: 'users.view',
    name: 'View Users',
    description: 'View user profiles and information',
    category: 'users',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'users.create',
    name: 'Create Users',
    description: 'Create new user accounts',
    category: 'users',
    icon: <UserCheck className="h-4 w-4" />
  },
  {
    id: 'users.edit',
    name: 'Edit Users',
    description: 'Modify user profiles and information',
    category: 'users',
    icon: <Edit className="h-4 w-4" />
  },
  {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Remove user accounts from the system',
    category: 'users',
    icon: <UserX className="h-4 w-4" />
  },
  {
    id: 'users.roles',
    name: 'Manage User Roles',
    description: 'Assign and modify user roles',
    category: 'users',
    icon: <Shield className="h-4 w-4" />
  },

  // Work Orders
  {
    id: 'workorders.view',
    name: 'View Work Orders',
    description: 'View work orders and their details',
    category: 'workorders',
    icon: <FileCheck className="h-4 w-4" />
  },
  {
    id: 'workorders.create',
    name: 'Create Work Orders',
    description: 'Create new work orders',
    category: 'workorders',
    icon: <Plus className="h-4 w-4" />
  },
  {
    id: 'workorders.edit',
    name: 'Edit Work Orders',
    description: 'Modify existing work orders',
    category: 'workorders',
    icon: <Edit className="h-4 w-4" />
  },
  {
    id: 'workorders.delete',
    name: 'Delete Work Orders',
    description: 'Remove work orders from the system',
    category: 'workorders',
    icon: <Trash2 className="h-4 w-4" />
  },
  {
    id: 'workorders.assign',
    name: 'Assign Work Orders',
    description: 'Assign work orders to users',
    category: 'workorders',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'workorders.manage',
    name: 'Manage Work Orders',
    description: 'Full work order management including scheduling',
    category: 'workorders',
    icon: <Settings className="h-4 w-4" />
  },

  // Inspections
  {
    id: 'inspections.view',
    name: 'View Inspections',
    description: 'View inspection results and data',
    category: 'inspections',
    icon: <ClipboardList className="h-4 w-4" />
  },
  {
    id: 'inspections.perform',
    name: 'Perform Inspections',
    description: 'Complete assigned inspections',
    category: 'inspections',
    icon: <FileCheck className="h-4 w-4" />
  },
  {
    id: 'inspections.approve',
    name: 'Approve Inspections',
    description: 'Review and approve completed inspections',
    category: 'inspections',
    icon: <UserCheck className="h-4 w-4" />
  },
  {
    id: 'inspections.export',
    name: 'Export Inspections',
    description: 'Export inspection data and reports',
    category: 'inspections',
    icon: <FileCheck className="h-4 w-4" />
  },

  // Templates
  {
    id: 'templates.view',
    name: 'View Templates',
    description: 'View inspection templates',
    category: 'templates',
    icon: <Eye className="h-4 w-4" />
  },
  {
    id: 'templates.create',
    name: 'Create Templates',
    description: 'Create new inspection templates',
    category: 'templates',
    icon: <Plus className="h-4 w-4" />
  },
  {
    id: 'templates.edit',
    name: 'Edit Templates',
    description: 'Modify existing templates',
    category: 'templates',
    icon: <Edit className="h-4 w-4" />
  },
  {
    id: 'templates.delete',
    name: 'Delete Templates',
    description: 'Remove templates from the system',
    category: 'templates',
    icon: <Trash2 className="h-4 w-4" />
  },
  {
    id: 'templates.manage',
    name: 'Manage Templates',
    description: 'Full template management including publishing',
    category: 'templates',
    icon: <Settings className="h-4 w-4" />
  },

  // Analytics
  {
    id: 'analytics.view',
    name: 'View Analytics',
    description: 'Access system analytics and reports',
    category: 'analytics',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'analytics.export',
    name: 'Export Analytics',
    description: 'Export analytics data and reports',
    category: 'analytics',
    icon: <FileCheck className="h-4 w-4" />
  }
];

export function RoleManagement() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    color: '#3b82f6',
    permissions: [],
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'System Administrator',
          description: 'Full system access with all permissions',
          color: '#dc2626',
          permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
          isSystemRole: true,
          isActive: true,
          userCount: 2,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'System',
          lastModified: '2024-01-01T00:00:00Z',
          lastModifiedBy: 'System'
        },
        {
          id: '2',
          name: 'Safety Manager',
          description: 'Manages safety operations and approves inspections',
          color: '#ea580c',
          permissions: [
            'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.assign', 'workorders.manage',
            'inspections.view', 'inspections.approve', 'inspections.export',
            'templates.view', 'templates.create', 'templates.edit', 'templates.manage',
            'users.view', 'users.roles',
            'analytics.view', 'analytics.export'
          ],
          isSystemRole: true,
          isActive: true,
          userCount: 5,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'System',
          lastModified: '2025-01-15T10:00:00Z',
          lastModifiedBy: 'Admin'
        },
        {
          id: '3',
          name: 'Inspector',
          description: 'Performs inspections and completes work orders',
          color: '#16a34a',
          permissions: [
            'workorders.view',
            'inspections.view', 'inspections.perform',
            'templates.view'
          ],
          isSystemRole: true,
          isActive: true,
          userCount: 15,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'System',
          lastModified: '2024-12-01T14:00:00Z',
          lastModifiedBy: 'Safety Manager'
        },
        {
          id: '4',
          name: 'Supervisor',
          description: 'Oversees inspectors and manages local operations',
          color: '#7c3aed',
          permissions: [
            'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.assign',
            'inspections.view', 'inspections.perform', 'inspections.approve',
            'templates.view',
            'users.view',
            'analytics.view'
          ],
          isSystemRole: false,
          isActive: true,
          userCount: 8,
          createdAt: '2024-02-15T09:00:00Z',
          createdBy: 'Safety Manager',
          lastModified: '2025-01-10T11:00:00Z',
          lastModifiedBy: 'Safety Manager'
        },
        {
          id: '5',
          name: 'Read Only',
          description: 'View-only access for reporting and auditing',
          color: '#64748b',
          permissions: [
            'workorders.view',
            'inspections.view',
            'templates.view',
            'analytics.view'
          ],
          isSystemRole: false,
          isActive: true,
          userCount: 3,
          createdAt: '2024-03-01T12:00:00Z',
          createdBy: 'Admin',
          lastModified: '2024-03-01T12:00:00Z',
          lastModifiedBy: 'Admin'
        }
      ];

      const mockAssignments: RoleAssignment[] = [
        {
          userId: '1',
          userName: 'John Admin',
          userEmail: 'john.admin@company.com',
          roleId: '1',
          roleName: 'System Administrator',
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'System',
          isActive: true
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          roleId: '2',
          roleName: 'Safety Manager',
          assignedAt: '2024-01-15T10:00:00Z',
          assignedBy: 'John Admin',
          isActive: true
        },
        {
          userId: '3',
          userName: 'Mike Wilson',
          userEmail: 'mike.wilson@company.com',
          roleId: '3',
          roleName: 'Inspector',
          assignedAt: '2024-02-01T09:00:00Z',
          assignedBy: 'Sarah Johnson',
          isActive: true
        }
      ];

      setRoles(mockRoles);
      setAssignments(mockAssignments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load roles and permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast({
          title: "Error",
          description: "Name and description are required",
          variant: "destructive",
        });
        return;
      }

      const newRole: Role = {
        ...formData,
        id: Date.now().toString(),
        permissions: formData.permissions || [],
        isSystemRole: false,
        userCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        lastModified: new Date().toISOString(),
        lastModifiedBy: 'Current User'
      } as Role;

      setRoles(prev => [...prev, newRole]);
      setIsCreateModalOpen(false);
      resetForm();

      toast({
        title: "Role Created",
        description: `${newRole.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  };

  const handleEditRole = async () => {
    try {
      if (!selectedRole || !formData.name || !formData.description) {
        return;
      }

      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id 
          ? {
              ...role,
              ...formData,
              permissions: formData.permissions || [],
              lastModified: new Date().toISOString(),
              lastModifiedBy: 'Current User'
            } as Role
          : role
      ));

      setIsEditModalOpen(false);
      setSelectedRole(null);
      resetForm();

      toast({
        title: "Role Updated",
        description: `${formData.name} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      if (role.isSystemRole) {
        toast({
          title: "Cannot Delete",
          description: "System roles cannot be deleted",
          variant: "destructive",
        });
        return;
      }

      if (role.userCount > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete role that is assigned to users",
          variant: "destructive",
        });
        return;
      }

      setRoles(prev => prev.filter(r => r.id !== roleId));
      
      toast({
        title: "Role Deleted",
        description: `${role.name} has been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      setRoles(prev => prev.map(role => 
        role.id === roleId 
          ? { ...role, isActive, lastModified: new Date().toISOString(), lastModifiedBy: 'Current User' }
          : role
      ));

      toast({
        title: isActive ? "Role Activated" : "Role Deactivated",
        description: `The role has been ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      permissions: [],
      isActive: true
    });
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: [...role.permissions],
      isActive: role.isActive
    });
    setIsEditModalOpen(true);
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = !searchTerm || 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getPermissionsByCategory = (category: string) => {
    return AVAILABLE_PERMISSIONS.filter(p => p.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Crown className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'workorders': return <FileCheck className="h-4 w-4" />;
      case 'inspections': return <ClipboardList className="h-4 w-4" />;
      case 'templates': return <Eye className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions for your organization
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Role
            </Button>
          </DialogTrigger>
          <RoleFormDialog 
            title="Create New Role"
            formData={formData}
            setFormData={setFormData}
            onSave={handleCreateRole}
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
            <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
            <div className="text-sm text-muted-foreground">Total Roles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {roles.filter(r => r.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Roles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {roles.reduce((sum, r) => sum + r.userCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Assignments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {AVAILABLE_PERMISSIONS.length}
            </div>
            <div className="text-sm text-muted-foreground">Available Permissions</div>
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
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div></div>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Lock className="h-4 w-4 mr-2" />
            Permissions ({AVAILABLE_PERMISSIONS.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Users className="h-4 w-4 mr-2" />
            Assignments ({assignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map(role => (
              <RoleCard 
                key={role.id} 
                role={role}
                onEdit={openEditModal}
                onDelete={handleDeleteRole}
                onToggle={handleToggleRole}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {['system', 'users', 'workorders', 'inspections', 'templates', 'analytics'].map(category => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getCategoryIcon(category)}
                  {category} Permissions
                </CardTitle>
                <CardDescription>
                  Permissions related to {category} management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {getPermissionsByCategory(category).map(permission => (
                    <div key={permission.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {permission.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{permission.name}</h4>
                          {permission.isSystemCritical && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {permission.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="space-y-3">
            {assignments.map(assignment => (
              <Card key={`${assignment.userId}-${assignment.roleId}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{assignment.userName}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          style={{ 
                            backgroundColor: roles.find(r => r.id === assignment.roleId)?.color || '#64748b'
                          }}
                          className="text-white"
                        >
                          {assignment.roleName}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned {formatDate(assignment.assignedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <RoleFormDialog 
          title={`Edit ${selectedRole?.name}`}
          formData={formData}
          setFormData={setFormData}
          onSave={handleEditRole}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedRole(null);
            resetForm();
          }}
          isEdit={true}
          isSystemRole={selectedRole?.isSystemRole}
        />
      </Dialog>
    </div>
  );
}

// Role Card Component
function RoleCard({ 
  role, 
  onEdit, 
  onDelete, 
  onToggle 
}: {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onToggle: (roleId: string, isActive: boolean) => void;
}) {
  return (
    <Card className={`${role.isActive ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{role.name}</CardTitle>
              {role.isSystemRole && (
                <Badge variant="outline" className="text-xs">
                  System
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {role.description}
            </CardDescription>
          </div>
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: role.color }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Permissions Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Permissions</span>
          <Badge variant="outline">{role.permissions.length}</Badge>
        </div>

        {/* User Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Assigned Users</span>
          <Badge variant="outline">{role.userCount}</Badge>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={role.isActive ? "default" : "secondary"}>
            {role.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Last Modified */}
        <div className="text-xs text-muted-foreground">
          Modified {new Date(role.lastModified).toLocaleDateString()} by {role.lastModifiedBy}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(role.id, !role.isActive)}
            className="flex-1"
          >
            {role.isActive ? (
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
            onClick={() => onEdit(role)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          {!role.isSystemRole && role.userCount === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(role.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Role Form Dialog Component
function RoleFormDialog({
  title,
  formData,
  setFormData,
  onSave,
  onCancel,
  isEdit = false,
  isSystemRole = false
}: {
  title: string;
  formData: Partial<Role>;
  setFormData: (data: Partial<Role>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
  isSystemRole?: boolean;
}) {
  const togglePermission = (permissionId: string) => {
    const currentPermissions = formData.permissions || [];
    const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
    
    // Prevent removing system critical permissions from system roles
    if (isSystemRole && permission?.isSystemCritical && currentPermissions.includes(permissionId)) {
      return;
    }
    
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];
    
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const toggleCategoryPermissions = (category: string, enable: boolean) => {
    const categoryPermissions = AVAILABLE_PERMISSIONS
      .filter(p => p.category === category)
      .map(p => p.id);
    
    const currentPermissions = formData.permissions || [];
    let updatedPermissions;
    
    if (enable) {
      // Add all category permissions
      updatedPermissions = [...new Set([...currentPermissions, ...categoryPermissions])];
    } else {
      // Remove category permissions (except system critical ones for system roles)
      updatedPermissions = currentPermissions.filter(id => {
        const permission = AVAILABLE_PERMISSIONS.find(p => p.id === id);
        return !categoryPermissions.includes(id) || 
               (isSystemRole && permission?.isSystemCritical);
      });
    }
    
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const getCategoryPermissionCount = (category: string) => {
    const categoryPermissions = AVAILABLE_PERMISSIONS.filter(p => p.category === category);
    const assignedPermissions = formData.permissions || [];
    const assignedCount = categoryPermissions.filter(p => assignedPermissions.includes(p.id)).length;
    return { assigned: assignedCount, total: categoryPermissions.length };
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Modify role settings and permissions' : 'Create a new role with specific permissions'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Safety Inspector"
              disabled={isSystemRole}
            />
          </div>
          
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 p-1"
              />
              <Input
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this role is responsible for..."
            disabled={isSystemRole}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Role is active</Label>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Permissions</h3>
            <Badge variant="outline">
              {formData.permissions?.length || 0} of {AVAILABLE_PERMISSIONS.length} selected
            </Badge>
          </div>
          
          {['system', 'users', 'workorders', 'inspections', 'templates', 'analytics'].map(category => {
            const { assigned, total } = getCategoryPermissionCount(category);
            const allAssigned = assigned === total;
            const someAssigned = assigned > 0;
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <CardTitle className="text-base capitalize">{category}</CardTitle>
                      <Badge variant="outline">
                        {assigned}/{total}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCategoryPermissions(category, !allAssigned)}
                        disabled={isSystemRole && category === 'system'}
                      >
                        {allAssigned ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {getPermissionsByCategory(category).map(permission => {
                      const isAssigned = formData.permissions?.includes(permission.id) || false;
                      const isDisabled = isSystemRole && permission.isSystemCritical && isAssigned;
                      
                      return (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={isAssigned}
                            onCheckedChange={() => togglePermission(permission.id)}
                            disabled={isDisabled}
                          />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <Label
                              htmlFor={permission.id}
                              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                isDisabled ? 'opacity-70' : 'cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {permission.icon}
                                {permission.name}
                                {permission.isSystemCritical && (
                                  <Badge variant="destructive" className="text-xs">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={!formData.name || !formData.description}
        >
          {isEdit ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
