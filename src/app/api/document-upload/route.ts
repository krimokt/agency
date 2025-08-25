import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${documentType}_${timestamp}_${file.name}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('client-documents')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      return NextResponse.json(
        { error: `Failed to upload file: ${storageError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-documents')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
} 