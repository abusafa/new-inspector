import { NavLink, Outlet, type RouteObject, useRoutes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import { ProtectedRoute, WithPermission } from './components/auth/ProtectedRoute';
import { UserProfile } from './components/auth/UserProfile';
import { NotificationsPanel } from './components/NotificationsPanel';
import { RealTimeStatus } from './components/RealTimeStatus';
import { Dashboard } from './components/Dashboard';
import { MobileDashboard } from './components/MobileDashboard';
import { MobileLayout } from './components/MobileLayout';
import { ResponsiveDashboard } from './components/ResponsiveDashboard';
import { WorkOrdersPage } from './components/WorkOrdersPage';
import { InspectionsPage } from './components/InspectionsPage';
import { UsersPage } from './components/UsersPage';
import { SettingsPage } from './components/SettingsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { TemplateManagementPage } from './components/TemplateManagementPage';
import { ApprovalDashboard } from './components/ApprovalDashboard';
import { RecurringWorkOrders } from './components/RecurringWorkOrders';
import { RoleManagement } from './components/RoleManagement';
import { AuditLogs } from './components/AuditLogs';
import { NotificationCenter } from './components/NotificationCenter';
import { Toaster } from './components/ui/toaster';
import { 
  LayoutDashboard, 
  FileCheck, 
  ClipboardList, 
  Users, 
  Settings,
  BarChart3,
  Shield,
  Bell,
  Layers,
  CheckCircle,
  RotateCcw,
  UserCog,
  Activity
} from 'lucide-react';

function Layout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="h-14 px-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-lg font-bold tracking-tight">SafetyCheck Admin</div>
            </div>
            <nav className="ml-auto flex items-center gap-6 text-sm">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              
              <WithPermission permission="workorders.view">
                <NavLink 
                  to="/work-orders" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <FileCheck className="h-4 w-4" />
                  Work Orders
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="inspections.view">
                <NavLink 
                  to="/inspections" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <ClipboardList className="h-4 w-4" />
                  Inspections
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="templates.manage">
                <NavLink 
                  to="/templates" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Layers className="h-4 w-4" />
                  Templates
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="inspections.approve">
                <NavLink 
                  to="/approvals" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <CheckCircle className="h-4 w-4" />
                  Approvals
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="workorders.manage">
                <NavLink 
                  to="/recurring" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <RotateCcw className="h-4 w-4" />
                  Recurring
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="users.view">
                <NavLink 
                  to="/users" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Users className="h-4 w-4" />
                  Users
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="users.roles">
                <NavLink 
                  to="/roles" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <UserCog className="h-4 w-4" />
                  Roles
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="analytics.view">
                <NavLink 
                  to="/analytics" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </NavLink>
              </WithPermission>
              
              <WithPermission permission="system.audit">
                <NavLink 
                  to="/audit" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Activity className="h-4 w-4" />
                  Audit Logs
                </NavLink>
              </WithPermission>

              <WithPermission permission="system.settings">
                <NavLink 
                  to="/notifications" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </NavLink>
              </WithPermission>

              <WithPermission permission="system.settings">
                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </NavLink>
              </WithPermission>
            </nav>
            
            <div className="flex items-center gap-3 ml-4 border-l pl-4">
              <RealTimeStatus />
              <NotificationsPanel />
              <UserProfile variant="dropdown" />
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MobileLayout />,
    children: [
      {
        index: true,
        element: <ResponsiveDashboard />,
      },
      {
        path: 'work-orders',
        element: (
          <ProtectedRoute requiredPermission="workorders.view">
            <WorkOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inspections',
        element: (
          <ProtectedRoute requiredPermission="inspections.view">
            <InspectionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'templates',
        element: (
          <ProtectedRoute requiredPermission="templates.manage">
            <TemplateManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'approvals',
        element: (
          <ProtectedRoute requiredPermission="inspections.approve">
            <ApprovalDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'recurring',
        element: (
          <ProtectedRoute requiredPermission="workorders.manage">
            <RecurringWorkOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredPermission="users.view">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute requiredPermission="users.roles">
            <RoleManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute requiredPermission="analytics.view">
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit',
        element: (
          <ProtectedRoute requiredPermission="system.audit">
            <AuditLogs />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute requiredPermission="system.settings">
            <NotificationCenter />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredPermission="system.settings">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <AuthProvider>
      <RealTimeProvider>
        <AppRoutes />
        <Toaster />
      </RealTimeProvider>
    </AuthProvider>
  );
}

export default App;