import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import fs from "fs";
import path from "path";

// Initialize the Document AI client
const client = new DocumentProcessorServiceClient({
  keyFilename: process.env.GCP_KEY_FILE,
});

export interface DocumentAIResult {
  text: string;
  entities: DocumentEntity[];
  confidence: number;
  documentType: string;
  pages: Page[];
}

export interface DocumentEntity {
  type: string;
  text: string;
  confidence: number;
}

export interface Page {
  pageNumber: number;
  text: string;
}

/**
 * Process a document using Google Document AI
 */
export async function processDocument(
  processorId: string, 
  filePath: string,
  mimeType: string = "image/jpeg"
): Promise<DocumentAIResult> {
  try {
    console.log("🔧 Document AI processing started:", {
      processorId,
      filePath,
      mimeType,
      projectId: process.env.GCP_PROJECT_ID,
      location: process.env.GCP_LOCATION
    });

    const name = `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}/processors/${processorId}`;
    console.log("📍 Full processor name:", name);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    console.log("📁 File read successfully, size:", fileBuffer.length, "bytes");

    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    console.log("📤 Sending request to Document AI...");
    const [result] = await client.processDocument(request);
    console.log("📥 Received response from Document AI");

    const { document } = result;

    if (!document) {
      throw new Error("No document returned from Document AI");
    }

    // Extract text safely
    const text = (document as any).text || "";
    
    // Extract entities safely
    const entities: DocumentEntity[] = [];
    const documentEntities = (document as any).entities || [];
    
    documentEntities.forEach((entity: any) => {
      if (entity.type && entity.mentionText) {
        entities.push({
          type: entity.type,
          text: entity.mentionText,
          confidence: entity.confidence || 0,
        });
      }
    });

    // Extract pages safely
    const pages: Page[] = [];
    const documentPages = (document as any).pages || [];
    
    documentPages.forEach((page: any) => {
      pages.push({
        pageNumber: page.pageNumber || 0,
        text: page.text || "",
      });
    });

    // Get confidence safely
    const confidence = (document as any).textConfidence || 0;

    console.log("📄 Document processing results:", {
      hasText: !!text,
      textLength: text.length,
      entityCount: entities.length,
      pageCount: pages.length,
      confidence: confidence
    });

    const resultData = {
      text,
      entities,
      confidence,
      documentType: mimeType,
      pages,
    };

    console.log("✅ Document AI processing completed successfully");
    return resultData;

  } catch (error) {
    console.error("❌ Document AI processing failed:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processorId,
      filePath,
      mimeType
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('NOT_FOUND')) {
        throw new Error(`Processor not found: ${processorId}. Please check your processor ID and location.`);
      }
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error(`Permission denied. Please check your service account permissions and API enablement.`);
      }
      if (error.message.includes('INVALID_ARGUMENT')) {
        throw new Error(`Invalid argument. Please check your processor ID format and project configuration.`);
      }
      throw new Error(`Document processing failed: ${error.message}`);
    }
    
    throw new Error(`Document processing failed: ${error}`);
  }
}

/**
 * Extract structured fields from Document AI results
 */
export function extractFields(result: DocumentAIResult): Record<string, any> {
  const fields: Record<string, any> = {};
  
  // Map entities to fields
  result.entities.forEach((entity) => {
    fields[entity.type] = entity.text;
  });

  // Add metadata
  fields.fullText = result.text;
  fields.confidence = result.confidence;
  fields.documentType = result.documentType;
  fields.pageCount = result.pages.length;

  return fields;
}

/**
 * Get supported processor types
 */
export const PROCESSOR_TYPES = {
  // Identity documents
  IDENTITY_DOCUMENTS: "Identity Document Processor",
  DRIVER_LICENSE: "Driver License Processor",
  PASSPORT: "Passport Processor",
  
  // Financial documents
  INVOICE: "Invoice Processor",
  RECEIPT: "Receipt Processor",
  BANK_STATEMENT: "Bank Statement Processor",
  
  // Legal documents
  CONTRACT: "Contract Processor",
  AGREEMENT: "Agreement Processor",
  CERTIFICATE: "Certificate Processor",
} as const;

/**
 * Get common entity types for identity documents
 */
export const IDENTITY_ENTITIES = [
  "first_name",
  "last_name",
  "date_of_birth",
  "place_of_birth",
  "document_id",
  "expiry_date",
  "nationality",
  "gender",
  "address",
  "issuing_authority",
  "issue_date",
] as const;

/**
 * Validate environment configuration
 */
export function validateConfig(): void {
  console.log("🔍 Validating configuration...");
  
  const required = ['GCP_PROJECT_ID', 'GCP_LOCATION', 'GCP_KEY_FILE'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Check if key file exists
  const keyFile = process.env.GCP_KEY_FILE!;
  if (!fs.existsSync(keyFile)) {
    throw new Error(`Service account key file not found: ${keyFile}`);
  }
  
  console.log("✅ Configuration validation passed");
  console.log("📋 Configuration details:", {
    projectId: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_LOCATION,
    keyFile: process.env.GCP_KEY_FILE
  });
}
