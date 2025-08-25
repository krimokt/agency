import { existsSync } from 'fs';
/**
 * OCR Configuration Manager
 * Handles environment validation and configuration for Moroccan ID OCR Pipeline
 */

export interface OCREnvironmentConfig {
  // Required Google Cloud Configuration
  GCP_PROJECT_ID: string;
  GCP_LOCATION: string;
  GCP_KEY_FILE: string;
  
  // Required Processor IDs for Moroccan Documents
  PROCESSOR_ID_CIN_FRONT: string;
  PROCESSOR_ID_CIN_BACK: string;
  PROCESSOR_ID_DRIVER_FRONT: string;
  PROCESSOR_ID_DRIVER_BACK: string;
  
  // Optional Configuration
  MAX_FILE_SIZE?: string;
  PROCESSING_TIMEOUT?: string;
  ENABLE_DEBUG_LOGGING?: string;
  CACHE_TTL?: string;
}

export interface ProcessorConfig {
  projectId: string;
  location: string;
  keyFile: string;
  processors: {
    cinFront: string;
    cinBack: string;
    driverLicenseFront: string;
    driverLicenseBack: string;
  };
}

export interface SecurityConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  rateLimitPerMinute: number;
  enableAuditLogging: boolean;
  encryptExtractedData: boolean;
}

export interface PerformanceConfig {
  processingTimeout: number; // in milliseconds
  maxConcurrentRequests: number;
  cacheEnabled: boolean;
  cacheTTL: number; // in seconds
  enableDebugLogging: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingVariables: string[];
}

export class OCRConfigManager {
  private static instance: OCRConfigManager;
  private config: ProcessorConfig | null = null;
  private securityConfig: SecurityConfig | null = null;
  private performanceConfig: PerformanceConfig | null = null;

  private constructor() {}

  public static getInstance(): OCRConfigManager {
    if (!OCRConfigManager.instance) {
      OCRConfigManager.instance = new OCRConfigManager();
    }
    return OCRConfigManager.instance;
  }

  /**
   * Validate all required environment variables
   */
  public validateEnvironment(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingVariables: []
    };

    // Required environment variables
    const requiredVars: (keyof OCREnvironmentConfig)[] = [
      'GCP_PROJECT_ID',
      'GCP_LOCATION', 
      'GCP_KEY_FILE',
      'PROCESSOR_ID_CIN_FRONT',
      'PROCESSOR_ID_CIN_BACK',
      'PROCESSOR_ID_DRIVER_FRONT',
      'PROCESSOR_ID_DRIVER_BACK'
    ];

    // Check for missing required variables
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        result.missingVariables.push(varName);
        result.errors.push(`Missing required environment variable: ${varName}`);
        result.isValid = false;
      }
    }

    // Validate GCP_KEY_FILE exists if provided
    if (process.env.GCP_KEY_FILE) {
      try {
        if (!existsSync(process.env.GCP_KEY_FILE)) {
          result.errors.push(`Service account key file not found: ${process.env.GCP_KEY_FILE}`);
          result.isValid = false;
        }
      } catch (error) {
        result.errors.push(`Cannot access service account key file: ${error}`);
        result.isValid = false;
      }
    }

    // Validate processor ID format (should be alphanumeric)
    const processorIds = [
      'PROCESSOR_ID_CIN_FRONT',
      'PROCESSOR_ID_CIN_BACK', 
      'PROCESSOR_ID_DRIVER_FRONT',
      'PROCESSOR_ID_DRIVER_BACK'
    ];

    for (const processorVar of processorIds) {
      const processorId = process.env[processorVar];
      if (processorId && !/^[a-zA-Z0-9]+$/.test(processorId)) {
        result.warnings.push(`Processor ID ${processorVar} has unusual format: ${processorId}`);
      }
    }

    // Validate optional numeric configurations
    const numericConfigs = [
      { name: 'MAX_FILE_SIZE', defaultValue: '10485760' }, // 10MB
      { name: 'PROCESSING_TIMEOUT', defaultValue: '30000' }, // 30 seconds
      { name: 'CACHE_TTL', defaultValue: '3600' } // 1 hour
    ];

    for (const config of numericConfigs) {
      const value = process.env[config.name];
      if (value && isNaN(Number(value))) {
        result.warnings.push(`${config.name} should be a number, got: ${value}`);
      }
    }

    return result;
  }

  /**
   * Get processor configuration
   */
  public getProcessorConfig(): ProcessorConfig {
    if (!this.config) {
      const validation = this.validateEnvironment();
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      this.config = {
        projectId: process.env.GCP_PROJECT_ID!,
        location: process.env.GCP_LOCATION!,
        keyFile: process.env.GCP_KEY_FILE!,
        processors: {
          cinFront: process.env.PROCESSOR_ID_CIN_FRONT!,
          cinBack: process.env.PROCESSOR_ID_CIN_BACK!,
          driverLicenseFront: process.env.PROCESSOR_ID_DRIVER_FRONT!,
          driverLicenseBack: process.env.PROCESSOR_ID_DRIVER_BACK!
        }
      };
    }

    return this.config;
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig(): SecurityConfig {
    if (!this.securityConfig) {
      this.securityConfig = {
        maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        allowedMimeTypes: [
          'image/jpeg',
          'image/png', 
          'image/gif',
          'image/bmp',
          'image/webp',
          'application/pdf'
        ],
        rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 60,
        enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true',
        encryptExtractedData: process.env.ENCRYPT_EXTRACTED_DATA === 'true'
      };
    }

    return this.securityConfig;
  }

  /**
   * Get performance configuration
   */
  public getPerformanceConfig(): PerformanceConfig {
    if (!this.performanceConfig) {
      this.performanceConfig = {
        processingTimeout: Number(process.env.PROCESSING_TIMEOUT) || 30000, // 30 seconds
        maxConcurrentRequests: Number(process.env.MAX_CONCURRENT_REQUESTS) || 10,
        cacheEnabled: process.env.CACHE_ENABLED !== 'false', // enabled by default
        cacheTTL: Number(process.env.CACHE_TTL) || 3600, // 1 hour
        enableDebugLogging: process.env.ENABLE_DEBUG_LOGGING === 'true'
      };
    }

    return this.performanceConfig;
  }

  /**
   * Get processor ID for specific document type and side
   */
  public getProcessorId(documentType: 'cin' | 'driver_license', side: 'front' | 'back'): string {
    const config = this.getProcessorConfig();
    
    if (documentType === 'cin') {
      return side === 'front' ? config.processors.cinFront : config.processors.cinBack;
    } else {
      return side === 'front' ? config.processors.driverLicenseFront : config.processors.driverLicenseBack;
    }
  }

  /**
   * Get full processor name for Google Document AI
   */
  public getProcessorName(documentType: 'cin' | 'driver_license', side: 'front' | 'back'): string {
    const config = this.getProcessorConfig();
    const processorId = this.getProcessorId(documentType, side);
    
    return `projects/${config.projectId}/locations/${config.location}/processors/${processorId}`;
  }

  /**
   * Reset cached configuration (useful for testing)
   */
  public resetConfig(): void {
    this.config = null;
    this.securityConfig = null;
    this.performanceConfig = null;
  }

  /**
   * Get configuration summary for debugging
   */
  public getConfigSummary(): Record<string, any> {
    try {
      const processorConfig = this.getProcessorConfig();
      const securityConfig = this.getSecurityConfig();
      const performanceConfig = this.getPerformanceConfig();

      return {
        processor: {
          projectId: processorConfig.projectId,
          location: processorConfig.location,
          keyFileExists: existsSync(processorConfig.keyFile),
          processorCount: Object.keys(processorConfig.processors).length
        },
        security: {
          maxFileSize: `${(securityConfig.maxFileSize / 1024 / 1024).toFixed(1)}MB`,
          allowedFormats: securityConfig.allowedMimeTypes.length,
          rateLimitPerMinute: securityConfig.rateLimitPerMinute,
          auditLogging: securityConfig.enableAuditLogging
        },
        performance: {
          timeout: `${performanceConfig.processingTimeout}ms`,
          maxConcurrent: performanceConfig.maxConcurrentRequests,
          cacheEnabled: performanceConfig.cacheEnabled,
          cacheTTL: `${performanceConfig.cacheTTL}s`,
          debugLogging: performanceConfig.enableDebugLogging
        }
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        configurationValid: false
      };
    }
  }
}

// Export singleton instance
export const ocrConfig = OCRConfigManager.getInstance();

// Export utility functions
export function validateOCREnvironment(): ValidationResult {
  return ocrConfig.validateEnvironment();
}

export function getProcessorConfig(): ProcessorConfig {
  return ocrConfig.getProcessorConfig();
}

export function getSecurityConfig(): SecurityConfig {
  return ocrConfig.getSecurityConfig();
}

export function getPerformanceConfig(): PerformanceConfig {
  return ocrConfig.getPerformanceConfig();
}