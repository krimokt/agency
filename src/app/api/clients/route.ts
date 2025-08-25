import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET: Retrieve all clients
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clients: clients || []
    });

  } catch (error) {
    console.error('Clients API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new client
export async function POST(request: NextRequest) {
  try {
    const clientData = await request.json();
    const supabase = getSupabaseAdmin();

    // Transform the data to match database schema
    const dbClientData = {
      first_name: clientData.firstName,
      last_name: clientData.lastName,
      // Store null instead of empty string to avoid UNIQUE violations on many empty values
      email: (clientData.email && String(clientData.email).trim().length > 0)
        ? String(clientData.email).trim().toLowerCase()
        : null,
      gender: clientData.gender,
      nationality: clientData.nationality,
      date_of_birth: clientData.dateOfBirth || null,
      phone: clientData.phone,
      address: clientData.address,
      
      // ID Document
      id_number: clientData.idNumber,
      id_issue_date: clientData.idIssueDate || null,
      id_expiry_date: clientData.idExpiryDate || null,
      id_front_image_url: clientData.idFrontImageUrl,
      id_back_image_url: clientData.idBackImageUrl,
      
      // Driving License
      license_number: clientData.licenseNumber,
      license_issue_date: clientData.licenseIssueDate || null,
      license_expiry_date: clientData.licenseExpiryDate || null,
      // Ensure Postgres array type receives a JS array
      license_categories: Array.isArray(clientData.licenseCategories)
        ? clientData.licenseCategories
        : (clientData.licenseCategories ? [clientData.licenseCategories] : []),
      license_front_image_url: clientData.licenseFrontImageUrl,
      license_back_image_url: clientData.licenseBackImageUrl,
      
      // Emergency Contact
      emergency_contact_name: clientData.emergencyContact?.name,
      emergency_contact_phone: clientData.emergencyContact?.phone,
      emergency_contact_relationship: clientData.emergencyContact?.relationship,
      
      // Additional
      notes: clientData.notes,
      
      // Status
      status: 'active'
    };

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([dbClientData])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      // Handle duplicate email specifically
      if ((error as any).code === '23505' && String((error as any).message || '').includes('clients_email_key')) {
        return NextResponse.json(
          { error: 'Email already exists. Use a different email or leave it blank.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create client: ${error.message}` },
        { status: 500 }
      );
    }

    // Automatically sync images from client_uploads if they exist
    if (newClient) {
      try {
        await supabase.rpc('sync_client_images', { client_uuid: newClient.id });
        
        // Fetch the updated client data with synced images
        const { data: updatedClient } = await supabase
          .from('clients')
          .select('*')
          .eq('id', newClient.id)
          .single();
          
        return NextResponse.json({
          success: true,
          client: updatedClient || newClient,
          message: 'Client created successfully with synced images'
        });
      } catch (syncError) {
        console.error('Error syncing images:', syncError);
        // Return the client even if image sync fails
        return NextResponse.json({
          success: true,
          client: newClient,
          message: 'Client created successfully (image sync failed)'
        });
      }
    }

    return NextResponse.json({
      success: true,
      client: newClient,
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('Create client API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 