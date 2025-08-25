import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decodedToken = JWTUtils.verifyQRToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get client upload record
    const { data: clientUpload, error } = await supabase
      .from('client_uploads')
      .select('*')
      .eq('client_id', decodedToken.clientId)
      .eq('qr_token_id', decodedToken.qrTokenId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({
          success: true,
          status: 'pending',
          uploadStatus: 'pending',
          processingStatus: 'pending',
          documents: {
            idFront: false,
            idBack: false,
            licenseFront: false,
            licenseBack: false
          },
          parsedData: null
        });
      }
      
      console.error('Error fetching client upload:', error);
      return NextResponse.json(
        { error: 'Failed to fetch upload status' },
        { status: 500 }
      );
    }

    // Check which documents are uploaded
    const documents = {
      idFront: !!clientUpload.id_front_url,
      idBack: !!clientUpload.id_back_url,
      licenseFront: !!clientUpload.license_front_url,
      licenseBack: !!clientUpload.license_back_url
    };

    // Determine overall status
    let status = 'pending';
    if (clientUpload.upload_status === 'completed' && clientUpload.processing_status === 'completed') {
      status = 'completed';
    } else if (clientUpload.upload_status === 'failed' || clientUpload.processing_status === 'failed') {
      status = 'failed';
    } else if (clientUpload.upload_status === 'processing' || clientUpload.processing_status === 'processing') {
      status = 'processing';
    } else if (clientUpload.upload_status === 'uploading') {
      status = 'uploading';
    }

    return NextResponse.json({
      success: true,
      status,
      uploadStatus: clientUpload.upload_status,
      processingStatus: clientUpload.processing_status,
      documents,
      parsedData: clientUpload.parsed_data,
      completedAt: clientUpload.completed_at,
      // Include document URLs for display
      idFrontUrl: clientUpload.id_front_url,
      idBackUrl: clientUpload.id_back_url,
      licenseFrontUrl: clientUpload.license_front_url,
      licenseBackUrl: clientUpload.license_back_url
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
} 