/**
 * YouTube Utility Helper
 * Validates YouTube URLs and extracts video IDs, thumbnails, and embed links.
 */

/**
 * Extracts a standard 11-character YouTube video ID from various YouTube URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - Raw 11-character video ID
 */
export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Standard watch URL, shorts, embed, live, and youtu.be shortlinks (including youtube-nocookie.com)
  const regExp = /(?:(?:youtube\.com|youtube-nocookie\.com)\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

/**
 * Checks if a string is a valid YouTube URL or video ID
 */
export function isValidYouTubeUrl(url: string | null | undefined): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Generates the standard high-quality thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnail(videoId: string | null | undefined): string {
  if (!videoId) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Generates a privacy-enhanced YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string | null | undefined, autoplay: boolean = true): string {
  if (!videoId) return '';
  const autoPlayParam = autoplay ? '1' : '0';
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoPlayParam}&rel=0&modestbranding=1`;
}
