# Document Parser Setup Guide

This guide explains how to set up the document parser feature for automatically extracting information from Moroccan ID cards and driving licenses.

## 🎯 Features

- **Automatic Data Extraction**: Extract personal information, ID details, and driving license information from document images
- **Multi-language Support**: Handles Arabic and French text on Moroccan documents
- **Multiple OCR Providers**: Support for Google Cloud Vision, Azure Computer Vision, AWS Textract, and Tesseract.js
- **Form Auto-fill**: Automatically fills the client registration form with extracted data
- **Image Preview**: Shows uploaded document previews before processing

## 📋 Supported Documents

### Moroccan ID Card (CIN) / Passport
- **Front**: Personal information, photo, ID number
- **Back**: Additional details, issue/expiry dates

### Moroccan Driving License
- **Front**: License number, categories, photo
- **Back**: Issue/expiry dates, place of issue

## 🔧 Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Google Cloud Vision API (Recommended)
GOOGLE_CLOUD_VISION_API_KEY=your_google_vision_api_key

# Azure Computer Vision (Alternative)
AZURE_VISION_ENDPOINT=your_azure_vision_endpoint
AZURE_VISION_API_KEY=your_azure_vision_api_key

# AWS Textract (Alternative)
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 2. OCR Service Configuration

#### Option A: Google Cloud Vision API (Recommended)

1. **Create Google Cloud Project**:
   ```bash
   # Install Google Cloud CLI
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Vision API**:
   ```bash
   gcloud services enable vision.googleapis.com
   ```

3. **Create API Key**:
   - Go to Google Cloud Console
   - Navigate to APIs & Services > Credentials
   - Create API Key
   - Copy the key to your `.env.local`

#### Option B: Azure Computer Vision

1. **Create Azure Resource**:
   - Go to Azure Portal
   - Create Computer Vision resource
   - Get endpoint URL and API key

2. **Configure Environment**:
   ```bash
   AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   AZURE_VISION_API_KEY=your_api_key
   ```

#### Option C: AWS Textract

1. **Setup AWS Credentials**:
   ```bash
   aws configure
   ```

2. **Install AWS SDK**:
   ```bash
   npm install aws-sdk
   ```

#### Option D: Tesseract.js (Client-side)

1. **Install Tesseract.js**:
   ```bash
   npm install tesseract.js
   ```

2. **Download Language Data**:
   ```javascript
   import { createWorker } from 'tesseract.js';
   
   const worker = await createWorker('fra+ara'); // French + Arabic
   ```

### 3. Update Document Parser Component

Modify `src/components/form/DocumentParser.tsx` to use your preferred OCR service:

```typescript
import { createOCRService, MoroccanDocumentParser } from '@/lib/ocr-service';

// Initialize OCR service
const ocrService = createOCRService('google', {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY
});

const documentParser = new MoroccanDocumentParser(ocrService);
```

### 4. API Route Setup (Optional)

For better security, create an API route to handle OCR processing:

```typescript
// pages/api/ocr/parse.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createOCRService, MoroccanDocumentParser } from '@/lib/ocr-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageData, documentType } = req.body;
    
    const ocrService = createOCRService('google', {
      apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY
    });
    
    const parser = new MoroccanDocumentParser(ocrService);
    
    let result;
    if (documentType === 'id') {
      result = await parser.parseMoroccanID(imageData);
    } else if (documentType === 'license') {
      result = await parser.parseMoroccanLicense(imageData);
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 🚀 Usage

### 1. Access Document Parser

1. Go to **Clients** page
2. Click **"Add Client"** button
3. In the **Personal Information** step, click **"Parse Documents"** button

### 2. Upload Documents

1. **Upload ID Card**:
   - Front of Moroccan ID card or Passport
   - Back of Moroccan ID card or Passport

2. **Upload Driving License**:
   - Front of Moroccan driving license
   - Back of Moroccan driving license

### 3. Process Documents

1. Click **"Parse Documents"** button
2. Wait for OCR processing (usually 2-5 seconds)
3. Review extracted data
4. Click **"Use Parsed Data"** to auto-fill the form

## 📊 Extracted Information

### Personal Information
- ✅ Full Name (from French text)
- ✅ Gender (Male/Female)
- ✅ Nationality (e.g., "Marocaine", "Française")
- ✅ Date of Birth (YYYY-MM-DD format)
- ✅ Place of Birth
- ✅ Address

### ID Document Information
- ✅ ID Type (CIN or Passport)
- ✅ ID Number
- ✅ Issue Date (if available)
- ✅ Expiry Date (if available)

### Driving License Information
- ✅ License Number
- ✅ Issue Date
- ✅ Expiry Date
- ✅ License Categories (A, B, C, etc.)
- ✅ Place of Issue (Wilaya)

## 🔒 Security Considerations

### API Key Security
- **Never expose API keys in client-side code**
- Use environment variables for sensitive data
- Consider using API routes for OCR processing

### Data Privacy
- Images are processed temporarily and not stored permanently
- OCR results are only used for form auto-fill
- Consider implementing data retention policies

### Rate Limiting
- Implement rate limiting for OCR API calls
- Monitor API usage to avoid excessive costs
- Consider caching results for repeated documents

## 🛠️ Troubleshooting

### Common Issues

1. **OCR Not Working**:
   - Check API key configuration
   - Verify image quality (should be clear and well-lit)
   - Ensure documents are in supported formats (JPEG, PNG)

2. **Poor Text Recognition**:
   - Improve image quality
   - Ensure good lighting
   - Use high-resolution images
   - Check if document is properly oriented

3. **Missing Data**:
   - Verify document format matches expected layout
   - Check if text is in supported languages (Arabic/French)
   - Ensure all required fields are visible in image

### Debug Mode

Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_DEBUG_OCR=true
```

This will log OCR results and parsing steps to the console.

## 💰 Cost Considerations

### Google Cloud Vision API
- **Free Tier**: 1,000 requests/month
- **Paid**: $1.50 per 1,000 requests
- **Text Detection**: $0.60 per 1,000 requests

### Azure Computer Vision
- **Free Tier**: 5,000 transactions/month
- **Paid**: $1.00 per 1,000 transactions

### AWS Textract
- **Free Tier**: 1,000 pages/month
- **Paid**: $1.50 per 1,000 pages

### Tesseract.js
- **Free**: No API costs
- **Limitations**: Client-side processing, larger bundle size

## 🔄 Integration with Database

The parsed data automatically integrates with your client registration form. To save to database:

```typescript
// In your form submission handler
const handleAddClient = async (clientData: AddClientFormData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        date_of_birth: clientData.dateOfBirth,
        license_number: clientData.licenseNumber,
        address: clientData.address,
        // ... other fields
      });
    
    if (error) throw error;
    
    // Success handling
  } catch (error) {
    console.error('Error adding client:', error);
  }
};
```

## 📈 Performance Optimization

1. **Image Compression**: Compress images before OCR processing
2. **Caching**: Cache OCR results for repeated documents
3. **Batch Processing**: Process multiple documents in parallel
4. **Progressive Loading**: Show loading states during processing

## 🎨 Customization

### Styling
Modify the document parser modal styling in `DocumentParser.tsx`:

```typescript
// Custom styling for upload areas
const uploadAreaStyle = "border-2 border-dashed border-blue-300 bg-blue-50";
```

### Parsing Rules
Customize parsing rules in `ocr-service.ts`:

```typescript
// Add custom regex patterns for specific document formats
const customNamePattern = /Nom[:\s]+([A-Za-zÀ-ÿ\s]+)/i;
```

### Language Support
Add support for additional languages:

```typescript
// In Google Vision API call
imageContext: {
  languageHints: ['ar', 'fr', 'en'], // Add English
},
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation for your chosen OCR service
3. Test with sample documents to verify setup
4. Monitor API usage and costs

---

**Note**: This document parser is specifically designed for Moroccan documents. For other countries, you'll need to modify the parsing patterns in `ocr-service.ts`. 