'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NoteItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Star, Bookmark, Calendar, Eye, Layers, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface NoteCardProps {
  note: NoteItem;
  onSelect?: (note: NoteItem) => void;
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onSelect, className = '' }) => {
  const [starred, setStarred] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [stars, setStars] = useState(note.starCount);

  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (starred) {
      setStarred(false);
      setStars((prev) => prev - 1);
    } else {
      setStarred(true);
      setStars((prev) => prev + 1);
    }
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(note)}
      className={`group bg-white rounded-xl border border-[#E5DDD2] shadow-soft hover:shadow-soft-md hover:border-[#D5C9BA] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${className}`}
    >
      {/* Note Image / Folio Preview Header */}
      <div className="relative aspect-[16/10] bg-[#FAF7F2] overflow-hidden border-b border-[#E5DDD2]">
        {!note.thumbnailUrl || note.thumbnailUrl.endsWith('.pdf') ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F3EE] p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#D5C9BA] shadow-soft-xs flex items-center justify-center text-[#2D2A26] mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-[#8A8275]" />
            </div>
            <p className="text-xs font-serif font-bold text-[#23211F] line-clamp-1">{note.courseCode}</p>
            <p className="text-[10px] text-[#7A756D] line-clamp-1">{note.topic || note.subject}</p>
          </div>
        ) : (
          <Image
            src={note.thumbnailUrl}
            alt={note.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
        )}
        <div className="absolute inset-0 bg-[#23211F]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3 backdrop-blur-[1px]">
          <span className="text-xs font-medium text-[#23211F] bg-[#FAF7F2] border border-[#D5C9BA] shadow-soft-xs px-2.5 py-1 rounded flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#5A554E]" /> Read Folio
          </span>
          {note.pages.length > 1 && (
            <span className="text-xs font-medium text-[#FAF7F2] bg-[#23211F]/90 px-2 py-0.5 rounded flex items-center gap-1">
              <Layers className="w-3 h-3" /> {note.pages.length} Pages
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="subject" subject={note.subject}>
            {note.courseCode}
          </Badge>
          {note.pdfAvailable && (
            <span className="bg-[#2D2A26] text-[#FAF7F2] text-[10px] font-medium tracking-wider px-2 py-0.5 rounded shadow-soft-xs">
              PDF
            </span>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7A756D] mb-1.5">
            <span className="font-medium text-[#2D2A26]">{note.subject}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Calendar className="w-3 h-3 text-[#9A9388]" />
              {formatDate(note.lectureDate)}
            </span>
          </div>

          <h3 className="text-base font-serif font-bold text-[#23211F] group-hover:text-[#C86D51] transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h3>

          <p className="mt-1.5 text-xs text-[#5A554E] line-clamp-2 leading-relaxed">
            {note.summary}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] font-mono text-[#6A655E] bg-[#FAF7F2] border border-[#E8E1D5] px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer info & Actions */}
        <div className="pt-3.5 border-t border-[#E5DDD2] flex items-center justify-between">
          <Link
            href={`/profile/${note.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 group/author"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#D5C9BA]">
              <Image
                src={note.author.avatar}
                alt={note.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-[#23211F] group-hover/author:underline truncate max-w-[100px]">
              {note.author.name.split(' ')[0]}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleStar}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-all duration-150 font-medium ${
                starred
                  ? 'bg-[#F5EDE0] text-[#7A4B1A] border-[#D4A359] shadow-soft-xs'
                  : 'bg-white text-[#5A554E] border-[#E5DDD2] hover:bg-[#FAF7F2] hover:text-[#23211F]'
              }`}
              title="Star note"
            >
              <Star className={`w-3.5 h-3.5 ${starred ? 'fill-[#D4A359] text-[#D4A359]' : ''}`} />
              <span>{stars}</span>
            </button>

            <button
              onClick={toggleBookmark}
              className={`p-1.5 rounded border transition-all duration-150 ${
                bookmarked
                  ? 'bg-[#EEF1F6] text-[#334D6E] border-[#A8B8D0] shadow-soft-xs'
                  : 'bg-white text-[#5A554E] border-[#E5DDD2] hover:bg-[#FAF7F2] hover:text-[#23211F]'
              }`}
              title="Bookmark note"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#334D6E] text-[#334D6E]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
