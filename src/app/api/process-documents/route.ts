import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { documentType, frontImageUrl, backImageUrl } = await request.json();

    if (!documentType || !frontImageUrl || !backImageUrl) {
      return NextResponse.json(
        { error: 'Document type, front image URL, and back image URL are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const parsedData: any = {};

    // Process front image using Google Document AI
    try {
      const frontFilePath = frontImageUrl.split('/client-documents/')[1];
      if (frontFilePath) {
        const { data: frontImageData } = await supabase.storage
          .from('client-documents')
          .download(frontFilePath);

        if (frontImageData) {
          const frontFile = new File([frontImageData], 'front.jpg', { type: 'image/jpeg' });
          
          // Use Google Document AI for processing
          const formData = new FormData();
          formData.append('file', frontFile);
          formData.append('documentType', 'auto');
          formData.append('side', 'auto');

          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ocr/process`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.fields) {
              Object.assign(parsedData, result.data.fields);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing front image:', error);
    }

    // Process back image using Google Document AI
    try {
      const backFilePath = backImageUrl.split('/client-documents/')[1];
      if (backFilePath) {
        const { data: backImageData } = await supabase.storage
          .from('client-documents')
          .download(backFilePath);

        if (backImageData) {
          const backFile = new File([backImageData], 'back.jpg', { type: 'image/jpeg' });
          
          // Use Google Document AI for processing
          const formData = new FormData();
          formData.append('file', backFile);
          formData.append('documentType', 'auto');
          formData.append('side', 'auto');

          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ocr/process`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.fields) {
              // Merge data, prioritizing non-empty values from back
              Object.keys(result.data.fields).forEach(key => {
                if (result.data.fields[key] && !parsedData[key]) {
                  parsedData[key] = result.data.fields[key];
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing back image:', error);
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
} 