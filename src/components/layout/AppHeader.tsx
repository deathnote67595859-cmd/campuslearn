'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
}) => {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

  const displayTitle = title || (session?.user?.name ? `${session.user.name.split(' ')[0]}'s Workspace` : 'Student Workspace');
  const displaySubtitle = subtitle || (session?.user?.university ? `${session.user.university} • ${session.user.major || 'Student'}` : 'Search, organize, and share handwritten course notes');

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DDD2] px-6 py-3.5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-serif font-bold text-[#23211F] tracking-tight">{displayTitle}</h1>
        <p className="text-xs text-[#7A756D]">{displaySubtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Subtle academic term pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-xs font-medium text-[#5A554E] shadow-soft-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6B8E73]"></span>
          <span>{session?.user?.role || 'STUDENT'}</span>
        </div>

        {/* Quick Upload CTA */}
        <Link href="/upload">
          <Button variant="primary" size="sm" className="text-xs font-medium">
            <Upload className="w-3.5 h-3.5 mr-1" /> Add Notes
          </Button>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-white border border-[#D5C9BA] shadow-soft-xs hover:bg-[#FAF7F2] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#5A554E]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl border border-[#D5C9BA] shadow-soft-lg p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#E5DDD2] pb-2 mb-3">
                <span className="text-xs font-serif font-bold text-[#23211F]">Notifications</span>
                <span className="text-[10px] bg-[#F4EFEA] border border-[#D5C9BA] text-[#7A756D] px-2 py-0.5 rounded font-medium">
                  0 New
                </span>
              </div>
              <div className="py-6 text-center space-y-1.5">
                <Bell className="w-5 h-5 text-stone-300 mx-auto" />
                <p className="text-xs font-medium text-[#23211F]">All caught up</p>
                <p className="text-[11px] text-[#7A756D] max-w-[200px] mx-auto">
                  Folio feedback, cohort updates, and study alerts will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
