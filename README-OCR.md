# Moroccan CIN Template OCR System

A Next.js application that uses template-based OCR to automatically extract information from Moroccan National Identity Cards (CNIE).

## Features

- **Template-based OCR**: Predefined zones for consistent extraction
- **Multi-language support**: French, Arabic, and English OCR
- **Image normalization**: Automatic resizing and rotation
- **Field validation**: Built-in format validation for dates and numbers
- **Debug overlay**: Visual zone calibration tool
- **Real-time processing**: Instant form autofill

## Extracted Fields

- First Name (Latin)
- Last Name (Latin) 
- Full Name (Arabic)
- Birth Date (DD.MM.YYYY)
- Birth Place
- CIN Number
- Expiry Date (DD.MM.YYYY)
- Card Number (K01234567)

## Installation

1. Install dependencies:
```bash
npm i sharp tesseract.js
```

2. Ensure your project uses Node.js runtime (required for Sharp)

## Usage

1. Navigate to `/ocr` page
2. Upload a CNIE photo (front side)
3. Click "Extract & Autofill"
4. Review extracted data and validation indicators

## File Structure

```
src/
├── lib/
│   ├── cniTemplate.ts      # Zone coordinates template
│   ├── image.ts            # Image processing utilities
│   ├── ocr.ts              # OCR functionality
│   └── extractCni.ts       # Field extraction logic
├── app/
│   ├── api/cni-extract/    # OCR API endpoint
│   └── ocr/page.tsx        # Main OCR interface
└── components/
    └── DebugOverlay.tsx    # Zone visualization
```

## Calibration Guide

### Step 1: Upload Test Images
- Use clear, well-lit photos of different CNIE cards
- Ensure photos are taken straight (minimal rotation)

### Step 2: Adjust Zone Coordinates
Edit `src/lib/cniTemplate.ts` to fine-tune zone positions:

```typescript
export const CNI_TEMPLATE_V1 = {
  baseWidth: 1000,
  baseHeight: 630,
  zones: {
    latinName: { left: 60, top: 120, width: 520, height: 80 },
    // Adjust these values based on your test results
  }
}
```

### Step 3: Test and Iterate
- Upload test images
- Check debug overlay for zone accuracy
- Adjust coordinates as needed
- Repeat until all fields extract correctly

## Production Tips

### Image Quality
- **Lighting**: Ensure good, even lighting
- **Angle**: Take photos straight-on (minimal tilt)
- **Focus**: Keep text sharp and readable
- **Size**: Minimum 1000x630 pixels recommended

### Performance Optimization
- **File size**: Limit uploads to 5-8 MB
- **Format**: Accept only image formats (jpg, png, etc.)
- **Caching**: Consider caching OCR results for repeated cards

### Fallback Strategy
If template zones fail:
1. Run whole-image OCR as backup
2. Use regex patterns to extract fields
3. Provide manual correction interface

### Error Handling
- Validate file types and sizes
- Handle OCR failures gracefully
- Provide clear error messages
- Log issues for debugging

## Troubleshooting

### Common Issues

**Field extraction fails:**
- Check zone coordinates in template
- Verify image quality and lighting
- Ensure proper image orientation

**OCR accuracy poor:**
- Improve image quality
- Adjust zone boundaries
- Consider language-specific OCR settings

**Performance slow:**
- Optimize image size before processing
- Use appropriate image formats
- Consider server-side caching

### Debug Tools

- **Debug Overlay**: Visualize OCR zones
- **Raw Results**: View unprocessed OCR text
- **Validation Indicators**: Check field format validity

## API Endpoint

### POST /api/cni-extract

**Request:**
- Form data with `file` field (image)

**Response:**
```json
{
  "ok": true,
  "fields": {
    "firstName": "MOUHCINE",
    "lastName": "TEMSAMANI",
    "fullNameAr": "محسن التمسماني",
    "birthDate": "29.11.1978",
    "birthPlace": "TANGER ASSILAH - TANGER",
    "cin": "123456",
    "expiryDate": "09.09.2029",
    "cardNumber": "K01234567",
    "isValid": {
      "birthDate": true,
      "expiryDate": true,
      "cardNumber": true,
      "cin": true
    }
  }
}
```

## Dependencies

- **Sharp**: Image processing and manipulation
- **Tesseract.js**: OCR engine with multi-language support
- **Next.js**: React framework with API routes

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the calibration guide
3. Open an issue with detailed information
4. Include sample images (with sensitive data removed)



















