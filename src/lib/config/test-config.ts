/**
 * Configuration Test Utility
 * Tests the OCR configuration with actual environment variables
 */

import { ocrConfig, validateOCREnvironment } from './ocr-config';

export interface ConfigTestResult {
  success: boolean;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    missingVariables: string[];
  };
  configuration?: {
    processor: any;
    security: any;
    performance: any;
  };
  recommendations: string[];
}

/**
 * Test the OCR configuration with current environment
 */
export function testOCRConfiguration(): ConfigTestResult {
  const result: ConfigTestResult = {
    success: false,
    validation: {
      isValid: false,
      errors: [],
      warnings: [],
      missingVariables: []
    },
    recommendations: []
  };

  try {
    // Validate environment
    result.validation = validateOCREnvironment();
    
    if (!result.validation.isValid) {
      result.success = false;
      result.recommendations = [
        'Set all required environment variables in .env.local',
        'Ensure GCP_KEY_FILE points to a valid service account key',
        'Verify all processor IDs are correct',
        'Check Google Cloud project permissions'
      ];
      return result;
    }

    // Get configuration summary
    result.configuration = ocrConfig.getConfigSummary();
    
    // Add specific recommendations based on warnings
    if (result.validation.warnings.length > 0) {
      result.recommendations.push('Review configuration warnings above');
    }

    // Check if key file exists
    if (result.configuration.processor && !result.configuration.processor.keyFileExists) {
      result.recommendations.push('Service account key file not found - check GCP_KEY_FILE path');
    }

    result.success = true;
    result.recommendations.push('Configuration is valid and ready for use');

  } catch (error) {
    result.success = false;
    result.validation.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.recommendations.push('Fix configuration errors before proceeding');
  }

  return result;
}

/**
 * Print configuration test results to console
 */
export function printConfigTestResults(): void {
  console.log('🔧 Testing OCR Configuration...\n');
  
  const result = testOCRConfiguration();
  
  if (result.success) {
    console.log('✅ Configuration Test: PASSED\n');
    
    if (result.configuration) {
      console.log('📋 Configuration Summary:');
      console.log('  Processor:', result.configuration.processor);
      console.log('  Security:', result.configuration.security);
      console.log('  Performance:', result.configuration.performance);
      console.log('');
    }
    
    if (result.validation.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.validation.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }
    
  } else {
    console.log('❌ Configuration Test: FAILED\n');
    
    if (result.validation.errors.length > 0) {
      console.log('🚫 Errors:');
      result.validation.errors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    }
    
    if (result.validation.missingVariables.length > 0) {
      console.log('📝 Missing Environment Variables:');
      result.validation.missingVariables.forEach(variable => console.log(`  - ${variable}`));
      console.log('');
    }
  }
  
  if (result.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(`  - ${rec}`));
    console.log('');
  }
}

/**
 * Test processor connectivity (placeholder for actual Google Cloud test)
 */
export async function testProcessorConnectivity(): Promise<{
  success: boolean;
  processors: Array<{
    name: string;
    id: string;
    accessible: boolean;
    error?: string;
  }>;
}> {
  const result = {
    success: true,
    processors: [] as Array<{
      name: string;
      id: string;
      accessible: boolean;
      error?: string;
    }>
  };

  try {
    const config = ocrConfig.getProcessorConfig();
    
    // Test each processor (this would normally make actual API calls)
    const processors = [
      { name: 'CIN Front', id: config.processors.cinFront },
      { name: 'CIN Back', id: config.processors.cinBack },
      { name: 'Driver License Front', id: config.processors.driverLicenseFront },
      { name: 'Driver License Back', id: config.processors.driverLicenseBack }
    ];

    for (const processor of processors) {
      // For now, just validate the processor ID format
      const isValidFormat = /^[a-zA-Z0-9]+$/.test(processor.id);
      
      result.processors.push({
        name: processor.name,
        id: processor.id,
        accessible: isValidFormat,
        error: isValidFormat ? undefined : 'Invalid processor ID format'
      });
      
      if (!isValidFormat) {
        result.success = false;
      }
    }

  } catch (error) {
    result.success = false;
    result.processors.push({
      name: 'Configuration Error',
      id: 'N/A',
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return result;
}