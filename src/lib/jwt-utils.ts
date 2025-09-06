import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

export interface QRTokenPayload {
  clientId: string;
  qrTokenId: string;
  type: 'qr_upload';
  iat?: number;
  exp?: number;
}

export interface CarQRTokenPayload {
  carId: string;
  qrTokenId: string;
  type: 'car_qr_upload';
  iat?: number;
  exp?: number;
}

export class JWTUtils {
  /**
   * Generate a QR token for a client
   * @param clientId - The client ID
   * @param qrTokenId - The QR token database ID
   * @returns JWT token string
   */
  static generateQRToken(clientId: string, qrTokenId: string): string {
    const payload: QRTokenPayload = {
      clientId,
      qrTokenId,
      type: 'qr_upload'
    };

    // Token expires in 4 minutes (240 seconds)
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '4m' });
  }

  /**
   * Generate a QR token for a car document upload
   */
  static generateCarQRToken(carId: string, qrTokenId: string): string {
    const payload: CarQRTokenPayload = {
      carId,
      qrTokenId,
      type: 'car_qr_upload'
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '4m' });
  }

  /**
   * Verify and decode a QR token
   * @param token - The JWT token to verify
   * @returns Decoded payload or null if invalid
   */
  static verifyQRToken(token: string): QRTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as QRTokenPayload;
      
      // Additional validation
      if (decoded.type !== 'qr_upload') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /** Verify and decode a Car QR token */
  static verifyCarQRToken(token: string): CarQRTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as CarQRTokenPayload;
      if (decoded.type !== 'car_qr_upload') {
        return null;
      }
      return decoded;
    } catch (error) {
      console.error('Car JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Check if a token is expired
   * @param token - The JWT token to check
   * @returns true if expired, false otherwise
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as QRTokenPayload;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   * @param token - The JWT token
   * @returns Date object or null if invalid
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as QRTokenPayload;
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
} 