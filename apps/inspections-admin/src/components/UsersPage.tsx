import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUsers } from '@/hooks/useApi';
import { formatDate, formatDateTime, formatPhoneNumber } from '@/lib/utils';
import type { User } from '@/lib/api';
import { api } from '@/lib/api';
import { UserModal } from '@/components/modals/UserModal';
import { DeleteConfirmationDialog } from '@/components/modals/DeleteConfirmationDialog';
import { FilterDialog, type FilterCriteria } from '@/components/modals/FilterDialog';
import { ExportDialog } from '@/components/modals/ExportDialog';
import { UserRoleDialog } from '@/components/modals/UserRoleDialog';
import { UserStatusDialog } from '@/components/modals/UserStatusDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Building2,
  Shield,
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  Settings,
  Download
} from 'lucide-react';

function getRoleColor(role: string) {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'safety manager':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'safety supervisor':
    case 'supervisor':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'inspector':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'maintenance lead':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function UserCard({ 
  user, 
  onEdit,
  onDelete
}: { 
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{initials}</span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription className="text-sm">
                {user.employeeId && `ID: ${user.employeeId}`}
              </CardDescription>
            </div>
          </div>
          <Badge className={getRoleColor(user.role)}>
            {user.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{formatPhoneNumber(user.phoneNumber)}</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
          </div>

          {/* Work Info */}
          {(user.department || user.location) && (
            <div className="space-y-2">
              {user.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Supervisor */}
          {user.supervisor && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Reports to:</span>
              <span className="font-medium">{user.supervisor}</span>
            </div>
          )}

          {/* Last Login */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last login: {formatDateTime(user.loginTime)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Joined {formatDate(user.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(user)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(user)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UsersPage() {
  const { data: users, loading, error, refetch } = useUsers();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const filteredUsers = users?.filter(user => {
    // Text search
    const searchQuery = filters.search || searchTerm;
    if (searchQuery) {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phoneNumber.includes(searchQuery) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Role filter
    if (filters.role && user.role !== filters.role) return false;

    // Department filter
    if (filters.department && user.department !== filters.department) return false;

    // Location filter
    if (filters.location && user.location !== filters.location) return false;

    return true;
  }) || [];

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await api.users.delete(userToDelete.id);
      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been deleted successfully.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to delete user:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-24" />
                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <UserX className="h-5 w-5" />
              <p>Failed to load users: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group users by role for stats
  const usersByRole = users?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Inspectors and admins management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setExportDialogOpen(true)}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setRoleDialogOpen(true)}
            variant="outline"
          >
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
          <Button 
            onClick={() => setStatusDialogOpen(true)}
            variant="outline"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Manage Status
          </Button>
          <Button onClick={() => {
            setSelectedUser(null);
            setModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => setFilterDialogOpen(true)}
          className={Object.keys(filters).length > 0 ? "border-primary text-primary" : ""}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="rounded-r-none"
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-l-none"
          >
            Table
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inspectors</p>
                <p className="text-2xl font-bold">{usersByRole['Inspector'] || 0}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Supervisors</p>
                <p className="text-2xl font-bold">
                  {(usersByRole['Safety Supervisor'] || 0) + (usersByRole['Supervisor'] || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold">
                  {(usersByRole['Safety Manager'] || 0) + (usersByRole['Maintenance Lead'] || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      {Object.keys(usersByRole).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role Distribution</CardTitle>
            <CardDescription>User roles across the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{role}</p>
                    <p className="text-sm text-muted-foreground">{count} users</p>
                  </div>
                  <Badge className={getRoleColor(role)}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user}
              onEdit={(u) => {
                setSelectedUser(u);
                setModalOpen(true);
              }}
              onDelete={(u) => {
                setUserToDelete(u);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const initials = user.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{initials}</span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.email && (
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>{user.location || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPhoneNumber(user.phoneNumber)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(user.loginTime)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredUsers.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No users match your search.' : 'No users found.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
        onSave={refetch}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
        itemName={userToDelete?.name}
        onConfirm={handleDeleteUser}
      />

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onFiltersChange={setFilters}
        type="users"
        availableOptions={{
          roles: [...new Set(users?.map(u => u.role) || [])],
          departments: [...new Set(users?.map(u => u.department).filter((dept): dept is string => Boolean(dept)) || [])],
          locations: [...new Set(users?.map(u => u.location).filter((loc): loc is string => Boolean(loc)) || [])],
        }}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={{ users: filteredUsers }}
        type="users"
      />

      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        users={users || []}
        onUpdate={refetch}
      />

      <UserStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        users={users || []}
        onUpdate={refetch}
      />
    </div>
  );
}
