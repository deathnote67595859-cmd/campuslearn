import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/public/explore
 * Public endpoint for landing page showcasing genuine database records.
 * Returns latest public notes, active subject channels, and total statistics.
 */
export async function GET() {
  try {
    const [subjects, notes, totalCount, topContributor] = await Promise.all([
      prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
          _count: {
            select: { resources: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.resource.findMany({
        where: {
          isPublic: true,
          type: 'NOTE',
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          fileUrl: true,
          topic: true,
          courseCode: true,
          viewCount: true,
          createdAt: true,
          subject: {
            select: {
              name: true,
              code: true,
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
            select: { bookmarks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.resource.count({
        where: { isPublic: true, type: 'NOTE' },
      }),
      // Find a genuine user who has uploaded resources
      prisma.user.findFirst({
        where: {
          resources: {
            some: { isPublic: true },
          },
        },
        select: {
          name: true,
          username: true,
          image: true,
          university: true,
          major: true,
          bio: true,
          _count: {
            select: { resources: true },
          },
        },
        orderBy: {
          resources: {
            _count: 'desc',
          },
        },
      }),
    ]);

    const formattedNotes = notes.map((r) => {
      const avatarUrl =
        r.user.image ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.user.name || 'Scholar')}`;
      const thumbUrl = r.fileUrl || avatarUrl;

      return {
        id: r.id,
        title: r.title,
        subject: r.subject.name,
        topic: r.topic || 'General Lecture',
        lectureDate: r.createdAt.toISOString().split('T')[0],
        uploadDate: r.createdAt.toISOString().split('T')[0],
        courseCode: r.courseCode || r.subject.code || 'GEN',
        author: {
          name: r.user.name || 'Student Contributor',
          username: r.user.username || r.user.id,
          avatar: avatarUrl,
          university: r.user.university || 'Campus College',
          major: r.user.major || 'Undergraduate',
          graduationYear: r.user.graduationYear || "'26",
          isVerified: r.user.isVerified,
        },
        thumbnailUrl: thumbUrl,
        pages: [
          {
            id: `${r.id}-p1`,
            imageUrl: thumbUrl,
            pageNumber: 1,
            caption: r.title,
          },
        ],
        starCount: r._count.bookmarks,
        bookmarkCount: r._count.bookmarks,
        viewsCount: r.viewCount,
        isPublic: true,
        summary: r.description || '',
        tags: [r.subject.name.toLowerCase().replace(/[^a-z0-9]/g, ''), 'notes'],
        pdfAvailable: true,
      };
    });

    const formattedSubjects = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code || 'GEN',
      color: s.color || 'stone',
      noteCount: s._count.resources,
    }));

    const contributorData = topContributor
      ? {
          name: topContributor.name || 'Verified Scholar',
          username: topContributor.username || 'scholar',
          avatar:
            topContributor.image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(topContributor.name || 'Scholar')}`,
          university: topContributor.university || 'Campus College',
          major: topContributor.major || 'Academic Contributor',
          bio: topContributor.bio || 'Sharing handwritten course notes and problem set solutions.',
          totalNotes: topContributor._count.resources,
        }
      : null;

    return NextResponse.json({
      featuredNote: formattedNotes[0] || null,
      recentNotes: formattedNotes.slice(1, 4),
      subjects: formattedSubjects,
      totalCount,
      topContributor: contributorData,
    });
  } catch (error: any) {
    console.error('Error fetching public explore data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve public catalog.' },
      { status: 500 }
    );
  }
}

