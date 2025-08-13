import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  User,
  Building,
  Clock
} from 'lucide-react';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Demo accounts for easy testing
  const demoAccounts = [
    {
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'Admin',
      department: 'Administration',
      description: 'Full system access with all permissions'
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      role: 'Safety Manager',
      department: 'Safety & Compliance',
      description: 'Manages safety operations and inspections'
    },
    {
      name: 'John Inspector',
      email: 'john@company.com',
      role: 'Inspector',
      department: 'Safety',
      description: 'Performs inspections and reports findings'
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await login(formData.email, formData.password);
    if (!success) {
      setErrors({ general: 'Login failed. Please check your credentials.' });
    }
  };

  const handleDemoLogin = async (email: string) => {
    setFormData({ email, password: 'demo123' });
    
    // Small delay for better UX
    setTimeout(async () => {
      await login(email, 'demo123');
    }, 500);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'safety manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'safety supervisor':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inspector':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'maintenance lead':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding and Info */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SafetyInspect</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sign in to your admin account to manage inspections, users, and system settings.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Comprehensive Management</div>
                <div className="text-sm text-gray-600">Users, work orders, inspections, and templates</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Role-Based Security</div>
                <div className="text-sm text-gray-600">Advanced permissions and access control</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Real-Time Analytics</div>
                <div className="text-sm text-gray-600">Live dashboard with comprehensive reporting</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{errors.general}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`pl-10 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-center text-gray-600 mb-3">
                  Click any account below to login instantly (password: demo123)
                </p>
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email)}
                    disabled={isLoading}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 group-hover:bg-blue-100">
                          <User className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{account.name}</div>
                          <div className="text-xs text-gray-600">{account.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${getRoleColor(account.role)}`}>
                          {account.role}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {account.department}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>
              Need help? Contact your system administrator or 
              <br />
              email support@company.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
