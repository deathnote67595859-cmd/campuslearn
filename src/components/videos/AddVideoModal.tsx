'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Video, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/lib/youtube';

interface SubjectOption {
  id: string;
  name: string;
  code: string | null;
}

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableSubjects: SubjectOption[];
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableSubjects,
}) => {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [subjectName, setSubjectName] = useState(availableSubjects[0]?.name || '');
  const [customSubject, setCustomSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live video ID and thumbnail preview
  const detectedVideoId = useMemo(() => {
    return extractYouTubeVideoId(youtubeUrl);
  }, [youtubeUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalSubject = subjectName === 'NEW' ? customSubject.trim() : subjectName.trim();

    if (!title.trim() || title.trim().length < 3) {
      setError('Please provide a descriptive video title (minimum 3 characters).');
      return;
    }

    if (!finalSubject) {
      setError('Please select or specify a course subject.');
      return;
    }

    if (!detectedVideoId) {
      setError('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          youtubeUrl: youtubeUrl.trim(),
          subjectName: finalSubject,
          courseCode: courseCode.trim() || undefined,
          topic: topic.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add video lecture.');
        setLoading(false);
        return;
      }

      // Reset form and notify parent
      setTitle('');
      setYoutubeUrl('');
      setDescription('');
      setTopic('');
      setCourseCode('');
      setCustomSubject('');
      onSuccess();
      onClose();
    } catch {
      setError('Network error while saving video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#23211F]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl border border-[#D5C9BA] shadow-soft-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DDD2] flex items-center justify-between bg-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C86D51] text-white flex items-center justify-center shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#23211F]">
                Add Educational Video Lecture
              </h2>
              <p className="text-xs text-[#7A756D]">
                Catalog a verified YouTube video directly into the CampusLearn Library.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#D5C9BA] bg-white hover:bg-[#FAF7F2] text-[#5A554E] hover:text-[#23211F] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* YouTube URL input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
              YouTube Video Link <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
            <p className="text-[11px] text-[#9A9388]">
              Supports standard YouTube links, shortened youtu.be links, or 11-character video IDs.
            </p>

            {/* Live Video Detection & Preview */}
            {detectedVideoId && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-emerald-200 flex items-center gap-3 mt-2 animate-in fade-in duration-150">
                <div className="relative w-20 aspect-video rounded-lg overflow-hidden border border-[#D5C9BA] shrink-0 bg-black">
                  <Image
                    src={getYouTubeThumbnail(detectedVideoId)}
                    alt="Detected Video Thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Valid YouTube video detected</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#7A756D] truncate">
                    Video ID: {detectedVideoId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
              Video Title <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. CS106B Lecture 12: Binary Search Trees"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Subject & Course Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
                Course Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#D5C9BA] bg-white px-3 py-2.5 text-[#23211F] focus:outline-hidden focus:ring-2 focus:ring-[#C86D51]"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
                <option value="NEW">+ Create New Subject...</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
                Course Code
              </label>
              <Input
                type="text"
                placeholder="e.g. CS 106B"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>
          </div>

          {/* Custom Subject field if '+ Create New Subject' chosen */}
          {subjectName === 'NEW' && (
            <div className="space-y-1.5 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <label className="block text-xs font-semibold text-amber-900">
                New Subject Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Robotics & Controls"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                required
              />
            </div>
          )}

          {/* Lecture Topic */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
              Topic or Lecture Unit
            </label>
            <Input
              type="text"
              placeholder="e.g. Tree Traversal & Balancing"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Lecture Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A756D]">
              Overview & Topics Covered
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of what students will learn from this lecture recording..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#D5C9BA] bg-white p-3 text-[#23211F] focus:outline-hidden focus:ring-2 focus:ring-[#C86D51]"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-[#E5DDD2] flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving Video...
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 mr-1.5" /> Publish to Library
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

