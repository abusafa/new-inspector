import { NavLink, Outlet, type RouteObject, useRoutes } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="h-12 px-3 flex items-center gap-2">
          <div className="text-base font-semibold tracking-tight">SafetyCheck Admin</div>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'text-blue-600' : 'text-muted-foreground'}>
              Dashboard
            </NavLink>
            <NavLink to="/work-orders" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-muted-foreground'}>
              Work Orders
            </NavLink>
            <NavLink to="/inspections" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-muted-foreground'}>
              Inspections
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-muted-foreground'}>
              Users
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-muted-foreground'}>
              Settings
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <div className="text-muted-foreground text-sm">Overview of inspections and work orders.</div>
    </div>
  );
}

function WorkOrdersPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Work Orders</h2>
      <p className="text-sm text-muted-foreground">Manage and assign work orders.</p>
    </div>
  );
}

function InspectionsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Inspections</h2>
      <p className="text-sm text-muted-foreground">Templates, results, and analytics.</p>
    </div>
  );
}

function UsersPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Users</h2>
      <p className="text-sm text-muted-foreground">Inspectors and admins management.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Settings</h2>
      <p className="text-sm text-muted-foreground">System configuration.</p>
    </div>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
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
