'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { getCachedOrFetchResources } from '@/lib/data-cache';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDetailModal } from '@/components/notes/NoteDetailModal';
import { Button } from '@/components/ui/Button';
import { NoteItem, SubjectCategory } from '@/types';
import {
  BookOpen,
  Upload,
  Bookmark,
  Layers,
  ChevronRight,
  ArrowUpRight,
  FolderOpen,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

const AIStudyAssistantModal = dynamic(
  () => import('@/components/ai/AIStudyAssistantModal').then((mod) => mod.AIStudyAssistantModal),
  { ssr: false }
);

interface DbResource {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  videoUrl: string | null;
  topic: string;
  courseCode: string;
  subject: string;
  viewCount: number;
  bookmarkCount: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    university: string;
    major: string;
    graduationYear: string;
    isVerified: boolean;
  };
}

interface DbSubject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  color: string | null;
  iconName: string | null;
  noteCount?: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const [dbResources, setDbResources] = useState<DbResource[]>([]);
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getCachedOrFetchResources(false),
      fetch('/api/bookmarks')
        .then((res) => (res.ok ? res.json() : { count: 0 }))
        .catch(() => ({ count: 0 })),
    ])
      .then(([resourceData, bookmarkData]) => {
        if (isMounted) {
          setDbResources(resourceData.resources || []);
          setDbSubjects(resourceData.subjects || []);
          setSavedCount(bookmarkData.count || 0);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard data.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter for NOTE type resources for the note gallery
  const noteItems: NoteItem[] = useMemo(() => {
    return dbResources
      .filter((r) => r.type === 'NOTE' || r.type === 'PDF')
      .map((r) => ({
        id: r.id,
        title: r.title,
        subject: (r.subject as SubjectCategory) || 'C++',
        topic: r.topic,
        lectureDate: r.createdAt.split('T')[0],
        uploadDate: r.createdAt.split('T')[0],
        courseCode: r.courseCode,
        author: {
          name: r.uploader.name,
          username: r.uploader.username,
          avatar: r.uploader.avatar,
          university: r.uploader.university,
          major: r.uploader.major,
          graduationYear: r.uploader.graduationYear,
          isVerified: r.uploader.isVerified,
        },
        thumbnailUrl: r.fileUrl || r.uploader.avatar,
        pages: [
          {
            id: `${r.id}-p1`,
            imageUrl: r.fileUrl || r.uploader.avatar,
            pageNumber: 1,
            caption: r.title,
          },
        ],
        starCount: r.bookmarkCount,
        bookmarkCount: r.bookmarkCount,
        viewsCount: r.viewCount,
        isPublic: true,
        summary: r.description,
        tags: [r.subject.toLowerCase().replace(/[^a-z0-9]/g, ''), r.type.toLowerCase()],
        pdfAvailable: true,
      }));
  }, [dbResources]);

  // Notes uploaded by the current logged-in user
  const myUploadsCount = useMemo(() => {
    if (!session?.user?.id) return 0;
    return dbResources.filter((r) => r.uploader.id === session.user.id).length;
  }, [dbResources, session?.user?.id]);

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Scholar';

  return (
    <div className="space-y-10">
      {/* WARM SCHOLARLY WELCOME BANNER */}
      <div className="bg-[#242220] text-[#FAF7F2] p-8 rounded-2xl border border-[#3A3632] shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-xs font-medium text-[#FAF7F2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
            <span>Academic Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#FAF7F2]">
            Welcome back, {firstName}.
          </h2>
          <p className="text-[#B8B0A2] text-xs sm:text-sm leading-relaxed font-sans">
            There are currently{' '}
            <span className="text-[#FAF7F2] font-semibold underline underline-offset-4 decoration-[#D4A359]">
              {noteItems.length} verified lecture folios
            </span>{' '}
            catalogued across {dbSubjects.length} academic courses in the database.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsAIAssistantOpen(true)}
            className="text-xs font-medium bg-[#FAF7F2]/10 text-[#FAF7F2] border-[#FAF7F2]/30 hover:bg-[#FAF7F2]/20 hover:border-[#FAF7F2]"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-[#D4A359]" /> AI Study Assistant
          </Button>
          <Link href="/upload">
            <Button variant="yellow" size="md" className="text-xs font-medium">
              <Upload className="w-4 h-4 mr-1.5" /> Upload Folio
            </Button>
          </Link>
          <Link href="/notes">
            <Button
              variant="outline"
              size="md"
              className="text-xs font-medium bg-transparent text-[#FAF7F2] border-[#FAF7F2]/30 hover:bg-[#FAF7F2]/10 hover:border-[#FAF7F2]"
            >
              Browse Archives
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS & SUMMARY STRIP: 100% Calculated From Real Neon Records */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Catalogued */}
        <div className="bg-white p-5 rounded-xl border border-[#E5DDD2] shadow-soft flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#E5DDD2] flex items-center justify-center text-[#2D2A26] shadow-soft-xs shrink-0">
            <BookOpen className="w-5 h-5 text-[#5A554E]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A756D]">Catalogued</p>
            <p className="text-2xl font-serif font-bold text-[#23211F]">
              {loading ? '—' : noteItems.length}
            </p>
          </div>
        </div>

        {/* Stat 2: User's Uploads */}
        <div className="bg-white p-5 rounded-xl border border-[#E5DDD2] shadow-soft flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#E5DDD2] flex items-center justify-center text-[#D4A359] shadow-soft-xs shrink-0">
            <FileText className="w-5 h-5 text-[#D4A359]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A756D]">My Uploads</p>
            <p className="text-2xl font-serif font-bold text-[#23211F]">
              {loading ? '—' : myUploadsCount}
            </p>
          </div>
        </div>

        {/* Stat 3: Saved Folios */}
        <div className="bg-white p-5 rounded-xl border border-[#E5DDD2] shadow-soft flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#E5DDD2] flex items-center justify-center text-[#334D6E] shadow-soft-xs shrink-0">
            <Bookmark className="w-5 h-5 fill-[#334D6E]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A756D]">Saved Folios</p>
            <p className="text-2xl font-serif font-bold text-[#23211F]">
              {loading ? '—' : savedCount}
            </p>
          </div>
        </div>

        {/* Stat 4: Active Channels */}
        <div className="bg-white p-5 rounded-xl border border-[#E5DDD2] shadow-soft flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#E5DDD2] flex items-center justify-center text-[#2D5A3A] shadow-soft-xs shrink-0">
            <Layers className="w-5 h-5 text-[#2D5A3A]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A756D]">Channels</p>
            <p className="text-2xl font-serif font-bold text-[#23211F]">
              {loading ? '—' : `${dbSubjects.length} Courses`}
            </p>
          </div>
        </div>
      </div>

      {/* ENROLLED COURSES INDEX: Genuine Subjects from Neon */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DDD2] pb-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#23211F]">Academic Course Channels</h3>
            <p className="text-xs text-[#7A756D]">Verified course directories in Neon PostgreSQL</p>
          </div>
          <Link
            href="/notes"
            className="text-xs font-semibold text-[#5A554E] hover:text-[#23211F] flex items-center gap-1 transition-colors"
          >
            Full Library <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : dbSubjects.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#E5DDD2] text-center space-y-2">
            <p className="text-sm font-semibold text-stone-800">No course channels registered yet</p>
            <p className="text-xs text-stone-500">Course subjects will appear once added to the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dbSubjects.slice(0, 3).map((subject) => (
              <div
                key={subject.id}
                className="bg-white p-6 rounded-xl border border-[#E5DDD2] shadow-soft hover:shadow-soft-md hover:border-[#D5C9BA] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#FAF7F2] text-[#2D2A26] border border-[#E5DDD2]">
                    {subject.code || 'GEN'}
                  </span>
                  <span className="text-xs font-mono text-[#7A756D]">
                    {typeof subject.noteCount === 'number' ? `${subject.noteCount} resources` : 'Course'}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-serif font-bold text-[#23211F]">{subject.name}</h4>
                  <p className="text-xs text-[#7A756D] mt-1">
                    {subject.description || 'Course lecture repository'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5DDD2] flex justify-between items-center text-xs">
                  <Link
                    href={`/notes?subject=${encodeURIComponent(subject.name)}`}
                    className="font-medium text-[#5A554E] hover:text-[#23211F] flex items-center gap-1 transition-colors"
                  >
                    View Subject Folios <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENTLY CATALOGUED NOTES GALLERY: Genuine Notes from Neon */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DDD2] pb-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#23211F]">Recently Catalogued Folios</h3>
            <p className="text-xs text-[#7A756D]">Latest handwritten study guides from your cohort</p>
          </div>
          <Link href="/notes">
            <Button variant="outline" size="sm" className="text-xs">
              Complete Archive
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-2 max-w-md mx-auto">
            <AlertCircle className="w-5 h-5 text-rose-600 mx-auto" />
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        ) : noteItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DDD2] p-12 text-center space-y-3 shadow-soft max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-[#7A756D] flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-serif font-bold text-[#23211F]">No Lecture Folios Catalogued Yet</h4>
            <p className="text-xs text-[#7A756D]">
              Be the first to upload lecture notes or problem set guides to this workspace.
            </p>
            <Link href="/upload" className="inline-block pt-2">
              <Button variant="primary" size="sm">
                Upload First Note
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noteItems.slice(0, 6).map((note) => (
              <NoteCard key={note.id} note={note} onSelect={(n) => setSelectedNote(n)} />
            ))}
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />

      {/* Standalone AI Study Assistant Modal */}
      <AIStudyAssistantModal isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
    </div>
  );
}
