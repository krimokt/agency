import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST: Sync images from client_uploads to clients table
export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();
    const supabase = getSupabaseAdmin();

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Call the sync function for the specific client
    const { error: syncError } = await supabase.rpc('sync_client_images', {
      client_uuid: clientId
    });

    if (syncError) {
      console.error('Error syncing images:', syncError);
      return NextResponse.json(
        { error: `Failed to sync images: ${syncError.message}` },
        { status: 500 }
      );
    }

    // Fetch the updated client data
    const { data: updatedClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated client:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated client data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Images synced successfully'
    });

  } catch (error) {
    console.error('Sync images API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get client images from client_uploads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const supabase = getSupabaseAdmin();

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get client images using the function
    const { data: images, error } = await supabase.rpc('get_client_images', {
      client_uuid: clientId
    });

    if (error) {
      console.error('Error fetching client images:', error);
      return NextResponse.json(
        { error: 'Failed to fetch client images' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: images || []
    });

  } catch (error) {
    console.error('Get client images API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 