# 🚀 Google Document AI Integration Setup

This guide will help you set up Google Document AI to replace the template-based OCR system with AI-powered document processing.

## ✨ **What You Get with Google Document AI**

- **🎯 Intelligent Field Extraction**: Automatically identifies and extracts relevant information
- **🌍 Multi-language Support**: Handles Arabic, French, English, and many more languages
- **📄 Multiple Document Types**: IDs, passports, invoices, contracts, receipts, etc.
- **🔍 High Accuracy**: Much better than template-based OCR
- **📱 No Template Calibration**: Works out of the box with any document format

## 🛠️ **Setup Steps**

### **Step 1: Google Cloud Project Setup**

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable billing (required for Document AI)

2. **Enable Document AI API**:
   ```bash
   # In Google Cloud Console
   # Go to APIs & Services > Library
   # Search for "Document AI API" and enable it
   ```

3. **Create Document AI Processor**:
   - Go to Document AI in Google Cloud Console
   - Click "Create Processor"
   - Choose "Identity Document Processor" for IDs/passports
   - Note down the Processor ID

### **Step 2: Authentication Setup**

1. **Create Service Account**:
   ```bash
   # In Google Cloud Console
   # Go to IAM & Admin > Service Accounts
   # Click "Create Service Account"
   # Give it Document AI permissions
   ```

2. **Generate Access Token**:
   ```bash
   # Download the JSON key file
   # Or use Application Default Credentials
   ```

### **Step 3: Environment Variables**

Create a `.env.local` file in your project root:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_LOCATION=us
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id-here
GOOGLE_ACCESS_TOKEN=your-access-token-here
```

### **Step 4: Install Dependencies**

```bash
npm install @google-cloud/documentai
# or if you prefer the REST API approach (current implementation)
npm install node-fetch
```

## 🔧 **Configuration Options**

### **Processor Types Available**

1. **Identity Document Processor**:
   - Passports, National IDs, Driver Licenses
   - Extracts: names, dates, document numbers, etc.

2. **Financial Document Processor**:
   - Invoices, receipts, bank statements
   - Extracts: amounts, dates, vendor info, etc.

3. **Legal Document Processor**:
   - Contracts, agreements, certificates
   - Extracts: parties, dates, legal entities, etc.

### **Custom Processors**

You can also create custom processors for specific document types:
- Training data: 10-50 examples of your document type
- Training time: 1-2 hours
- Accuracy: 90%+ with good training data

## 📱 **Usage**

### **Navigate to New AI Documents Page**

```
/ai-documents
```

### **Upload Any Document**

- Supports images (JPEG, PNG, GIF, BMP, WebP)
- Supports PDFs
- Maximum file size: 20MB
- Maximum dimensions: 4096x4096

### **Automatic Field Extraction**

The AI will automatically identify and extract:
- ✅ Personal information (names, dates, places)
- ✅ Document details (IDs, expiry dates)
- ✅ Addresses and contact information
- ✅ Any other relevant fields

## 🔍 **API Endpoints**

### **POST /api/document-ai**

**Request:**
```typescript
FormData with 'file' field
```

**Response:**
```json
{
  "ok": true,
  "fields": {
    "firstName": "ELMEHDI",
    "lastName": "TOUGGANI",
    "birthDate": "2004-03-25",
    "birthPlace": "MENARA GUELIZ MARRAKECH",
    "documentId": "EE894156",
    "expiryDate": "2032-03-01",
    "nationality": "Moroccan",
    "gender": "M",
    "confidence": 0.95
  },
  "confidence": 0.95,
  "documentType": "image/jpeg"
}
```

## 💰 **Pricing**

- **Document AI**: $1.50 per 1,000 pages
- **OCR**: $1.50 per 1,000 pages
- **Custom Processors**: $2.00 per 1,000 pages
- **Training**: $20 per hour

## 🚀 **Advanced Features**

### **Batch Processing**

```typescript
// Process multiple documents at once
const results = await Promise.all(
  files.map(file => documentAI.processDocument(file))
);
```

### **Custom Entity Extraction**

```typescript
// Extract custom fields
const customFields = result.entities
  .filter(entity => entity.type === 'custom_field')
  .map(entity => entity.mentionText);
```

### **Confidence Scoring**

```typescript
// Filter results by confidence
const highConfidenceResults = result.entities
  .filter(entity => entity.confidence > 0.8);
```

## 🔒 **Security & Privacy**

- **Data Processing**: Google processes documents in secure data centers
- **Data Retention**: Documents are not stored permanently
- **Compliance**: Meets GDPR, HIPAA, and other compliance standards
- **Encryption**: All data is encrypted in transit and at rest

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Authentication Error**:
   - Check your access token
   - Verify service account permissions
   - Ensure API is enabled

2. **Processor Not Found**:
   - Verify processor ID
   - Check processor location
   - Ensure processor is active

3. **File Upload Issues**:
   - Check file size limits
   - Verify supported formats
   - Ensure proper file encoding

### **Debug Mode**

Enable debug logging:
```typescript
// In your API route
console.log('Document AI Response:', result);
console.log('Extracted Fields:', fields);
```

## 📚 **Resources**

- [Google Document AI Documentation](https://cloud.google.com/document-ai)
- [API Reference](https://cloud.google.com/document-ai/docs/reference/rest)
- [Processor Types](https://cloud.google.com/document-ai/docs/processors-list)
- [Best Practices](https://cloud.google.com/document-ai/docs/best-practices)

## 🎯 **Next Steps**

1. **Set up Google Cloud Project**
2. **Configure environment variables**
3. **Test with sample documents**
4. **Customize field extraction as needed**
5. **Deploy to production**

## 🆚 **Comparison: Template OCR vs Document AI**

| Feature | Template OCR | Google Document AI |
|---------|--------------|-------------------|
| **Setup Time** | 2-4 hours | 30 minutes |
| **Accuracy** | 70-85% | 90-95% |
| **Maintenance** | High (calibration) | Low (automatic) |
| **Document Types** | Limited | Unlimited |
| **Language Support** | Manual config | Automatic |
| **Cost** | Free | $1.50/1000 pages |
| **Scalability** | Limited | High |

**Google Document AI is the clear winner for production use!** 🏆





