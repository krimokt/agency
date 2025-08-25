import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const envStatus = {
      supabaseUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      anonKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRolePresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    } as const;

    // Connectivity probe to Supabase REST endpoint
    const connectivity: { restUrl?: string; ok: boolean; status?: number; error?: string } = { ok: false };
    try {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
      const restUrl = base ? `${base}/rest/v1` : '';
      connectivity.restUrl = restUrl || undefined;
      if (restUrl) {
        const resp = await fetch(restUrl, { method: 'HEAD' });
        connectivity.ok = resp.ok;
        connectivity.status = resp.status;
      } else {
        connectivity.error = 'SUPABASE URL not set';
      }
    } catch (e: any) {
      connectivity.ok = false;
      connectivity.error = e?.message || String(e);
    }

    const supabase = getSupabaseAdmin();

    // Test if qr_tokens table exists
    const { data: qrTokens, error: qrError } = await supabase
      .from('qr_tokens')
      .select('count(*)')
      .limit(1);

    // Test if client_uploads table exists
    const { data: clientUploads, error: clientError } = await supabase
      .from('client_uploads')
      .select('count(*)')
      .limit(1);

    // Test if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    return NextResponse.json({
      success: true,
      env: envStatus,
      connectivity,
      tables: {
        qr_tokens: {
          exists: !qrError,
          error: qrError?.message
        },
        client_uploads: {
          exists: !clientError,
          error: clientError?.message
        }
      },
      storage: {
        buckets: buckets?.map(b => b.name) || [],
        error: bucketError?.message
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: `Database test failed: ${error}` },
      { status: 500 }
    );
  }
} 