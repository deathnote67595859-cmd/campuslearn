'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  User,
  LogOut,
  ChevronRight,
  Video,
  Sparkles,
} from 'lucide-react';
import { getCachedOrFetchResources } from '@/lib/data-cache';

const AIStudyAssistantModal = dynamic(
  () => import('@/components/ai/AIStudyAssistantModal').then((mod) => mod.AIStudyAssistantModal),
  { ssr: false }
);

interface SidebarSubject {
  id: string;
  name: string;
  code: string | null;
  noteCount?: number;
}

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState<SidebarSubject[]>([]);
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCachedOrFetchResources(false)
      .then((data) => {
        if (isMounted && data.subjects) {
          setSubjects(data.subjects);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const userName = session?.user?.name || 'Scholar';
  const userUsername =
    session?.user?.username ||
    (session?.user?.email ? session.user.email.split('@')[0] : 'user');
  const userAvatar =
    session?.user?.image ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Notes Library', href: '/notes', icon: BookOpen },
    { label: 'Video Library', href: '/videos', icon: Video },
    { label: 'Upload Notes', href: '/upload', icon: Upload },
    { label: 'My Profile', href: `/profile/${userUsername}`, icon: User },
  ];

  return (
    <aside className="w-64 bg-[#242220] text-[#FAF7F2] border-r border-[#3A3632] flex flex-col justify-between shrink-0 min-h-screen">
      {/* Top Header */}
      <div className="p-5 space-y-6">
        <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 group">
          <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] flex items-center justify-center text-[#242220] shadow-soft-xs transition-transform group-hover:scale-105">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-serif font-bold text-[#FAF7F2] tracking-tight">CampusNotes</span>
            <span className="text-[10px] text-[#A69C8E] font-medium tracking-widest uppercase">
              Academic Archive
            </span>
          </div>
        </Link>

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A8275] mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FAF7F2] text-[#242220] shadow-soft-xs font-semibold'
                    : 'text-[#B8B0A2] hover:text-[#FAF7F2] hover:bg-[#322F2C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#242220]' : 'text-[#8A8275]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#242220]" />}
              </Link>
            );
          })}

          {/* AI Study Assistant Navigation Button */}
          <button
            onClick={() => setIsAIOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-[#FAF7F2] bg-[#2E2B27] hover:bg-[#38342F] border border-[#443F3A] shadow-soft-xs mt-2 group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#D4A359] group-hover:scale-110 transition-transform" />
              <span className="font-medium">AI Study Assistant</span>
            </div>
            <span className="text-[10px] bg-[#FAF7F2]/10 text-[#D4A359] px-1.5 py-0.5 rounded font-mono font-semibold">
              Groq
            </span>
          </button>
        </div>

        {/* Course Channels: Genuine Subjects from Neon */}
        <div className="space-y-1.5 pt-4 border-t border-[#3A3632]">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A8275] mb-2">
            Course Channels
          </p>
          {subjects.length === 0 ? (
            <p className="px-3 text-[11px] text-[#7A756D] italic">No channels registered</p>
          ) : (
            subjects.slice(0, 4).map((sub) => (
              <Link
                key={sub.id}
                href={`/notes?subject=${encodeURIComponent(sub.name)}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#B8B0A2] hover:text-[#FAF7F2] hover:bg-[#322F2C] transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51] shrink-0"></span>
                  <span className="truncate">{sub.code || sub.name}</span>
                </div>
                <span className="text-[10px] text-[#8A8275] font-mono shrink-0">
                  {typeof sub.noteCount === 'number' ? `${sub.noteCount} notes` : ''}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-4 border-t border-[#3A3632] space-y-2">
        <div className="bg-[#2D2A26] p-3 rounded-xl flex items-center justify-between border border-[#3A3632]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#524D46] shrink-0 bg-[#3A3632]">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#FAF7F2] truncate">{userName}</p>
              <p className="text-[10px] text-[#A69C8E] font-mono truncate">@{userUsername}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 text-xs font-medium text-[#8A8275] hover:text-[#C86D51] px-2 py-1.5 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* AI Study Assistant Modal */}
      <AIStudyAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </aside>
  );
};
