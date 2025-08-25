"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import QRCodeGenerator from "@/components/qr/QRCodeGenerator";

interface ParsedDocumentData {
  // Personal Information
  fullName: string;
  firstName: string;
  lastName: string;
  gender: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: string;

  // ID Document Information
  idType: string;
  idNumber: string;
  issueDate: string;
  expiryDate: string;

  // Driving License Information
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseCategories: string; // Changed from string[] to string for dropdown
  placeOfIssue: string;

  // Image URLs for automatic form population
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  licenseFrontImageUrl?: string;
  licenseBackImageUrl?: string;
}

interface MobileUpload {
  id: string;
  client_id: string;
  upload_status: string;
  processing_status: string;
  id_front_url?: string;
  id_back_url?: string;
  license_front_url?: string;
  license_back_url?: string;
  parsed_data?: any;
  created_at: string;
  updated_at: string;
}

interface DocumentParserProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: ParsedDocumentData) => void;
  clientId?: string; // Add clientId prop for QR generation
  clientName?: string; // Add clientName prop for QR generation
}

const DocumentParser: React.FC<DocumentParserProps> = ({
  isOpen,
  onClose,
  onParsed,
  clientId,
  clientName,
}) => {
  const [uploadedImages, setUploadedImages] = useState<{
    idFront?: File;
    idBack?: File;
    licenseFront?: File;
    licenseBack?: File;
  }>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  // Remove selectedProcessorId as it's not needed for Document AI
  const [processingProgress, setProcessingProgress] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDocumentData>({
    fullName: "",
    firstName: "",
    lastName: "",
    gender: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    address: "",
    idType: "",
    idNumber: "",
    issueDate: "",
    expiryDate: "",
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    licenseCategories: "",
    placeOfIssue: "",
  });

  const urlToFile = async (url: string, suggestedName: string): Promise<File | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      const file = new File([blob], suggestedName, { type: blob.type || 'image/jpeg' });
      return file;
    } catch (e) {
      console.error('Failed to download file from URL:', url, e);
      return null;
    }
  };

  const handleRefresh = async () => {
    if (!clientId) return;
    setIsRefreshing(true);
    try {
      const resp = await fetch(`/api/mobile-uploads?clientId=${clientId}`);
      if (!resp.ok) return;
      const data = await resp.json();
      const uploads = data.uploads || [];
      if (uploads.length === 0) return;
      const latest = uploads[0];

      const [idFrontFile, idBackFile, licFrontFile, licBackFile] = await Promise.all([
        latest.id_front_url ? urlToFile(latest.id_front_url, 'id_front.jpg') : Promise.resolve(null),
        latest.id_back_url ? urlToFile(latest.id_back_url, 'id_back.jpg') : Promise.resolve(null),
        latest.license_front_url ? urlToFile(latest.license_front_url, 'license_front.jpg') : Promise.resolve(null),
        latest.license_back_url ? urlToFile(latest.license_back_url, 'license_back.jpg') : Promise.resolve(null),
      ]);

      const newImages: { idFront?: File; idBack?: File; licenseFront?: File; licenseBack?: File } = {};
      if (idFrontFile) newImages.idFront = idFrontFile;
      if (idBackFile) newImages.idBack = idBackFile;
      if (licFrontFile) newImages.licenseFront = licFrontFile;
      if (licBackFile) newImages.licenseBack = licBackFile;

      setUploadedImages(newImages);
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Removed live status and realtime refresh for mobile uploads

  const handleImageUpload = (type: keyof typeof uploadedImages, file: File) => {
    setUploadedImages(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleImageRemove = (type: keyof typeof uploadedImages) => {
    setUploadedImages(prev => ({
      ...prev,
      [type]: undefined
    }));
  };

  // Google Document AI only - no more fallback to text parsing
  const extractStructuredFields = async (file: File): Promise<any> => {
    try {
      console.log('Starting Google Document AI processing for file:', file.name);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'auto'); // Auto-detect document type
      formData.append('side', 'auto'); // Auto-detect side

      console.log('Sending request to /api/ocr/process');

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      const fetchPromise = fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Document AI API error:', errorData);
        throw new Error(`Document processing failed: ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Document AI result received:', result);

      if (result.success && result.data) {
        return result.data.fields || {};
      } else {
        throw new Error(result.error || 'Document AI processing failed');
      }
    } catch (error) {
      console.error('Document AI processing error:', error);
      throw new Error('Failed to extract structured fields from image');
    }
  };

  // Updated field mapping function for Document AI
  const mapDocumentAIFieldsToForm = (fields: any): Partial<ParsedDocumentData> => {
    console.log('Mapping Document AI fields to form structure:', fields);

    const mappedData: Partial<ParsedDocumentData> = {};

    // Helper function to format dates consistently
    const formatDate = (dateString: string): string => {
      if (!dateString) return "";
      
      // Handle DD/MM/YYYY format (common in Moroccan documents)
      const parts = dateString.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Validate the parts
        if (day && month && year && day.length <= 2 && month.length <= 2 && year.length === 4) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      // Handle other date formats
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return dateString; // Return as-is if we can't parse it
    };

    // Map Document AI fields to form structure with comprehensive field coverage
    
    // First Name - try multiple field variations
    if (fields.firstName) mappedData.firstName = fields.firstName;
    else if (fields.first_name) mappedData.firstName = fields.first_name;
    else if (fields.firstNameArabic) mappedData.firstName = fields.firstNameArabic;
    else if (fields.first_name_arabic) mappedData.firstName = fields.first_name_arabic;

    // Last Name - try multiple field variations
    if (fields.lastName) mappedData.lastName = fields.lastName;
    else if (fields.last_name) mappedData.lastName = fields.last_name;
    else if (fields.lastNameArabic) mappedData.lastName = fields.lastNameArabic;
    else if (fields.last_name_arabic) mappedData.lastName = fields.last_name_arabic;

    // Handle full name
    if (fields.fullName) {
      mappedData.fullName = fields.fullName;
    } else if (mappedData.firstName && mappedData.lastName) {
      mappedData.fullName = `${mappedData.firstName} ${mappedData.lastName}`;
    }

    // Date of Birth - try multiple field variations and formats
    if (fields.dateOfBirth) mappedData.dateOfBirth = formatDate(fields.dateOfBirth);
    else if (fields.date_of_birth) mappedData.dateOfBirth = formatDate(fields.date_of_birth);
    else if (fields.dateofbirth) mappedData.dateOfBirth = formatDate(fields.dateofbirth);

    // Place of Birth - try multiple field variations
    if (fields.placeOfBirth) mappedData.placeOfBirth = fields.placeOfBirth;
    else if (fields.place_of_birth) mappedData.placeOfBirth = fields.place_of_birth;
    else if (fields.born_in) mappedData.placeOfBirth = fields.born_in;

    // Address - try multiple field variations
    if (fields.address) mappedData.address = fields.address;
    else if (fields.addressArabic) mappedData.address = fields.addressArabic;
    else if (fields.living_adress) mappedData.address = fields.living_adress;

    // ID Number - try multiple field variations
    if (fields.ID_number) {
      mappedData.idNumber = fields.ID_number;
      console.log('Mapped ID_number to idNumber:', fields.ID_number);
    } else if (fields.id_number) {
      mappedData.idNumber = fields.id_number;
      console.log('Mapped id_number to idNumber:', fields.id_number);
    } else if (fields.cinNumber) {
      mappedData.idNumber = fields.cinNumber;
      console.log('Mapped cinNumber to idNumber:', fields.cinNumber);
    } else if (fields.idNumber) {
      mappedData.idNumber = fields.idNumber;
      console.log('Mapped idNumber to idNumber:', fields.idNumber);
    } else if (fields.document_id) {
      mappedData.idNumber = fields.document_id;
      console.log('Mapped document_id to idNumber:', fields.document_id);
    }

    // License Number - try multiple field variations
    if (fields.licenseNumber) {
      mappedData.licenseNumber = fields.licenseNumber;
      console.log('Mapped licenseNumber to licenseNumber:', fields.licenseNumber);
    } else if (fields.license_number) {
      mappedData.licenseNumber = fields.license_number;
      console.log('Mapped license_number to licenseNumber:', fields.license_number);
    } else if (fields.permis_number) {
      mappedData.licenseNumber = fields.permis_number;
      console.log('Mapped permis_number to licenseNumber:', fields.permis_number);
    }

    // Issue Date - try multiple field variations
    if (fields.issueDate) mappedData.issueDate = formatDate(fields.issueDate);
    else if (fields.issue_date) mappedData.issueDate = formatDate(fields.issue_date);
    else if (fields.delivery_date) mappedData.issueDate = formatDate(fields.delivery_date);
    else if (fields.date_de_delivrance) mappedData.issueDate = formatDate(fields.date_de_delivrance);

    // Expiry Date - try multiple field variations
    if (fields.expiryDate) mappedData.expiryDate = formatDate(fields.expiryDate);
    else if (fields.expiry_date) mappedData.expiryDate = formatDate(fields.expiry_date);
    else if (fields.valid_until) mappedData.expiryDate = formatDate(fields.valid_until);
    else if (fields.valable_jusqu_au) mappedData.expiryDate = formatDate(fields.valable_jusqu_au);

    // License Issue Date - try multiple field variations
    if (fields.licenseIssueDate) mappedData.licenseIssueDate = formatDate(fields.licenseIssueDate);
    else if (fields.license_issue_date) mappedData.licenseIssueDate = formatDate(fields.license_issue_date);
    else if (fields.permis_issue_date) mappedData.licenseIssueDate = formatDate(fields.permis_issue_date);

    // License Expiry Date - try multiple field variations
    if (fields.licenseExpiryDate) {
      mappedData.licenseExpiryDate = formatDate(fields.licenseExpiryDate);
      console.log('Mapped licenseExpiryDate from fields:', mappedData.licenseExpiryDate);
    } else if (fields.license_expiry_date) {
      mappedData.licenseExpiryDate = formatDate(fields.license_expiry_date);
      console.log('Mapped license_expiry_date to licenseExpiryDate:', mappedData.licenseExpiryDate);
    } else if (fields.permis_expiry_date) {
      mappedData.licenseExpiryDate = formatDate(fields.permis_expiry_date);
      console.log('Mapped permis_expiry_date to licenseExpiryDate:', mappedData.licenseExpiryDate);
    } else if (fields.expiryDate) {
      mappedData.licenseExpiryDate = formatDate(fields.expiryDate);
      console.log('Mapped expiryDate to licenseExpiryDate:', mappedData.licenseExpiryDate);
    } else if (fields.expiry_date) {
      mappedData.licenseExpiryDate = formatDate(fields.expiry_date);
      console.log('Mapped expiry_date to licenseExpiryDate:', mappedData.licenseExpiryDate);
    }

    // For license documents, also set the main expiryDate field
    if (mappedData.licenseExpiryDate && !mappedData.expiryDate) {
      mappedData.expiryDate = mappedData.licenseExpiryDate;
      console.log('Set main expiryDate from license expiry:', mappedData.expiryDate);
    }

    // License Categories - try multiple field variations
    if (fields.licenseCategories) {
      mappedData.licenseCategories = Array.isArray(fields.licenseCategories) 
        ? fields.licenseCategories.join(' ') 
        : fields.licenseCategories;
      console.log('Mapped licenseCategories from fields:', mappedData.licenseCategories);
    } else if (fields.license_categories) {
      mappedData.licenseCategories = Array.isArray(fields.license_categories) 
        ? fields.license_categories.join(' ') 
        : fields.license_categories;
      console.log('Mapped license_categories to licenseCategories:', mappedData.licenseCategories);
    } else if (fields.categories) {
      mappedData.licenseCategories = Array.isArray(fields.categories) 
        ? fields.categories.join(' ') 
        : fields.categories;
      console.log('Mapped categories to licenseCategories:', mappedData.licenseCategories);
    }

    // Process license categories to match AddClientModal format
    if (mappedData.licenseCategories) {
      // Clean and standardize the categories
      let processedCategories = mappedData.licenseCategories;
      
      // Remove extra spaces and normalize
      processedCategories = processedCategories.replace(/\s+/g, ' ').trim();
      
      // Map common variations to standard format
      const categoryMappings: { [key: string]: string } = {
        'AM': 'AM - Moped/Scooter',
        'A1': 'A1 - Small Motorcycle',
        'A': 'A - Large Motorcycle',
        'B': 'B - Car',
        'C': 'C - Truck',
        'D': 'D - Bus',
        'EB': 'EB - Car with Trailer',
        'EC': 'EC - Truck with Trailer',
        'ED': 'ED - Bus with Trailer',
        // Legacy mappings for backward compatibility
        'A2': 'A - Large Motorcycle',
        'BE': 'EB - Car with Trailer',
        'CE': 'EC - Truck with Trailer',
        'DE': 'ED - Bus with Trailer'
      };

      // Try to map individual categories - take the first one for dropdown
      const individualCategories = processedCategories.split(/[,\s]+/).filter(Boolean);
      if (individualCategories.length > 0) {
        const firstCategory = individualCategories[0].trim().toUpperCase();
        mappedData.licenseCategories = categoryMappings[firstCategory] || individualCategories[0];
        console.log('Processed license category for dropdown:', {
          original: processedCategories,
          firstCategory: firstCategory,
          mapped: mappedData.licenseCategories
        });
      }
    }

    // Place of Issue - try multiple field variations
    if (fields.placeOfIssue) mappedData.placeOfIssue = fields.placeOfIssue;
    else if (fields.place_of_issue) mappedData.placeOfIssue = fields.place_of_issue;
    else if (fields.delivred_at) mappedData.placeOfIssue = fields.delivred_at;
    else if (fields.delivred_to) mappedData.placeOfIssue = fields.delivred_to;
    else if (fields.délivré_à) mappedData.placeOfIssue = fields.délivré_à;

    // Additional fields that might be useful for client registration
    // Authority/Issuing Authority
    if (fields.authority) mappedData.placeOfIssue = fields.authority;
    else if (fields.issuing_authority) mappedData.placeOfIssue = fields.issuing_authority;
    else if (fields.autorité) mappedData.placeOfIssue = fields.autorité;

    // Document side information
    if (fields.side) {
      // This can be useful for determining which side of the document was processed
      console.log('Document side processed:', fields.side);
    }

    // Raw entities for debugging (if needed)
    if (fields.rawEntities) {
      console.log('Raw entities from Document AI:', fields.rawEntities);
    }

    // Full text for debugging (if needed)
    if (fields.fullText) {
      console.log('Full text from Document AI (first 200 chars):', fields.fullText.substring(0, 200));
      
      // Extract additional information from full text if specific fields are missing
      if (!mappedData.licenseNumber && fields.fullText.includes('Permis N°')) {
        const licenseMatch = fields.fullText.match(/Permis N°\s*(\d+\/\d+)/);
        if (licenseMatch) {
          mappedData.licenseNumber = licenseMatch[1];
          console.log('Extracted license number from text:', mappedData.licenseNumber);
        }
      }
      
      // Extract issue date from text if not available in fields
      if (!mappedData.licenseIssueDate && fields.fullText.includes('Le ')) {
        const issueMatch = fields.fullText.match(/Le\s+(\d{2}\/\d{2}\/\d{4})/);
        if (issueMatch) {
          mappedData.licenseIssueDate = formatDate(issueMatch[1]);
          console.log('Extracted issue date from text:', mappedData.licenseIssueDate);
        }
      }
      
      // Extract place of issue from text if not available in fields
      if (!mappedData.placeOfIssue && fields.fullText.includes('délivré à')) {
        const placeMatch = fields.fullText.match(/délivré à\s+([A-Za-zÀ-ÿ]+)/);
        if (placeMatch) {
          mappedData.placeOfIssue = placeMatch[1];
          console.log('Extracted place of issue from text:', mappedData.placeOfIssue);
        }
      }

      // Extract gender from text if not available in fields
      if (!mappedData.gender) {
        if (fields.fullText.includes('Sexe') || fields.fullText.includes('الجنس')) {
          if (fields.fullText.includes('M') || fields.fullText.includes('Masculin') || fields.fullText.includes('ذكر')) {
            mappedData.gender = "Male";
            console.log('Extracted gender from text: Male');
          } else if (fields.fullText.includes('F') || fields.fullText.includes('Féminin') || fields.fullText.includes('أنثى')) {
            mappedData.gender = "Female";
            console.log('Extracted gender from text: Female');
          }
        }
      }

      // Extract nationality from text if not available in fields
      if (!mappedData.nationality) {
        if (fields.fullText.includes('Maroc') || fields.fullText.includes('المغرب') || fields.fullText.includes('Moroccan')) {
          mappedData.nationality = "Moroccan";
          console.log('Extracted nationality from text: Moroccan');
        }
      }

      // Extract expiry date from text if not available in fields
      if (!mappedData.expiryDate && !mappedData.licenseExpiryDate) {
        const expiryMatch = fields.fullText.match(/Valable jusqu'au\s*(\d{2}\/\d{2}\/\d{4})/);
        if (expiryMatch) {
          const formattedExpiry = formatDate(expiryMatch[1]);
          mappedData.expiryDate = formattedExpiry;
          mappedData.licenseExpiryDate = formattedExpiry;
          console.log('Extracted expiry date from text:', formattedExpiry);
        }
      }

      // Additional license-specific text extraction
      if (fields.fullText.includes('PERMIS DE CONDUIRE') || fields.fullText.includes('رخصة السياقة')) {
        console.log('License document detected, extracting additional fields...');
        
        // Try to extract expiry date from various license text patterns
        if (!mappedData.licenseExpiryDate) {
          const patterns = [
            /Valable jusqu'au\s*(\d{2}\/\d{2}\/\d{4})/,
            /Valable jusqu'au\s*(\d{2}\.\d{2}\.\d{4})/,
            /Valable jusqu'au\s*(\d{2}-\d{2}-\d{4})/,
            /Expire le\s*(\d{2}\/\d{2}\/\d{4})/,
            /Expire le\s*(\d{2}\.\d{2}\.\d{4})/,
            /Expire le\s*(\d{2}-\d{2}-\d{4})/,
            /Date d'expiration\s*(\d{2}\/\d{2}\/\d{4})/,
            /Date d'expiration\s*(\d{2}\.\d{2}\.\d{4})/,
            /Date d'expiration\s*(\d{2}-\d{2}-\d{4})/
          ];
          
          for (const pattern of patterns) {
            const match = fields.fullText.match(pattern);
            if (match) {
              const formattedExpiry = formatDate(match[1]);
              mappedData.licenseExpiryDate = formattedExpiry;
              mappedData.expiryDate = formattedExpiry;
              console.log(`Extracted license expiry date using pattern ${pattern}:`, formattedExpiry);
              break;
            }
          }
        }

        // Try to extract license categories from text if not already available
        if (!mappedData.licenseCategories) {
          const categoryPatterns = [
            /Catégories?\s*:?\s*([A-Z,\s]+)/i,
            /Categories?\s*:?\s*([A-Z,\s]+)/i,
            /Catégories?\s*:?\s*([A-Z,\s]+)/i,
            /([A-Z])\s*-?\s*[A-Za-z\s]+/g,
            /([A-Z])\s*[A-Za-z\s]*/g,
            // Specific Moroccan license patterns
            /(AM|A1|A|B|C|D|EB|EC|ED)/g,
            /Catégories?\s*\/\s*الأصناف\s*:?\s*([A-Z,\s]+)/i
          ];
          
          for (const pattern of categoryPatterns) {
            const matches = fields.fullText.match(pattern);
            if (matches) {
              let extractedCategories = '';
              if (Array.isArray(matches)) {
                // For patterns with capture groups
                extractedCategories = matches.slice(1).join(', ');
              } else {
                // For global patterns
                extractedCategories = matches;
              }
              
              if (extractedCategories) {
                mappedData.licenseCategories = extractedCategories;
                console.log('Extracted license categories from text:', extractedCategories);
                console.log('Using pattern:', pattern);
                break;
              }
            }
          }
        }
      }
    }

    // Document Type detection
    if (fields.documentType) {
      if (fields.documentType === 'driver_license') {
        mappedData.idType = "Driving License";
        console.log('Set idType to Driving License from documentType field');
      } else if (fields.documentType === 'cin') {
        mappedData.idType = "Moroccan National ID";
        console.log('Set idType to Moroccan National ID from documentType field');
      }
    } else if (fields.fullText) {
      // Fallback: detect document type from text content
      if (fields.fullText.includes('PERMIS DE CONDUIRE') || fields.fullText.includes('رخصة السياقة')) {
        mappedData.idType = "Driving License";
        console.log('Set idType to Driving License from text content');
      } else if (fields.fullText.includes('CARTE NATIONALE') || fields.fullText.includes('الهوية الوطنية')) {
        mappedData.idType = "Moroccan National ID";
        console.log('Set idType to Moroccan National ID from text content');
      }
    }

    // Set defaults for Moroccan documents
    if (!mappedData.nationality) {
      mappedData.nationality = "Moroccan";
      console.log('Set default nationality to Moroccan');
    }
    if (!mappedData.gender) {
      mappedData.gender = "Male"; // Default for Moroccan IDs
      console.log('Set default gender to Male');
    }

    // For license documents, ensure these fields are populated
    if (mappedData.idType === "Driving License") {
      // Ensure license documents have the required fields
      if (!mappedData.expiryDate && mappedData.licenseExpiryDate) {
        mappedData.expiryDate = mappedData.licenseExpiryDate;
        console.log('Set expiryDate for license document:', mappedData.expiryDate);
      }
      if (!mappedData.gender) {
        mappedData.gender = "Male"; // Default for Moroccan licenses
        console.log('Set gender for license document:', mappedData.gender);
      }
      if (!mappedData.nationality) {
        mappedData.nationality = "Moroccan"; // Default for Moroccan licenses
        console.log('Set nationality for license document:', mappedData.nationality);
      }
    }

    // Log the mapping results
    console.log('Field mapping completed:', mappedData);
    
    // Log specific license-related fields for debugging
    if (mappedData.idType === "Driving License" || mappedData.licenseNumber) {
      console.log('=== LICENSE DOCUMENT FIELD MAPPING SUMMARY ===');
      console.log('License Number:', mappedData.licenseNumber);
      console.log('License Issue Date:', mappedData.licenseIssueDate);
      console.log('License Expiry Date:', mappedData.licenseExpiryDate);
      console.log('Main Expiry Date:', mappedData.expiryDate);
      console.log('License Categories:', mappedData.licenseCategories);
      console.log('Place of Issue:', mappedData.placeOfIssue);
      console.log('===========================================');
    }

    // Log final license categories for debugging
    if (mappedData.licenseCategories) {
      console.log('Final license category for dropdown:', mappedData.licenseCategories);
      console.log('Available form categories:', [
        "AM - Moped/Scooter",
        "A1 - Small Motorcycle", 
        "A - Large Motorcycle",
        "B - Car",
        "C - Truck",
        "D - Bus",
        "EB - Car with Trailer",
        "EC - Truck with Trailer",
        "ED - Bus with Trailer"
      ]);
    }

    return mappedData;
  };

  // Updated main processing function to use only Document AI with parallel processing
  const processDocuments = useCallback(async () => {
    if (!uploadedImages.idFront && !uploadedImages.licenseFront) {
      alert("Please upload at least the front of ID card or driving license");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress([]);

    try {
      const parsedData: ParsedDocumentData = {
        fullName: "",
        firstName: "",
        lastName: "",
        gender: "",
        nationality: "",
        dateOfBirth: "",
        placeOfBirth: "",
        address: "",
        idType: "",
        idNumber: "",
        issueDate: "",
        expiryDate: "",
        licenseNumber: "",
        licenseIssueDate: "",
        licenseExpiryDate: "",
        licenseCategories: "",
        placeOfIssue: "",
      };

      // Create an array of all images to process
      const imagesToProcess = [];
      
      if (uploadedImages.idFront) {
        imagesToProcess.push({
          type: 'ID Front',
          file: uploadedImages.idFront,
          key: 'idFront'
        });
      }
      
      if (uploadedImages.idBack) {
        imagesToProcess.push({
          type: 'ID Back',
          file: uploadedImages.idBack,
          key: 'idBack'
        });
      }
      
      if (uploadedImages.licenseFront) {
        imagesToProcess.push({
          type: 'License Front',
          file: uploadedImages.licenseFront,
          key: 'licenseFront'
        });
      }
      
      if (uploadedImages.licenseBack) {
        imagesToProcess.push({
          type: 'License Back',
          file: uploadedImages.licenseBack,
          key: 'licenseBack'
        });
      }

      console.log(`Processing ${imagesToProcess.length} images simultaneously...`);
      setProcessingProgress([`Starting processing of ${imagesToProcess.length} images...`]);

      // Estimate processing time (roughly 15-25 seconds per image)
      const estimatedTimePerImage = 20; // seconds
      const totalEstimatedTime = imagesToProcess.length * estimatedTimePerImage;
      setProcessingProgress(prev => [...prev, `⏱️ Estimated time: ${totalEstimatedTime} seconds`]);

      // Process all images in parallel using Promise.all()
      const processingPromises = imagesToProcess.map(async (imageInfo) => {
        try {
          setProcessingProgress(prev => [...prev, `Processing ${imageInfo.type}...`]);
          console.log(`Processing ${imageInfo.type} with Google Document AI...`);
          const fields = await extractStructuredFields(imageInfo.file);
          const mappedData = mapDocumentAIFieldsToForm(fields);
          
          // Special handling for license back to ensure expiry date is captured
          if (imageInfo.key === 'licenseBack' && mappedData.expiryDate) {
            console.log(`License back expiry date detected: ${mappedData.expiryDate}`);
            // Ensure this gets mapped to licenseExpiryDate for the form
            if (!mappedData.licenseExpiryDate) {
              mappedData.licenseExpiryDate = mappedData.expiryDate;
              console.log(`Set licenseExpiryDate from expiryDate for license back: ${mappedData.licenseExpiryDate}`);
            }
          }
          
          setProcessingProgress(prev => [...prev, `✅ ${imageInfo.type} completed`]);
          
          return {
            type: imageInfo.type,
            key: imageInfo.key,
            data: mappedData,
            success: true
          };
        } catch (error) {
          console.error(`Document AI processing failed for ${imageInfo.type}:`, error);
          setProcessingProgress(prev => [...prev, `❌ ${imageInfo.type} failed`]);
          
          return {
            type: imageInfo.type,
            key: imageInfo.key,
            data: {} as Partial<ParsedDocumentData>,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      // Wait for all images to be processed simultaneously
      const results = await Promise.all(processingPromises);
      
      setProcessingProgress(prev => [...prev, 'Merging results...']);
      console.log('All images processed:', results);

      // Merge all successful results
      results.forEach(result => {
        if (result.success) {
          console.log(`${result.type} data extracted:`, result.data);
          
          // Merge data, prioritizing non-empty values
          Object.keys(result.data).forEach(key => {
            const typedKey = key as keyof ParsedDocumentData;
            if (result.data[typedKey] && !parsedData[typedKey]) {
              (parsedData as any)[typedKey] = result.data[typedKey];
            }
          });
        } else {
          console.warn(`${result.type} processing failed:`, result.error);
        }
      });

      // Add image URLs to parsed data for automatic form population
      if (uploadedImages.idFront) {
        parsedData.idFrontImageUrl = URL.createObjectURL(uploadedImages.idFront);
        console.log('Added ID Front image URL to parsed data');
      }
      if (uploadedImages.idBack) {
        parsedData.idBackImageUrl = URL.createObjectURL(uploadedImages.idBack);
        console.log('Added ID Back image URL to parsed data');
      }
      if (uploadedImages.licenseFront) {
        parsedData.licenseFrontImageUrl = URL.createObjectURL(uploadedImages.licenseFront);
        console.log('Added License Front image URL to parsed data');
      }
      if (uploadedImages.licenseBack) {
        parsedData.licenseBackImageUrl = URL.createObjectURL(uploadedImages.licenseBack);
        console.log('Added License Back image URL to parsed data');
      }

      // Set document type based on what was processed
      if (uploadedImages.idFront || uploadedImages.idBack) {
        parsedData.idType = "Moroccan National ID";
      }
      if (uploadedImages.licenseFront || uploadedImages.licenseBack) {
        parsedData.idType = parsedData.idType ? `${parsedData.idType} + Driving License` : "Driving License";
      }

      setProcessingProgress(prev => [...prev, '✅ Processing completed!']);
      console.log('Final parsed data:', parsedData);
      setParsedData(parsedData);
      
      // Show success message with image information
      const imageCount = [uploadedImages.idFront, uploadedImages.idBack, uploadedImages.licenseFront, uploadedImages.licenseBack].filter(Boolean).length;
      setProcessingProgress(prev => [...prev, `🎉 Success! ${imageCount} image(s) processed and will be auto-populated in the form`]);
      
      onParsed(parsedData);
      // Auto-close the parser after successful processing
      onClose();

    } catch (error) {
      console.error('Document processing error:', error);
      setProcessingProgress(prev => [...prev, '❌ Processing failed']);
      alert('Failed to process documents. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, onParsed]);

  // Removed admin-side action for using parsed data from mobile list

  const renderUploadSection = (type: keyof typeof uploadedImages, title: string, description: string) => (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center dark:border-gray-600">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(type, file);
          }}
          className="hidden"
          id={`${type}-upload`}
        />
        <label
          htmlFor={`${type}-upload`}
          className="cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {uploadedImages[type] ? (
            <div className="space-y-2">
              <img
                src={URL.createObjectURL(uploadedImages[type]!)}
                alt={`${title} Preview`}
                className="w-32 h-20 object-cover mx-auto rounded"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadedImages[type]?.name}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Uploaded - Ready for processing
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to change image
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📄</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Document Parser
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 Document Requirements
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Upload clear images of Moroccan ID cards and driving licenses. Click "Parse Documents" to extract personal information using Google Document AI.
              ID details, and driving license information will be automatically extracted with high accuracy. Documents should be in Arabic and French.
            </p>
          </div>

          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="text-sm"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID Card Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                🆔 ID Card Documents
              </h3>
              {renderUploadSection(
                "idFront",
                "Front of ID Card",
                "Upload front of Moroccan ID card or Passport"
              )}
              {renderUploadSection(
                "idBack",
                "Back of ID Card",
                "Upload back of Moroccan ID card or Passport"
              )}
            </div>

            {/* Driving License Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                🚗 Driving License Documents
              </h3>
              {renderUploadSection(
                "licenseFront",
                "Front of Driving License",
                "Upload front of Moroccan driving license"
              )}
              {renderUploadSection(
                "licenseBack",
                "Back of Driving License",
                "Upload back of Moroccan driving license"
              )}
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Processing documents with Google Document AI...
                  </p>
                </div>
                
                {/* Progress Details */}
                {processingProgress.length > 0 && (
                  <div className="space-y-2">
                    {processingProgress.map((progress, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-yellow-700 dark:text-yellow-300">
                          {progress.includes('✅') ? '✓' : progress.includes('❌') ? '✗' : '•'}
                        </span>
                        <span className={`text-yellow-700 dark:text-yellow-300 ${
                          progress.includes('✅') ? 'text-green-700 dark:text-green-300' : 
                          progress.includes('❌') ? 'text-red-700 dark:text-red-300' : ''
                        }`}>
                          {progress}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Processing Info */}
          {!isProcessing && (uploadedImages.idFront || uploadedImages.idBack || uploadedImages.licenseFront || uploadedImages.licenseBack) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600">📋</div>
                <p className="text-blue-800 dark:text-blue-200">
                  Documents uploaded. Click "Parse Documents" to start processing.
                </p>
              </div>
            </div>
          )}

          {/* Mobile Uploads Section removed; QR remains */}

          {/* QR Code Section for Mobile Uploads */}
          {clientId && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  📱 Mobile Upload Option
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="text-sm"
                >
                  {showQRCode ? "Hide QR Code" : "Show QR Code"}
                </Button>
              </div>

              {showQRCode && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Scan QR Code for Mobile Upload
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Generate a QR code that clients can scan with their phone to upload their ID and driving license photos directly.
                    </p>
                  </div>

                  <QRCodeGenerator
                    clientId={clientId}
                    clientName={clientName || "Client"}
                  />

                  {/* Live Upload Status removed */}

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      📋 Instructions for Client:
                    </h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Scan the QR code with your phone camera</li>
                      <li>• Upload front and back of ID card</li>
                      <li>• Upload front and back of driving license</li>
                      <li>• Review and confirm the extracted data</li>
                      <li>• QR code expires in 4 minutes for security</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={processDocuments}
              disabled={isProcessing || (!uploadedImages.idFront && !uploadedImages.licenseFront)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Parse Documents"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentParser; 