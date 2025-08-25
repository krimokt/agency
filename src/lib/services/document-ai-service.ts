/**
 * Google Document AI Service Integration
 * Enhanced service for processing Moroccan identity documents
 */

import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { 
  ExtractedFields, 
  ProcessingResult, 
  DocumentAIResponse, 
  DocumentAIEntity,
  OCRError,
  OCRErrorType,
  DocumentType,
  DocumentSide,
  MOROCCAN_FIELD_MAPPINGS
} from '@/types/ocr';
import { ocrConfig } from '@/lib/config/ocr-config';

export class DocumentAIService {
  private client: DocumentProcessorServiceClient;
  private config: any;

  constructor() {
    this.config = ocrConfig.getProcessorConfig();
    this.client = new DocumentProcessorServiceClient({
      keyFilename: this.config.keyFile,
    });
  }

  /**
   * Process a document using the appropriate processor
   */
  async processDocument(
    fileBuffer: Buffer, 
    documentType: DocumentType, 
    side: DocumentSide,
    mimeType: string = 'image/jpeg'
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Get the correct processor ID
      const processorId = ocrConfig.getProcessorId(documentType, side);
      const processorName = ocrConfig.getProcessorName(documentType, side);
      
      console.log(`🔧 Processing ${documentType} ${side} with processor: ${processorId}`);
      
      const request = {
        name: processorName,
        rawDocument: {
          content: fileBuffer.toString('base64'),
          mimeType: mimeType,
        },
      };

      const [result] = await this.client.processDocument(request);
      
      if (!result.document) {
        throw new Error('Document AI returned no document');
      }

      const processingTime = Date.now() - startTime;
      
      // Extract entities
      const entities: DocumentAIEntity[] = (result.document.entities || []).map((entity: any) => ({
        type: entity.type || '',
        mentionText: entity.mentionText || '',
        confidence: entity.confidence || 0,
        pageAnchor: entity.pageAnchor
      }));

      // Calculate overall confidence
      const confidence = this.calculateConfidence(entities);

      return {
        text: result.document.text || '',
        entities,
        confidence,
        processingTime,
        processorId
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Document AI processing error:', error);
      
      throw this.createOCRError(error, processingTime);
    }
  }

  /**
   * Extract structured fields from processing result
   */
  extractFields(
    result: ProcessingResult, 
    documentType: DocumentType, 
    side: DocumentSide
  ): ExtractedFields {
    const extractedFields: ExtractedFields = {
      documentType,
      side,
      confidence: result.confidence,
      fieldConfidences: {},
      processingTime: result.processingTime,
      extractedAt: new Date().toISOString()
    };

    // Get field mappings for this document type and side
    const mappings = MOROCCAN_FIELD_MAPPINGS[documentType]?.[side] || {};
    
    console.log(`🗺️ Using field mappings for ${documentType} ${side}:`, mappings);
    
    // Process each entity
    result.entities.forEach((entity) => {
      const entityType = entity.type.toLowerCase();
      const mentionText = entity.mentionText.trim();
      
      console.log(`🔍 Processing entity: ${entity.type} = "${mentionText}" (confidence: ${entity.confidence})`);
      
      // Store field confidence
      extractedFields.fieldConfidences[entity.type] = entity.confidence;
      
      // Try direct mapping first
      const mappedField = mappings[entityType];
      if (mappedField) {
        (extractedFields as any)[mappedField] = mentionText;
        console.log(`✅ Mapped ${entity.type} -> ${mappedField}: ${mentionText}`);
        return;
      }
      
      // Fallback to fuzzy matching for common patterns
      this.fuzzyMapField(extractedFields, entity.type, mentionText, entity.confidence);
    });

    // Post-process fields
    this.postProcessFields(extractedFields);
    
    return extractedFields;
  }

  /**
   * Fuzzy field mapping for entities that don't match exact patterns
   */
  private fuzzyMapField(
    fields: ExtractedFields, 
    entityType: string, 
    mentionText: string, 
    confidence: number
  ): void {
    const type = entityType.toLowerCase();
    
    // Name patterns
    if (this.matchesPattern(type, ['first_name', 'given_name', 'prenom', 'prénom'])) {
      fields.firstName = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> firstName: ${mentionText}`);
    } 
    else if (this.matchesPattern(type, ['last_name', 'family_name', 'surname', 'nom_famille', 'nom'])) {
      fields.lastName = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> lastName: ${mentionText}`);
    }
    else if (this.matchesPattern(type, ['full_name', 'complete_name', 'nom_complet', 'name'])) {
      fields.fullName = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> fullName: ${mentionText}`);
      
      // Try to split full name if individual names not found
      if (!fields.firstName && !fields.lastName) {
        const nameParts = mentionText.split(/\s+/);
        if (nameParts.length >= 2) {
          fields.firstName = nameParts[0];
          fields.lastName = nameParts.slice(1).join(' ');
          console.log(`🔄 Split fullName: ${fields.firstName} | ${fields.lastName}`);
        }
      }
    }
    
    // Date patterns
    else if (this.matchesPattern(type, ['birth_date', 'date_naissance', 'date_of_birth', 'dob'])) {
      fields.dateOfBirth = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> dateOfBirth: ${mentionText}`);
    }
    else if (this.matchesPattern(type, ['issue_date', 'date_emission', 'date_delivrance', 'delivery_date'])) {
      fields.issueDate = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> issueDate: ${mentionText}`);
    }
    else if (this.matchesPattern(type, ['expiry_date', 'expiration_date', 'date_expiration', 'valid_until'])) {
      fields.expiryDate = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> expiryDate: ${mentionText}`);
    }
    
    // Document ID patterns
    else if (this.matchesPattern(type, ['document_id', 'cin', 'carte_identite', 'id_number', 'numero_cin'])) {
      fields.cinNumber = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> cinNumber: ${mentionText}`);
    }
    else if (this.matchesPattern(type, ['license_number', 'permis', 'licence', 'numero_permis'])) {
      fields.licenseNumber = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> licenseNumber: ${mentionText}`);
    }
    
    // Location patterns
    else if (this.matchesPattern(type, ['birth_place', 'lieu_naissance', 'place_of_birth', 'birthplace'])) {
      fields.placeOfBirth = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> placeOfBirth: ${mentionText}`);
    }
    else if (this.matchesPattern(type, ['address', 'adresse', 'domicile', 'residence'])) {
      fields.address = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> address: ${mentionText}`);
    }
    
    // Other patterns
    else if (this.matchesPattern(type, ['nationality', 'nationalite', 'nationalité'])) {
      fields.nationality = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> nationality: ${mentionText}`);
    }
    else if (this.matchesPattern(type, ['gender', 'sexe', 'sex'])) {
      fields.gender = mentionText;
      console.log(`🔄 Fuzzy mapped ${entityType} -> gender: ${mentionText}`);
    }
    else {
      console.log(`❓ No mapping found for entity type: ${entityType}`);
    }
  }

  /**
   * Check if entity type matches any of the given patterns
   */
  private matchesPattern(entityType: string, patterns: string[]): boolean {
    return patterns.some(pattern => 
      entityType.includes(pattern) || 
      pattern.includes(entityType) ||
      entityType.replace(/[_-]/g, '').includes(pattern.replace(/[_-]/g, ''))
    );
  }

  /**
   * Post-process extracted fields for better formatting
   */
  private postProcessFields(fields: ExtractedFields): void {
    // Clean up names
    if (fields.firstName) {
      fields.firstName = this.cleanName(fields.firstName);
    }
    if (fields.lastName) {
      fields.lastName = this.cleanName(fields.lastName);
    }
    if (fields.fullName) {
      fields.fullName = this.cleanName(fields.fullName);
    }

    // Normalize dates
    if (fields.dateOfBirth) {
      fields.dateOfBirth = this.normalizeDate(fields.dateOfBirth);
    }
    if (fields.issueDate) {
      fields.issueDate = this.normalizeDate(fields.issueDate);
    }
    if (fields.expiryDate) {
      fields.expiryDate = this.normalizeDate(fields.expiryDate);
    }

    // Clean document IDs
    if (fields.cinNumber) {
      fields.cinNumber = this.cleanDocumentId(fields.cinNumber);
    }
    if (fields.licenseNumber) {
      fields.licenseNumber = this.cleanDocumentId(fields.licenseNumber);
    }
  }

  /**
   * Clean and normalize name fields
   */
  private cleanName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^(M\.|Mme|Mr|Mrs|Miss)\.?\s*/i, '') // Remove titles
      .replace(/\b(NOM|PRENOM|NAME)\b:?\s*/gi, ''); // Remove field labels
  }

  /**
   * Normalize date format
   */
  private normalizeDate(dateStr: string): string {
    if (!dateStr) return dateStr;

    // Remove common prefixes
    const cleaned = dateStr.replace(/^(né|née|born|date)\s*:?\s*/i, '').trim();
    
    // Try to match DD/MM/YYYY or DD.MM.YYYY format
    const match = cleaned.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${day}/${month}/${year}`;
    }

    return cleaned;
  }

  /**
   * Clean document ID fields
   */
  private cleanDocumentId(id: string): string {
    return id
      .trim()
      .replace(/^(No|N°|#|CIN|ID)\s*:?\s*/i, '') // Remove prefixes
      .replace(/\s+/g, '') // Remove spaces
      .toUpperCase();
  }

  /**
   * Calculate overall confidence from entities
   */
  private calculateConfidence(entities: DocumentAIEntity[]): number {
    if (entities.length === 0) return 0;
    
    const totalConfidence = entities.reduce((sum, entity) => sum + entity.confidence, 0);
    return totalConfidence / entities.length;
  }

  /**
   * Create appropriate OCR error from caught exception
   */
  private createOCRError(error: any, processingTime: number): OCRError {
    let errorType = OCRErrorType.UNKNOWN_ERROR;
    let retryable = false;
    let suggestedAction = 'Check logs for more details';

    if (error.message?.includes('NOT_FOUND')) {
      errorType = OCRErrorType.PROCESSOR_NOT_FOUND;
      suggestedAction = 'Verify processor ID and project configuration';
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorType = OCRErrorType.AUTHENTICATION_ERROR;
      suggestedAction = 'Check service account permissions';
    } else if (error.message?.includes('DEADLINE_EXCEEDED')) {
      errorType = OCRErrorType.PROCESSING_TIMEOUT;
      retryable = true;
      suggestedAction = 'Retry with smaller file or better network connection';
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      errorType = OCRErrorType.QUOTA_EXCEEDED;
      suggestedAction = 'Check Google Cloud quotas and billing';
    }

    return {
      type: errorType,
      message: error.message || 'Unknown error occurred',
      details: {
        processingTime,
        originalError: error
      },
      retryable,
      suggestedAction,
      errorCode: error.code
    };
  }
}