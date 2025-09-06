// Google Cloud Configuration
// This file contains configuration for Google Cloud services

export const GOOGLE_CONFIG = {
  // Document AI Configuration
  documentAI: {
    // Supported processor types for different document types
    processors: {
      // Identity documents (passports, IDs, driver licenses)
      identityDocuments: {
        name: "Identity Document Processor",
        description: "Processes identity documents like passports, national IDs, and driver licenses",
        supportedTypes: ["passport", "national_id", "driver_license", "identity_card"],
        entityTypes: [
          "first_name", "last_name", "date_of_birth", "place_of_birth",
          "document_id", "expiry_date", "nationality", "gender", "address"
        ]
      },
      
      // Financial documents
      financialDocuments: {
        name: "Financial Document Processor",
        description: "Processes financial documents like invoices, receipts, and bank statements",
        supportedTypes: ["invoice", "receipt", "bank_statement", "tax_document"],
        entityTypes: [
          "invoice_number", "total_amount", "date", "vendor_name",
          "account_number", "balance", "transaction_date"
        ]
      },
      
      // Legal documents
      legalDocuments: {
        name: "Legal Document Processor",
        description: "Processes legal documents like contracts, agreements, and certificates",
        supportedTypes: ["contract", "agreement", "certificate", "legal_document"],
        entityTypes: [
          "party_name", "effective_date", "expiry_date", "document_type",
          "signature_date", "legal_entity", "jurisdiction"
        ]
      }
    },
    
    // Common entity types across all processors
    commonEntities: [
      "text", "date", "number", "email", "phone", "address",
      "organization", "person", "location", "currency", "percentage"
    ]
  },
  
  // OCR Configuration
  ocr: {
    // Supported languages
    languages: ["en", "fr", "ar", "es", "de", "it", "pt", "nl", "ja", "ko", "zh"],
    
    // Image processing options
    imageProcessing: {
      maxFileSize: 20 * 1024 * 1024, // 20MB
      supportedFormats: ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"],
      maxDimensions: { width: 4096, height: 4096 }
    }
  },
  
  // API Configuration
  api: {
    baseUrl: "https://documentai.googleapis.com",
    version: "v1",
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  }
};

// Environment variable validation
export function validateGoogleConfig() {
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_DOCUMENT_AI_PROCESSOR_ID',
    'GOOGLE_ACCESS_TOKEN'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID!,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us',
    processorId: process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID!,
    accessToken: process.env.GOOGLE_ACCESS_TOKEN!
  };
}

// Helper function to get processor configuration
export function getProcessorConfig(processorType: keyof typeof GOOGLE_CONFIG.documentAI.processors) {
  return GOOGLE_CONFIG.documentAI.processors[processorType];
}

// Helper function to check if entity type is supported
export function isEntityTypeSupported(entityType: string, processorType: keyof typeof GOOGLE_CONFIG.documentAI.processors) {
  const processor = getProcessorConfig(processorType);
  return processor.entityTypes.includes(entityType) || GOOGLE_CONFIG.documentAI.commonEntities.includes(entityType);
}












