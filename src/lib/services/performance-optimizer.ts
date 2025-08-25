import { createHash } from 'crypto';
/**
 * Performance Optimization Service
 * Optimizes OCR processing for speed and accuracy
 */

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private processingQueue: Map<string, Promise<any>> = new Map();
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Optimize image for faster processing
   */
  async optimizeImage(fileBuffer: Buffer, mimeType: string): Promise<Buffer> {
    try {
      // For now, return original buffer
      // In production, you could add image compression/resizing here
      return fileBuffer;
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      return fileBuffer;
    }
  }

  /**
   * Generate cache key for file
   */
  generateCacheKey(fileBuffer: Buffer, processorId: string): string {
    const hash = createHash('md5').update(fileBuffer).digest('hex');
    return `${processorId}_${hash}`;
  }

  /**
   * Get cached result if available
   */
  getCachedResult(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('📦 Using cached result');
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(cacheKey); // Remove expired cache
    }
    
    return null;
  }

  /**
   * Cache processing result
   */
  cacheResult(cacheKey: string, result: any): void {
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    // Cleanup old cache entries
    this.cleanupCache();
  }

  /**
   * Deduplicate concurrent requests for same file
   */
  async deduplicateRequest<T>(
    key: string, 
    processor: () => Promise<T>
  ): Promise<T> {
    // If same request is already processing, wait for it
    if (this.processingQueue.has(key)) {
      console.log('🔄 Deduplicating concurrent request');
      return await this.processingQueue.get(key)!;
    }

    // Start new processing
    const promise = processor();
    this.processingQueue.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.processingQueue.delete(key);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get processing statistics
   */
  getStats(): {
    cacheSize: number;
    queueSize: number;
    cacheHitRate: number;
  } {
    return {
      cacheSize: this.cache.size,
      queueSize: this.processingQueue.size,
      cacheHitRate: 0 // Would need to track hits/misses for real calculation
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }
}

/**
 * File validation and preprocessing
 */
export class FileProcessor {
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  static readonly SUPPORTED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'application/pdf'
  ];

  /**
   * Validate uploaded file
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check file type
    if (!this.SUPPORTED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Supported types: ${this.SUPPORTED_TYPES.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Convert file to optimized buffer
   */
  static async convertToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  static async preprocessImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    // For now, return original buffer
    // In production, could add:
    // - Image rotation correction
    // - Contrast enhancement
    // - Noise reduction
    // - Resolution optimization
    
    return buffer;
  }
}

/**
 * Processing metrics and monitoring
 */
export class ProcessingMetrics {
  private static metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageProcessingTime: 0,
    processingTimes: [] as number[],
    errorsByType: {} as Record<string, number>
  };

  static recordRequest(
    success: boolean, 
    processingTime: number, 
    errorType?: string
  ): void {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
      if (errorType) {
        this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
      }
    }

    // Track processing times (keep last 100)
    this.metrics.processingTimes.push(processingTime);
    if (this.metrics.processingTimes.length > 100) {
      this.metrics.processingTimes.shift();
    }

    // Calculate average
    this.metrics.averageProcessingTime = 
      this.metrics.processingTimes.reduce((a, b) => a + b, 0) / this.metrics.processingTimes.length;
  }

  static getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
        : 0
    };
  }

  static resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageProcessingTime: 0,
      processingTimes: [],
      errorsByType: {}
    };
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();