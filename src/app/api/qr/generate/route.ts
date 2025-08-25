import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Basic environment validation to aid debugging on hosting
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase public env vars missing' }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing' }, { status: 500 });
    }

    // Get admin client
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to init Supabase admin' }, { status: 500 });
    }

    // Do not require the clients table; accept any clientId for QR generation
    const actualClientId = clientId;

    // Create QR token record in database
    const { data: qrTokenData, error: qrTokenError } = await supabase
      .from('qr_tokens')
      .insert({
        id: uuidv4(), // avoid relying on DB default gen_random_uuid()
        client_id: actualClientId,
        token: uuidv4(), // Generate a unique token
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      })
      .select()
      .single();

    if (qrTokenError) {
      console.error('Error creating QR token:', qrTokenError);
      return NextResponse.json(
        {
          error: 'Failed to create QR token',
          details: qrTokenError.message || qrTokenError.hint || qrTokenError.code || 'unknown',
        },
        { status: 500 }
      );
    }

    // Generate JWT token
    const jwtToken = JWTUtils.generateQRToken(actualClientId, qrTokenData.id);

    // Create the mobile upload URL using site origin or configured base URL
    const requestOrigin = new URL(request.url).origin;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || requestOrigin || 'http://localhost:3000';
    const uploadUrl = `${appBaseUrl.replace(/\/$/, '')}/mobile-upload?token=${encodeURIComponent(jwtToken)}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(uploadUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrTokenId: qrTokenData.id,
      qrCodeDataUrl,
      uploadUrl,
      expiresAt: qrTokenData.expires_at
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get existing QR tokens for this client
    const { data: existingTokens, error } = await supabase
      .from('qr_tokens')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR tokens:', error);
      return NextResponse.json(
        { error: 'Failed to fetch QR tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tokens: existingTokens
    });

  } catch (error) {
    console.error('QR tokens fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR tokens' },
      { status: 500 }
    );
  }
} 