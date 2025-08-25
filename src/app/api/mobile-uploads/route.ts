import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    // Fetch mobile uploads for the client
    const { data: uploads, error } = await supabase
      .from('client_uploads')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mobile uploads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mobile uploads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploads: uploads || []
    });

  } catch (error) {
    console.error('Mobile uploads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 