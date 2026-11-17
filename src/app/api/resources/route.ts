import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // 1. Enforce Server-Side Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to view educational resources.' },
        { status: 401 }
      );
    }

    // 2. Fetch subjects and public resources concurrently (Performance optimization: avoids waterfall)
    const [subjects, resources] = await Promise.all([
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
          isPublic: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          fileUrl: true,
          videoUrl: true,
          topic: true,
          courseCode: true,
          isPublic: true,
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
              university: true,
              major: true,
              graduationYear: true,
              isVerified: true,
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

    // Transform into clean client-friendly format
    const transformedResources = resources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      type: r.type,
      fileUrl: r.fileUrl || '',
      videoUrl: r.videoUrl || null,
      topic: r.topic || 'General Lecture',
      courseCode: r.courseCode || r.subject.code || 'GEN',
      subject: r.subject.name,
      subjectCode: r.subject.code,
      subjectColor: r.subject.color,
      isPublic: r.isPublic,
      viewCount: r.viewCount,
      bookmarkCount: r._count.bookmarks,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      uploader: {
        id: r.user.id,
        name: r.user.name || 'Anonymous Contributor',
        username: r.user.username || 'student',
        avatar:
          r.user.image ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.user.name || 'Student')}`,
        university: r.user.university || 'Campus College',
        major: r.user.major || 'Undergraduate',
        graduationYear: r.user.graduationYear || "'26",
        isVerified: r.user.isVerified || false,
      },
    }));

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
      resources: transformedResources,
    });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve resources. Please try again later.' },
      { status: 500 }
    );
  }
}

