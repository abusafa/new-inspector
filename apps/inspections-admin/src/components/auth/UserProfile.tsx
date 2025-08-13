import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Clock,
  Mail,
  Phone,
  Building,
  MapPin,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserProfileProps {
  variant?: 'dropdown' | 'card' | 'avatar';
  showFullProfile?: boolean;
}

export function UserProfile({ variant = 'dropdown', showFullProfile = false }: UserProfileProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showPermissions, setShowPermissions] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const getStatusColor = () => {
    const settings = user.settings as any;
    const status = settings?.status || 'active';
    
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'safety manager':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'safety supervisor':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'inspector':
        return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'maintenance lead':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
              {getInitials(user.name)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
                {getInitials(user.name)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <Badge className={`text-xs mt-1 ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
              {getInitials(user.name)}
            </div>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleColor(user.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
                <Badge className={getStatusColor()}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardHeader>
      
      {showFullProfile && (
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.department}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.location}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Work Information</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Employee ID</span>
                <span className="text-sm font-mono">{user.employeeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Supervisor</span>
                <span className="text-sm">{user.supervisor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm">{formatDateTime(user.loginTime)}</span>
              </div>
              {user.sessionExpiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session Expires</span>
                  <span className="text-sm">{formatDateTime(user.sessionExpiresAt)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Permissions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPermissions(!showPermissions)}
              >
                {showPermissions ? 'Hide' : 'Show'} ({user.permissions.length})
              </Button>
            </div>
            
            {showPermissions && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Your role grants you the following permissions:
                </div>
                <div className="grid gap-2">
                  {user.permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-mono">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Avatar variant for mobile header
  if (variant === 'avatar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
              {getInitials(user?.name || '')}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
                {getInitials(user?.name || '')}
              </div>
              <div>
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.role}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
