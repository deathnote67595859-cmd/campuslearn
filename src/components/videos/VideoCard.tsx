'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Calendar, User, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { SubjectCategory } from '@/types';

export interface VideoResource {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  youtubeVideoId: string | null;
  thumbnailUrl: string;
  topic: string;
  courseCode: string;
  subject: string;
  subjectId: string;
  subjectColor: string | null;
  viewCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
  uploader: {
    id: string;
    name: string;
    username: string;
    role: string;
    avatar: string;
    university: string;
    major: string;
  };
}

interface VideoCardProps {
  video: VideoResource;
  onSelect: (video: VideoResource) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(video)}
      className="bg-white rounded-2xl border border-[#E5DDD2] overflow-hidden shadow-soft hover:shadow-soft-md hover:border-[#D5C9BA] transition-all duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Video Thumbnail with 16:9 Aspect Ratio and Play Overlay */}
        <div className="relative aspect-video w-full bg-[#23211F] overflow-hidden">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <Badge variant="subject" subject={video.subject as SubjectCategory}>
              {video.courseCode}
            </Badge>
            <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border border-white/20">
              YouTube Embed
            </span>
          </div>

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#C86D51] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#b05d43] transition-all duration-200">
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            </div>
          </div>

          {/* Bottom tag on thumbnail */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
            <span className="text-[11px] font-medium truncate max-w-[80%] drop-shadow-sm">
              {video.topic}
            </span>
            {video.viewCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-white/80">
                <Eye className="w-3 h-3" /> {video.viewCount}
              </span>
            )}
          </div>
        </div>

        {/* Video Details */}
        <div className="p-4.5 space-y-2.5">
          <h3 className="text-sm font-serif font-bold text-[#23211F] group-hover:text-[#C86D51] transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>

          <p className="text-xs text-[#7A756D] line-clamp-2 leading-relaxed">
            {video.description || 'Curated educational video lecture from your university syllabus.'}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4.5 py-3 border-t border-[#F0EAE1] bg-[#FAF8F5] flex items-center justify-between text-xs text-[#7A756D]">
        {/* Uploader */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#D5C9BA] shrink-0 bg-stone-200">
            <Image
              src={video.uploader.avatar}
              alt={video.uploader.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 truncate">
            <span className="font-medium text-[#23211F] truncate block text-[11px]">
              {video.uploader.name}
            </span>
          </div>
          {video.uploader.role !== 'STUDENT' && (
            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              {video.uploader.role === 'TEACHER' ? 'Faculty' : 'Admin'}
            </span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#9A9388] shrink-0">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(video.createdAt.split('T')[0])}</span>
        </div>
      </div>
    </div>
  );
};

