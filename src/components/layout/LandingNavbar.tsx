'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DDD2] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#2D2A26] flex items-center justify-center text-[#FAF7F2] shadow-soft-xs transition-transform group-hover:scale-105">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif font-bold text-[#2D2A26] tracking-tight">
              CampusNotes
            </span>
            <span className="text-[10px] font-sans font-medium text-[#7A756D] tracking-widest uppercase border-l border-[#D5C9BA] pl-2 hidden sm:inline">
              Archive & Folio
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-[#5A554E]">
          <Link href="#featured-archives" className="hover:text-[#2D2A26] transition-colors underline-offset-8 hover:underline decoration-1 decoration-[#2D2A26]">
            Featured Folios
          </Link>
          <Link href="#editorial-curation" className="hover:text-[#2D2A26] transition-colors underline-offset-8 hover:underline decoration-1 decoration-[#2D2A26]">
            Study Guides
          </Link>
          <Link href="/notes" className="hover:text-[#2D2A26] transition-colors underline-offset-8 hover:underline decoration-1 decoration-[#2D2A26]">
            Public Library
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="text-xs font-medium">
              Start Reading <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
