import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileCheck, User as UserIcon } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';

export function MobileShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/work-orders') {
      return location.pathname.startsWith('/work-orders');
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="h-12 px-3 flex items-center gap-2">
          <div className="text-base font-semibold tracking-tight">SafetyCheck</div>
          <div className="ml-auto">
            <UserProfile onProfileClick={() => navigate('/profile')} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20 pt-2">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto max-w-xl grid grid-cols-2">
          <NavLink
            to="/work-orders"
            className={({ isActive: _ }) =>
              `flex flex-col items-center justify-center py-2 text-xs ${
                isActive('/work-orders') ? 'text-blue-600' : 'text-muted-foreground'
              }`
            }
          >
            <FileCheck className="h-5 w-5" />
            <span className="mt-0.5">Work Orders</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive: _ }) =>
              `flex flex-col items-center justify-center py-2 text-xs ${
                isActive('/profile') ? 'text-blue-600' : 'text-muted-foreground'
              }`
            }
          >
            <UserIcon className="h-5 w-5" />
            <span className="mt-0.5">Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}


