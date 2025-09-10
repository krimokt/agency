import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!token || !documentType || !file) {
      return NextResponse.json({ error: 'Token, document type, and file are required' }, { status: 400 });
    }

    const decoded = JWTUtils.verifyCarQRToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const supabase = getSupabaseAdmin();

    // Validate token row
    const { data: qrToken, error: tokenError } = await supabase
      .from('car_qr_tokens')
      .select('*')
      .eq('id', decoded.qrTokenId)
      .eq('car_id', decoded.carId)
      .is('used_at', null)
      .single();
    if (tokenError || !qrToken) return NextResponse.json({ error: 'QR token not found or used' }, { status: 401 });
    if (new Date(qrToken.expires_at) < new Date()) return NextResponse.json({ error: 'QR token expired' }, { status: 401 });

    // Get or create upload record
    const { data: existing, error: fetchError } = await supabase
      .from('car_uploads')
      .select('*')
      .eq('car_id', decoded.carId)
      .eq('qr_token_id', decoded.qrTokenId)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch upload record' }, { status: 500 });
    }
    let uploadRow = existing;
    if (!uploadRow) {
      const { data: created, error: createError } = await supabase
        .from('car_uploads')
        .insert({ car_id: decoded.carId, qr_token_id: decoded.qrTokenId, upload_status: 'uploading' })
        .select()
        .single();
      if (createError) return NextResponse.json({ error: 'Failed to create upload record' }, { status: 500 });
      uploadRow = created;
    }

    // Upload to storage
    const originalName = (file as any).name || `${documentType}`;
    const extMatch = originalName.match(/\.(\w+)$/i);
    const ext = extMatch ? extMatch[0].toLowerCase() : (file.type === 'application/pdf' ? '.pdf' : '.jpg');
    const fileName = `${uploadRow.id}/${documentType}_${Date.now()}${ext}`;
    const { error: storageError } = await supabase.storage
      .from('car-documents')
      .upload(fileName, file, { contentType: file.type, cacheControl: '3600' });
    if (storageError) return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from('car-documents').getPublicUrl(fileName);

    try {
      await supabase.from('car_qrscan').insert({
        car_id: decoded.carId,
        qr_token_id: decoded.qrTokenId,
        document_type: documentType,
        storage_path: fileName,
        public_url: publicUrl,
        mime_type: file.type,
        size_bytes: (file as any).size || null,
      });
    } catch {}

    const updateData: any = { upload_status: 'uploading' };
    const carUpdateData: any = {};
    
    switch (documentType) {
      case 'carte_grise': 
        updateData.carte_grise_url = publicUrl;
        carUpdateData.carte_grise_url = publicUrl;
        break;
      case 'insurance': 
        updateData.insurance_url = publicUrl;
        carUpdateData.insurance_url = publicUrl;
        break;
      case 'inspection': 
        updateData.inspection_url = publicUrl;
        carUpdateData.technical_inspection_url = publicUrl;
        break;
      case 'rental_agreement': 
        updateData.rental_agreement_url = publicUrl;
        carUpdateData.rental_agreement_url = publicUrl;
        break;
      case 'other': 
        updateData.other_url = publicUrl;
        carUpdateData.other_documents_url = publicUrl;
        break;
      default: return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // Update car_uploads table
    const { error: updError } = await supabase.from('car_uploads').update(updateData).eq('id', uploadRow.id);
    if (updError) return NextResponse.json({ error: 'Failed to update upload record' }, { status: 500 });

    // Update add_new_car table with document URLs
    const { error: carUpdError } = await supabase
      .from('add_new_car')
      .update(carUpdateData)
      .eq('id', decoded.carId);
    if (carUpdError) {
      console.error('Failed to update car document URLs:', carUpdError);
      // Don't fail the request, just log the error
    }

    // mark as ready_for_completion if at least carte grise + insurance + inspection present
    const { data: after } = await supabase.from('car_uploads').select('*').eq('id', uploadRow.id).single();
    const hasCore = !!after?.carte_grise_url && !!after?.insurance_url && !!after?.inspection_url;
    if (hasCore) {
      await supabase.from('car_uploads').update({ upload_status: 'ready_for_completion', processing_status: 'ready' }).eq('id', uploadRow.id);
    }

    return NextResponse.json({ success: true, documentType, uploadId: uploadRow.id });
  } catch (e) {
    console.error('mobile-upload-car error', e);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}


