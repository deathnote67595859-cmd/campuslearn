import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSupabaseServerClient, SUPABASE_BUCKET_NAME } from '@/lib/supabase-server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Enforce Server-Side Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to download educational resources.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required.' }, { status: 400 });
    }

    // 2. Fetch resource metadata from database
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
    }

    // 3. Verify access permissions: public resources are accessible to students,
    // or private resources owned by the current user or an admin
    if (!resource.isPublic && resource.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to access this private resource.' },
        { status: 403 }
      );
    }

    const filePath = resource.fileUrl;
    if (!filePath) {
      return NextResponse.json(
        { error: 'This resource does not have an attached file.' },
        { status: 404 }
      );
    }

    // 4. Handle External or Non-Supabase URLs (e.g. initial seeded demo URLs)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return NextResponse.json({
        downloadUrl: filePath,
        fileName: `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        expiresIn: 300,
        isExternal: true,
      });
    }

    // 5. Generate Short-Lived Signed URL from Private Supabase Storage (5-minute expiration)
    const supabase = getSupabaseServerClient();
    const expiresInSeconds = 300; // 5 minutes

    const { data, error: signedUrlError } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds, {
        download: `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      });

    if (signedUrlError || !data?.signedUrl) {
      console.error('Failed to create signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Unable to generate secure download link. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl,
      fileName: `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      expiresIn: expiresInSeconds,
      isExternal: false,
    });
  } catch (error: any) {
    console.error('Error generating signed download URL:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process download request.' },
      { status: 500 }
    );
  }
}

