/**
 * Unit tests for OCR Configuration Manager
 */

import { OCRConfigManager, validateOCREnvironment } from '../ocr-config';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

describe('OCRConfigManager', () => {
  let configManager: OCRConfigManager;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear environment variables
    delete process.env.GCP_PROJECT_ID;
    delete process.env.GCP_LOCATION;
    delete process.env.GCP_KEY_FILE;
    delete process.env.PROCESSOR_ID_CIN_FRONT;
    delete process.env.PROCESSOR_ID_CIN_BACK;
    delete process.env.PROCESSOR_ID_DRIVER_FRONT;
    delete process.env.PROCESSOR_ID_DRIVER_BACK;
    
    configManager = OCRConfigManager.getInstance();
    configManager.resetConfig();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should return invalid when required variables are missing', () => {
      const result = configManager.validateEnvironment();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(7);
      expect(result.missingVariables).toContain('GCP_PROJECT_ID');
      expect(result.missingVariables).toContain('GCP_LOCATION');
      expect(result.missingVariables).toContain('GCP_KEY_FILE');
      expect(result.missingVariables).toContain('PROCESSOR_ID_CIN_FRONT');
    });

    it('should return valid when all required variables are present', () => {
      // Mock fs.existsSync to return true
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);

      // Set all required environment variables
      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/path/to/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'abc123';
      process.env.PROCESSOR_ID_CIN_BACK = 'def456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'ghi789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'jkl012';

      const result = configManager.validateEnvironment();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missingVariables).toHaveLength(0);
    });

    it('should return error when key file does not exist', () => {
      // Mock fs.existsSync to return false
      const fs = require('fs');
      fs.existsSync.mockReturnValue(false);

      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/nonexistent/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'abc123';
      process.env.PROCESSOR_ID_CIN_BACK = 'def456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'ghi789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'jkl012';

      const result = configManager.validateEnvironment();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Service account key file not found: /nonexistent/key.json');
    });

    it('should warn about unusual processor ID formats', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);

      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/path/to/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'abc-123'; // Contains dash
      process.env.PROCESSOR_ID_CIN_BACK = 'def456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'ghi789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'jkl012';

      const result = configManager.validateEnvironment();
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Processor ID PROCESSOR_ID_CIN_FRONT has unusual format: abc-123');
    });

    it('should warn about invalid numeric configurations', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);

      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/path/to/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'abc123';
      process.env.PROCESSOR_ID_CIN_BACK = 'def456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'ghi789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'jkl012';
      process.env.MAX_FILE_SIZE = 'not-a-number';

      const result = configManager.validateEnvironment();
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('MAX_FILE_SIZE should be a number, got: not-a-number');
    });
  });

  describe('getProcessorConfig', () => {
    it('should throw error when environment is invalid', () => {
      expect(() => {
        configManager.getProcessorConfig();
      }).toThrow('Configuration validation failed');
    });

    it('should return processor configuration when environment is valid', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);

      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/path/to/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'abc123';
      process.env.PROCESSOR_ID_CIN_BACK = 'def456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'ghi789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'jkl012';

      const config = configManager.getProcessorConfig();
      
      expect(config.projectId).toBe('test-project');
      expect(config.location).toBe('us');
      expect(config.keyFile).toBe('/path/to/key.json');
      expect(config.processors.cinFront).toBe('abc123');
      expect(config.processors.cinBack).toBe('def456');
      expect(config.processors.driverLicenseFront).toBe('ghi789');
      expect(config.processors.driverLicenseBack).toBe('jkl012');
    });
  });

  describe('getProcessorId', () => {
    beforeEach(() => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);

      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/path/to/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'cin-front-123';
      process.env.PROCESSOR_ID_CIN_BACK = 'cin-back-456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'driver-front-789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'driver-back-012';
    });

    it('should return correct processor ID for CIN front', () => {
      const processorId = configManager.getProcessorId('cin', 'front');
      expect(processorId).toBe('cin-front-123');
    });

    it('should return correct processor ID for CIN back', () => {
      const processorId = configManager.getProcessorId('cin', 'back');
      expect(processorId).toBe('cin-back-456');
    });

    it('should return correct processor ID for driver license front', () => {
      const processorId = configManager.getProcessorId('driver_license', 'front');
      expect(processorId).toBe('driver-front-789');
    });

    it('should return correct processor ID for driver license back', () => {
      const processorId = configManager.getProcessorId('driver_license', 'back');
      expect(processorId).toBe('driver-back-012');
    });
  });

  describe('getProcessorName', () => {
    beforeEach(() => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);

      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.GCP_LOCATION = 'us';
      process.env.GCP_KEY_FILE = '/path/to/key.json';
      process.env.PROCESSOR_ID_CIN_FRONT = 'cin-front-123';
      process.env.PROCESSOR_ID_CIN_BACK = 'cin-back-456';
      process.env.PROCESSOR_ID_DRIVER_FRONT = 'driver-front-789';
      process.env.PROCESSOR_ID_DRIVER_BACK = 'driver-back-012';
    });

    it('should return full processor name for CIN front', () => {
      const processorName = configManager.getProcessorName('cin', 'front');
      expect(processorName).toBe('projects/test-project/locations/us/processors/cin-front-123');
    });

    it('should return full processor name for driver license back', () => {
      const processorName = configManager.getProcessorName('driver_license', 'back');
      expect(processorName).toBe('projects/test-project/locations/us/processors/driver-back-012');
    });
  });

  describe('getSecurityConfig', () => {
    it('should return default security configuration', () => {
      const config = configManager.getSecurityConfig();
      
      expect(config.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
      expect(config.allowedMimeTypes).toContain('image/jpeg');
      expect(config.allowedMimeTypes).toContain('application/pdf');
      expect(config.rateLimitPerMinute).toBe(60);
      expect(config.enableAuditLogging).toBe(false);
      expect(config.encryptExtractedData).toBe(false);
    });

    it('should use custom values from environment', () => {
      process.env.MAX_FILE_SIZE = '20971520'; // 20MB
      process.env.RATE_LIMIT_PER_MINUTE = '30';
      process.env.ENABLE_AUDIT_LOGGING = 'true';
      process.env.ENCRYPT_EXTRACTED_DATA = 'true';

      configManager.resetConfig();
      const config = configManager.getSecurityConfig();
      
      expect(config.maxFileSize).toBe(20971520);
      expect(config.rateLimitPerMinute).toBe(30);
      expect(config.enableAuditLogging).toBe(true);
      expect(config.encryptExtractedData).toBe(true);
    });
  });

  describe('getPerformanceConfig', () => {
    it('should return default performance configuration', () => {
      const config = configManager.getPerformanceConfig();
      
      expect(config.processingTimeout).toBe(30000);
      expect(config.maxConcurrentRequests).toBe(10);
      expect(config.cacheEnabled).toBe(true);
      expect(config.cacheTTL).toBe(3600);
      expect(config.enableDebugLogging).toBe(false);
    });

    it('should use custom values from environment', () => {
      process.env.PROCESSING_TIMEOUT = '45000';
      process.env.MAX_CONCURRENT_REQUESTS = '5';
      process.env.CACHE_ENABLED = 'false';
      process.env.CACHE_TTL = '7200';
      process.env.ENABLE_DEBUG_LOGGING = 'true';

      configManager.resetConfig();
      const config = configManager.getPerformanceConfig();
      
      expect(config.processingTimeout).toBe(45000);
      expect(config.maxConcurrentRequests).toBe(5);
      expect(config.cacheEnabled).toBe(false);
      expect(config.cacheTTL).toBe(7200);
      expect(config.enableDebugLogging).toBe(true);
    });
  });
});

describe('validateOCREnvironment utility function', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return validation result', () => {
    const result = validateOCREnvironment();
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('missingVariables');
  });
});