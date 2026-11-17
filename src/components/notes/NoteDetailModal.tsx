'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { NoteItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Dynamically lazy-load AI Study Assistant to prevent loading heavy AI bundle until requested
const AIStudyAssistantModal = dynamic(
  () => import('@/components/ai/AIStudyAssistantModal').then((mod) => mod.AIStudyAssistantModal),
  { ssr: false }
);
import { X, Star, Bookmark, Download, Share2, Calendar, Check, Sparkles, Loader2, FileText, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface NoteDetailModalProps {
  note: NoteItem | null;
  onClose: () => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ note, onClose }) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!note) return null;

  const activePage = note.pages[activePageIndex] || note.pages[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBookmark = async () => {
    if (!note?.id || isBookmarking) return;
    setIsBookmarking(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: note.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/resources/${note.id}/download`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setDownloadError(errData.error || 'Failed to generate download link.');
        setIsDownloading(false);
        return;
      }
      const data = await res.json();
      if (data.downloadUrl) {
        // Trigger browser download via signed URL
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = data.fileName || `${note.title}.pdf`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setDownloadError('No download URL returned by server.');
      }
    } catch {
      setDownloadError('Network error while requesting download.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#23211F]/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="relative bg-white rounded-2xl border border-[#D5C9BA] shadow-soft-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-[#E5DDD2] flex items-center justify-between bg-[#F4EFEA]">
            <div className="flex items-center gap-3">
              <Badge variant="subject" subject={note.subject}>
                {note.courseCode}
              </Badge>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#23211F] line-clamp-1">{note.title}</h2>
                <p className="text-xs text-[#7A756D] flex items-center gap-2">
                  <span>{note.topic}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#9A9388]" /> Date: {formatDate(note.lectureDate)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* AI Study Assistant Trigger Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                className="text-xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>Study Assistant</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-xs font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Share'}
              </Button>

              {note.pdfAvailable && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="text-xs font-medium"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>{isDownloading ? 'Signing...' : 'Download PDF'}</span>
                </Button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[#D5C9BA] bg-white hover:bg-[#FAF7F2] text-[#5A554E] hover:text-[#23211F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Download Error Alert if any */}
          {downloadError && (
            <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{downloadError}</span>
            </div>
          )}

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#E5DDD2]">
            {/* Note Page Preview Box */}
            <div className="lg:col-span-2 p-6 bg-[#FAF7F2] flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-full max-w-lg aspect-[3/4] bg-white rounded-xl shadow-soft-md border border-[#D5C9BA] overflow-hidden">
                <Image
                  src={activePage.imageUrl}
                  alt={`Page ${activePage.pageNumber}`}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Page pagination if multiple */}
              {note.pages.length > 1 && (
                <div className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#E5DDD2] shadow-soft-xs">
                  <span className="text-xs text-[#7A756D] font-medium mr-1">Pages:</span>
                  {note.pages.map((page, idx) => (
                    <button
                      key={page.id}
                      onClick={() => setActivePageIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium border transition-all ${
                        idx === activePageIndex
                          ? 'bg-[#2D2A26] text-[#FAF7F2] border-[#2D2A26] shadow-soft-xs'
                          : 'bg-[#FAF7F2] text-[#5A554E] border-[#E5DDD2] hover:bg-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {activePage.caption && (
                <p className="mt-3 text-xs text-[#5A554E] bg-white px-3.5 py-1.5 rounded-lg border border-[#E5DDD2] text-center font-sans shadow-soft-xs">
                  <strong className="text-[#23211F]">Note:</strong> {activePage.caption}
                </p>
              )}
            </div>

            {/* Details Sidebar */}
            <div className="p-6 space-y-6 flex flex-col justify-between bg-white">
              <div className="space-y-5">
                {/* Author info card */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DDD2] shadow-soft-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#D5C9BA]">
                      <Image
                        src={note.author.avatar}
                        alt={note.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/profile/${note.author.username}`}
                        className="text-xs font-semibold text-[#23211F] hover:underline block"
                      >
                        {note.author.name}
                      </Link>
                      <p className="text-[11px] text-[#7A756D]">{note.author.university} • {note.author.graduationYear}</p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A756D] mb-2">
                    Lecture Summary
                  </h4>
                  <p className="text-xs text-[#5A554E] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DDD2]">
                    {note.summary}
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A756D] mb-2">
                    Topic Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono text-[#5A554E] bg-[#FAF7F2] border border-[#E5DDD2] px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#E5DDD2] flex gap-2">
                <Button
                  variant={starred ? 'yellow' : 'outline'}
                  className="flex-1 text-xs"
                  onClick={() => setStarred(!starred)}
                >
                  <Star className={`w-3.5 h-3.5 mr-1 ${starred ? 'fill-[#D4A359] text-[#D4A359]' : ''}`} />
                  {starred ? 'Starred' : 'Star Folio'}
                </Button>
                <Button
                  variant={bookmarked ? 'primary' : 'outline'}
                  className="flex-1 text-xs"
                  disabled={isBookmarking}
                  onClick={handleToggleBookmark}
                >
                  <Bookmark className={`w-3.5 h-3.5 mr-1 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Saved to Library' : 'Save Folio'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIStudyAssistantModal
        note={note}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
};
