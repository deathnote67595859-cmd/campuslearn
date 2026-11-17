/**
 * Video Library Sanity & Validation Test Suite
 * Verifies URL extraction, role checks, data validation, and embed generation.
 */

import {
  extractYouTubeVideoId,
  isValidYouTubeUrl,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
} from '../src/lib/youtube.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n=== RUNNING VIDEO LIBRARY SANITY & SECURITY TESTS ===\n');

// 1. Test YouTube URL Extraction
console.log('1. YouTube URL Extraction & Validation:');
const testCases = [
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Standard watch URL' },
  { url: 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s', expected: 'dQw4w9WgXcQ', label: 'Watch URL with extra query params' },
  { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Shortened youtu.be URL' },
  { url: 'https://youtu.be/dQw4w9WgXcQ?si=abcdef123456', expected: 'dQw4w9WgXcQ', label: 'Shortened URL with tracking parameter' },
  { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Embed URL' },
  { url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Privacy-enhanced embed URL' },
  { url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Shorts URL' },
  { url: 'https://www.youtube.com/live/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Live stream URL' },
  { url: 'dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', label: 'Raw 11-char video ID' },
  { url: 'https://vimeo.com/12345678', expected: null, label: 'Non-YouTube URL (Vimeo)' },
  { url: 'https://google.com', expected: null, label: 'Generic website URL' },
  { url: 'not-a-valid-url', expected: null, label: 'Invalid string' },
  { url: '', expected: null, label: 'Empty string' },
  { url: null as any, expected: null, label: 'Null value' },
];

for (const tc of testCases) {
  const result = extractYouTubeVideoId(tc.url);
  assert(result === tc.expected, `${tc.label} -> extracted: ${result}`);
}

// 2. Test Thumbnail and Embed URL generation
console.log('\n2. Thumbnail & Embed URL Generation:');
const videoId = 'dQw4w9WgXcQ';
const thumbnail = getYouTubeThumbnail(videoId);
assert(thumbnail === 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'Generates correct HQ thumbnail URL');

const embedUrl = getYouTubeEmbedUrl(videoId);
assert(embedUrl.includes('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'Generates privacy-enhanced embed URL');
assert(embedUrl.includes('autoplay=1'), 'Embed URL includes autoplay parameter');

// 3. Test Server-Side Role Enforcement Simulation
console.log('\n3. Server-Side Role Protection Logic:');

function simulateRoleCheck(role: string): { allowed: boolean; status: number } {
  if (role !== 'TEACHER' && role !== 'ADMIN') {
    return { allowed: false, status: 403 };
  }
  return { allowed: true, status: 200 };
}

const studentCheck = simulateRoleCheck('STUDENT');
assert(!studentCheck.allowed && studentCheck.status === 403, 'STUDENT role is blocked with 403 Forbidden');

const teacherCheck = simulateRoleCheck('TEACHER');
assert(teacherCheck.allowed && teacherCheck.status === 200, 'TEACHER role is allowed (200 OK)');

const adminCheck = simulateRoleCheck('ADMIN');
assert(adminCheck.allowed && adminCheck.status === 200, 'ADMIN role is allowed (200 OK)');

const unauthorizedCheck = simulateRoleCheck('ANONYMOUS');
assert(!unauthorizedCheck.allowed && unauthorizedCheck.status === 403, 'Unrecognized/anonymous role is rejected');

// 4. Test Video Payload Validation
console.log('\n4. Video Creation Payload Validation Logic:');

function validateVideoPayload(payload: { title?: string; youtubeUrl?: string; subjectName?: string }) {
  if (!payload.title || payload.title.trim().length < 3) {
    return { valid: false, error: 'Title required (min 3 chars)' };
  }
  if (!payload.subjectName || payload.subjectName.trim().length === 0) {
    return { valid: false, error: 'Subject required' };
  }
  const id = extractYouTubeVideoId(payload.youtubeUrl);
  if (!id) {
    return { valid: false, error: 'Valid YouTube URL required' };
  }
  return { valid: true, videoId: id };
}

assert(!validateVideoPayload({ title: 'ab', youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ', subjectName: 'C++' }).valid, 'Rejects title shorter than 3 characters');
assert(!validateVideoPayload({ title: 'Valid Title', youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ', subjectName: '' }).valid, 'Rejects empty subject');
assert(!validateVideoPayload({ title: 'Valid Title', youtubeUrl: 'https://vimeo.com/987654321', subjectName: 'Physics' }).valid, 'Rejects non-YouTube URL');
assert(!validateVideoPayload({ title: 'Valid Title', youtubeUrl: 'not-a-youtube-url', subjectName: 'Physics' }).valid, 'Rejects invalid string');
assert(validateVideoPayload({ title: 'Lecture 1: Intro', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subjectName: 'Math' }).valid, 'Accepts valid video submission');

// 5. Final Report
console.log('\n=============================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('=============================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
