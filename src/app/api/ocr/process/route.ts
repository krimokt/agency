import { NextResponse } from "next/server";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { performanceOptimizer, FileProcessor, ProcessingMetrics } from "@/lib/services/performance-optimizer";

export const runtime = "nodejs";

// Document type detection patterns
const DOCUMENT_PATTERNS = {
  cin_front: {
    keywords: ['royaume du maroc', 'carte nationale', 'identité', 'cin', 'national', 'identity'],
    processors: {
      primary: process.env.PROCESSOR_ID_CIN_FRONT || "3a99d7a85b81d553",
      fallback: process.env.PROCESSOR_ID_CIN_BACK || "57289e0cb8656e24"
    }
  },
  cin_back: {
    keywords: ['adresse', 'address', 'lieu de naissance', 'date de délivrance', 'autorité'],
    processors: {
      primary: process.env.PROCESSOR_ID_CIN_BACK || "57289e0cb8656e24",
      fallback: process.env.PROCESSOR_ID_CIN_FRONT || "3a99d7a85b81d553"
    }
  },
  driver_front: {
    keywords: ['permis de conduire', 'driving license', 'licence', 'categories', 'catégories'],
    processors: {
      primary: process.env.PROCESSOR_ID_DRIVER_FRONT || "66a18a389e1dc180",
      fallback: process.env.PROCESSOR_ID_DRIVER_BACK || "c48ce968f7471c21"
    }
  },
  driver_back: {
    keywords: ['restrictions', 'limitations', 'codes', 'observations'],
    processors: {
      primary: process.env.PROCESSOR_ID_DRIVER_BACK || "c48ce968f7471c21",
      fallback: process.env.PROCESSOR_ID_DRIVER_FRONT || "66a18a389e1dc180"
    }
  }
};

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    console.log("🚀 Fast OCR Processing Started...");

    // Environment validation
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || 'us';
    const keyFile = process.env.GCP_KEY_FILE;

    if (!projectId || !location || !keyFile) {
      return NextResponse.json({
        success: false,
        error: "Missing GCP configuration",
        processingTime: Date.now() - startTime
      }, { status: 500 });
    }

    // Initialize Document AI client
    const client = new DocumentProcessorServiceClient({
      keyFilename: keyFile,
    });

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string || 'auto';
    const side = formData.get('side') as string || 'auto';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file provided",
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }

    console.log(`📄 Processing: ${file.name} (${file.size} bytes)`);

    // Validate and convert file to buffer
    const validation = FileProcessor.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }

    const fileBuffer = await FileProcessor.convertToBuffer(file);
    const optimizedBuffer = await performanceOptimizer.optimizeImage(fileBuffer, file.type);
    
    // Step 1: Quick OCR for document type detection (if auto)
    let detectedType = documentType;
    let detectedSide = side;
    
    if (documentType === 'auto' || side === 'auto') {
      console.log("🔍 Auto-detecting document type...");
      const quickOcrResult = await performQuickOCR(client, optimizedBuffer, projectId, location, file.type);
      const detection = detectDocumentType(quickOcrResult.text);
      
      if (documentType === 'auto') detectedType = detection.type;
      if (side === 'auto') detectedSide = detection.side;
      
      console.log(`🎯 Detected: ${detectedType} ${detectedSide}`);
    }

    // Step 2: Process with appropriate processor (with caching and deduplication)
    const processorId = getProcessorId(detectedType, detectedSide);
    console.log(`🔧 Using processor: ${processorId}`);

    const cacheKey = performanceOptimizer.generateCacheKey(optimizedBuffer, processorId);
    
    // Check cache first
    let result = performanceOptimizer.getCachedResult(cacheKey);
    
    if (!result) {
      // Process with deduplication
      result = await performanceOptimizer.deduplicateRequest(
        cacheKey,
        () => processWithProcessor(client, optimizedBuffer, processorId, projectId, location, file.type)
      );
      
      // Cache the result
      performanceOptimizer.cacheResult(cacheKey, result);
    }

    // Step 3: Extract and map fields
    const extractedFields = extractAndMapFields(result, detectedType, detectedSide);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Processing completed in ${processingTime}ms`);

    // Record metrics
    ProcessingMetrics.recordRequest(true, processingTime);

    return NextResponse.json({
      success: true,
      data: {
        documentType: detectedType,
        side: detectedSide,
        fields: extractedFields,
        confidence: calculateOverallConfidence(result.entities || []),
        processingTime
      },
      processingTime,
      requestId: generateRequestId()
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error("❌ OCR Processing failed:", error);
    
    // Record error metrics
    ProcessingMetrics.recordRequest(false, processingTime, error.name || 'UnknownError');
    
    return NextResponse.json({
      success: false,
      error: error.message || "Processing failed",
      processingTime,
      requestId: generateRequestId()
    }, { status: 500 });
  }
}

// Quick OCR for document type detection
async function performQuickOCR(
  client: DocumentProcessorServiceClient,
  fileBuffer: Buffer,
  projectId: string,
  location: string,
  mimeType: string
) {
  // Use CIN front processor for quick detection (fastest)
  const processorId = process.env.PROCESSOR_ID_CIN_FRONT || "3a99d7a85b81d553";
  const processorName = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  
  const request = {
    name: processorName,
    rawDocument: {
      content: fileBuffer.toString("base64"),
      mimeType: mimeType || "image/jpeg",
    },
  };

  const [result] = await client.processDocument(request);
  return {
    text: result.document?.text || "",
    entities: result.document?.entities || []
  };
}

// Detect document type from OCR text
function detectDocumentType(text: string): { type: string; side: string } {
  const lowerText = text.toLowerCase();
  
  // Check for driver license indicators
  if (lowerText.includes('permis de conduire') || 
      lowerText.includes('driving license') || 
      lowerText.includes('categories') ||
      lowerText.includes('catégories')) {
    
    // Check if it's back side (has restrictions/codes)
    if (lowerText.includes('restrictions') || 
        lowerText.includes('limitations') || 
        lowerText.includes('codes') ||
        lowerText.includes('observations')) {
      return { type: 'driver_license', side: 'back' };
    }
    return { type: 'driver_license', side: 'front' };
  }
  
  // Check for CIN indicators
  if (lowerText.includes('carte nationale') || 
      lowerText.includes('identité') || 
      lowerText.includes('royaume du maroc') ||
      lowerText.includes('cin')) {
    
    // Check if it's back side (has address)
    if (lowerText.includes('adresse') || 
        lowerText.includes('address') || 
        lowerText.includes('lieu de naissance') ||
        lowerText.includes('date de délivrance')) {
      return { type: 'cin', side: 'back' };
    }
    return { type: 'cin', side: 'front' };
  }
  
  // Default fallback
  return { type: 'cin', side: 'front' };
}

// Get processor ID based on document type and side
function getProcessorId(documentType: string, side: string): string {
  const key = `${documentType}_${side}` as keyof typeof DOCUMENT_PATTERNS;
  return DOCUMENT_PATTERNS[key]?.processors.primary || process.env.PROCESSOR_ID_CIN_FRONT || "3a99d7a85b81d553";
}

// Process with specific processor
async function processWithProcessor(
  client: DocumentProcessorServiceClient,
  fileBuffer: Buffer,
  processorId: string,
  projectId: string,
  location: string,
  mimeType: string
) {
  const processorName = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  
  const request = {
    name: processorName,
    rawDocument: {
      content: fileBuffer.toString("base64"),
      mimeType: mimeType || "image/jpeg",
    },
  };

  const [result] = await client.processDocument(request);
  
  if (!result.document) {
    throw new Error("Document AI returned no document");
  }

  return {
    text: result.document.text || "",
    entities: result.document.entities || []
  };
}

// Extract and map fields based on document type
function extractAndMapFields(result: any, documentType: string, side: string) {
  const fields: any = {};
  const rawEntities: any[] = [];
  
  console.log(`🗺️ Mapping fields for ${documentType} ${side}`);
  
  if (result.entities) {
    result.entities.forEach((entity: any) => {
      if (entity.type && entity.mentionText) {
        const entityType = entity.type.toLowerCase();
        const mentionText = entity.mentionText.trim();
        
        rawEntities.push({
          type: entity.type,
          text: mentionText,
          confidence: entity.confidence || 0
        });

        // Store original entity
        fields[entity.type] = mentionText;
        
        // Map to standard field names
        mapEntityToStandardFields(fields, entityType, mentionText, documentType, side);
      }
    });
  }

  // Add metadata
  fields.fullText = result.text;
  fields.rawEntities = rawEntities;
  fields.documentType = documentType;
  fields.side = side;
  
  console.log("📋 Mapped fields:", Object.keys(fields).filter(k => !['fullText', 'rawEntities'].includes(k)));
  
  return fields;
}

// Map entity to standard field names
function mapEntityToStandardFields(
  fields: any, 
  entityType: string, 
  mentionText: string, 
  documentType: string, 
  side: string
) {
  // Name mappings
  if (entityType === 'first_name') {
    fields.firstName = mentionText;
    fields.first_name = mentionText;
  } else if (entityType === 'last_name') {
    fields.lastName = mentionText;
    fields.last_name = mentionText;
  } else if (entityType === 'first_name_arabic') {
    fields.firstNameArabic = mentionText;
    fields.first_name_arabic = mentionText;
  } else if (entityType === 'last_name_arabic') {
    fields.lastNameArabic = mentionText;
    fields.last_name_arabic = mentionText;
  }
  
  // Date mappings
  else if (entityType === 'dateofbirth' || entityType === 'date_of_birth') {
    fields.dateOfBirth = mentionText;
    fields.dateofbirth = mentionText;
    fields.date_of_birth = mentionText;
  } else if (entityType === 'expiry_date' || entityType === 'expiration_date') {
    fields.expiryDate = mentionText;
    fields.expiry_date = mentionText;
  } else if (entityType === 'issue_date' || entityType === 'date_emission') {
    fields.issueDate = mentionText;
    fields.issue_date = mentionText;
  }
  
  // Document ID mappings
  else if (entityType === 'id_number' || entityType === 'cin' || entityType === 'document_id') {
    fields.cinNumber = mentionText;
    fields.ID_number = mentionText;
    fields.id_number = mentionText;
    fields.idNumber = mentionText;
  } else if (entityType === 'license_number' || entityType === 'permis') {
    fields.licenseNumber = mentionText;
    fields.license_number = mentionText;
  }
  
  // Location mappings
  else if (entityType === 'born_in' || entityType === 'place_of_birth' || entityType === 'lieu_naissance') {
    fields.placeOfBirth = mentionText;
    fields.born_in = mentionText;
    fields.place_of_birth = mentionText;
  } else if (entityType === 'living_adress' || entityType === 'address_in_arabic' || entityType === 'address') {
    fields.address = mentionText;
    fields.living_adress = mentionText;
    fields.address_in_arabic = mentionText;
  }
  
  // Other mappings
  else if (entityType === 'nationality' || entityType === 'nationalite') {
    fields.nationality = mentionText;
  } else if (entityType === 'gender' || entityType === 'sexe') {
    fields.gender = mentionText;
  }
  
  // Driver license specific
  else if (entityType === 'categories' || entityType === 'license_categories') {
    fields.licenseCategories = mentionText.split(/[,\s]+/).filter(c => c.length > 0);
    fields.categories = mentionText;
  } else if (entityType === 'restrictions' || entityType === 'limitations') {
    fields.restrictions = mentionText.split(/[,\s]+/).filter(r => r.length > 0);
  }
}

// Calculate overall confidence
function calculateOverallConfidence(entities: any[]): number {
  if (entities.length === 0) return 0;
  
  const totalConfidence = entities.reduce((sum, entity) => {
    return sum + (entity.confidence || 0);
  }, 0);
  
  return totalConfidence / entities.length;
}

// Generate unique request ID
function generateRequestId(): string {
  return `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}