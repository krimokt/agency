import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { carId, documents } = await request.json();

    if (!carId) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Prepare update data with both URLs and dates
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle document URLs
    if (documents.carte_grise_url !== undefined) updateData.carte_grise_url = documents.carte_grise_url || null;
    if (documents.insurance_url !== undefined) updateData.insurance_url = documents.insurance_url || null;
    if (documents.technical_inspection_url !== undefined) updateData.technical_inspection_url = documents.technical_inspection_url || null;
    if (documents.rental_agreement_url !== undefined) updateData.rental_agreement_url = documents.rental_agreement_url || null;
    if (documents.other_documents_url !== undefined) updateData.other_documents_url = documents.other_documents_url || null;

    // Handle document dates
    if (documents.carte_grise_issue_date !== undefined) updateData.carte_grise_issue_date = documents.carte_grise_issue_date || null;
    if (documents.carte_grise_expiry_date !== undefined) updateData.carte_grise_expiry_date = documents.carte_grise_expiry_date || null;
    if (documents.insurance_issue_date !== undefined) updateData.insurance_issue_date = documents.insurance_issue_date || null;
    if (documents.insurance_expiry_date !== undefined) updateData.insurance_expiry_date = documents.insurance_expiry_date || null;
    if (documents.technical_inspection_issue_date !== undefined) updateData.technical_inspection_issue_date = documents.technical_inspection_issue_date || null;
    if (documents.technical_inspection_expiry_date !== undefined) updateData.technical_inspection_expiry_date = documents.technical_inspection_expiry_date || null;
    if (documents.rental_agreement_start_date !== undefined) updateData.rental_agreement_start_date = documents.rental_agreement_start_date || null;
    if (documents.rental_agreement_end_date !== undefined) updateData.rental_agreement_end_date = documents.rental_agreement_end_date || null;

    // Update the car with document URLs and dates
    const { data, error } = await supabase
      .from('add_new_car')
      .update(updateData)
      .eq('id', carId)
      .select()
      .single();

    if (error) {
      console.error('Error updating car documents:', error);
      return NextResponse.json({ error: 'Failed to update car documents' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      car: data,
      message: 'Car documents updated successfully' 
    });

  } catch (error) {
    console.error('Error in update-documents API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}








