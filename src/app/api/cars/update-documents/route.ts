import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { carId, documents } = await request.json();

    if (!carId) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Update the car with document URLs
    const { data, error } = await supabase
      .from('add_new_car')
      .update({
        carte_grise_url: documents.carte_grise_url || null,
        insurance_url: documents.insurance_url || null,
        technical_inspection_url: documents.technical_inspection_url || null,
        rental_agreement_url: documents.rental_agreement_url || null,
        other_documents_url: documents.other_documents_url || null,
        updated_at: new Date().toISOString()
      })
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








