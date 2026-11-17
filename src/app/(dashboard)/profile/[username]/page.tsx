'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDetailModal } from '@/components/notes/NoteDetailModal';
import { Button } from '@/components/ui/Button';
import { NoteItem, SubjectCategory } from '@/types';
import {
  GraduationCap,
  Building2,
  Calendar,
  BookOpen,
  Share2,
  Check,
  Globe,
  Layers,
  Github,
  Linkedin,
  AlertCircle,
  Loader2,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

interface UserProfileData {
  id: string;
  name: string;
  username: string;
  email: string | null;
  avatar: string;
  role: string;
  university: string;
  major: string;
  graduationYear: string;
  bio: string;
  isVerified: boolean;
  githubUrl: string;
  linkedinUrl: string;
  joinedDate: string;
  totalNotes: number;
  savedNotesCount: number;
}

interface RawUserResource {
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

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const usernameParam = params?.username as string;

  const [activeTab, setActiveTab] = useState<'published' | 'collections'>('published');
  const [copied, setCopied] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
  const [userResources, setUserResources] = useState<RawUserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If usernameParam is undefined or empty, fallback to current user's username/id
  const targetUsername = usernameParam || session?.user?.username || session?.user?.id;

  useEffect(() => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/users/${encodeURIComponent(targetUsername)}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'User profile not found.');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProfileUser(data.user);
          setUserResources(data.resources || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load profile.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetUsername]);

  const isSelf =
    Boolean(session?.user?.id && profileUser?.id && session.user.id === profileUser.id) ||
    Boolean(session?.user?.username && profileUser?.username && session.user.username === profileUser.username);

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert raw resources to NoteItem format
  const userNotes: NoteItem[] = useMemo(() => {
    return userResources.map((r) => ({
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
          caption: r.videoUrl ? `Video: ${r.videoUrl}` : r.title,
        },
      ],
      starCount: r.bookmarkCount,
      bookmarkCount: r.bookmarkCount,
      viewsCount: r.viewCount,
      isPublic: true,
      summary: r.description,
      tags: [r.subject.toLowerCase().replace(/[^a-z0-9]/g, ''), r.type.toLowerCase()],
      pdfAvailable: r.type === 'PDF' || r.type === 'NOTE',
    }));
  }, [userResources]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3 shadow-soft max-w-md mx-auto my-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-600">Loading student profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-4 max-w-md mx-auto my-12 shadow-soft">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-serif font-bold text-stone-900">Profile Not Found</h3>
        <p className="text-xs text-stone-500">
          {error || 'No student or faculty profile found with this username.'}
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="text-xs mt-2">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-paper-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-stone-300 shadow-paper-sm shrink-0 bg-stone-100">
              <Image
                src={profileUser.avatar}
                alt={profileUser.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{profileUser.name}</h1>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  @{profileUser.username}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-200">
                  <Globe className="w-3 h-3 text-emerald-600" /> {profileUser.role === 'TEACHER' ? 'Faculty Profile' : 'Student Profile'}
                </span>
                {profileUser.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded border border-amber-200">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {profileUser.university || 'Campus College'}
                </span>
                {profileUser.major && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                      {profileUser.major} {profileUser.graduationYear ? `(${profileUser.graduationYear})` : ''}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Joined {profileUser.joinedDate}
                </span>
              </div>

              {profileUser.bio ? (
                <p className="text-xs text-stone-600 pt-1 max-w-xl leading-relaxed">
                  {profileUser.bio}
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic pt-1">
                  No academic bio provided yet.
                </p>
              )}

              {/* Social links if configured */}
              {(profileUser.githubUrl || profileUser.linkedinUrl) && (
                <div className="flex items-center gap-3 pt-2">
                  {profileUser.githubUrl && (
                    <a
                      href={profileUser.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-800 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profileUser.linkedinUrl && (
                    <a
                      href={profileUser.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-800 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleCopyShare}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied' : 'Share Profile'}
            </Button>
            {isSelf && (
              <Link href="/upload">
                <Button variant="primary" size="sm">
                  Upload Folio
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats strip - 100% genuine database counts */}
        <div className="pt-6 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-2 gap-4 text-center sm:text-left">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <p className="text-xs text-stone-500 font-medium">Published Note Guides</p>
            <p className="text-xl font-bold text-stone-900 mt-0.5">{profileUser.totalNotes}</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <p className="text-xs text-stone-500 font-medium">Saved Bookmarks</p>
            <p className="text-xl font-bold text-stone-900 mt-0.5">{profileUser.savedNotesCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-stone-200 flex gap-6">
        <button
          onClick={() => setActiveTab('published')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'published'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Public Notes ({userNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'collections'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Curated Collections
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'published' ? (
        userNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200 text-stone-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-800">No public notes uploaded yet</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Educational notes uploaded by this student to Neon will be listed here once published.
            </p>
            {isSelf && (
              <Link href="/upload" className="inline-block pt-2">
                <Button variant="primary" size="sm">
                  Upload First Folio
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNotes.map((note) => (
              <NoteCard key={note.id} note={note} onSelect={(n) => setSelectedNote(n)} />
            ))}
          </div>
        )
      ) : (
        /* Curated Collections Tab: Genuine empty state */
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200 text-stone-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-stone-800">No curated collections created yet</p>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Thematic study guides and grouped course packets will appear here once compiled.
          </p>
        </div>
      )}

      {/* Note Detail Modal */}
      <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </div>
  );
}
