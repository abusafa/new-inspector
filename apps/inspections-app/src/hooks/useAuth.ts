import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  phoneNumber: string;
  name?: string;
  role?: string;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('safetycheck_user');
    
    // Apply saved preferences on app load
    const savedLanguage = localStorage.getItem('safetycheck_language') || 'en';
    const savedTheme = localStorage.getItem('safetycheck_theme') || 'system';
    
    // Apply language and RTL
    const isRTL = savedLanguage === 'ar';
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRTL);
    
    // Apply theme
    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };
    
    applyTheme(savedTheme);
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Check if session is still valid (e.g., within 24 hours)
        const loginTime = new Date(userData.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
          setUser(userData);
        } else {
          localStorage.removeItem('safetycheck_user');
        }
      } catch (error) {
        localStorage.removeItem('safetycheck_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (phoneNumber: string) => {
    const userData: User = {
      phoneNumber,
      name: getNameFromPhone(phoneNumber), // Mock function to get name
      role: 'Inspector',
      loginTime: new Date().toISOString()
    };
    
    setUser(userData);
    localStorage.setItem('safetycheck_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safetycheck_user');
  };

  return {
    user,
    isLoading,
    login,
    logout
  };
}

// Mock function to simulate getting user name from phone number
// In a real app, this would come from your user database
function getNameFromPhone(phoneNumber: string): string {
  const phoneMap: Record<string, string> = {
    '(555) 123-4567': 'John Smith',
    '(555) 987-6543': 'Sarah Johnson',
    '(555) 456-7890': 'Mike Rodriguez',
    '(555) 321-0987': 'Emily Davis',
  };
  
  return phoneMap[phoneNumber] || 'Inspector';
}

export { AuthContext };