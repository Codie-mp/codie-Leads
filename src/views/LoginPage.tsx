"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, Lock, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

type AuthView = 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const { login } = useAuth();
  
  const [view, setView] = useState<AuthView>(
    searchParamsHook.get('plan') || searchParamsHook.toString().includes('register') ? 'register' : 'login'
  );
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (searchParamsHook.get('plan')) {
      setView('register');
    }
  }, [searchParamsHook]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (view === 'register') {
        if (password.length < 8) throw new Error('Password must be at least 8 characters long');
        
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, companyName: companyName || 'My Company' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        
          toast.success(data.message || 'Account created! Please check your email for the verification code.');
          setResendCooldown(data.cooldownSeconds ?? 60);
          setView('verify');
        
      } else if (view === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!res.ok) {
          if (data.error === "UNVERIFIED") {
            toast.info("Please verify your email first. We sent a new code.");
            setResendCooldown(60);
            setView('verify');
            return;
          }
          throw new Error(data.error || 'Authentication failed');
        }

        login(data.accessToken, data.refreshToken);
        toast.success('Welcome back!');
        const planParam = searchParamsHook.get('plan');
        const from = planParam ? `/app?view=billing&plan=${planParam}` : '/app';
        router.replace(from);
        
      } else if (view === 'verify') {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        
        login(data.accessToken, data.refreshToken);
        toast.success('Email verified successfully!');
        const planParam = searchParamsHook.get('plan');
        router.replace(planParam ? `/app?view=billing&plan=${planParam}` : '/app');

      } else if (view === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
        
        toast.success('Password reset code sent to your email.');
        setResendCooldown(data.cooldownSeconds ?? 60);
        setView('reset-password');

      } else if (view === 'reset-password') {
        if (newPassword.length < 8) throw new Error('Password must be at least 8 characters long');
        
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');
        
        login(data.accessToken, data.refreshToken);
        toast.success('Password reset successfully!');
        router.replace('/app');
      }

    } catch (err: any) {
      if (err.message !== "UNVERIFIED") {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (purpose: 'verification' | 'reset') => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.retryAfterSeconds) setResendCooldown(Number(data.retryAfterSeconds));
        throw new Error(data.error || 'Failed to resend code');
      }
      setResendCooldown(data.cooldownSeconds ?? 60);
      toast.success('Code sent successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    switch (view) {
      case 'register': return 'Create your workspace';
      case 'verify': return 'Verify your email';
      case 'forgot-password': return 'Reset your password';
      case 'reset-password': return 'Enter new password';
      default: return 'Sign in to your workspace';
    }
  };

  const renderSubheader = () => {
    if (view === 'register') {
      return (
        <>Already have an account? <button onClick={() => setView('login')} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none cursor-pointer p-0">Sign in instead</button></>
      );
    } else if (view === 'login') {
      return (
        <>Or <button onClick={() => setView('register')} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none cursor-pointer p-0">start your 14-day free trial</button></>
      );
    } else if (view === 'verify') {
      return `We sent a 6-digit code to ${email}`;
    } else if (view === 'forgot-password') {
      return (
        <>Remembered it? <button onClick={() => setView('login')} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none cursor-pointer p-0">Sign in</button></>
      );
    } else if (view === 'reset-password') {
      return `Enter the code sent to ${email}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {renderHeader()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {renderSubheader()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {(view === 'login' || view === 'register' || view === 'forgot-password') && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
            )}

            {view === 'register' && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required={view === 'register'}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'register') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(view === 'verify' || view === 'reset-password') && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  6-Digit Code
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900 font-mono tracking-widest text-center"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            {view === 'reset-password' && (
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mt-4">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button type="button" onClick={() => { setView('forgot-password'); setError(null); }} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer">
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            {(view === 'verify' || view === 'reset-password') && (
               <div className="text-sm text-center">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  disabled={isLoading || resendCooldown > 0}
                  onClick={() => resendCode(view === 'verify' ? 'verification' : 'reset')}
                  className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend it'}
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {view === 'register' ? 'Create Account' 
                      : view === 'login' ? 'Sign in' 
                      : view === 'verify' ? 'Verify Code'
                      : view === 'forgot-password' ? 'Send Reset Code'
                      : 'Reset Password'} <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
            
            {(view === 'login' || view === 'register') && (
              <div className="text-center mt-4 text-sm text-gray-600">
                {view === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setView('register')} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setView('login')} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer">
                      Log in
                    </button>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
