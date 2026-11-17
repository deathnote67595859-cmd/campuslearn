'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getCachedOrFetchResources, invalidateResourceCache } from '@/lib/data-cache';
import {
  Upload,
  FileText,
  X,
  Calendar,
  BookOpen,
  Tag,
  Lock,
  Globe,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  FileCheck,
} from 'lucide-react';

interface SubjectOption {
  id: string;
  name: string;
  code: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('C++');
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>([]);
  const [courseCode, setCourseCode] = useState('CS 106L');
  const [topic, setTopic] = useState('');
  const [lectureDate, setLectureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Status & Validation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // User Role Check: TEACHER or ADMIN required
  const userRole = session?.user?.role;
  const isAuthorizedUploader = userRole === 'TEACHER' || userRole === 'ADMIN';

  // Load existing subjects from database (using cache to prevent duplicate request)
  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await getCachedOrFetchResources();
        if (data && data.subjects && data.subjects.length > 0) {
          setAvailableSubjects(data.subjects);
          const first = data.subjects[0];
          setSubject(first.name);
          if (first.code) setCourseCode(first.code);
        }
      } catch (e) {
        console.error('Failed to load subjects', e);
      }
    }
    loadSubjects();
  }, []);

  // Update courseCode automatically when subject changes
  const handleSubjectChange = (newSubjectName: string) => {
    setSubject(newSubjectName);
    const match = availableSubjects.find((s) => s.name === newSubjectName);
    if (match && match.code) {
      setCourseCode(match.code);
    }
  };

  // Validate and handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Invalid file type. Only PDF documents (.pdf) are permitted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError(`File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto-populate title from clean filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Invalid file format. Please drop a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError(`File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // Handle Real Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a PDF document to upload.';
    }
    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }
    if (!topic.trim()) {
      newErrors.topic = 'Topic name is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isAuthorizedUploader) {
      setGeneralError('Only TEACHER or ADMIN accounts have upload permissions.');
      return;
    }

    setErrors({});
    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', selectedFile!);
    formData.append('title', title.trim());
    formData.append('subject', subject);
    formData.append('courseCode', courseCode.trim());
    formData.append('topic', topic.trim());
    formData.append('summary', summary.trim());
    formData.append('tags', tags.trim());
    formData.append('isPublic', String(isPublic));

    try {
      setUploadProgress(45);
      const res = await fetch('/api/resources/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const data = await res.json();

      if (!res.ok) {
        setIsUploading(false);
        setGeneralError(data.error || 'Upload failed. Please try again.');
        return;
      }

      setUploadProgress(100);
      setIsUploading(false);
      setSuccessMessage(true);
      invalidateResourceCache();

      setTimeout(() => {
        router.push('/notes');
        router.refresh();
      }, 1500);
    } catch {
      setIsUploading(false);
      setGeneralError('Network error while uploading file. Please check your connection.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Upload Educational Resource</h1>
        <p className="text-xs text-stone-500 mt-1">
          Upload verified PDF course guides, lecture notes, and syllabus materials to the secure campus repository.
        </p>
      </div>

      {/* Role Notice Banner for Students */}
      {!isAuthorizedUploader && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-950">Faculty & Admin Permission Required</p>
            <p className="text-amber-800 leading-relaxed">
              Your account currently has the <strong className="font-semibold">STUDENT</strong> role.
              To maintain academic integrity and quality control, only verified <strong className="font-semibold">TEACHER</strong> or <strong className="font-semibold">ADMIN</strong> accounts are authorized to publish materials.
            </p>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {generalError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-medium">{generalError}</p>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">PDF uploaded and encrypted successfully!</p>
            <p className="text-xs text-emerald-700">Stored in private Supabase storage. Redirecting to library...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Real PDF Dropzone */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-paper-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              PDF Document (Max 10 MB)
            </h2>
            {selectedFile && (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> PDF Attached
              </span>
            )}
          </div>

          {(errors.file || fileError) && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.file || fileError}
            </p>
          )}

          {/* Hidden native input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={!isAuthorizedUploader || isUploading}
          />

          {!selectedFile ? (
            <div
              onClick={() => isAuthorizedUploader && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors space-y-3 ${
                isAuthorizedUploader
                  ? 'border-stone-300 hover:border-indigo-500 bg-stone-50/60 hover:bg-indigo-50/20 cursor-pointer'
                  : 'border-stone-200 bg-stone-100/50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Click to select a PDF or drag and drop your document here
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  PDF format strictly required (Max 10 MB)
                </p>
              </div>
            </div>
          ) : (
            /* Selected File Card */
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-stone-500 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Application/PDF
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Course & Metadata Inputs */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-paper-sm space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              Course & Resource Metadata
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Course Subject
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!isAuthorizedUploader || isUploading}
                className="w-full bg-white border border-stone-300 text-stone-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="C++">C++ (CS 106L)</option>
                    <option value="Mathematics">Mathematics (MATH 51)</option>
                    <option value="Physics">Physics (PHYS 41)</option>
                    <option value="Computer Networks">Computer Networks (CS 144)</option>
                    <option value="Data Structures">Data Structures (CS 106B)</option>
                  </>
                )}
              </select>
            </div>

            <Input
              label="Course Code"
              placeholder="e.g. CS 106L"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              disabled={!isAuthorizedUploader || isUploading}
              icon={<BookOpen className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Resource Title"
            placeholder="e.g. Memory Architecture, Stack vs Heap & Smart Pointers"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isAuthorizedUploader || isUploading}
            error={errors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Topic Name"
              placeholder="e.g. Dynamic Memory & Valgrind"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={!isAuthorizedUploader || isUploading}
              error={errors.topic}
            />
            <Input
              label="Lecture / Term Date"
              type="date"
              value={lectureDate}
              onChange={(e) => setLectureDate(e.target.value)}
              disabled={!isAuthorizedUploader || isUploading}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Resource Summary & Key Proofs
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!isAuthorizedUploader || isUploading}
              placeholder="Briefly describe the key formulas, theorems, or problem set solutions covered in this PDF..."
              className="w-full bg-white border border-stone-300 rounded-lg p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <Input
            label="Tags (comma separated)"
            placeholder="e.g. cpp, pointers, malloc, valgrind"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={!isAuthorizedUploader || isUploading}
            icon={<Tag className="w-4 h-4" />}
          />

          {/* Privacy Toggle */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
                {isPublic ? <Globe className="w-5 h-5 text-indigo-600" /> : <Lock className="w-5 h-5 text-stone-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {isPublic ? 'Public Campus Resource' : 'Private Draft'}
                </p>
                <p className="text-[11px] text-stone-500">
                  {isPublic
                    ? 'Visible to all enrolled university students in course archives.'
                    : 'Only visible to course instructors and admins.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!isAuthorizedUploader || isUploading}
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublic ? 'bg-indigo-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Upload Submit Action */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/notes')}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="min-w-[170px]"
            disabled={!isAuthorizedUploader || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading ({uploadProgress}%)...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> Publish PDF
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
