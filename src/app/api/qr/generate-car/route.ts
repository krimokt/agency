import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { carId } = await request.json();
    if (!carId) return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase public env vars missing' }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing' }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();

    // create token row
    const { data: tokenRow, error: tokenError } = await supabase
      .from('car_qr_tokens')
      .insert({
        id: uuidv4(),
        car_id: carId,
        token: uuidv4(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (tokenError) {
      console.error('car_qr_tokens insert error:', tokenError);
      return NextResponse.json({ error: 'Failed to create car QR token' }, { status: 500 });
    }

    const jwtToken = JWTUtils.generateCarQRToken(carId, tokenRow.id);
    const requestOrigin = new URL(request.url).origin;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || requestOrigin || 'http://localhost:3000';
    const uploadUrl = `${appBaseUrl.replace(/\/$/, '')}/car-upload?token=${encodeURIComponent(jwtToken)}`;

    const qrCodeDataUrl = await QRCode.toDataURL(uploadUrl, { width: 300, margin: 2 });

    return NextResponse.json({
      success: true,
      qrTokenId: tokenRow.id,
      qrCodeDataUrl,
      uploadUrl,
      expiresAt: tokenRow.expires_at,
    });
  } catch (e) {
    console.error('generate-car error:', e);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}










