import { NextResponse } from "next/server";
import { validateConfig } from "@/lib/docai";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("🧪 Testing Document AI configuration...");
    
    // Test environment variables
    const envVars = {
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
      GCP_LOCATION: process.env.GCP_LOCATION,
      GCP_KEY_FILE: process.env.GCP_KEY_FILE,
    };
    
    console.log("📋 Environment variables:", envVars);
    
    // Validate configuration
    validateConfig();
    
    return NextResponse.json({
      ok: true,
      message: "Configuration is valid",
      environment: envVars,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("❌ Configuration test failed:", error.message);
    
    return NextResponse.json({
      ok: false,
      error: error.message,
      environment: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        GCP_LOCATION: process.env.GCP_LOCATION,
        GCP_KEY_FILE: process.env.GCP_KEY_FILE,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}







