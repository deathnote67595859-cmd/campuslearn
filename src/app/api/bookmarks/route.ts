import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bookmarks
 * Returns bookmarked resource IDs and total count for the current user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in to view bookmarks.' },
        { status: 401 }
      );
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      select: {
        resourceId: true,
        createdAt: true,
        resource: {
          select: {
            id: true,
            title: true,
            type: true,
            topic: true,
            courseCode: true,
            subject: {
              select: { name: true, code: true, color: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      count: bookmarks.length,
      bookmarkedIds: bookmarks.map((b) => b.resourceId),
      bookmarks,
    });
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bookmarks.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookmarks
 * Toggles a bookmark for a resource.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in to bookmark resources.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { resourceId } = body;

    if (!resourceId || typeof resourceId !== 'string') {
      return NextResponse.json(
        { error: 'Valid resourceId is required.' },
        { status: 400 }
      );
    }

    // Check if the resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found.' },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
    });

    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      const newCount = await prisma.bookmark.count({
        where: { userId: session.user.id },
      });
      return NextResponse.json({
        bookmarked: false,
        count: newCount,
        message: 'Folio removed from your saved library.',
      });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          resourceId,
        },
      });
      const newCount = await prisma.bookmark.count({
        where: { userId: session.user.id },
      });
      return NextResponse.json({
        bookmarked: true,
        count: newCount,
        message: 'Folio saved to your library.',
      });
    }
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark.' },
      { status: 500 }
    );
  }
}

