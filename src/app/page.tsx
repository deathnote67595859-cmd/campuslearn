'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDetailModal } from '@/components/notes/NoteDetailModal';
import { NoteItem } from '@/types';
import {
  Camera,
  ArrowRight,
  Star,
  GraduationCap,
  Calendar,
  BookOpen,
  FolderOpen,
} from 'lucide-react';

interface PublicSubject {
  id: string;
  name: string;
  code: string;
  color: string;
  noteCount: number;
}

interface TopContributor {
  name: string;
  username: string;
  avatar: string;
  university: string;
  major: string;
  bio: string;
  totalNotes: number;
}

export default function LandingPage() {
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [featuredNote, setFeaturedNote] = useState<NoteItem | null>(null);
  const [recentNotes, setRecentNotes] = useState<NoteItem[]>([]);
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [topContributor, setTopContributor] = useState<TopContributor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/public/explore')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { featuredNote?: NoteItem; recentNotes?: NoteItem[]; subjects?: PublicSubject[]; topContributor?: TopContributor } | null) => {
        if (isMounted && data) {
          if (data.featuredNote) setFeaturedNote(data.featuredNote);
          if (data.recentNotes) setRecentNotes(data.recentNotes);
          if (data.subjects) setSubjects(data.subjects);
          if (data.topContributor) setTopContributor(data.topContributor);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <LandingNavbar />

      <main className="flex-1">
        {/* Editorial Masthead Hero Section */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#E5DDD2]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* Top academic stamp */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4EFEA] border border-[#D5C9BA] text-xs font-medium text-[#5A554E] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51]"></span>
              <span>University Lecture Archives • Curated by Students</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#23211F] tracking-tight max-w-4xl mx-auto leading-[1.12]">
              Preserve, Organize & Search Your{' '}
              <em className="font-serif italic font-normal text-[#C86D51]">
                Handwritten
              </em>{' '}
              Class Notes.
            </h1>

            <p className="text-base sm:text-lg text-[#5A554E] max-w-2xl mx-auto leading-relaxed font-sans font-normal">
              High-resolution captures of blackboards, notebook pages, and problem set walk-throughs. Organized by course code, topic, and lecture date.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm px-6 py-3">
                  Start Reading Free <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/notes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6 py-3">
                  Explore Public Library
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ASYMMETRIC EDITORIAL SHOWCASE */}
        <section id="featured-archives" className="py-20 md:py-24 bg-white border-b border-[#E5DDD2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DDD2] pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#7A756D]">
                  Curated Collection • Verified Archive
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23211F] mt-2">
                  Featured Study Folios
                </h2>
                <p className="text-sm text-[#7A756D] mt-1">
                  Selected peer notes with diagrams, problem proofs, and lecture annotations.
                </p>
              </div>
              <Link href="/notes">
                <Button variant="outline" size="sm" className="text-xs">
                  View Full Directory →
                </Button>
              </Link>
            </div>

            {/* Asymmetrical 2-Column Editorial Spread */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column (7 of 12 columns): Lead Study Folio Preview */}
              <div className="lg:col-span-7 bg-[#FAF7F2] rounded-2xl border border-[#E5DDD2] p-6 sm:p-8 shadow-soft flex flex-col justify-between space-y-6">
                {featuredNote ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#F5EDE0] text-[#7A4B1A] border border-[#E3D1B8]">
                        Lead Document • {featuredNote.courseCode}
                      </span>
                      <span className="text-xs text-[#7A756D] font-mono">
                        Archived {featuredNote.uploadDate}
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedNote(featuredNote)}
                      className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#D5C9BA] shadow-soft-sm group cursor-pointer bg-stone-100"
                    >
                      <Image
                        src={featuredNote.thumbnailUrl}
                        alt={featuredNote.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-[#23211F]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-[#FAF7F2] text-[#23211F] text-xs font-medium px-4 py-2 rounded-md shadow-soft border border-[#D5C9BA]">
                          Open Folio Reader
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-bold text-[#23211F]">
                        {featuredNote.title}
                      </h3>
                      <p className="text-sm text-[#5A554E] leading-relaxed">
                        {featuredNote.summary || 'Detailed peer study notes covering theoretical models and problem set analysis.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E5DDD2] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D5C9BA]">
                          <Image src={featuredNote.author.avatar} alt="Author" fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#23211F]">{featuredNote.author.name}</p>
                          <p className="text-[11px] text-[#7A756D]">{featuredNote.author.university}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-white border border-[#E5DDD2] px-2.5 py-1 rounded text-[#23211F] flex items-center gap-1 shadow-soft-xs">
                          <Star className="w-3.5 h-3.5 fill-[#D4A359] text-[#D4A359]" /> {featuredNote.starCount} stars
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Clean Empty State when no notes uploaded yet */
                  <div className="py-16 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-[#D5C9BA] text-[#7A756D] flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-serif font-bold text-[#23211F]">Ready for Your First Study Folio</h4>
                      <p className="text-xs text-[#7A756D] max-w-md mx-auto">
                        No peer notes have been uploaded to Neon yet. Sign in and be the first to publish handwritten notes.
                      </p>
                    </div>
                    <Link href="/upload" className="inline-block pt-2">
                      <Button variant="primary" size="sm" className="text-xs">
                        Publish First Note
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column (5 of 12 columns): Stacked Curated Editorial Elements */}
              <div className="lg:col-span-5 space-y-6">
                {/* Section A: Multi-Page Scanner Note */}
                <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DDD2] p-6 shadow-soft space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#D5C9BA] flex items-center justify-center text-[#23211F] shadow-soft-xs">
                      <Camera className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#23211F]">Multi-Page Note Capture</h4>
                      <p className="text-[11px] text-[#7A756D]">Upload, organize, and export verified lecture PDFs</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#5A554E] leading-relaxed">
                    Snap sequential notebook pages during recitation. Easily catalog blackboard diagrams and review lecture materials.
                  </p>
                  <div className="pt-1">
                    <Link href="/upload">
                      <Button variant="secondary" size="sm" className="w-full text-xs">
                        Open Upload Studio →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Section B: Course Channels Index (Genuine Subjects from Neon) */}
                <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DDD2] p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DDD2] pb-2.5">
                    <h4 className="text-sm font-serif font-bold text-[#23211F]">Active Course Channels</h4>
                    <span className="text-[11px] font-mono text-[#7A756D]">
                      {subjects.length} Subjects
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.length === 0 ? (
                      <p className="text-xs text-stone-500 italic">Course channels loading from database...</p>
                    ) : (
                      subjects.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/notes?subject=${encodeURIComponent(sub.name)}`}
                          className="px-3 py-1.5 bg-white border border-[#E5DDD2] rounded-lg text-xs font-medium text-[#23211F] shadow-soft-xs hover:border-[#23211F] transition-all flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51]"></span>
                          <span>{sub.code}: {sub.name}</span>
                          <span className="text-[10px] text-[#7A756D] font-mono">({sub.noteCount})</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Section C: Contributor Dossier (Genuine Contributor from Neon) */}
                <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DDD2] p-6 shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#7A756D]">
                      Peer Contributor
                    </span>
                    <span className="text-[10px] bg-[#EBF2EC] text-[#2D5A3A] border border-[#CCDCCE] px-2 py-0.5 rounded">
                      Verified Scholar
                    </span>
                  </div>
                  {topContributor ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D5C9BA] shrink-0">
                          <Image src={topContributor.avatar} alt="Profile" fill className="object-cover" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-[#23211F]">{topContributor.name}</h5>
                          <p className="text-xs text-[#7A756D]">
                            {topContributor.university} • {topContributor.major}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#5A554E] italic font-serif">
                        &quot;{topContributor.bio}&quot;
                      </p>
                      <Link href={`/profile/${topContributor.username}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs mt-1">
                          View Scholar Profile →
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="py-3 text-center space-y-2">
                      <p className="text-xs text-[#5A554E]">
                        Join your campus cohort in uploading verified lecture guides and handwritten problem walkthroughs.
                      </p>
                      <Link href="/signup">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Create Contributor Account →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fresh Notes Archive Row (Genuine Notes from Neon) */}
        <section id="editorial-curation" className="py-20 md:py-24 bg-[#FAF7F2] border-b border-[#E5DDD2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#7A756D]">
                Recent Additions
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#23211F]">
                Fresh Folios From Campus Lectures
              </h2>
              <p className="text-sm text-[#7A756D]">
                Handwritten course notes and problem set solutions uploaded by students.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-stone-200/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentNotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5DDD2] p-12 text-center space-y-3 max-w-md mx-auto shadow-soft">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-[#7A756D] flex items-center justify-center mx-auto">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#23211F]">No Additional Notes Yet</h4>
                <p className="text-xs text-[#7A756D]">
                  New folios will appear here as classmates publish their lecture notes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recentNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onSelect={(n) => setSelectedNote(n)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Editorial Invitation Colophon CTA */}
        <section className="py-20 bg-[#242220] text-[#FAF7F2]">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 mx-auto flex items-center justify-center text-[#FAF7F2]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#FAF7F2]">
              Organize your semester coursework with care.
            </h2>
            <p className="text-[#B3ABA0] max-w-xl mx-auto text-sm leading-relaxed">
              Join fellow students exchanging legible, indexed study guides for your campus courses.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/signup">
                <Button variant="yellow" size="lg" className="text-sm px-6 py-2.5">
                  Create Student Account
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-sm bg-transparent text-[#FAF7F2] border-[#FAF7F2]/30 hover:bg-[#FAF7F2]/10 hover:border-[#FAF7F2]">
                  Open Workspace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Note Detail Modal */}
      <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </div>
  );
}
