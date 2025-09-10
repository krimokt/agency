import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const decoded = JWTUtils.verifyCarQRToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const supabase = getSupabaseAdmin();

    // Validate token row (allow if used for uploads but not completed)
    const { data: qrToken, error: tokenError } = await supabase
      .from('car_qr_tokens')
      .select('*')
      .eq('id', decoded.qrTokenId)
      .eq('car_id', decoded.carId)
      .single();
    if (tokenError || !qrToken) return NextResponse.json({ error: 'QR token not found' }, { status: 401 });
    if (new Date(qrToken.expires_at) < new Date()) return NextResponse.json({ error: 'QR token expired' }, { status: 401 });

    // Check if upload exists and current status
    const { data: existingUpload } = await supabase
      .from('car_uploads')
      .select('*')
      .eq('car_id', decoded.carId)
      .eq('qr_token_id', decoded.qrTokenId)
      .single();
    
    if (existingUpload?.upload_status === 'manually_completed') {
      return NextResponse.json({ error: 'Upload already completed' }, { status: 400 });
    }

    if (!existingUpload) {
      return NextResponse.json({ error: 'No upload record found for this token' }, { status: 400 });
    }

    // Mark the QR token as used
    const { error: markUsedError } = await supabase
      .from('car_qr_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', decoded.qrTokenId);
    
    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError);
    }

    // Mark upload as manually completed
    const { error: uploadUpdateError } = await supabase
      .from('car_uploads')
      .update({ 
        upload_status: 'manually_completed',
        processing_status: 'completed',
        completed_at: new Date().toISOString() 
      })
      .eq('car_id', decoded.carId)
      .eq('qr_token_id', decoded.qrTokenId);

    if (uploadUpdateError) {
      console.error('Error updating upload status:', uploadUpdateError);
      return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Upload process completed successfully',
      carId: decoded.carId 
    });

  } catch (e) {
    console.error('mobile-upload-car/complete error', e);
    return NextResponse.json({ error: 'Failed to process completion' }, { status: 500 });
  }
}