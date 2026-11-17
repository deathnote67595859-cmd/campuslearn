import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in to view profiles.' },
        { status: 401 }
      );
    }

    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      );
    }

    // Find by username or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { id: username },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        role: true,
        university: true,
        major: true,
        graduationYear: true,
        bio: true,
        isVerified: true,
        githubUrl: true,
        linkedinUrl: true,
        createdAt: true,
        resources: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            fileUrl: true,
            videoUrl: true,
            topic: true,
            courseCode: true,
            viewCount: true,
            createdAt: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                color: true,
              },
            },
            _count: {
              select: { bookmarks: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            resources: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const formattedResources = user.resources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      type: r.type,
      fileUrl: r.fileUrl || '',
      videoUrl: r.videoUrl || null,
      topic: r.topic || 'General Lecture',
      courseCode: r.courseCode || r.subject.code || 'GEN',
      subject: r.subject.name,
      viewCount: r.viewCount,
      bookmarkCount: r._count.bookmarks,
      createdAt: r.createdAt.toISOString(),
      uploader: {
        id: user.id,
        name: user.name || 'Student',
        username: user.username || 'student',
        avatar:
          user.image ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Student')}`,
        university: user.university || 'Campus College',
        major: user.major || 'Undergraduate',
        graduationYear: user.graduationYear || "'26",
        isVerified: user.isVerified,
      },
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || 'Student Contributor',
        username: user.username || user.id,
        email: user.email,
        avatar:
          user.image ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Student')}`,
        role: user.role,
        university: user.university || 'Campus College',
        major: user.major || 'Undergraduate',
        graduationYear: user.graduationYear || '',
        bio: user.bio || '',
        isVerified: user.isVerified,
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        joinedDate: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          year: 'numeric',
        }).format(user.createdAt),
        totalNotes: user._count.resources,
        savedNotesCount: user._count.bookmarks,
      },
      resources: formattedResources,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user profile.' },
      { status: 500 }
    );
  }
}

