import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const carId = formData.get('carId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !carId || !documentType) {
      return NextResponse.json(
        { error: 'File, carId, and documentType are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify car exists
    const { data: car, error: carError } = await supabase
      .from('add_new_car')
      .select('id, brand, model, plate_number')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${carId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('car-documents')
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
      .from('car-documents')
      .getPublicUrl(fileName);

    // Update car record with document URL
    const updateField = `${documentType}_url`;
    const { error: updateError } = await supabase
      .from('add_new_car')
      .update({
        [updateField]: publicUrl
      })
      .eq('id', carId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: `Failed to update car record: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      documentType,
      url: publicUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}




