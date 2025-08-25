import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if client exists in clients table
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('id', clientId)
      .single();

    let actualClientId = clientId;

    if (clientCheckError && clientCheckError.code === 'PGRST116') {
      // Client doesn't exist in clients table, check for parsed data from mobile uploads
      console.log('Client not found, checking for parsed data from mobile uploads');
      
      // Check if there's any parsed data from mobile uploads for this client ID
      const { data: mobileUploads, error: uploadsError } = await supabase
        .from('client_uploads')
        .select('parsed_data')
        .eq('client_id', clientId)
        .not('parsed_data', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      let clientData = {
        first_name: 'New Client',
        last_name: '',
        gender: 'male',
        nationality: 'Moroccan',
        date_of_birth: null,
        address: '',
        id_number: '',
        license_number: '',
        status: 'active'
      };

      // If we have parsed data from mobile uploads, use it
      if (mobileUploads && mobileUploads.length > 0 && mobileUploads[0].parsed_data) {
        const parsedData = mobileUploads[0].parsed_data;
        console.log('Found parsed data from mobile uploads:', parsedData);
        
        clientData = {
          first_name: parsedData.firstName || parsedData.fullName?.split(' ')[0] || 'New Client',
          last_name: parsedData.lastName || parsedData.fullName?.split(' ').slice(1).join(' ') || '',
          gender: parsedData.gender?.toLowerCase() || 'male',
          nationality: parsedData.nationality || 'Moroccan',
          date_of_birth: parsedData.dateOfBirth || null,
          address: parsedData.address || '',
          id_number: parsedData.idNumber || '',
          license_number: parsedData.licenseNumber || '',
          status: 'active'
        };
        
        console.log('Using parsed data for client creation:', clientData);
      } else {
        console.log('No parsed data found, using default client data');
      }

      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          id: clientId,
          ...clientData
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        return NextResponse.json(
          { error: 'Failed to create client record' },
          { status: 500 }
        );
      }

      actualClientId = newClient.id;
      console.log('Created new client with ID:', actualClientId, 'Name:', clientData.first_name, clientData.last_name);
    } else if (clientCheckError) {
      console.error('Error checking client:', clientCheckError);
      return NextResponse.json(
        { error: 'Failed to check client record' },
        { status: 500 }
      );
    } else {
      actualClientId = existingClient.id;
      console.log('Using existing client with ID:', actualClientId, 'Name:', existingClient.first_name, existingClient.last_name);
    }

    // Create QR token record in database
    const { data: qrTokenData, error: qrTokenError } = await supabase
      .from('qr_tokens')
      .insert({
        client_id: actualClientId,
        token: crypto.randomUUID(), // Generate a unique token
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      })
      .select()
      .single();

    if (qrTokenError) {
      console.error('Error creating QR token:', qrTokenError);
      return NextResponse.json(
        { error: 'Failed to create QR token' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const jwtToken = JWTUtils.generateQRToken(actualClientId, qrTokenData.id);

    // Create the mobile upload URL using app base URL (fallback to localhost:3000)
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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