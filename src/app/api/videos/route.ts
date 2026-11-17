import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/lib/youtube';

/**
 * GET /api/videos
 * Returns all catalogued educational videos and available subjects.
 * Requires authenticated session.
 */
export async function GET() {
  try {
    // 1. Enforce Server-Side Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to access the Video Library.' },
        { status: 401 }
      );
    }

    // 2. Fetch subjects and video resources concurrently (Performance optimization: avoids waterfall)
    const [subjects, videos] = await Promise.all([
      prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          color: true,
          iconName: true,
          _count: {
            select: { resources: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.resource.findMany({
        where: {
          type: 'VIDEO',
          isPublic: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          fileUrl: true,
          videoUrl: true,
          topic: true,
          courseCode: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
              university: true,
              major: true,
            },
          },
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // 4. Format videos with extracted video ID and thumbnail
    const formattedVideos = videos.map((v) => {
      const videoId = extractYouTubeVideoId(v.videoUrl);
      const thumbnail = v.fileUrl || getYouTubeThumbnail(videoId);

      return {
        id: v.id,
        title: v.title,
        description: v.description || '',
        videoUrl: v.videoUrl || '',
        youtubeVideoId: videoId,
        thumbnailUrl: thumbnail,
        topic: v.topic || 'Video Lecture',
        courseCode: v.courseCode || v.subject.code || 'VID',
        subject: v.subject.name,
        subjectId: v.subject.id,
        subjectColor: v.subject.color,
        viewCount: v.viewCount,
        bookmarkCount: v._count.bookmarks,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
        uploader: {
          id: v.user.id,
          name: v.user.name || 'Faculty Member',
          username: v.user.username || 'instructor',
          role: v.user.role,
          avatar:
            v.user.image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.user.name || 'Faculty')}`,
          university: v.user.university || 'Campus College',
          major: v.user.major || 'Faculty of Sciences',
        },
      };
    });

    return NextResponse.json({
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        description: s.description,
        color: s.color,
        iconName: s.iconName,
        noteCount: s._count.resources,
      })),
      videos: formattedVideos,
    });
  } catch (error: any) {
    console.error('Error fetching videos from database:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve video resources. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos
 * Adds a new educational YouTube video.
 * Restricted to TEACHER and ADMIN users.
 */
export async function POST(req: Request) {
  try {
    // 1. Enforce Server-Side Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to add educational videos.' },
        { status: 401 }
      );
    }

    // 2. Strict Role Verification: TEACHER or ADMIN only
    const userRole = session.user.role;
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Forbidden. Only instructor (TEACHER) or administrator (ADMIN) accounts are permitted to add educational videos.',
        },
        { status: 403 }
      );
    }

    // 3. Parse and sanitize JSON payload
    const body = await req.json();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const youtubeUrl = body.youtubeUrl?.trim();
    const subjectName = body.subjectName?.trim();
    const courseCode = body.courseCode?.trim();
    const topic = body.topic?.trim();

    // 4. Validate required fields
    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: 'Title is required and must be at least 3 characters.' },
        { status: 400 }
      );
    }

    if (!subjectName) {
      return NextResponse.json(
        { error: 'Subject is required.' },
        { status: 400 }
      );
    }

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required.' },
        { status: 400 }
      );
    }

    // 5. Validate YouTube URL and extract video ID
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            'Invalid YouTube URL. Please provide a valid YouTube watch link, share link, or 11-character video ID.',
        },
        { status: 400 }
      );
    }

    // 6. Ensure target Subject exists or create a new subject channel
    let subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: { equals: subjectName, mode: 'insensitive' } },
          { code: { equals: courseCode || '', mode: 'insensitive' } },
        ],
      },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: subjectName,
          code: courseCode || subjectName.toUpperCase().slice(0, 8),
          description: `Course channel for ${subjectName}`,
          color: 'indigo',
          iconName: 'Video',
        },
      });
    }

    // Standard normalized YouTube link and thumbnail URL
    const canonicalVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = getYouTubeThumbnail(videoId);

    // 7. Save Video Resource in database
    const newVideo = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        type: 'VIDEO',
        videoUrl: canonicalVideoUrl,
        fileUrl: thumbnailUrl,
        topic: topic || 'Video Lecture',
        courseCode: courseCode || subject.code || 'VID',
        isPublic: true,
        subjectId: subject.id,
        userId: session.user.id,
      },
      include: {
        subject: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Video lecture added successfully.',
        video: {
          id: newVideo.id,
          title: newVideo.title,
          videoUrl: newVideo.videoUrl,
          youtubeVideoId: videoId,
          thumbnailUrl: newVideo.fileUrl,
          courseCode: newVideo.courseCode,
          subject: newVideo.subject.name,
          createdAt: newVideo.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating video resource:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save video resource.' },
      { status: 500 }
    );
  }
}

