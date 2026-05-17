import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { AxiosError } from 'axios';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
}

interface ApiErrorResponse {
  message?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!isLogin && (!name.trim() || name.trim().length < 3)) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login successful');
      } else {
        await register(name, formData.email, formData.password, role);
        toast.success('Registration successful');
      }
      navigate('/');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div
        className="w-full max-w-md"
        style={{
          animation: 'fadeScale 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-3xl font-bold text-white tracking-tight">LeadFlow</h1>
            <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-[#FFB300]"></span>
          </div>
          <p className="text-[#6B7280] mt-2 text-sm">Smart Lead Management Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#111111] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[#111111] dark:text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              {isLogin ? 'Sign in to your account' : 'Register a new account'}
            </p>
          </div>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="bg-[#F9FAFB] dark:bg-[#1A1A1A] rounded-lg p-3 mb-5 flex items-start gap-2">
              <Shield size={16} className="text-[#FFB300] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#6B7280]">
                <p className="font-medium text-[#111111] dark:text-white">Demo Credentials:</p>
                <p>Admin: admin@leadflow.com / admin123</p>
                <p>Sales: rahul@leadflow.com / sales123</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-[#111111] dark:text-white">
                    Full Name <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={`mt-1.5 h-11 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white ${errors.name ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
                  />
                  {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#111111] dark:text-white">
                    Role
                  </Label>
                  <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'sales')}>
                    <SelectTrigger className="mt-1.5 h-11 border-[#E5E7EB] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white focus:ring-[#FFB300]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#111111] dark:text-white">
                Email <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@company.com"
                className={`mt-1.5 h-11 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white ${errors.email ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
              />
              {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[#111111] dark:text-white">
                Password <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className={`mt-1.5 h-11 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white ${errors.password ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
              />
              {errors.password && <p className="text-xs text-[#EF4444] mt-1">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#FFB300] text-black hover:bg-[#FFA000] rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-[#6B7280] hover:text-[#FFB300] transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
