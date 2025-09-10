import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const decoded = JWTUtils.verifyCarQRToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: upload, error } = await supabase
      .from('car_uploads')
      .select('*')
      .eq('car_id', decoded.carId)
      .eq('qr_token_id', decoded.qrTokenId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          status: 'pending',
          uploadStatus: 'pending',
          processingStatus: 'pending',
          documents: {
            carteGrise: false,
            insurance: false,
            inspection: false,
            rentalAgreement: false,
            other: false,
          },
        });
      }
      return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }

    const documents = {
      carteGrise: !!upload.carte_grise_url,
      insurance: !!upload.insurance_url,
      inspection: !!upload.inspection_url,
      rentalAgreement: !!upload.rental_agreement_url,
      other: !!upload.other_url,
    };

    let status = 'pending';
    if (upload.upload_status === 'manually_completed' && upload.processing_status === 'completed') status = 'manually_completed';
    else if (upload.upload_status === 'completed' && upload.processing_status === 'completed') status = 'completed';
    else if (upload.upload_status === 'ready_for_completion') status = 'ready_for_completion';
    else if (upload.upload_status === 'failed' || upload.processing_status === 'failed') status = 'failed';
    else if (upload.upload_status === 'processing' || upload.processing_status === 'processing') status = 'processing';
    else if (upload.upload_status === 'uploading') status = 'uploading';

    return NextResponse.json({ success: true, status, uploadStatus: upload.upload_status, processingStatus: upload.processing_status, documents, completedAt: upload.completed_at, urls: {
      carteGrise: upload.carte_grise_url,
      insurance: upload.insurance_url,
      inspection: upload.inspection_url,
      rentalAgreement: upload.rental_agreement_url,
      other: upload.other_url,
    }});
  } catch (e) {
    console.error('car status error', e);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}










