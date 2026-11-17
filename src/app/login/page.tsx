'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Info,
} from 'lucide-react';
import { signIn } from 'next-auth/react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleQuery = searchParams.get('role');

  const [activeRole, setActiveRole] = useState<'STUDENT' | 'TEACHER'>(
    roleQuery?.toLowerCase() === 'teacher' ? 'TEACHER' : 'STUDENT'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email || !email.includes('@')) {
      newErrors.email =
        activeRole === 'TEACHER'
          ? 'Please enter your institutional educator email address.'
          : 'Please enter a valid student email address.';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
        expectedRole: activeRole,
      });

      if (!result?.ok || result.error) {
        if (
          result?.error === 'TEACHER_NOT_AUTHORIZED' ||
          result?.error?.includes('TEACHER_NOT_AUTHORIZED')
        ) {
          setErrors({
            general:
              'Teacher access must be authorized by an administrator. This account is registered as a Student. Please switch to the Student Portal to sign in.',
          });
        } else {
          setErrors({
            general:
              activeRole === 'TEACHER'
                ? 'Invalid faculty email or password. Please verify your credentials or contact an administrator.'
                : 'Invalid student email or password. Please try again.',
          });
        }
        setIsSubmitting(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrors({ general: 'Network or authentication error. Please try again later.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 shadow-paper-md rounded-2xl border border-stone-200 space-y-6">
      {/* Role Selection Switcher */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 text-center">
          Select Your Workspace Role
        </p>
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveRole('STUDENT');
              setErrors({});
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeRole === 'STUDENT'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('TEACHER');
              setErrors({});
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeRole === 'TEACHER'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-600" />
            <span>Faculty / Teacher</span>
          </button>
        </div>
      </div>

      {/* Role Specific Explanatory Banner */}
      {activeRole === 'TEACHER' ? (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-950">Authorized Faculty Sign In</p>
            <p className="text-[11px] text-amber-800 leading-normal">
              Teacher accounts must be provisioned and authorized by an institution administrator. Self-registration is restricted to students.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center gap-2 text-xs text-stone-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[11px]">
            Sign in with your student email to access lecture notes, video archives, and study channels.
          </span>
        </div>
      )}

      {/* General Error Notification */}
      {errors.general && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span className="leading-relaxed">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={activeRole === 'TEACHER' ? 'Faculty / Educator Email' : 'Student Email'}
          type="email"
          placeholder={activeRole === 'TEACHER' ? 'faculty@university.edu' : 'student@university.edu'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="w-4 h-4" />}
        />

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Password
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset requires administrative configuration. Please contact your campus support.');
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500/20"
            />
            <span className="text-xs text-stone-600 font-medium">Keep me signed in</span>
          </label>
        </div>

        {/* Primary Role-Aware Sign-In Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full text-sm font-semibold py-2.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Verifying credentials...</span>
          ) : (
            <span className="flex items-center gap-2">
              {activeRole === 'TEACHER' ? 'Sign In to Faculty Portal' : 'Sign In as Student'}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Footer Role Links */}
      <div className="text-center pt-2 border-t border-stone-100">
        {activeRole === 'STUDENT' ? (
          <p className="text-xs text-stone-500">
            Don&apos;t have a CampusNotes account?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Register as a student
            </Link>
          </p>
        ) : (
          <div className="space-y-1 text-xs text-stone-500">
            <p>
              Looking for student coursework?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveRole('STUDENT');
                  setErrors({});
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline"
              >
                Switch to Student Portal
              </button>
            </p>
            <p className="text-[11px] text-stone-400">
              Teacher accounts must be provisioned by institution administrators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top logo link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:bg-indigo-700 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold text-stone-900 tracking-tight">CampusNotes</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-stone-900">Academic Workspace Login</h2>
        <p className="mt-1 text-xs text-stone-500">
          Sign in to access your course folios, lecture notes, and video libraries.
        </p>
      </div>

      {/* Main Login Card wrapped in Suspense for useSearchParams */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="bg-white py-12 px-6 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              Loading workspace login...
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </div>

      <div className="text-center text-xs text-stone-400">
        © 2026 CampusNotes • CampusLearn Platform
      </div>
    </div>
  );
}
