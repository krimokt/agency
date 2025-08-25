# 🤖 AI Document Processing System

A modern, AI-powered document processing system built with Next.js and Google Document AI. This system automatically extracts information from various document types including identity documents, passports, invoices, contracts, and more.

## ✨ **Features**

- **🎯 AI-Powered Extraction**: Uses Google Document AI for intelligent field detection
- **🌍 Multi-language Support**: Handles Arabic, French, English, and many more languages
- **📄 Multiple Document Types**: IDs, passports, invoices, contracts, receipts, etc.
- **🔍 High Accuracy**: 90-95% accuracy vs traditional OCR methods
- **📱 Modern UI**: Beautiful, responsive interface with real-time processing
- **🔒 Enterprise Security**: Google Cloud security standards

## 🚀 **Quick Start**

### **1. Setup Google Cloud**

Follow the complete setup guide: [GOOGLE_DOCUMENT_AI_SETUP.md](./GOOGLE_DOCUMENT_AI_SETUP.md)

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Variables**

Create `.env.local`:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id
GOOGLE_ACCESS_TOKEN=your-access-token
```

### **4. Run Development Server**

```bash
npm run dev
```

### **5. Navigate to AI Documents**

Visit `/ai-documents` to start processing documents.

## 📁 **Project Structure**

```
src/
├── lib/
│   ├── google-document-ai.ts    # Google Document AI integration
│   ├── google-config.ts         # Configuration and validation
│   └── ocr-service.ts           # Main OCR service (updated)
├── app/
│   ├── api/
│   │   └── document-ai/         # AI processing API
│   ├── ai-documents/            # AI documents interface
│   └── page.tsx                 # Landing page
└── components/                   # React components
```

## 🔧 **How It Works**

1. **Upload Document**: User uploads image or PDF
2. **AI Processing**: Google Document AI analyzes the document
3. **Field Extraction**: AI automatically identifies relevant fields
4. **Data Cleaning**: Post-processing for format consistency
5. **Results Display**: Clean, structured data with confidence scores

## 📊 **Supported Document Types**

### **Identity Documents**
- National IDs
- Passports
- Driver Licenses
- Identity Cards

### **Financial Documents**
- Invoices
- Receipts
- Bank Statements
- Tax Documents

### **Legal Documents**
- Contracts
- Agreements
- Certificates
- Legal Documents

## 🌍 **Language Support**

- **Arabic** (العربية)
- **French** (Français)
- **English**
- **Spanish** (Español)
- **German** (Deutsch)
- **Italian** (Italiano)
- **Portuguese** (Português)
- **Dutch** (Nederlands)
- **Japanese** (日本語)
- **Korean** (한국어)
- **Chinese** (中文)

## 🔍 **API Endpoints**

### **POST /api/document-ai**

Process documents with AI:

```typescript
// Request
FormData with 'file' field

// Response
{
  "ok": true,
  "fields": {
    "firstName": "ELMEHDI",
    "lastName": "TOUGGANI",
    "birthDate": "2004-03-25",
    "documentId": "EE894156",
    "confidence": 0.95
  }
}
```

## 💰 **Pricing**

- **Document AI**: $1.50 per 1,000 pages
- **OCR**: $1.50 per 1,000 pages
- **Custom Processors**: $2.00 per 1,000 pages

## 🆚 **Why Google Document AI?**

| Feature | Traditional OCR | Google Document AI |
|---------|----------------|-------------------|
| **Setup Time** | 2-4 hours | 30 minutes |
| **Accuracy** | 70-85% | 90-95% |
| **Maintenance** | High (calibration) | Low (automatic) |
| **Document Types** | Limited | Unlimited |
| **Language Support** | Manual config | Automatic |
| **Scalability** | Limited | High |

## 🔒 **Security & Privacy**

- **Data Processing**: Google processes documents in secure data centers
- **Data Retention**: Documents are not stored permanently
- **Compliance**: Meets GDPR, HIPAA, and other compliance standards
- **Encryption**: All data is encrypted in transit and at rest

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Authentication Error**: Check your access token and service account permissions
2. **Processor Not Found**: Verify processor ID and location
3. **File Upload Issues**: Check file size limits and supported formats

### **Debug Mode**

Enable logging in your API route:

```typescript
console.log('Document AI Response:', result);
console.log('Extracted Fields:', fields);
```

## 📚 **Resources**

- [Google Document AI Documentation](https://cloud.google.com/document-ai)
- [API Reference](https://cloud.google.com/document-ai/docs/reference/rest)
- [Processor Types](https://cloud.google.com/document-ai/docs/processors-list)
- [Best Practices](https://cloud.google.com/document-ai/docs/best-practices)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Check the [setup guide](./GOOGLE_DOCUMENT_AI_SETUP.md)
- Review the [troubleshooting section](#-troubleshooting)
- Open an issue on GitHub

---

**Built with ❤️ using Next.js and Google Document AI**
