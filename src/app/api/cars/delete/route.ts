import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('id');
    
    if (!carId) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // First, check if the car exists
    const { data: car, error: fetchError } = await supabase
      .from('add_new_car')
      .select('id, brand, model, plate_number')
      .eq('id', carId)
      .single();

    if (fetchError || !car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Delete related records first (car_uploads, car_qr_tokens, car_qrscan)
    await supabase.from('car_uploads').delete().eq('car_id', carId);
    await supabase.from('car_qr_tokens').delete().eq('car_id', carId);
    await supabase.from('car_qrscan').delete().eq('car_id', carId);

    // Delete the car record
    const { error: deleteError } = await supabase
      .from('add_new_car')
      .delete()
      .eq('id', carId);

    if (deleteError) {
      console.error('Error deleting car:', deleteError);
      return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Car ${car.brand} ${car.model} (${car.plate_number}) deleted successfully` 
    });

  } catch (error) {
    console.error('Delete car error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}








