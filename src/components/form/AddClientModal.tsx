"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import DocumentParser from "./DocumentParser";
import { v4 as uuidv4 } from "uuid";

interface AddClientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  gender: "male" | "female" | "other";
  nationality: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  
  // ID Document
  idNumber: string;
  idIssueDate: string;
  idExpiryDate: string;
  idFrontImageUrl: string;
  idBackImageUrl: string;
  
  // Driving License
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseCategories: string; // Changed from string[] to string for dropdown
  licenseFrontImageUrl: string;
  licenseBackImageUrl: string;
  
  // Additional
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddClientFormData) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(1);
  const [isDocumentParserOpen, setIsDocumentParserOpen] = useState(false);
  const [clientId] = useState(() => uuidv4()); // Generate consistent clientId once
  const [uploadingDocuments, setUploadingDocuments] = useState<{
    idFront: boolean;
    idBack: boolean;
    licenseFront: boolean;
    licenseBack: boolean;
  }>({
    idFront: false,
    idBack: false,
    licenseFront: false,
    licenseBack: false,
  });
  const [processingOCR, setProcessingOCR] = useState(false);
  const [formData, setFormData] = useState<AddClientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "male",
    nationality: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    idNumber: "",
    idIssueDate: "",
    idExpiryDate: "",
    idFrontImageUrl: "",
    idBackImageUrl: "",
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    licenseCategories: "B - Car",
    licenseFrontImageUrl: "",
    licenseBackImageUrl: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    notes: "",
  });

  const handleInputChange = (
    field: string,
    value: string | string[] | object
  ) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof AddClientFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    try {
      // Set uploading state
      setUploadingDocuments(prev => ({ ...prev, [documentType]: true }));
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      // Upload to our API endpoint
      const response = await fetch('/api/document-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update form data with the uploaded URL
      const fieldMap: { [key: string]: string } = {
        'id_front': 'idFrontImageUrl',
        'id_back': 'idBackImageUrl',
        'license_front': 'licenseFrontImageUrl',
        'license_back': 'licenseBackImageUrl',
      };
      
      const fieldName = fieldMap[documentType];
      if (fieldName) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: result.url,
        }));
      }
      
      // Process OCR if we have both front and back of a document type
      await processOCRForDocument(documentType);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const processOCRForDocument = async (documentType: string) => {
    try {
      setProcessingOCR(true);
      
      // Check if we have both front and back images
      const hasBothImages = 
        (documentType === 'id_front' && formData.idFrontImageUrl && formData.idBackImageUrl) ||
        (documentType === 'id_back' && formData.idFrontImageUrl && formData.idBackImageUrl) ||
        (documentType === 'license_front' && formData.licenseFrontImageUrl && formData.licenseBackImageUrl) ||
        (documentType === 'license_back' && formData.licenseFrontImageUrl && formData.licenseBackImageUrl);
      
      if (!hasBothImages) return;
      
      // Process OCR for the complete document
      const response = await fetch('/api/process-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: documentType.startsWith('id_') ? 'id' : 'license',
          frontImageUrl: documentType.startsWith('id_') ? formData.idFrontImageUrl : formData.licenseFrontImageUrl,
          backImageUrl: documentType.startsWith('id_') ? formData.idBackImageUrl : formData.licenseBackImageUrl,
        }),
      });
      
      if (response.ok) {
        const parsedData = await response.json();
        // Auto-populate form fields with parsed data
        handleDocumentParsed(parsedData);
      }
      
    } catch (error) {
      console.error('OCR processing error:', error);
    } finally {
      setProcessingOCR(false);
    }
  };

  const handleDocumentParsed = (parsedData: any) => {
    console.log('handleDocumentParsed called with:', parsedData);
    
    // Try multiple ways to get the name
    let firstName = '';
    let lastName = '';
    
    // Method 1: Use firstName and lastName if available
    if (parsedData.firstName && parsedData.lastName) {
      firstName = parsedData.firstName;
      lastName = parsedData.lastName;
      console.log('Method 1 - Using firstName/lastName from parsed data:', { firstName, lastName });
    }
    // Method 2: Split fullName if available
    else if (parsedData.fullName) {
      const nameParts = parsedData.fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
      console.log('Method 2 - Split fullName:', { firstName, lastName, fullName: parsedData.fullName });
    }
    
    console.log('Final name extraction:', { firstName, lastName, fullName: parsedData.fullName });
    
    // Convert gender to our format
    const gender = parsedData.gender?.toLowerCase() === 'female' ? 'female' : 'male';
    
    // Use the full address string directly
    const address = parsedData.address || '';
    
    console.log('Address from OCR:', address);
    
    // Convert license categories string to single value
    const licenseCategories = parsedData.licenseCategories || '';
    
    const updatedFormData = {
      ...formData, // Keep existing form data
      firstName: firstName || formData.firstName,
      lastName: lastName || formData.lastName,
      email: formData.email,
      gender: gender as "male" | "female" | "other",
      nationality: parsedData.nationality || formData.nationality,
      dateOfBirth: parsedData.dateOfBirth || formData.dateOfBirth,
      phone: formData.phone,
      address: address, // This should now be properly set
      idNumber: parsedData.idNumber || formData.idNumber,
      idIssueDate: parsedData.issueDate || formData.idIssueDate,
      idExpiryDate: parsedData.expiryDate || formData.idExpiryDate,
      licenseNumber: parsedData.licenseNumber || formData.licenseNumber,
      licenseIssueDate: parsedData.licenseIssueDate || formData.licenseIssueDate,
      licenseExpiryDate: parsedData.licenseExpiryDate || formData.licenseExpiryDate,
      licenseCategories: licenseCategories,
      // Auto-populate image URLs from DocumentParser
      idFrontImageUrl: parsedData.idFrontImageUrl || formData.idFrontImageUrl,
      idBackImageUrl: parsedData.idBackImageUrl || formData.idBackImageUrl,
      licenseFrontImageUrl: parsedData.licenseFrontImageUrl || formData.licenseFrontImageUrl,
      licenseBackImageUrl: parsedData.licenseBackImageUrl || formData.licenseBackImageUrl,
    };
    
    // Log image population for debugging
    if (parsedData.idFrontImageUrl || parsedData.idBackImageUrl || parsedData.licenseFrontImageUrl || parsedData.licenseBackImageUrl) {
      console.log('Auto-populating images from DocumentParser:', {
        idFront: parsedData.idFrontImageUrl ? '✅ Added' : '❌ Not provided',
        idBack: parsedData.idBackImageUrl ? '✅ Added' : '❌ Not provided',
        licenseFront: parsedData.licenseFrontImageUrl ? '✅ Added' : '❌ Not provided',
        licenseBack: parsedData.licenseBackImageUrl ? '✅ Added' : '❌ Not provided'
      });
    }
    
    console.log('Updated form data:', updatedFormData);
    console.log('Final name in form data:', { firstName: updatedFormData.firstName, lastName: updatedFormData.lastName });
    console.log('Address in updated form data:', updatedFormData.address);
    
    setFormData(updatedFormData);
    
    // Show success message for auto-populated images
    const imageCount = [parsedData.idFrontImageUrl, parsedData.idBackImageUrl, parsedData.licenseFrontImageUrl, parsedData.licenseBackImageUrl].filter(Boolean).length;
    if (imageCount > 0) {
      alert(`✅ Successfully processed documents and auto-populated ${imageCount} image(s) in the form!`);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save to database
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      const result = await response.json();
      
      // If client was created successfully, sync images from client_uploads
      if (result.success && result.client) {
        try {
          const syncResponse = await fetch('/api/clients/sync-images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId: result.client.id }),
          });

          if (syncResponse.ok) {
            const syncResult = await syncResponse.json();
            console.log('Images synced successfully:', syncResult);
          }
        } catch (syncError) {
          console.error('Error syncing images:', syncError);
        }
      }
      
      // Call the original onSubmit callback
      onSubmit(formData);
      
      // Close modal and reset form
      onClose();
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        gender: "male",
        nationality: "",
        dateOfBirth: "",
        phone: "",
        address: "",
        idNumber: "",
        idIssueDate: "",
        idExpiryDate: "",
        idFrontImageUrl: "",
        idBackImageUrl: "",
        licenseNumber: "",
        licenseIssueDate: "",
        licenseExpiryDate: "",
        licenseCategories: "",
        licenseFrontImageUrl: "",
        licenseBackImageUrl: "",
        emergencyContact: {
          name: "",
          phone: "",
          relationship: "",
        },
        notes: "",
      });
      setActiveStep(1);
      
      // Show success message
      alert('Client created successfully!');
      
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof Error) {
        alert(`Error creating client: ${error.message}`);
      } else {
        alert('Error creating client: An unknown error occurred.');
      }
    }
  };
  const steps = [
    { id: 1, title: "Personal Information", icon: "👤" },
    { id: 2, title: "ID Document", icon: "🆔" },
    { id: 3, title: "Driving License", icon: "🚗" },
    { id: 4, title: "Client Contact", icon: "📞" },
  ];

  const licenseCategories = [
    "AM - Moped/Scooter",
    "A1 - Small Motorcycle",
    "A - Large Motorcycle", 
    "B - Car",
    "C - Truck",
    "D - Bus",
    "EB - Car with Trailer",
    "EC - Truck with Trailer",
    "ED - Bus with Trailer",
  ];

  const renderPersonalInformation = () => (
    <div className="space-y-6">
      {/* Document Parser Button */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📄 Auto-Fill from Documents
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Upload Moroccan ID cards and driving licenses to automatically fill the form. 
              Images will be automatically populated in the corresponding upload sections below.
            </p>
          </div>
          <Button
            onClick={() => setIsDocumentParserOpen(true)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Parse Documents
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
            {formData.firstName && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Auto-filled
              </span>
            )}
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
            {formData.lastName && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Auto-filled
              </span>
            )}
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nationality
          </label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleInputChange("nationality", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

             <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Address
         </label>
         <textarea
           placeholder="Enter full address"
           value={formData.address}
           onChange={(e) => handleInputChange("address", e.target.value)}
           rows={3}
           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
         />
         {formData.address && (
           <p className="text-xs text-gray-500 mt-1">
             Current address: {formData.address}
           </p>
         )}
       </div>
       
       {/* Debug Section - Remove in production */}
       {process.env.NODE_ENV === 'development' && (
         <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
           <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
             🔍 Debug Info (Development Only)
           </h4>
           <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
             <div>First Name: "{formData.firstName}"</div>
             <div>Last Name: "{formData.lastName}"</div>
             <div>Nationality: "{formData.nationality}"</div>
             <div>Date of Birth: "{formData.dateOfBirth}"</div>
             <div>Address: "{formData.address}"</div>
           </div>
         </div>
       )}
    </div>
  );

  const renderIdDocument = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ID Number *
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleInputChange("idNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issue Date
          </label>
          <input
            type="date"
            value={formData.idIssueDate}
            onChange={(e) => handleInputChange("idIssueDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expiry Date
        </label>
        <input
          type="date"
          value={formData.idExpiryDate}
          onChange={(e) => handleInputChange("idExpiryDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload ID Front
            {formData.idFrontImageUrl && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Auto-populated
              </span>
            )}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center dark:border-gray-600">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("id_front", file);
              }}
              className="hidden"
              id="id-front-upload"
              disabled={uploadingDocuments.idFront}
            />
            <label
              htmlFor="id-front-upload"
              className={`cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 ${
                uploadingDocuments.idFront ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formData.idFrontImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={formData.idFrontImageUrl}
                    alt="ID Front Preview"
                    className="w-24 h-16 object-cover mx-auto rounded"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.idFront ? 'Uploading...' : 'Click to change'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl">📄</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.idFront ? 'Uploading...' : 'Upload ID Front'}
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload ID Back
            {formData.idBackImageUrl && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Auto-populated
              </span>
            )}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center dark:border-gray-600">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("id_back", file);
              }}
              className="hidden"
              id="id-back-upload"
              disabled={uploadingDocuments.idBack}
            />
            <label
              htmlFor="id-back-upload"
              className={`cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 ${
                uploadingDocuments.idBack ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formData.idBackImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={formData.idBackImageUrl}
                    alt="ID Back Preview"
                    className="w-24 h-16 object-cover mx-auto rounded"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.idBack ? 'Uploading...' : 'Click to change'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl">📄</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.idBack ? 'Uploading...' : 'Upload ID Back'}
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {processingOCR && (
        <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Processing documents with OCR...
          </span>
        </div>
      )}
    </div>
  );

  const renderDrivingLicense = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            License Number *
          </label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issue Date
          </label>
          <input
            type="date"
            value={formData.licenseIssueDate}
            onChange={(e) => handleInputChange("licenseIssueDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expiry Date
        </label>
        <input
          type="date"
          value={formData.licenseExpiryDate}
          onChange={(e) => handleInputChange("licenseExpiryDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          License Categories
        </label>
        <select
          value={formData.licenseCategories}
          onChange={(e) => handleInputChange("licenseCategories", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select a license category</option>
          {licenseCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload License Front
            {formData.licenseFrontImageUrl && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Auto-populated
              </span>
            )}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center dark:border-gray-600">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("license_front", file);
              }}
              className="hidden"
              id="license-front-upload"
              disabled={uploadingDocuments.licenseFront}
            />
            <label
              htmlFor="license-front-upload"
              className={`cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 ${
                uploadingDocuments.licenseFront ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formData.licenseFrontImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={formData.licenseFrontImageUrl}
                    alt="License Front Preview"
                    className="w-24 h-16 object-cover mx-auto rounded"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.licenseFront ? 'Uploading...' : 'Click to change'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl">🚗</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.licenseFront ? 'Uploading...' : 'Upload License Front'}
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload License Back
            {formData.licenseBackImageUrl && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Auto-populated
              </span>
            )}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center dark:border-gray-600">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("license_back", file);
              }}
              className="hidden"
              id="license-back-upload"
              disabled={uploadingDocuments.licenseBack}
            />
            <label
              htmlFor="license-back-upload"
              className={`cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 ${
                uploadingDocuments.licenseBack ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formData.licenseBackImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={formData.licenseBackImageUrl}
                    alt="License Back Preview"
                    className="w-24 h-16 object-cover mx-auto rounded"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.licenseBack ? 'Uploading...' : 'Click to change'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl">🚗</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadingDocuments.licenseBack ? 'Uploading...' : 'Upload License Back'}
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientContact = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📞 Contact Information
        </h4>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          Provide the client's primary contact details for communication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="client@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="+212 6XX XXX XXX"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Emergency Contact
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Contact Name"
            value={formData.emergencyContact.name}
            onChange={(e) => handleInputChange("emergencyContact.name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <input
            type="tel"
            placeholder="Contact Phone"
            value={formData.emergencyContact.phone}
            onChange={(e) => handleInputChange("emergencyContact.phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            placeholder="Relationship"
            value={formData.emergencyContact.relationship}
            onChange={(e) => handleInputChange("emergencyContact.relationship", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Additional notes about the client..."
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderPersonalInformation();
      case 2:
        return renderIdDocument();
      case 3:
        return renderDrivingLicense();
      case 4:
        return renderClientContact();
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Client
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium",
                  activeStep >= step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400"
                )}
              >
                {activeStep > step.id ? "✓" : step.icon}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium",
                  activeStep >= step.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-4",
                    activeStep > step.id
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
                         {activeStep < steps.length ? (
               <Button
                 onClick={() => setActiveStep(activeStep + 1)}
                 disabled={
                   (activeStep === 1 && (!formData.firstName || !formData.lastName)) ||
                   (activeStep === 2 && !formData.idNumber) ||
                   (activeStep === 3 && !formData.licenseNumber) ||
                   (activeStep === 4 && (!formData.phone))
                 }
               >
                 Next
               </Button>
             ) : (
               <Button onClick={handleSubmit}>
                 Add Client
               </Button>
             )}
          </div>
        </div>
      </div>

      {/* Document Parser Modal */}
      <DocumentParser
        isOpen={isDocumentParserOpen}
        onClose={() => setIsDocumentParserOpen(false)}
        onParsed={handleDocumentParsed}
        clientId={clientId}
        clientName={`${formData.firstName} ${formData.lastName}`.trim() || "New Client"}
      />
    </Modal>
  );
};

export default AddClientModal; 