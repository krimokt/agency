# QR Code System & Mobile Upload Documentation

## Overview

This system allows admins to generate QR codes for clients to upload their ID and driving license documents via a mobile-friendly web interface. The QR codes expire after 4 minutes and use JWT tokens for security.

## Features

- ✅ **QR Code Generation**: Admins can generate QR codes linked to specific clients
- ✅ **Mobile-Friendly Upload**: Responsive web interface for document uploads
- ✅ **Document Processing**: Automatic OCR processing using existing document parser
- ✅ **Real-time Status**: Live status updates during upload and processing
- ✅ **Security**: JWT tokens with 4-minute expiration
- ✅ **Storage Integration**: Supabase storage for document management

## System Architecture

### Database Schema

#### `qr_tokens` Table
- `id`: UUID primary key
- `client_id`: UUID reference to client
- `token`: Unique token string
- `expires_at`: Expiration timestamp
- `used_at`: Usage timestamp (null if unused)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### `client_uploads` Table
- `id`: UUID primary key
- `client_id`: UUID reference to client
- `qr_token_id`: UUID reference to QR token
- `upload_status`: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
- `processing_status`: 'pending' | 'processing' | 'completed' | 'failed'
- `id_front_url`: URL to front of ID image
- `id_back_url`: URL to back of ID image
- `license_front_url`: URL to front of license image
- `license_back_url`: URL to back of license image
- `parsed_data`: JSONB field containing extracted data
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `completed_at`: Completion timestamp

### API Endpoints

#### `/api/qr/generate` (POST)
Generates a QR code for a client.

**Request:**
```json
{
  "clientId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "qrTokenId": "uuid",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "uploadUrl": "http://localhost:3000/mobile-upload?token=...",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

#### `/api/mobile-upload` (POST)
Handles document uploads from mobile devices.

**Request:** FormData with:
- `token`: JWT token
- `documentType`: 'id_front' | 'id_back' | 'license_front' | 'license_back'
- `file`: Image file

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "documentType": "id_front",
  "uploadId": "uuid"
}
```

#### `/api/mobile-upload/status` (GET)
Checks upload and processing status.

**Request:** Query parameter `token`

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "uploadStatus": "completed",
  "processingStatus": "completed",
  "documents": {
    "idFront": true,
    "idBack": true,
    "licenseFront": true,
    "licenseBack": true
  },
  "parsedData": {
    "fullName": "Abdelkarim Touggani",
    "firstName": "Abdelkarim",
    "lastName": "Touggani",
    "dateOfBirth": "2001-05-19",
    "address": "319 HAY GUENNOUNE NAKHIL NORD MARRAKECH",
    "licenseNumber": "6100000003110"
  },
  "completedAt": "2024-01-01T12:00:00Z"
}
```

## Setup Instructions

### 1. Database Setup

Run the SQL scripts in order:

```sql
-- 1. QR System Schema
\i src/scripts/qr_system_schema.sql

-- 2. Storage Setup
\i src/scripts/setup_storage.sql
```

### 2. Environment Variables

Add to your `.env.local`:

```bash
# QR System Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SUPABASE_JWT_SECRET=your-jwt-secret-key
```

### 3. Dependencies

Install required packages:

```bash
npm install qrcode jsonwebtoken @types/qrcode @types/jsonwebtoken
```

## Usage Guide

### For Admins

1. **Generate QR Code**:
   ```tsx
   import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
   
   <QRCodeGenerator 
     clientId="client-uuid" 
     clientName="John Doe"
   />
   ```

2. **Integration Example**:
   ```tsx
   import QRIntegrationExample from '@/components/qr/QRIntegrationExample';
   
   <QRIntegrationExample 
     clientId="client-uuid" 
     clientName="John Doe"
   />
   ```

### For Clients

1. **Scan QR Code**: Client scans the QR code with their phone camera
2. **Upload Documents**: Mobile web page opens with 4 upload buttons
3. **Take Photos**: Camera opens for each document type
4. **Processing**: Documents are automatically processed with OCR
5. **Review**: Client can see extracted information

## Mobile Upload Flow

1. **QR Code Scan** → Opens `/mobile-upload?token=jwt-token`
2. **Token Validation** → Verifies JWT token and client ID
3. **Document Upload** → 4 buttons for different document types
4. **Camera Integration** → Uses `capture="environment"` for camera
5. **File Upload** → Uploads to Supabase storage
6. **OCR Processing** → Calls existing document parser
7. **Status Updates** → Real-time progress updates
8. **Results Display** → Shows extracted information

## Security Features

- **JWT Tokens**: Secure token generation with 4-minute expiration
- **Token Validation**: Server-side validation of QR tokens
- **One-time Use**: QR tokens are marked as used after first upload
- **Client Isolation**: Each QR code is linked to a specific client
- **Storage Policies**: Row-level security on database tables

## Error Handling

- **Invalid Token**: Returns 401 for expired or invalid tokens
- **Upload Failures**: Graceful handling of file upload errors
- **Processing Errors**: Status updates for OCR processing failures
- **Network Issues**: Retry mechanisms and user feedback

## Mobile Optimization

- **Responsive Design**: Optimized for mobile screens
- **Touch-Friendly**: Large buttons and touch targets
- **Camera Integration**: Native camera access for document photos
- **Progress Indicators**: Visual feedback during uploads
- **Offline Support**: Handles network interruptions gracefully

## Troubleshooting

### Common Issues

1. **QR Code Not Working**:
   - Check JWT secret in environment variables
   - Verify token expiration (4 minutes)
   - Ensure client ID exists in database

2. **Upload Failures**:
   - Check Supabase storage bucket exists
   - Verify storage policies are set correctly
   - Check file size limits (10MB)

3. **OCR Processing Issues**:
   - Verify Google Cloud Vision API key
   - Check image quality and format
   - Review OCR service logs

### Debug Steps

1. Check browser console for client-side errors
2. Review server logs for API errors
3. Verify database connections and permissions
4. Test with different image formats and sizes

## Future Enhancements

- [ ] **Email Notifications**: Notify admins when documents are uploaded
- [ ] **Document Validation**: Client-side image quality checks
- [ ] **Multi-language Support**: Internationalization for mobile app
- [ ] **Offline Mode**: Cache for offline document uploads
- [ ] **Analytics**: Track upload success rates and processing times
- [ ] **Bulk QR Generation**: Generate multiple QR codes at once
- [ ] **Custom Expiration**: Configurable QR code expiration times
- [ ] **Document Templates**: Pre-defined document type templates

## API Reference

### JWT Token Structure

```typescript
interface QRTokenPayload {
  clientId: string;
  qrTokenId: string;
  type: 'qr_upload';
  iat?: number;
  exp?: number;
}
```

### Upload Status Types

```typescript
type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

### Document Types

```typescript
type DocumentType = 'id_front' | 'id_back' | 'license_front' | 'license_back';
```

## Support

For technical support or questions about the QR code system, please refer to the project documentation or contact the development team. 