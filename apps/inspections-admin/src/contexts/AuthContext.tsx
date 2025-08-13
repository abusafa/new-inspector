import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthUser extends User {
  permissions: string[];
  lastLoginAt?: string;
  sessionExpiresAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permission mappings based on roles
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Admin': [
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
    'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.delete', 'workorders.assign',
    'inspections.view', 'inspections.create', 'inspections.edit', 'inspections.delete', 'inspections.approve',
    'templates.view', 'templates.create', 'templates.edit', 'templates.delete',
    'analytics.view', 'system.settings', 'system.export', 'system.audit'
  ],
  'Safety Manager': [
    'users.view', 'users.edit',
    'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.assign',
    'inspections.view', 'inspections.create', 'inspections.edit', 'inspections.approve',
    'templates.view', 'templates.create', 'templates.edit',
    'analytics.view', 'system.export'
  ],
  'Safety Supervisor': [
    'users.view',
    'workorders.view', 'workorders.create', 'workorders.edit',
    'inspections.view', 'inspections.create', 'inspections.edit',
    'templates.view', 'analytics.view'
  ],
  'Inspector': [
    'workorders.view',
    'inspections.view', 'inspections.create', 'inspections.edit',
    'templates.view'
  ],
  'Maintenance Lead': [
    'users.view',
    'workorders.view', 'workorders.create', 'workorders.edit',
    'inspections.view',
    'templates.view'
  ]
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          
          // Check if session is expired
          if (authData.sessionExpiresAt && new Date(authData.sessionExpiresAt) > new Date()) {
            // Session is valid, restore user
            const userWithPermissions = {
              ...authData.user,
              permissions: ROLE_PERMISSIONS[authData.user.role] || []
            };
            setUser(userWithPermissions);
          } else {
            // Session expired, clear storage
            localStorage.removeItem('auth');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('auth');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an actual login API call
      // For demo purposes, we'll simulate authentication
      const mockLogin = await simulateLogin(email, password);
      
      if (mockLogin.success && mockLogin.user) {
        const sessionExpiresAt = new Date();
        sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 8); // 8 hour session
        
        const authUser: AuthUser = {
          ...mockLogin.user,
          permissions: ROLE_PERMISSIONS[mockLogin.user.role] || [],
          lastLoginAt: new Date().toISOString(),
          sessionExpiresAt: sessionExpiresAt.toISOString(),
        };

        setUser(authUser);
        
        // Store in localStorage
        localStorage.setItem('auth', JSON.stringify({
          user: mockLogin.user,
          sessionExpiresAt: sessionExpiresAt.toISOString(),
          loginTime: new Date().toISOString()
        }));

        toast({
          title: "Login successful",
          description: `Welcome back, ${mockLogin.user.name}!`,
        });

        return true;
      } else {
        toast({
          title: "Login failed",
          description: mockLogin.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    
    try {
      // In a real app, this would refresh user data from the server
      const updatedUser = await api.users.get(user.id);
      const userWithPermissions: AuthUser = {
        ...updatedUser,
        permissions: ROLE_PERMISSIONS[updatedUser.role] || [],
        lastLoginAt: user.lastLoginAt,
        sessionExpiresAt: user.sessionExpiresAt,
      };
      
      setUser(userWithPermissions);
      
      // Update localStorage
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        authData.user = updatedUser;
        localStorage.setItem('auth', JSON.stringify(authData));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock login function - in a real app this would be an API call
async function simulateLogin(email: string, password: string): Promise<{
  success: boolean;
  user?: User;
  message?: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock user database
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      phoneNumber: '(555) 123-4567',
      email: 'admin@company.com',
      role: 'Admin',
      department: 'Administration',
      location: 'Main Office',
      employeeId: 'EMP-001',
      supervisor: 'CEO',
      loginTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {}
    },
    {
      id: '2',
      name: 'Emily Davis',
      phoneNumber: '(555) 321-0987',
      email: 'emily.davis@company.com',
      role: 'Safety Manager',
      department: 'Safety & Compliance',
      location: 'Main Office',
      employeeId: 'EMP-004',
      supervisor: 'Admin User',
      loginTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {}
    },
    {
      id: '3',
      name: 'John Inspector',
      phoneNumber: '(555) 987-6543',
      email: 'john@company.com',
      role: 'Inspector',
      department: 'Safety',
      location: 'Field Office',
      employeeId: 'EMP-005',
      supervisor: 'Emily Davis',
      loginTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {}
    }
  ];

  // Simple authentication check
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }

  // For demo purposes, accept any password for existing users
  // In a real app, you would hash and compare passwords
  if (password.length < 3) {
    return {
      success: false,
      message: 'Invalid password'
    };
  }

  return {
    success: true,
    user: {
      ...user,
      loginTime: new Date().toISOString()
    }
  };
}
