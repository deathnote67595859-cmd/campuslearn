'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#242220] text-[#FAF7F2] border-t border-[#3A3632] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] flex items-center justify-center text-[#242220] font-bold shadow-soft-xs">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-serif font-bold text-[#FAF7F2]">CampusNotes</span>
            </div>
            <p className="text-xs text-[#A69C8E] leading-relaxed font-sans font-normal">
              An open academic archive built for university students to photograph, catalogue, search, and exchange handwritten lecture notes with clarity.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5C9BA] mb-3">Compendium</h4>
            <ul className="space-y-2 text-xs text-[#B8B0A2]">
              <li><Link href="/notes" className="hover:text-[#FAF7F2] transition-colors">Public Library</Link></li>
              <li><Link href="/upload" className="hover:text-[#FAF7F2] transition-colors">Upload Note Folio</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#FAF7F2] transition-colors">Scholar Workspace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5C9BA] mb-3">Courses</h4>
            <ul className="space-y-2 text-xs text-[#B8B0A2]">
              <li><Link href="/notes?subject=C%2B%2B" className="hover:text-[#FAF7F2] transition-colors">C++ (CS 106L)</Link></li>
              <li><Link href="/notes?subject=Mathematics" className="hover:text-[#FAF7F2] transition-colors">Mathematics (MATH 51)</Link></li>
              <li><Link href="/notes?subject=Physics" className="hover:text-[#FAF7F2] transition-colors">Physics (PHYS 41)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5C9BA] mb-3">Student Access</h4>
            <ul className="space-y-2 text-xs text-[#B8B0A2]">
              <li><Link href="/login" className="hover:text-[#FAF7F2] transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-[#FAF7F2] transition-colors">Create Account</Link></li>
              <li><Link href="/videos" className="hover:text-[#FAF7F2] transition-colors">Video Lectures</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#3A3632] flex flex-col md:flex-row items-center justify-between text-xs text-[#8A8275] gap-4">
          <p>© 2026 CampusNotes • University Handwritten Lecture Archive</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#B8B0A2] font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5 text-[#A69C8E]" /> Verified Academic Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
