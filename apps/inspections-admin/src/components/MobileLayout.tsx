import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute, WithPermission } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/components/auth/UserProfile';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { RealTimeStatus } from '@/components/RealTimeStatus';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileCheck, 
  ClipboardList, 
  Users, 
  Package,
  Settings,
  BarChart3,
  Shield,
  Menu,
  X,
  ChevronRight,
  Home,
  Layers,
  CheckCircle,
  RotateCcw,
  UserCog
} from 'lucide-react';

interface MobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: string;
  end?: boolean;
}

const navigationItems: MobileNavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true
  },
  {
    to: '/work-orders',
    label: 'Work Orders',
    icon: FileCheck,
    permission: 'workorders.view',
    badge: 'New'
  },
  {
    to: '/inspections',
    label: 'Inspections',
    icon: ClipboardList,
    permission: 'inspections.view'
  },
  {
    to: '/templates',
    label: 'Templates',
    icon: Layers,
    permission: 'templates.manage'
  },
  {
    to: '/approvals',
    label: 'Approvals',
    icon: CheckCircle,
    permission: 'inspections.approve'
  },
  {
    to: '/recurring',
    label: 'Recurring',
    icon: RotateCcw,
    permission: 'workorders.manage'
  },
  {
    to: '/assets',
    label: 'Assets',
    icon: Package
    // No permission required temporarily for testing
  },
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    permission: 'users.view'
  },
  {
    to: '/roles',
    label: 'Roles',
    icon: UserCog,
    permission: 'users.roles'
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    permission: 'analytics.view'
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    permission: 'system.settings'
  }
];

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const NavItem = ({ item }: { item: MobileNavItem }) => {
    const content = (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `flex items-center justify-between w-full p-4 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80'
          }`
        }
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <Badge variant={isActive ? 'secondary' : 'outline'} className="text-xs">
                  {item.badge}
                </Badge>
              )}
              <ChevronRight className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
          </>
        )}
      </NavLink>
    );

    if (item.permission) {
      return (
        <WithPermission permission={item.permission}>
          {content}
        </WithPermission>
      );
    }

    return content;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Inspections</h2>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {user.permissions?.length || 0} perms
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Version 2.1.0</span>
          <div className="flex items-center gap-2">
            <RealTimeStatus />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="font-bold text-lg">Inspections</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RealTimeStatus />
              <NotificationsPanel />
              <UserProfile variant="avatar" />
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
            <SidebarContent />
          </div>
        </div>

        {/* Main Content */}
        <main className="lg:pl-80">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t lg:hidden">
          <div className="grid grid-cols-5 gap-1">
            {navigationItems.slice(0, 5).map((item) => {
              const content = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center p-3 text-xs transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-5 w-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                      <span className="truncate max-w-full">{item.label}</span>
                      {item.badge && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );

              if (item.permission) {
                return (
                  <WithPermission key={item.to} permission={item.permission}>
                    {content}
                  </WithPermission>
                );
              }

              return content;
            })}
          </div>
        </nav>

        {/* Mobile spacing for bottom nav */}
        <div className="h-16 lg:hidden" />
      </div>
    </ProtectedRoute>
  );
}
