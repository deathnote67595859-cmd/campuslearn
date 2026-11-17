'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#FAF8F5]">
      {/* Persistent App Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {status === 'loading' ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-32 bg-stone-200/60 rounded-2xl w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="h-44 bg-stone-200/60 rounded-xl" />
                <div className="h-44 bg-stone-200/60 rounded-xl" />
                <div className="h-44 bg-stone-200/60 rounded-xl" />
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
