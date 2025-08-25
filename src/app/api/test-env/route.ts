import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyStart: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    allEnvVars: {
      GOOGLE_CLOUD_VISION_API_KEY: !!apiKey,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  });
} 