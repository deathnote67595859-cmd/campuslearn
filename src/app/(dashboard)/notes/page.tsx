'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { FilterBar } from '@/components/notes/FilterBar';
import { NoteCard } from '@/components/notes/NoteCard';
import { getCachedOrFetchResources } from '@/lib/data-cache';

// Dynamically lazy-load modal to reduce initial bundle size
const NoteDetailModal = dynamic(
  () => import('@/components/notes/NoteDetailModal').then((mod) => mod.NoteDetailModal),
  { ssr: false }
);
import { NoteItem, SubjectCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Star, SearchX, Upload, AlertCircle, RefreshCw, BookOpen, Video, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface DbResource {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'DOCUMENT' | 'VIDEO' | 'NOTE' | 'OTHER';
  fileUrl: string;
  videoUrl: string | null;
  topic: string;
  courseCode: string;
  subject: string;
  subjectCode: string | null;
  subjectColor: string | null;
  isPublic: boolean;
  viewCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
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
}

function NotesLibraryContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'All';

  const [dbResources, setDbResources] = useState<DbResource[]>([]);
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  // Fetch real data from Neon PostgreSQL API (with memory cache & request deduplication)
  const fetchResources = async (forceRefresh: boolean = false) => {
    if (dbResources.length === 0 || forceRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getCachedOrFetchResources(forceRefresh);
      setDbResources(data.resources || []);
      setDbSubjects(data.subjects || []);
    } catch (err: any) {
      if (dbResources.length === 0) {
        setError(err.message || 'Failed to fetch resources from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(false);
  }, []);

  // Sync initial subject if query param changes
  useEffect(() => {
    if (initialSubject && initialSubject !== selectedSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  // Transform database resources into UI NoteItems - strictly lecture notes / folios
  const noteItems: NoteItem[] = useMemo(() => {
    return dbResources
      .filter((r) => r.type === 'NOTE' || r.type === 'PDF' || r.type === 'DOCUMENT')
      .map((r) => {
        const thumbUrl = r.fileUrl || r.uploader.avatar;

        return {
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
          thumbnailUrl: thumbUrl,
          pages: [
            {
              id: `${r.id}-p1`,
              imageUrl: thumbUrl,
              pageNumber: 1,
              caption: r.title,
            },
          ],
          starCount: Math.max(r.bookmarkCount, 0),
          bookmarkCount: r.bookmarkCount,
          viewsCount: r.viewCount,
          isPublic: r.isPublic,
          summary: r.description,
          tags: [
            r.subject.toLowerCase().replace(/[^a-z0-9]/g, ''),
            r.type.toLowerCase(),
            ...(r.topic ? r.topic.toLowerCase().split(' ').slice(0, 2) : []),
          ],
          pdfAvailable: true,
        };
      });
  }, [dbResources]);

  // Extract distinct subject names for filter buttons
  const availableSubjects: SubjectCategory[] = useMemo(() => {
    const set = new Set<SubjectCategory>();
    noteItems.forEach((n) => set.add(n.subject));
    if (set.size > 0) {
      return Array.from(set);
    }
    if (dbSubjects.length > 0) {
      return dbSubjects.map((s) => s.name as SubjectCategory);
    }
    return [];
  }, [dbSubjects, noteItems]);

  // Filter & sort logic
  const filteredNotes = useMemo(() => {
    let result = [...noteItems];

    if (selectedSubject !== 'All') {
      result = result.filter((n) => n.subject === selectedSubject);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q) ||
          n.topic.toLowerCase().includes(q) ||
          n.courseCode.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.summary.toLowerCase().includes(q) ||
          n.author.name.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.lectureDate).getTime() - new Date(b.lectureDate).getTime();
      } else if (sortBy === 'stars') {
        return b.starCount - a.starCount;
      } else if (sortBy === 'popular') {
        return b.viewsCount - a.viewsCount;
      }
      return 0;
    });

    return result;
  }, [noteItems, searchQuery, selectedSubject, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E5DDD2] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#23211F] tracking-tight">Handwritten Lecture Archive</h1>
          <p className="text-xs text-[#7A756D] mt-1">
            Explore catalogued educational resources, lecture guides, and notes directly from your university cohort.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchResources(true)}
            disabled={loading}
            className="text-xs"
            title="Refresh notes from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        subjects={availableSubjects}
      />

      {/* Status Strip */}
      <div className="flex items-center justify-between text-xs text-[#7A756D] px-1">
        <span>
          Showing <strong className="text-[#23211F]">{filteredNotes.length}</strong> study folios
          {selectedSubject !== 'All' && ` in ${selectedSubject}`}
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#2D2A26] underline font-medium hover:text-[#C86D51]"
          >
            Clear Search Filter
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5DDD2] p-16 text-center space-y-3 shadow-soft max-w-md mx-auto my-6">
          <div className="w-9 h-9 border-3 border-[#2D2A26] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-sm font-serif font-semibold text-[#23211F]">Accessing Neon Database...</h3>
          <p className="text-xs text-[#7A756D]">Retrieving verified lecture folios and course channels.</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-3 shadow-soft max-w-md mx-auto my-6">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#23211F]">Unable to load library</h3>
          <p className="text-xs text-[#7A756D]">{error}</p>
          <Button variant="primary" size="sm" onClick={() => fetchResources()} className="text-xs mt-2">
            Try Again
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#E5DDD2] p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-soft">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-[#7A756D] flex items-center justify-center mx-auto">
            {noteItems.length === 0 ? <BookOpen className="w-6 h-6 text-[#8A8275]" /> : <SearchX className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-[#23211F]">
              {noteItems.length === 0 ? 'No study notes uploaded yet' : 'No matching folios found'}
            </h3>
            <p className="text-xs text-[#7A756D] leading-relaxed">
              {noteItems.length === 0
                ? 'The lecture notes archive is waiting for new course contributions. Faculty and educators can upload authentic PDF folios via the upload portal.'
                : `We couldn't find any folios matching "${searchQuery}". Try adjusting your keywords or course filter.`}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {noteItems.length === 0 ? (
              <>
                <Link href="/upload">
                  <Button variant="primary" size="sm">
                    <Upload className="w-3.5 h-3.5 mr-1" /> Contribute Folio
                  </Button>
                </Link>
                <Link href="/videos">
                  <Button variant="outline" size="sm">
                    <Video className="w-3.5 h-3.5 mr-1" /> Browse Video Library
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onSelect={(n) => setSelectedNote(n)} />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="bg-white rounded-xl border border-[#E5DDD2] p-4 shadow-soft hover:shadow-soft-md hover:border-[#D5C9BA] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-20 h-16 rounded-lg bg-[#FAF7F2] overflow-hidden border border-[#D5C9BA] shrink-0">
                  <Image src={note.thumbnailUrl} alt={note.title} fill className="object-cover" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="subject" subject={note.subject}>
                      {note.courseCode}
                    </Badge>
                    <span className="text-xs text-[#7A756D]">{note.topic}</span>
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#23211F] group-hover:text-[#C86D51] transition-colors truncate">
                    {note.title}
                  </h3>
                  <p className="text-xs text-[#5A554E] truncate max-w-xl">
                    {note.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 self-end sm:self-center text-xs text-[#7A756D]">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-[#9A9388]" />
                  {formatDate(note.lectureDate)}
                </span>
                <span className="flex items-center gap-1 font-medium text-[#D4A359]">
                  <Star className="w-3.5 h-3.5 fill-[#D4A359]" />
                  {note.starCount}
                </span>
                <Button variant="ghost" size="sm" className="text-xs">
                  Read Folio
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Detail Modal */}
      <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </div>
  );
}

export default function NotesLibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500 text-sm">Loading notes library...</div>}>
      <NotesLibraryContent />
    </Suspense>
  );
}
