import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSupabaseServerClient, SUPABASE_BUCKET_NAME } from '@/lib/supabase-server';
import crypto from 'crypto';

// Sensible constraints
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  let uploadedStoragePath: string | null = null;
  let supabaseClient = null;

  try {
    // 1. Enforce Server-Side Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to upload resources.' },
        { status: 401 }
      );
    }

    // 2. Strict Role Verification: Only TEACHER or ADMIN can upload resources
    const userRole = session.user.role;
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Forbidden. Only instructor (TEACHER) or administrator (ADMIN) accounts are permitted to upload resources.',
        },
        { status: 403 }
      );
    }

    // 3. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim();
    const subjectName = (formData.get('subject') as string | null)?.trim();
    const courseCode = (formData.get('courseCode') as string | null)?.trim();
    const topic = (formData.get('topic') as string | null)?.trim();
    const summary = (formData.get('summary') as string | null)?.trim();
    const isPublicString = formData.get('isPublic') as string | null;
    const isPublic = isPublicString === 'true' || isPublicString === 'on' || isPublicString === null;

    // 4. Validate metadata fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }
    if (!subjectName) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'A PDF file is required for upload.' },
        { status: 400 }
      );
    }

    // 5. Strict Server-Side File Validation
    // A. File Size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of 10 MB (received ${(file.size / (1024 * 1024)).toFixed(1)} MB).` },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty. Please select a valid PDF file.' },
        { status: 400 }
      );
    }

    // B. File Extension check
    const originalName = file.name || 'document.pdf';
    const lowerName = originalName.toLowerCase();
    if (!lowerName.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF files (.pdf) are permitted.' },
        { status: 400 }
      );
    }

    // C. File Content & Magic Bytes inspection
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // PDF files always begin with the magic header '%PDF-' (hex: 25 50 44 46 2d)
    const pdfMagicBytes = fileBuffer.slice(0, 5).toString('ascii');
    if (!pdfMagicBytes.startsWith('%PDF-')) {
      return NextResponse.json(
        { error: 'File content verification failed. The provided file is not a valid PDF document.' },
        { status: 400 }
      );
    }

    // 6. Ensure target subject exists or find/create it
    let subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: { equals: subjectName, mode: 'insensitive' } },
          { code: { equals: courseCode || '', mode: 'insensitive' } },
        ],
      },
    });

    if (!subject) {
      // Create new subject channel if it doesn't exist
      subject = await prisma.subject.create({
        data: {
          name: subjectName,
          code: courseCode || subjectName.toUpperCase().slice(0, 8),
          description: `Course channel for ${subjectName}`,
          color: 'indigo',
          iconName: 'BookOpen',
        },
      });
    }

    // 7. Generate a unique, collision-proof storage file path
    // Structure: {subjectSlug}/{timestamp}_{randomUuid}.pdf
    const sanitizedSubject = subject.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const randomSuffix = crypto.randomUUID();
    const timestamp = Date.now();
    const storagePath = `${sanitizedSubject}/${timestamp}_${randomSuffix}.pdf`;

    // 8. Upload to Private Supabase Storage Bucket
    supabaseClient = getSupabaseServerClient();
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError?.message || 'Unable to store file.'}` },
        { status: 502 }
      );
    }

    uploadedStoragePath = storagePath;

    // 9. Save Resource Metadata in Neon PostgreSQL via Prisma
    let newResource;
    try {
      newResource = await prisma.resource.create({
        data: {
          title,
          description: summary || '',
          type: 'PDF',
          fileUrl: storagePath, // Stores the relative bucket storage path (used to generate signed URLs)
          topic: topic || 'General Lecture',
          courseCode: courseCode || subject.code || 'GEN',
          isPublic,
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
            },
          },
        },
      });
    } catch (dbError: any) {
      console.error('Database transaction failed after storage upload:', dbError);

      // Clean up orphaned file from Supabase Storage
      if (uploadedStoragePath && supabaseClient) {
        try {
          await supabaseClient.storage
            .from(SUPABASE_BUCKET_NAME)
            .remove([uploadedStoragePath]);
          console.log(`Cleaned up orphaned file from storage: ${uploadedStoragePath}`);
        } catch (cleanupErr) {
          console.error('Failed to cleanup orphaned storage file:', cleanupErr);
        }
      }

      return NextResponse.json(
        { error: 'Failed to record resource in database. The uploaded file has been cleaned up.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Resource uploaded successfully.',
        resource: {
          id: newResource.id,
          title: newResource.title,
          type: newResource.type,
          courseCode: newResource.courseCode,
          subject: newResource.subject.name,
          createdAt: newResource.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error in upload route:', error);

    // If an upload occurred before unexpected failure, ensure cleanup
    if (uploadedStoragePath && supabaseClient) {
      try {
        await supabaseClient.storage
          .from(SUPABASE_BUCKET_NAME)
          .remove([uploadedStoragePath]);
      } catch (cleanupErr) {
        console.error('Failed to cleanup file:', cleanupErr);
      }
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error while processing upload.' },
      { status: 500 }
    );
  }
}

