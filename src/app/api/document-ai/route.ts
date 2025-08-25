import { NextResponse } from "next/server";
import { createDocumentAI } from "@/lib/google-document-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get configuration from environment variables
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us";
    const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID;
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

    if (!projectId || !processorId || !accessToken) {
      return NextResponse.json({ 
        error: "Google Cloud configuration missing. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_DOCUMENT_AI_PROCESSOR_ID, and GOOGLE_ACCESS_TOKEN environment variables." 
      }, { status: 500 });
    }

    // Convert file to buffer
    const bytes = Buffer.from(await file.arrayBuffer());

    // Create Document AI instance
    const documentAI = createDocumentAI({
      projectId,
      location,
      processorId,
      accessToken
    });

    // Process document
    const result = await documentAI.processDocument(bytes);
    
    // Extract fields
    const fields = documentAI.extractFields(result);

    return NextResponse.json({
      ok: true,
      fields,
      confidence: result.confidence,
      documentType: result.documentType
    });

  } catch (error: any) {
    console.error("Document AI Error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message || "Document processing failed" 
    }, { status: 500 });
  }
}





