import { NavLink, Outlet, type RouteObject, useRoutes } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { WorkOrdersPage } from './components/WorkOrdersPage';
import { InspectionsPage } from './components/InspectionsPage';
import { UsersPage } from './components/UsersPage';
import { SettingsPage } from './components/SettingsPage';
import { Toaster } from './components/ui/toaster';
import { 
  LayoutDashboard, 
  FileCheck, 
  ClipboardList, 
  Users, 
  Settings,
  Shield,
  Bell
} from 'lucide-react';

function Layout() {
  return (
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
          </nav>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold">AD</span>
            </div>
          </div>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'work-orders', element: <WorkOrdersPage /> },
      { path: 'inspections', element: <InspectionsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
];

export default function App() {
  const element = useRoutes(routes);
  return element;
}
