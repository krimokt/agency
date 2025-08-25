/**
 * Field validation functions for extracted OCR data
 */

import { 
  ExtractedFields, 
  FieldValidation, 
  ExtractedFieldsValidation,
  VALIDATION_PATTERNS,
  FIELD_IMPORTANCE_WEIGHTS,
  CONFIDENCE_THRESHOLDS
} from '@/types/ocr';

/**
 * Validate a single field value
 */
export function validateField(
  fieldName: keyof ExtractedFields, 
  value: any, 
  confidence?: number
): FieldValidation {
  const result: FieldValidation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Skip validation for undefined/null values
  if (value === undefined || value === null || value === '') {
    return result;
  }

  const stringValue = String(value).trim();

  switch (fieldName) {
    case 'cinNumber':
      if (!VALIDATION_PATTERNS.cinNumber.test(stringValue)) {
        result.isValid = false;
        result.errors.push('CIN number format is invalid. Expected format: 6-8 digits, optionally prefixed with 1-2 letters');
      }
      break;

    case 'licenseNumber':
      if (!VALIDATION_PATTERNS.licenseNumber.test(stringValue)) {
        result.isValid = false;
        result.errors.push('License number format is invalid. Expected format: 1-2 letters followed by 6-10 digits');
      }
      break;

    case 'dateOfBirth':
    case 'issueDate':
    case 'expiryDate':
      const dateValidation = validateDate(stringValue);
      if (!dateValidation.isValid) {
        result.isValid = false;
        result.errors.push(...dateValidation.errors);
      }
      if (dateValidation.warnings.length > 0) {
        result.warnings.push(...dateValidation.warnings);
      }
      break;

    case 'firstName':
    case 'lastName':
    case 'fullName':
      if (!VALIDATION_PATTERNS.name.test(stringValue)) {
        result.warnings.push('Name contains unusual characters. Please verify accuracy.');
      }
      if (stringValue.length < 2) {
        result.isValid = false;
        result.errors.push('Name is too short (minimum 2 characters)');
      }
      if (stringValue.length > 50) {
        result.warnings.push('Name is unusually long. Please verify accuracy.');
      }
      break;

    case 'address':
      if (!VALIDATION_PATTERNS.address.test(stringValue)) {
        result.warnings.push('Address contains unusual characters. Please verify accuracy.');
      }
      if (stringValue.length < 5) {
        result.warnings.push('Address seems too short. Please verify completeness.');
      }
      break;

    case 'placeOfBirth':
      if (stringValue.length < 2) {
        result.warnings.push('Place of birth seems too short. Please verify accuracy.');
      }
      break;

    case 'authority':
      if (stringValue.length < 3) {
        result.warnings.push('Issuing authority name seems too short. Please verify accuracy.');
      }
      break;

    case 'licenseCategories':
      if (Array.isArray(value)) {
        if (value.length === 0) {
          result.warnings.push('No license categories found. Please verify document quality.');
        }
        // Validate each category
        value.forEach((category, index) => {
          if (typeof category !== 'string' || category.trim().length === 0) {
            result.warnings.push(`License category ${index + 1} is empty or invalid`);
          }
        });
      } else if (typeof value === 'string') {
        // Single category as string
        if (stringValue.length === 0) {
          result.warnings.push('License category is empty');
        }
      }
      break;

    case 'restrictions':
      if (Array.isArray(value) && value.length === 0) {
        // Empty restrictions array is valid (no restrictions)
      } else if (typeof value === 'string' && stringValue.length === 0) {
        // Empty restrictions string is valid
      }
      break;

    case 'confidence':
      const confidenceNum = Number(value);
      if (isNaN(confidenceNum) || confidenceNum < 0 || confidenceNum > 1) {
        result.isValid = false;
        result.errors.push('Confidence score must be a number between 0 and 1');
      } else if (confidenceNum < CONFIDENCE_THRESHOLDS.LOW_CONFIDENCE) {
        result.warnings.push('Low confidence score detected. Please verify extracted data.');
      }
      break;
  }

  // Add confidence-based warnings
  if (confidence !== undefined) {
    if (confidence < CONFIDENCE_THRESHOLDS.MINIMUM_ACCEPTABLE) {
      result.warnings.push(`Very low confidence (${(confidence * 100).toFixed(1)}%) for this field`);
    } else if (confidence < CONFIDENCE_THRESHOLDS.LOW_CONFIDENCE) {
      result.warnings.push(`Low confidence (${(confidence * 100).toFixed(1)}%) for this field`);
    }
  }

  return result;
}

/**
 * Validate date format and logical constraints
 */
export function validateDate(dateString: string): FieldValidation {
  const result: FieldValidation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!dateString || dateString.trim() === '') {
    return result;
  }

  const trimmed = dateString.trim();

  // Check format
  const match = VALIDATION_PATTERNS.date.exec(trimmed);
  if (!match) {
    result.isValid = false;
    result.errors.push('Date format is invalid. Expected DD/MM/YYYY, DD.MM.YYYY, or DD-MM-YYYY');
    return result;
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Validate ranges
  if (month < 1 || month > 12) {
    result.isValid = false;
    result.errors.push('Month must be between 1 and 12');
  }

  if (day < 1 || day > 31) {
    result.isValid = false;
    result.errors.push('Day must be between 1 and 31');
  }

  // Validate year range (reasonable for identity documents)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 20) {
    result.warnings.push(`Year ${year} seems unusual. Please verify accuracy.`);
  }

  // Create date object to check validity
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    result.isValid = false;
    result.errors.push('Date is not valid (e.g., February 30th)');
  }

  // Check for future birth dates
  if (date > new Date()) {
    result.warnings.push('Date is in the future. Please verify accuracy.');
  }

  return result;
}

/**
 * Validate all extracted fields
 */
export function validateExtractedFields(fields: ExtractedFields): ExtractedFieldsValidation {
  const fieldValidations: Record<string, FieldValidation> = {};
  let hasErrors = false;
  let totalWeight = 0;
  let weightedConfidence = 0;

  // Validate each field
  Object.entries(fields).forEach(([fieldName, value]) => {
    if (fieldName === 'fieldConfidences' || fieldName === 'processingTime' || fieldName === 'extractedAt') {
      return; // Skip metadata fields
    }

    const fieldKey = fieldName as keyof ExtractedFields;
    const confidence = fields.fieldConfidences?.[fieldName];
    const validation = validateField(fieldKey, value, confidence);
    
    fieldValidations[fieldName] = validation;
    
    if (!validation.isValid) {
      hasErrors = true;
    }

    // Calculate weighted confidence
    const weight = FIELD_IMPORTANCE_WEIGHTS[fieldKey as keyof typeof FIELD_IMPORTANCE_WEIGHTS] || 0.01;
    if (value !== undefined && value !== null && value !== '') {
      totalWeight += weight;
      weightedConfidence += weight * (confidence || fields.confidence || 0);
    }
  });

  // Calculate overall confidence
  const overallConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : fields.confidence || 0;

  // Generate recommendations
  const recommendedActions: string[] = [];
  
  if (hasErrors) {
    recommendedActions.push('Review and correct fields with validation errors');
  }

  if (overallConfidence < CONFIDENCE_THRESHOLDS.MEDIUM_CONFIDENCE) {
    recommendedActions.push('Consider re-scanning the document with better lighting or resolution');
  }

  const warningCount = Object.values(fieldValidations).reduce(
    (count, validation) => count + validation.warnings.length, 0
  );
  
  if (warningCount > 3) {
    recommendedActions.push('Multiple fields have warnings - manual review recommended');
  }

  // Check for missing critical fields
  const criticalFields = ['cinNumber', 'licenseNumber', 'firstName', 'lastName'];
  const missingCritical = criticalFields.filter(field => {
    const value = fields[field as keyof ExtractedFields];
    return !value || (typeof value === 'string' && value.trim() === '');
  });

  if (missingCritical.length > 0) {
    recommendedActions.push(`Missing critical fields: ${missingCritical.join(', ')}`);
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('All validations passed - data appears accurate');
  }

  return {
    isValid: !hasErrors,
    fieldValidations,
    overallConfidence,
    recommendedActions
  };
}

/**
 * Format validation results for display
 */
export function formatValidationResults(validation: ExtractedFieldsValidation): string[] {
  const messages: string[] = [];

  // Overall status
  if (validation.isValid) {
    messages.push(`✅ Validation passed (${(validation.overallConfidence * 100).toFixed(1)}% confidence)`);
  } else {
    messages.push(`❌ Validation failed (${(validation.overallConfidence * 100).toFixed(1)}% confidence)`);
  }

  // Field-specific issues
  Object.entries(validation.fieldValidations).forEach(([fieldName, fieldValidation]) => {
    if (fieldValidation.errors.length > 0) {
      messages.push(`❌ ${fieldName}: ${fieldValidation.errors.join(', ')}`);
    }
    if (fieldValidation.warnings.length > 0) {
      messages.push(`⚠️ ${fieldName}: ${fieldValidation.warnings.join(', ')}`);
    }
  });

  // Recommendations
  validation.recommendedActions.forEach(action => {
    messages.push(`💡 ${action}`);
  });

  return messages;
}

/**
 * Check if extracted fields meet minimum quality requirements
 */
export function meetsMinimumQuality(fields: ExtractedFields): boolean {
  const validation = validateExtractedFields(fields);
  
  // Must pass validation
  if (!validation.isValid) {
    return false;
  }

  // Must have minimum confidence
  if (validation.overallConfidence < CONFIDENCE_THRESHOLDS.MINIMUM_ACCEPTABLE) {
    return false;
  }

  // Must have at least one critical field
  const criticalFields = ['cinNumber', 'licenseNumber', 'firstName', 'lastName'];
  const hasCriticalField = criticalFields.some(field => {
    const value = fields[field as keyof ExtractedFields];
    return value && (typeof value === 'string' ? value.trim() !== '' : true);
  });

  return hasCriticalField;
}