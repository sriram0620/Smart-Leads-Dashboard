import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
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
        const response = await api.login(formData.email, formData.password);
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Login successful');
          window.location.href = '/';
        }
      } else {
        const response = await api.register(name, formData.email, formData.password);
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Registration successful');
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Authentication failed';
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
        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[#111111]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              {isLogin ? 'Sign in to your account' : 'Register a new account'}
            </p>
          </div>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="bg-[#F9FAFB] rounded-lg p-3 mb-5 flex items-start gap-2">
              <Shield size={16} className="text-[#FFB300] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#6B7280]">
                <p className="font-medium text-[#111111]">Demo Credentials:</p>
                <p>Admin: admin@leadflow.com / admin123</p>
                <p>Sales: rahul@leadflow.com / sales123</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-[#111111]">
                  Full Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="mt-1.5 h-11 border-[#E5E7EB] focus-visible:ring-[#FFB300]"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#111111]">
                Email <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@company.com"
                className={`mt-1.5 h-11 ${errors.email ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
              />
              {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[#111111]">
                Password <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className={`mt-1.5 h-11 ${errors.password ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
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
