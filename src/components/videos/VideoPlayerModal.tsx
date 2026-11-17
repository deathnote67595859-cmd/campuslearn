'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ExternalLink, Calendar, AlertCircle, Share2, Check, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { VideoResource } from './VideoCard';
import { SubjectCategory } from '@/types';

interface VideoPlayerModalProps {
  video: VideoResource | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  if (!video) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(video.videoUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedUrl = video.youtubeVideoId ? getYouTubeEmbedUrl(video.youtubeVideoId) : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#23211F]/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl border border-[#D5C9BA] shadow-soft-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#E5DDD2] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <Badge variant="subject" subject={video.subject as SubjectCategory}>
              {video.courseCode}
            </Badge>
            <div className="min-w-0">
              <h2 className="text-base font-serif font-bold text-[#23211F] truncate">
                {video.title}
              </h2>
              <p className="text-xs text-[#7A756D] flex items-center gap-2">
                <span>{video.topic}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-[#9A9388]" />
                  {formatDate(video.createdAt.split('T')[0])}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs font-medium"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              ) : (
                <Share2 className="w-3.5 h-3.5 mr-1" />
              )}
              {copied ? 'Copied' : 'Share'}
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#D5C9BA] bg-white hover:bg-[#FAF7F2] text-[#5A554E] hover:text-[#23211F] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player Frame Container */}
          <div className="bg-black relative aspect-video w-full flex items-center justify-center">
            {video.youtubeVideoId && !embedError ? (
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setEmbedError(true)}
              />
            ) : (
              /* Fallback state when video ID is missing or embedding is restricted */
              <div className="p-8 text-center text-stone-300 max-w-md space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-sm font-semibold text-white">Video Embed Unavailable</h3>
                <p className="text-xs text-stone-400">
                  This YouTube video cannot be embedded directly in the browser player, or the URL format is invalid.
                </p>
                {video.videoUrl && (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C86D51] text-white text-xs font-medium hover:bg-[#b05d43] transition-colors mt-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Video Details Section */}
          <div className="p-6 space-y-5 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#23211F]">{video.title}</h3>
                <p className="text-xs text-[#7A756D] flex items-center gap-2">
                  <span className="font-semibold text-[#C86D51]">{video.subject}</span>
                  <span>•</span>
                  <span>{video.topic}</span>
                </p>
              </div>

              {/* YouTube external link button (for accessibility / fallback) */}
              {video.videoUrl && (
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5C9BA] text-xs font-medium text-[#5A554E] hover:text-[#23211F] hover:bg-[#FAF8F5] transition-colors shrink-0 self-start sm:self-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C86D51]" />
                  <span>Open in YouTube</span>
                </a>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
                Lecture Overview & Topics Covered
              </h4>
              <p className="text-xs text-[#5A554E] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DDD2] whitespace-pre-line">
                {video.description || 'No lecture description provided for this video resource.'}
              </p>
            </div>

            {/* Faculty / Contributor Info */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D5C9BA] bg-stone-200">
                  <Image
                    src={video.uploader.avatar}
                    alt={video.uploader.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#23211F]">
                      {video.uploader.name}
                    </span>
                    {video.uploader.role !== 'STUDENT' && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        {video.uploader.role === 'TEACHER' ? 'Faculty Instructor' : 'Administrator'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A756D]">
                    {video.uploader.university} • {video.uploader.major}
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-[#9A9388]">
                <span>Added on {formatDate(video.createdAt.split('T')[0])}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

