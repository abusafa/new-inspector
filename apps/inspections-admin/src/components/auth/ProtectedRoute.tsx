import { type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
              <p className="text-sm text-gray-600 mt-2">
                This page requires <strong>{requiredRole}</strong> role access.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Your current role: <strong>{user?.role}</strong>
              </p>
            </div>
            {fallback}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mx-auto">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Insufficient Permissions</h3>
              <p className="text-sm text-gray-600 mt-2">
                You don't have the required permission to access this page.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Required: <strong>{requiredPermission}</strong>
              </p>
            </div>
            {fallback}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component for permission-based rendering
interface WithPermissionProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function WithPermission({ children, permission, fallback }: WithPermissionProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Higher-order component for role-based rendering
interface WithRoleProps {
  children: ReactNode;
  role: string;
  fallback?: ReactNode;
}

export function WithRole({ children, role, fallback }: WithRoleProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Component for showing content only to authenticated users
interface AuthenticatedOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthenticatedOnly({ children, fallback }: AuthenticatedOnlyProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
