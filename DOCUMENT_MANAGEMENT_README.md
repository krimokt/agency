# Document Management System

## Overview

The Document Management System provides comprehensive handling of vehicle documents with issue and expiry date tracking for all cars in the fleet. This system is built using Supabase for data storage and provides both web and mobile interfaces for document management.

## Features

### 📋 Document Types
- **Carte Grise** (Vehicle Registration) - Required
- **Insurance** - Required  
- **Technical Inspection** - Required
- **Rental Agreement** - Optional
- **Other Documents** - Optional

### 📅 Date Management
- **Issue Date** tracking for all documents
- **Expiry Date** tracking with automatic warnings
- **Expiry Status** indicators (Valid, Expiring Soon, Expired)
- **Automatic alerts** for documents expiring within 30 days

### 🔄 Document Operations
- **Upload** documents via web interface
- **Mobile upload** via QR code scanning
- **Replace** existing documents
- **View** documents in new tab
- **Delete** documents (with confirmation)

### 📊 Dashboard Features
- **Fleet overview** with document statistics
- **Filtering** by car status and document type
- **Sorting** by plate number, brand, or status
- **Real-time updates** of document status
- **Bulk management** capabilities

## Database Schema

### `add_new_car` Table
The main cars table includes document URLs and dates:

```sql
-- Document URLs
carte_grise_url TEXT
insurance_url TEXT
technical_inspection_url TEXT
rental_agreement_url TEXT
other_documents_url TEXT

-- Document Dates
carte_grise_issue_date DATE
carte_grise_expiry_date DATE
insurance_issue_date DATE
insurance_expiry_date DATE
technical_inspection_issue_date DATE
technical_inspection_expiry_date DATE
rental_agreement_start_date DATE
rental_agreement_end_date DATE
```

### Supporting Tables
- `car_qr_tokens` - QR code tokens for mobile uploads
- `car_uploads` - Upload tracking and status
- `car_qrscan` - Mobile upload records

## API Endpoints

### Document Management
- `POST /api/cars/update-documents` - Update document URLs and dates
- `POST /api/cars/upload-document` - Upload document files
- `DELETE /api/cars/delete` - Delete car and associated documents

### QR Code System
- `POST /api/qr/generate-car` - Generate QR codes for mobile uploads
- `POST /api/mobile-upload-car` - Handle mobile document uploads
- `GET /api/mobile-upload-car/status` - Check upload status

## Components

### DocumentManager
Reusable component for managing individual car documents:
```tsx
<DocumentManager
  documents={documentTypes}
  data={carDocumentData}
  onUpdate={handleUpdate}
  onUpload={handleUpload}
  onGenerateQR={handleGenerateQR}
  onView={handleView}
  showUploadButtons={true}
  showQRButtons={true}
  showDateInputs={true}
  compact={false}
/>
```

### DocumentDashboard
Comprehensive dashboard for fleet-wide document management:
```tsx
<DocumentDashboard
  cars={carDocumentSummaries}
  onUpdateDocument={handleUpdateDocument}
  onUploadDocument={handleUploadDocument}
  onGenerateQR={handleGenerateQR}
  onViewDocument={handleViewDocument}
/>
```

## Usage

### Accessing Document Management

1. **From Cars Page**: Click "Document Management" button in the header
2. **Direct URL**: Navigate to `/document-management`
3. **Individual Car**: Click "Documents" button on any car

### Managing Documents

#### Upload Documents
1. Select a car from the dashboard
2. Choose document type
3. Upload file via web interface or scan QR code
4. Set issue and expiry dates
5. Save changes

#### Monitor Expiry Status
- **Green**: Document is valid
- **Orange**: Document expires within 30 days
- **Red**: Document has expired
- **Gray**: Document not uploaded

#### Mobile Upload Process
1. Generate QR code for document type
2. Scan QR code with mobile device
3. Upload document via mobile interface
4. Document automatically updates in system

### Document Status Indicators

| Status | Color | Description |
|--------|-------|-------------|
| Valid | Green | Document uploaded and not expired |
| Expiring Soon | Orange | Document expires within 30 days |
| Expired | Red | Document has passed expiry date |
| Missing | Gray | Document not uploaded |

## File Storage

Documents are stored in Supabase Storage under the `car-documents` bucket with the following structure:
```
car-documents/
  {carId}/
    carte_grise_{timestamp}.{extension}
    insurance_{timestamp}.{extension}
    technical_inspection_{timestamp}.{extension}
    rental_agreement_{timestamp}.{extension}
    other_documents_{timestamp}.{extension}
```

## Security

- **RLS (Row Level Security)** enabled on all tables
- **Admin-only** access to document management
- **JWT tokens** for mobile upload authentication
- **File type validation** (PDF, JPG, JPEG, PNG only)
- **Size limits** enforced by Supabase Storage

## Mobile Integration

The system supports mobile document upload through QR code scanning:

1. **QR Code Generation**: Creates secure, time-limited tokens
2. **Mobile Interface**: Responsive upload page accessible via QR scan
3. **Real-time Updates**: Documents appear immediately in web interface
4. **Status Tracking**: Upload progress and completion status

## Notifications and Alerts

### Automatic Alerts
- Documents expiring within 30 days
- Expired documents requiring immediate attention
- Missing required documents

### Visual Indicators
- Status badges on car listings
- Color-coded document status
- Warning messages for urgent actions

## Best Practices

### Document Management
1. **Regular Reviews**: Check document expiry dates monthly
2. **Proactive Updates**: Renew documents before expiry
3. **Complete Records**: Ensure all required documents are uploaded
4. **Backup Strategy**: Keep physical copies of critical documents

### System Usage
1. **Consistent Naming**: Use clear, descriptive document names
2. **Quality Control**: Ensure documents are legible and complete
3. **Regular Audits**: Review document status across the fleet
4. **Training**: Ensure all users understand the system

## Troubleshooting

### Common Issues

#### Upload Failures
- Check file size (must be under Supabase limits)
- Verify file type (PDF, JPG, JPEG, PNG only)
- Ensure stable internet connection
- Check Supabase Storage permissions

#### QR Code Issues
- Verify QR token hasn't expired
- Ensure mobile device has camera permissions
- Check QR code generation API response
- Verify mobile upload endpoint accessibility

#### Date Issues
- Ensure dates are in correct format (YYYY-MM-DD)
- Check for future dates on issue dates
- Verify expiry dates are after issue dates
- Handle timezone considerations

### Support
For technical issues or questions about the document management system, please refer to the main project documentation or contact the development team.

## Future Enhancements

- **Automated Reminders**: Email notifications for expiring documents
- **Document Templates**: Standardized document upload templates
- **Bulk Operations**: Mass document updates and downloads
- **Integration**: Connect with external document services
- **Analytics**: Document compliance reporting and analytics
