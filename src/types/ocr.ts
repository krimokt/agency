/**
 * Core data models and TypeScript interfaces for Moroccan ID OCR Pipeline
 */

// Document types supported by the OCR pipeline
export type DocumentType = 'cin' | 'driver_license';
export type DocumentSide = 'front' | 'back';

// Main interface for extracted fields from any Moroccan document
export interface ExtractedFields {
  // Document metadata
  documentType: DocumentType;
  side: DocumentSide;
  
  // Common fields across all documents
  fullName?: string;
  firstName?: string;
  lastName?: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  gender?: string;
  
  // CIN (National ID) specific fields - Front side
  cinNumber?: string;
  photo?: boolean;
  
  // CIN (National ID) specific fields - Back side
  address?: string;
  addressArabic?: string;
  issueDate?: string;
  expiryDate?: string;
  authority?: string;
  
  // Driver License specific fields - Front side
  licenseNumber?: string;
  licenseCategories?: string[];
  
  // Driver License specific fields - Back side
  restrictions?: string[];
  
  // Processing metadata
  confidence: number;
  fieldConfidences: Record<string, number>;
  processingTime: number;
  extractedAt: string; // ISO timestamp
}

// Field validation results
export interface FieldValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validation results for all extracted fields
export interface ExtractedFieldsValidation {
  isValid: boolean;
  fieldValidations: Record<string, FieldValidation>;
  overallConfidence: number;
  recommendedActions: string[];
}

// Processing request interface
export interface ProcessingRequest {
  file: File;
  documentType: DocumentType;
  side: DocumentSide;
  options?: ProcessingOptions;
}

// Processing options
export interface ProcessingOptions {
  enableFieldValidation?: boolean;
  confidenceThreshold?: number;
  returnRawResults?: boolean;
  enableDebugMode?: boolean;
}

// Processing response interface
export interface ProcessingResponse {
  success: boolean;
  data?: ExtractedFields;
  validation?: ExtractedFieldsValidation;
  error?: OCRError;
  processingTime: number;
  requestId: string;
}

// Error types and interfaces
export enum OCRErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PROCESSOR_NOT_FOUND = 'PROCESSOR_NOT_FOUND',
  FILE_VALIDATION_ERROR = 'FILE_VALIDATION_ERROR',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_DOCUMENT_TYPE = 'INVALID_DOCUMENT_TYPE',
  LOW_CONFIDENCE_SCORE = 'LOW_CONFIDENCE_SCORE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface OCRError {
  type: OCRErrorType;
  message: string;
  details?: any;
  retryable: boolean;
  suggestedAction?: string;
  errorCode?: string;
}

// Google Document AI response interfaces
export interface DocumentAIEntity {
  type: string;
  mentionText: string;
  confidence: number;
  pageAnchor?: {
    pageRefs: Array<{
      page: number;
      boundingPoly?: BoundingPoly;
    }>;
  };
}

export interface BoundingPoly {
  vertices: Array<{
    x?: number;
    y?: number;
  }>;
}

export interface DocumentAIResponse {
  document: {
    text: string;
    entities?: DocumentAIEntity[];
    pages?: Array<{
      pageNumber: number;
      dimension?: {
        width: number;
        height: number;
        unit: string;
      };
    }>;
    textConfidence?: number;
  };
}

// Processing result from Document AI service
export interface ProcessingResult {
  text: string;
  entities: DocumentAIEntity[];
  confidence: number;
  processingTime: number;
  processorId: string;
}

// File validation interfaces
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

// Configuration interfaces
export interface ProcessorMapping {
  cinFront: string;
  cinBack: string;
  driverLicenseFront: string;
  driverLicenseBack: string;
}

// Field mapping for different document types and sides
export interface FieldMapping {
  [documentType: string]: {
    [side: string]: {
      [googleAIFieldName: string]: keyof ExtractedFields;
    };
  };
}

// Default field mappings for Moroccan documents - Updated with your exact entity types
export const MOROCCAN_FIELD_MAPPINGS: FieldMapping = {
  cin: {
    front: {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'first_name_arabic': 'firstNameArabic',
      'last_name_arabic': 'lastNameArabic',
      'dateofbirth': 'dateOfBirth',
      'born_in': 'placeOfBirth',
      'id_number': 'cinNumber'
    },
    back: {
      'living_adress': 'address',
      'address_in_arabic': 'addressArabic',
      'expiry_date': 'expiryDate',
      'issue_date': 'issueDate'
    }
  },
  driver_license: {
    front: {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'first_name_arabic': 'firstNameArabic',
      'last_name_arabic': 'lastNameArabic',
      'dateofbirth': 'dateOfBirth',
      'license_number': 'licenseNumber',
      'id_number': 'licenseNumber'
    },
    back: {
      'living_adress': 'address',
      'address_in_arabic': 'addressArabic',
      'expiry_date': 'expiryDate',
      'issue_date': 'issueDate',
      'restrictions': 'restrictions'
    }
  }
};

// Confidence thresholds for different field types
export const CONFIDENCE_THRESHOLDS = {
  HIGH_CONFIDENCE: 0.9,
  MEDIUM_CONFIDENCE: 0.7,
  LOW_CONFIDENCE: 0.5,
  MINIMUM_ACCEPTABLE: 0.3
} as const;

// Field importance weights for overall confidence calculation
export const FIELD_IMPORTANCE_WEIGHTS = {
  // Critical fields (highest weight)
  cinNumber: 0.25,
  licenseNumber: 0.25,
  firstName: 0.15,
  lastName: 0.15,
  
  // Important fields (medium weight)
  dateOfBirth: 0.10,
  expiryDate: 0.10,
  
  // Supporting fields (lower weight)
  placeOfBirth: 0.05,
  address: 0.05,
  issueDate: 0.05,
  authority: 0.05,
  
  // Optional fields (minimal weight)
  licenseCategories: 0.02,
  restrictions: 0.02,
  photo: 0.01
} as const;

// Validation patterns for different field types
export const VALIDATION_PATTERNS = {
  // Moroccan CIN format: 6-8 digits
  cinNumber: /^[A-Z]{0,2}\d{6,8}$/,
  
  // Date formats: DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  date: /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/,
  
  // Moroccan license number format
  licenseNumber: /^[A-Z]{1,2}\d{6,10}$/,
  
  // Name validation (Arabic and Latin characters)
  name: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s'-]+$/,
  
  // Address validation (more permissive)
  address: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s,.-/]+$/
} as const;

// Export utility type for field keys
export type ExtractedFieldKey = keyof ExtractedFields;
export type DocumentTypeKey = keyof typeof MOROCCAN_FIELD_MAPPINGS;
export type DocumentSideKey = keyof typeof MOROCCAN_FIELD_MAPPINGS[DocumentTypeKey];