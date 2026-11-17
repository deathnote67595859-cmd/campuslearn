'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Video,
  Search,
  Plus,
  RefreshCw,
  SearchX,
  AlertCircle,
  Filter,
  Grid,
  List,
  Sparkles,
  PlaySquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VideoCard, VideoResource } from '@/components/videos/VideoCard';
import { getCachedOrFetchVideos, invalidateVideoCache } from '@/lib/data-cache';

// Dynamically lazy-load modals to optimize initial client bundle
const VideoPlayerModal = dynamic(
  () => import('@/components/videos/VideoPlayerModal').then((mod) => mod.VideoPlayerModal),
  { ssr: false }
);

const AddVideoModal = dynamic(
  () => import('@/components/videos/AddVideoModal').then((mod) => mod.AddVideoModal),
  { ssr: false }
);

interface SubjectOption {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
}

function VideoLibraryContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'All';

  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check role: Only TEACHER or ADMIN can add videos
  const userRole = session?.user?.role;
  const canAddVideos = userRole === 'TEACHER' || userRole === 'ADMIN';

  // Fetch real videos from Neon PostgreSQL API (with memory cache & request deduplication)
  const fetchVideos = async (forceRefresh: boolean = false) => {
    if (videos.length === 0 || forceRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getCachedOrFetchVideos(forceRefresh);
      setVideos(data.videos || []);
      setSubjects(data.subjects || []);
    } catch (err: any) {
      if (videos.length === 0) {
        setError(err.message || 'Failed to fetch video resources from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(false);
  }, []);

  // Update selected subject if query param changes
  useEffect(() => {
    if (initialSubject && initialSubject !== selectedSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  // Unique list of subject names for category filter buttons
  const availableSubjectNames = useMemo(() => {
    const names = new Set<string>();
    subjects.forEach((s) => names.add(s.name));
    videos.forEach((v) => names.add(v.subject));
    return ['All', ...Array.from(names)];
  }, [subjects, videos]);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Subject Filter
    if (selectedSubject !== 'All') {
      result = result.filter(
        (v) => v.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.subject.toLowerCase().includes(q) ||
          v.topic.toLowerCase().includes(q) ||
          v.courseCode.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.uploader.name.toLowerCase().includes(q)
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'popular') {
        return b.viewCount - a.viewCount;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [videos, selectedSubject, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b border-[#E5DDD2] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#FAF7F2] border border-[#D5C9BA] text-[#C86D51]">
              <Video className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756D]">
              Verified Educational Media
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#23211F] tracking-tight">
            Curated Video Lecture Library
          </h1>
          <p className="text-xs text-[#7A756D] mt-1">
            Watch syllabus-aligned lectures, seminar recordings, and walkthroughs embedded inside CampusLearn.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchVideos(true)}
            disabled={loading}
            className="text-xs"
            title="Refresh video list"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Add Video Button (TEACHER & ADMIN only) */}
          {canAddVideos && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Video Lecture
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DDD2] shadow-soft space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9388]" />
            <input
              type="text"
              placeholder="Search lectures by topic, title, course code (e.g. CS 106B, Recursion)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#D5C9BA] bg-[#FAF8F5] pl-9.5 pr-4 py-2.5 text-[#23211F] placeholder-[#9A9388] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C86D51] transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <span className="text-xs text-[#7A756D] font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-xl border border-[#D5C9BA] bg-white px-3 py-2 text-[#23211F] focus:outline-hidden focus:ring-2 focus:ring-[#C86D51]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="popular">Most Viewed</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#FAF8F5] border border-[#D5C9BA] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-soft-xs text-[#23211F]'
                    : 'text-[#9A9388] hover:text-[#23211F]'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-soft-xs text-[#23211F]'
                    : 'text-[#9A9388] hover:text-[#23211F]'
                }`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A756D] mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Subject:
          </span>
          {availableSubjectNames.map((subjectName) => (
            <button
              key={subjectName}
              onClick={() => setSelectedSubject(subjectName)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all text-xs ${
                selectedSubject === subjectName
                  ? 'bg-[#23211F] text-white shadow-soft-xs'
                  : 'bg-[#FAF8F5] text-[#5A554E] hover:bg-[#F0EAE1] border border-[#E5DDD2]'
              }`}
            >
              {subjectName}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-[#7A756D] px-1">
        <span>
          Showing <strong className="text-[#23211F]">{filteredVideos.length}</strong> video lectures
          {selectedSubject !== 'All' && ` in ${selectedSubject}`}
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#C86D51] underline font-medium hover:text-[#b05d43]"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Content States */}
      {loading ? (
        /* Loading State */
        <div className="bg-white rounded-2xl border border-[#E5DDD2] p-16 text-center space-y-3 shadow-soft max-w-md mx-auto my-6">
          <div className="w-9 h-9 border-3 border-[#C86D51] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-sm font-serif font-semibold text-[#23211F]">
            Connecting to Video Library...
          </h3>
          <p className="text-xs text-[#7A756D]">Retrieving verified lecture recordings from Neon database.</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-3 shadow-soft max-w-md mx-auto my-6">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#23211F]">Unable to load Video Library</h3>
          <p className="text-xs text-[#7A756D]">{error}</p>
          <Button variant="primary" size="sm" onClick={() => fetchVideos()} className="text-xs mt-2">
            Try Again
          </Button>
        </div>
      ) : filteredVideos.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#E5DDD2] p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-soft">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-[#7A756D] flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-[#23211F]">
              {videos.length === 0 ? 'No video lectures catalogued yet' : 'No matching lectures found'}
            </h3>
            <p className="text-xs text-[#7A756D] leading-relaxed">
              {videos.length === 0
                ? 'The video lecture archive is currently empty. Faculty instructors can add YouTube video lessons to this catalog.'
                : `We couldn't find any video lectures matching "${searchQuery}". Try adjusting your keywords or subject filter.`}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {videos.length > 0 && (
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
            {canAddVideos && (
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Lecture Video
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={(v) => setSelectedVideo(v)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="bg-white rounded-xl border border-[#E5DDD2] p-4 shadow-soft hover:shadow-soft-md hover:border-[#D5C9BA] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-28 aspect-video rounded-lg bg-black overflow-hidden border border-[#D5C9BA] shrink-0">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-[#C86D51] text-white flex items-center justify-center shadow-md">
                      <PlaySquare className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#D5C9BA] text-[#23211F]">
                      {video.courseCode}
                    </span>
                    <span className="text-xs text-[#7A756D]">{video.subject}</span>
                    <span>•</span>
                    <span className="text-xs text-[#7A756D]">{video.topic}</span>
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#23211F] group-hover:text-[#C86D51] transition-colors truncate">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[#5A554E] truncate max-w-xl">
                    {video.description || 'Verified educational video lecture.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  Watch Lecture
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Add Video Modal (Teachers/Admins) */}
      <AddVideoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          invalidateVideoCache();
          fetchVideos(true);
        }}
        availableSubjects={subjects}
      />
    </div>
  );
}

export default function VideoLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-stone-500 text-sm">Loading video library...</div>
      }
    >
      <VideoLibraryContent />
    </Suspense>
  );
}

