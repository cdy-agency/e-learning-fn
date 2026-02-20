'use client';

import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  redirectMessage?: string;
}

export function LoginModal({ isOpen, onClose, onSuccess, redirectMessage }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token — adapt to your auth system (e.g. next-auth, zustand, context)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      toast.success('Logged in successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4">
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-primary px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-white" />
              <h2 className="text-white font-bold text-lg">Sign in to continue</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors rounded-sm p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Context message */}
            {redirectMessage && (
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-sm px-4 py-3 mb-5">
                {redirectMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-sm text-sm font-semibold transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <a href="/forgot-password" className="hover:text-primary transition-colors">
                Forgot password?
              </a>
              <a href="/register" className="hover:text-primary transition-colors font-medium">
                Create an account →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}