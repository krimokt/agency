/**
 * Unit tests for field validation functions
 */

import {
  validateField,
  validateDate,
  validateExtractedFields,
  meetsMinimumQuality,
  formatValidationResults
} from '../field-validation';
import { ExtractedFields, DocumentType, DocumentSide } from '@/types/ocr';

describe('validateField', () => {
  it('should validate CIN numbers correctly', () => {
    // Valid CIN numbers
    expect(validateField('cinNumber', '123456').isValid).toBe(true);
    expect(validateField('cinNumber', 'AB123456').isValid).toBe(true);
    expect(validateField('cinNumber', '12345678').isValid).toBe(true);
    
    // Invalid CIN numbers
    expect(validateField('cinNumber', '12345').isValid).toBe(false); // too short
    expect(validateField('cinNumber', 'ABC123456').isValid).toBe(false); // too many letters
    expect(validateField('cinNumber', '123456789').isValid).toBe(false); // too long
  });

  it('should validate license numbers correctly', () => {
    // Valid license numbers
    expect(validateField('licenseNumber', 'A123456').isValid).toBe(true);
    expect(validateField('licenseNumber', 'AB1234567890').isValid).toBe(true);
    
    // Invalid license numbers
    expect(validateField('licenseNumber', '123456').isValid).toBe(false); // no letters
    expect(validateField('licenseNumber', 'ABC123').isValid).toBe(false); // too many letters
    expect(validateField('licenseNumber', 'A12345').isValid).toBe(false); // too short
  });

  it('should validate names correctly', () => {
    // Valid names
    expect(validateField('firstName', 'Ahmed').isValid).toBe(true);
    expect(validateField('firstName', 'محمد').isValid).toBe(true);
    expect(validateField('firstName', "O'Connor").isValid).toBe(true);
    
    // Invalid names
    expect(validateField('firstName', 'A').isValid).toBe(false); // too short
    expect(validateField('firstName', '').isValid).toBe(true); // empty is allowed
  });

  it('should add confidence warnings', () => {
    const result = validateField('firstName', 'Ahmed', 0.3);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Low confidence');
  });

  it('should handle undefined values gracefully', () => {
    const result = validateField('firstName', undefined);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateDate', () => {
  it('should validate correct date formats', () => {
    expect(validateDate('25/03/1990').isValid).toBe(true);
    expect(validateDate('25.03.1990').isValid).toBe(true);
    expect(validateDate('25-03-1990').isValid).toBe(true);
    expect(validateDate('01/01/2000').isValid).toBe(true);
  });

  it('should reject invalid date formats', () => {
    expect(validateDate('1990/03/25').isValid).toBe(false); // wrong format
    expect(validateDate('25/03/90').isValid).toBe(false); // 2-digit year
    expect(validateDate('invalid').isValid).toBe(false);
    expect(validateDate('32/01/2000').isValid).toBe(false); // invalid day
    expect(validateDate('01/13/2000').isValid).toBe(false); // invalid month
  });

  it('should detect invalid dates', () => {
    expect(validateDate('29/02/2021').isValid).toBe(false); // not a leap year
    expect(validateDate('31/04/2000').isValid).toBe(false); // April has 30 days
  });

  it('should warn about unusual years', () => {
    const result = validateDate('01/01/1800');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('unusual');
  });

  it('should handle empty dates', () => {
    const result = validateDate('');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateExtractedFields', () => {
  const createMockFields = (overrides: Partial<ExtractedFields> = {}): ExtractedFields => ({
    documentType: 'cin' as DocumentType,
    side: 'front' as DocumentSide,
    firstName: 'Ahmed',
    lastName: 'Benali',
    cinNumber: '123456',
    dateOfBirth: '25/03/1990',
    confidence: 0.85,
    fieldConfidences: {
      firstName: 0.9,
      lastName: 0.8,
      cinNumber: 0.95,
      dateOfBirth: 0.7
    },
    processingTime: 1500,
    extractedAt: new Date().toISOString(),
    ...overrides
  });

  it('should validate correct fields', () => {
    const fields = createMockFields();
    const result = validateExtractedFields(fields);
    
    expect(result.isValid).toBe(true);
    expect(result.overallConfidence).toBeGreaterThan(0.8);
    // Should not have missing critical fields error since we have firstName, lastName, cinNumber
    expect(result.recommendedActions).not.toContain(
      expect.stringContaining('Missing critical fields')
    );
  });

  it('should detect validation errors', () => {
    const fields = createMockFields({
      cinNumber: '12345', // invalid format
      dateOfBirth: '32/01/2000' // invalid date
    });
    
    const result = validateExtractedFields(fields);
    
    expect(result.isValid).toBe(false);
    expect(result.fieldValidations.cinNumber.isValid).toBe(false);
    expect(result.fieldValidations.dateOfBirth.isValid).toBe(false);
  });

  it('should calculate weighted confidence correctly', () => {
    const fields = createMockFields({
      fieldConfidences: {
        firstName: 0.9,
        lastName: 0.8,
        cinNumber: 0.95, // high weight field
        dateOfBirth: 0.5  // lower confidence
      }
    });
    
    const result = validateExtractedFields(fields);
    
    // Should be weighted towards the high-confidence, high-weight cinNumber
    expect(result.overallConfidence).toBeGreaterThan(0.7);
  });

  it('should recommend actions for low confidence', () => {
    const fields = createMockFields({
      confidence: 0.4,
      fieldConfidences: {
        firstName: 0.4,
        lastName: 0.3,
        cinNumber: 0.5
      }
    });
    
    const result = validateExtractedFields(fields);
    
    expect(result.recommendedActions.some(action => 
      action.includes('re-scanning the document')
    )).toBe(true);
  });

  it('should detect missing critical fields', () => {
    const fields = createMockFields({
      firstName: '',
      lastName: '',
      cinNumber: undefined
    });
    
    const result = validateExtractedFields(fields);
    
    expect(result.recommendedActions.some(action => 
      action.includes('Missing critical fields')
    )).toBe(true);
  });
});

describe('meetsMinimumQuality', () => {
  const createMockFields = (overrides: Partial<ExtractedFields> = {}): ExtractedFields => ({
    documentType: 'cin' as DocumentType,
    side: 'front' as DocumentSide,
    firstName: 'Ahmed',
    lastName: 'Benali',
    cinNumber: '123456',
    confidence: 0.7,
    fieldConfidences: {},
    processingTime: 1500,
    extractedAt: new Date().toISOString(),
    ...overrides
  });

  it('should pass for good quality fields', () => {
    const fields = createMockFields({
      confidence: 0.8,
      fieldConfidences: { firstName: 0.9, cinNumber: 0.85 }
    });
    
    expect(meetsMinimumQuality(fields)).toBe(true);
  });

  it('should fail for low confidence', () => {
    const fields = createMockFields({
      confidence: 0.2,
      fieldConfidences: { firstName: 0.2, cinNumber: 0.1 }
    });
    
    expect(meetsMinimumQuality(fields)).toBe(false);
  });

  it('should fail without critical fields', () => {
    const fields = createMockFields({
      firstName: '',
      lastName: '',
      cinNumber: undefined,
      confidence: 0.8
    });
    
    expect(meetsMinimumQuality(fields)).toBe(false);
  });

  it('should fail with validation errors', () => {
    const fields = createMockFields({
      cinNumber: 'invalid-format',
      confidence: 0.8
    });
    
    expect(meetsMinimumQuality(fields)).toBe(false);
  });
});

describe('formatValidationResults', () => {
  it('should format successful validation', () => {
    const validation = {
      isValid: true,
      fieldValidations: {},
      overallConfidence: 0.85,
      recommendedActions: ['All validations passed - data appears accurate']
    };
    
    const messages = formatValidationResults(validation);
    
    expect(messages[0]).toContain('✅ Validation passed');
    expect(messages[0]).toContain('85.0%');
    expect(messages).toContain('💡 All validations passed - data appears accurate');
  });

  it('should format validation with errors', () => {
    const validation = {
      isValid: false,
      fieldValidations: {
        cinNumber: {
          isValid: false,
          errors: ['Invalid format'],
          warnings: []
        },
        firstName: {
          isValid: true,
          errors: [],
          warnings: ['Low confidence']
        }
      },
      overallConfidence: 0.45,
      recommendedActions: ['Review and correct fields with validation errors']
    };
    
    const messages = formatValidationResults(validation);
    
    expect(messages[0]).toContain('❌ Validation failed');
    expect(messages).toContain('❌ cinNumber: Invalid format');
    expect(messages).toContain('⚠️ firstName: Low confidence');
    expect(messages).toContain('💡 Review and correct fields with validation errors');
  });
});