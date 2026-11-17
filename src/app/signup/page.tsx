'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, Mail, Lock, User, GraduationCap, Building2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    university: '',
    major: '',
    email: '',
    password: '',
    agreedToTerms: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid student email required.';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.agreedToTerms) {
      newErrors.terms = 'You must agree to the academic integrity guidelines.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          university: formData.university,
          major: formData.major,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || 'Registration failed. Please try again.' });
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Account created successfully! Signing you in...');

      // Auto sign-in with newly created credentials
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // If auto sign-in has any issue, redirect to login
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setErrors({ general: 'Network error occurred. Please check your connection.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:bg-indigo-700 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold text-stone-900 tracking-tight">CampusNotes</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-stone-900">Create your student account</h2>
        <p className="mt-1 text-xs text-stone-500">
          Join thousands of university peers sharing handwritten course lecture guides.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-paper-md rounded-2xl border border-stone-200 space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errors.general}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
              icon={<User className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="University / College"
                placeholder="e.g. State University"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                icon={<Building2 className="w-4 h-4" />}
              />
              <Input
                label="Major / Program"
                placeholder="e.g. Computer Science"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                icon={<GraduationCap className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Student Email Address"
              type="email"
              placeholder="e.g. student@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Create Password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-0.5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500/20"
                />
                <span className="text-xs text-stone-600 leading-snug">
                  I agree to the CampusNotes Honor Code & Academic Integrity Guidelines for sharing handwritten notes.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-sm font-semibold py-2.5 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Registering in PostgreSQL...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-stone-400">
        © 2026 CampusNotes • CampusLearn Platform
      </div>
    </div>
  );
}
