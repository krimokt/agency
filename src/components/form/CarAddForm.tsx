import React, { useEffect, useState, Suspense, lazy } from 'react';
import Button from '@/components/ui/button/Button';
import { supabase } from '@/lib/supabase';

// Lazy load the QR code generator to avoid SSR issues
const CarQRCodeGenerator = lazy(() => import('../qr/CarQRCodeGenerator'));

// Define interfaces for form data
interface CarBasicInfo {
  brand: string;
  model: string;
  plateNumber: string;
  year: number;
  pricePerDay: number;
}

interface CarDetails {
  category: string;
  status: 'Available' | 'Rented' | 'In Maintenance';
  features: string[];
  imageUrl: string;
}

interface DocumentDate {
  issuedDate?: string;
  expiryDate?: string;
  startDate?: string;
  endDate?: string;
}

interface CarDocuments {
  carteGrise: File | null;
  insurance: File | null;
  technicalInspection: File | null;
  rentalAgreement: File | null;
  otherDocuments: File | null;
  carteGriseDates: DocumentDate;
  insuranceDates: DocumentDate;
  technicalInspectionDates: DocumentDate;
  rentalAgreementDates: DocumentDate;
}

interface CarAddFormProps {
  onSubmit: (carData: {
    basicInfo: CarBasicInfo;
    details: CarDetails;
    documents: CarDocuments;
    documentUrls: Record<string, string | null>;
  }) => void;
  onCancel: () => void;
}

const CarAddForm: React.FC<CarAddFormProps> = ({ onSubmit, onCancel }) => {
  // Current step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Car ID state - will be set when car is created
  const [carId, setCarId] = useState<string | null>(null);
  const [isCreatingCar, setIsCreatingCar] = useState(false);
  
  // QR upload polling state
  const [qrJwtToken, setQrJwtToken] = useState<string | null>(null);
  const [isPollingQR, setIsPollingQR] = useState(false);
  
  // Form data state
  const [basicInfo, setBasicInfo] = useState<CarBasicInfo>({
    brand: '',
    model: '',
    plateNumber: '',
    year: new Date().getFullYear(),
    pricePerDay: 100,
  });
  
  const [details, setDetails] = useState<CarDetails>({
    category: 'Sedan',
    status: 'Available',
    features: [],
    imageUrl: '',
  });
  
  const [documents, setDocuments] = useState<CarDocuments>({
    carteGrise: null,
    insurance: null,
    technicalInspection: null,
    rentalAgreement: null,
    otherDocuments: null,
    carteGriseDates: {
      issuedDate: new Date().toISOString().split('T')[0],
    },
    insuranceDates: {
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
    technicalInspectionDates: {
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
    rentalAgreementDates: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
  });

  // Preview image state
  const [imagePreview, setImagePreview] = useState<string>('');

  // Step 3 uploads state
  const [docUploading, setDocUploading] = useState<Record<string, boolean>>({});
  const [docUrls, setDocUrls] = useState<Record<string, string | null>>({
    carteGrise: null,
    insurance: null,
    technicalInspection: null,
    rentalAgreement: null,
    otherDocuments: null,
  });

  // License plate split inputs state
  const [plateLeftNumber, setPlateLeftNumber] = useState<string>('');
  const [plateArabicLetter, setPlateArabicLetter] = useState<string>('');
  const [plateRightNumber, setPlateRightNumber] = useState<string>('');
  const [isArabicKeyboardOpen, setIsArabicKeyboardOpen] = useState<boolean>(false);

  const ARABIC_LETTERS = [
    'ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'
  ];

  // Keep combined plate number in basicInfo
  useEffect(() => {
    const left = (plateLeftNumber || '').replace(/\D/g, '');
    const right = (plateRightNumber || '').replace(/\D/g, '');
    const letter = (plateArabicLetter || '').replace(/[^\u0600-\u06FF]/g, '');
    const combined = [left, letter, right].filter(Boolean).join('-');
    setBasicInfo(prev => ({ ...prev, plateNumber: combined }));
  }, [plateLeftNumber, plateArabicLetter, plateRightNumber]);

  // QR upload polling effect
  useEffect(() => {
    if (!qrJwtToken || !isPollingQR) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mobile-upload-car/status?token=${encodeURIComponent(qrJwtToken)}`);
        const data = await response.json();
        
        if (data.success && data.urls) {
          // Update document URLs from QR uploads
          const newDocUrls = { ...docUrls };
          if (data.urls.carteGrise) newDocUrls.carteGrise = data.urls.carteGrise;
          if (data.urls.insurance) newDocUrls.insurance = data.urls.insurance;
          if (data.urls.inspection) newDocUrls.technicalInspection = data.urls.inspection;
          if (data.urls.rentalAgreement) newDocUrls.rentalAgreement = data.urls.rentalAgreement;
          if (data.urls.other) newDocUrls.otherDocuments = data.urls.other;
          
          setDocUrls(newDocUrls);
          
          // Stop polling if upload is completed
          if (data.status === 'completed') {
            setIsPollingQR(false);
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling QR upload status:', error);
      }
    }, 2000); // Poll every 2 seconds

          return () => clearInterval(pollInterval);
    }, [qrJwtToken, isPollingQR, docUrls]);
  
  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof Pick<CarDocuments, 'carteGrise' | 'insurance' | 'technicalInspection' | 'rentalAgreement' | 'otherDocuments'>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({
        ...documents,
        [documentType]: e.target.files[0],
      });
    }
  };

  // Handle document dates change
  const handleDocumentDateChange = (
    documentType: 'carteGriseDates' | 'insuranceDates' | 'technicalInspectionDates' | 'rentalAgreementDates',
    dateType: keyof DocumentDate,
    value: string
  ) => {
    setDocuments({
      ...documents,
      [documentType]: {
        ...documents[documentType],
        [dateType]: value,
      },
    });
  };

  // Calculate days left until expiry
  const calculateDaysLeft = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get expiry status indicator
  const getExpiryStatus = (expiryDate?: string): { status: 'valid' | 'warning' | 'expired'; text: string } => {
    if (!expiryDate) return { status: 'valid', text: '' };
    
    const daysLeft = calculateDaysLeft(expiryDate);
    
    if (daysLeft < 0) {
      return { status: 'expired', text: 'Expired' };
    } else if (daysLeft <= 30) {
      return { status: 'warning', text: `${daysLeft} days left` };
    } else {
      return { status: 'valid', text: 'Valid' };
    }
  };

  // Handle image URL or upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setDetails({
        ...details,
        imageUrl: imageUrl,
      });
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagePreview(e.target.value);
    setDetails({
      ...details,
      imageUrl: e.target.value,
    });
  };

  // Handle features checkbox
  const handleFeatureCheckboxChange = (feature: string) => {
    setDetails((prevDetails) => {
      const currentFeatures = [...prevDetails.features];
      if (currentFeatures.includes(feature)) {
        return {
          ...prevDetails,
          features: currentFeatures.filter(f => f !== feature)
        };
      } else {
        return {
          ...prevDetails,
          features: [...currentFeatures, feature]
        };
      }
    });
  };

  // Predefined features list
  const predefinedFeatures = [
    'Air Conditioning (AC)',
    'Bluetooth',
    'GPS / Navigation',
    'Backup Camera',
    'Parking Sensors / Radar Park Assist',
    'Automatic Transmission',
    'USB Charger / Port',
    'Sunroof',
    'Cruise Control',
    'Child Seat (ISOFIX-ready)'
  ];

  // Navigation functions
  const goToNextStep = async () => {
    if (currentStep < 3) {
      // If going to Step 3, create car record first
      if (currentStep === 2) {
        await createCarRecord();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  // Create car record for QR uploads
  const createCarRecord = async () => {
    if (carId || isCreatingCar) return; // Already created or creating
    
    setIsCreatingCar(true);
    try {
      const { data, error } = await supabase
        .from('add_new_car')
        .insert({
          brand: basicInfo.brand,
          model: basicInfo.model,
          plate_number: basicInfo.plateNumber,
          year: basicInfo.year,
          price_per_day: basicInfo.pricePerDay,
          category: details.category,
          status: details.status,
          features: details.features || [],
          image_url: details.imageUrl || 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=3270&auto=format&fit=crop'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating car record:', error);
        alert('Failed to create car record. Please try again.');
        return;
      }
      
      setCarId(data.id);
    } catch (error) {
      console.error('Error creating car record:', error);
      alert('Failed to create car record. Please try again.');
    } finally {
      setIsCreatingCar(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate plate parts before submit
    if (!plateLeftNumber || !plateArabicLetter || !plateRightNumber) {
      alert('Please enter a valid plate number: number - Arabic letter - number');
      setCurrentStep(1);
      return;
    }
    
    // Validate that at least one document has been uploaded
    const hasDocuments = Object.values(docUrls).some(url => url !== null);
    if (!hasDocuments) {
      alert('Please upload at least one document before saving the car. Go to Step 3 and upload documents first.');
      setCurrentStep(3);
      return;
    }
    
    // If car already exists (from QR uploads), just update it
    if (carId) {
      try {
        const { error } = await supabase
          .from('add_new_car')
          .update({
            carte_grise_url: docUrls.carteGrise,
            insurance_url: docUrls.insurance,
            technical_inspection_url: docUrls.technicalInspection,
            rental_agreement_url: docUrls.rentalAgreement,
            other_documents_url: docUrls.otherDocuments,
            updated_at: new Date().toISOString()
          })
          .eq('id', carId);
        
        if (error) {
          console.error('Error updating car:', error);
          alert('Failed to update car. Please try again.');
          return;
        }
        
        // Call onSubmit with the existing car data
        onSubmit({
          basicInfo,
          details,
          documents,
          documentUrls: docUrls,
        });
        return;
      } catch (error) {
        console.error('Error updating car:', error);
        alert('Failed to update car. Please try again.');
        return;
      }
    }
    
    // If car doesn't exist, create it (this shouldn't happen in normal flow)
    onSubmit({
      basicInfo,
      details,
      documents,
      documentUrls: docUrls, // Include the uploaded document URLs
    });
  };

  // Save selected files from Step 3 to Supabase Storage
  const uploadSingle = async (key: keyof typeof docUrls, file: File | null) => {
    if (!file) return null;
    try {
      setDocUploading((p) => ({ ...p, [key]: true }));
      const name = (file as any).name || `${key}`;
      const extMatch = name.match(/\.(\w+)$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : (file.type === 'application/pdf' ? '.pdf' : '.jpg');
      const path = `manual/${Date.now()}_${key}${ext}`;
      const { error } = await supabase.storage
        .from('car-documents')
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('car-documents').getPublicUrl(path);
      setDocUrls((p) => ({ ...p, [key]: publicUrl }));
      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${key}:`, error);
      alert(`Failed to upload ${key}. Please try again.`);
      return null;
    } finally {
      setDocUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const saveDocuments = async () => {
    const results = await Promise.all([
      uploadSingle('carteGrise', documents.carteGrise),
      uploadSingle('insurance', documents.insurance),
      uploadSingle('technicalInspection', documents.technicalInspection),
      uploadSingle('rentalAgreement', documents.rentalAgreement),
      uploadSingle('otherDocuments', documents.otherDocuments),
    ]);
    
    const uploadedCount = results.filter(url => url !== null).length;
    alert(`Documents uploaded successfully (${uploadedCount} files). Click "Save Car & Complete" to save the car with all information.`);
  };

  // Car brands for dropdown
  const carBrands = [
    'Toyota', 'Hyundai', 'Dacia', 'Peugeot', 'BMW', 'Mercedes', 'Audi', 
    'Volkswagen', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'Kia', 
    'Renault', 'Fiat', 'Seat', 'Skoda', 'Mazda', 'Volvo', 'Opel'
  ];

  // Car models based on selected brand
  const getCarModels = (brand: string) => {
    const modelsByBrand: Record<string, string[]> = {
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Yaris', 'Highlander', 'Prius'],
      'Hyundai': ['Elantra', 'Tucson', 'Santa Fe', 'Accent', 'Sonata', 'Kona'],
      'Dacia': ['Sandero', 'Duster', 'Logan', 'Spring', 'Jogger'],
      'Peugeot': ['208', '2008', '308', '3008', '5008', '508'],
      'BMW': ['Series 1', 'Series 3', 'Series 5', 'X1', 'X3', 'X5'],
      'Mercedes': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'GLE'],
      'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
      'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'T-Cross'],
      'Ford': ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'Mustang'],
      'Chevrolet': ['Spark', 'Malibu', 'Cruze', 'Equinox', 'Tahoe', 'Suburban'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Jazz'],
      'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Altima'],
      'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Niro'],
      'Renault': ['Clio', 'Captur', 'Megane', 'Kadjar', 'Arkana', 'Scenic'],
      'Fiat': ['500', 'Panda', 'Tipo', '500X', 'Doblo', 'Talento'],
      'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Alhambra'],
      'Skoda': ['Fabia', 'Octavia', 'Karoq', 'Kodiaq', 'Superb', 'Kamiq'],
      'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'MX-5'],
      'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
      'Opel': ['Corsa', 'Astra', 'Crossland', 'Grandland', 'Mokka', 'Insignia']
    };
    
    return modelsByBrand[brand] || [];
  };

  // Car categories
  const carCategories = [
    'Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Coupe', 
    'Convertible', 'Wagon', 'Minivan', 'Luxury', 'Electric', 'Hybrid'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Form Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {currentStep === 1 && 'Step 1 — Basic Information'}
          {currentStep === 2 && 'Step 2 — Car Details'}
          {currentStep === 3 && 'Step 3 — Required Documents *'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {currentStep === 1 && 'Provide basic information about the car.'}
          {currentStep === 2 && 'Add details and features of the car.'}
          {currentStep === 3 && 'Upload at least one required document to save the car.'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Basic Info</div>
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              2
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Car Details</div>
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            currentStep > 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              3
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Documents <span className="text-red-500">*</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Car Name (Brand) <span className="text-red-500">*</span>
                </label>
                <select
                  id="brand"
                  value={basicInfo.brand}
                  onChange={(e) => {
                    setBasicInfo({
                      ...basicInfo,
                      brand: e.target.value,
                      model: '', // Reset model when brand changes
                    });
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a brand</option>
                  {carBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <select
                  id="model"
                  value={basicInfo.model}
                  onChange={(e) => setBasicInfo({ ...basicInfo, model: e.target.value })}
                  required
                  disabled={!basicInfo.brand}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">Select a model</option>
                  {basicInfo.brand && getCarModels(basicInfo.brand).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {!basicInfo.brand && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Please select a brand first
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plate Number <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={plateLeftNumber}
                    onChange={(e) => setPlateLeftNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    placeholder="12345"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      dir="rtl"
                      value={plateArabicLetter}
                      onClick={() => setIsArabicKeyboardOpen(v => !v)}
                      placeholder="حرف"
                      className="w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {isArabicKeyboardOpen && (
                      <div className="absolute z-20 mt-2 w-64 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg grid grid-cols-7 gap-2">
                        {ARABIC_LETTERS.map((letter) => (
                          <button
                            type="button"
                            key={letter}
                            onClick={() => { setPlateArabicLetter(letter); setIsArabicKeyboardOpen(false); }}
                            className={`px-2 py-1 rounded text-lg leading-none border ${plateArabicLetter === letter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={plateRightNumber}
                    onChange={(e) => setPlateRightNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    placeholder="26"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Preview: <span dir="rtl" className="font-mono">{plateLeftNumber || '____'} | {plateArabicLetter || 'ـ'} | {plateRightNumber || '__'}</span>
                </p>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="year"
                  value={basicInfo.year}
                  onChange={(e) => setBasicInfo({ ...basicInfo, year: parseInt(e.target.value) })}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 16 }, (_, i) => 2025 - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Per Day (MAD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="pricePerDay"
                    value={basicInfo.pricePerDay}
                    onChange={(e) => setBasicInfo({ ...basicInfo, pricePerDay: parseInt(e.target.value) || 0 })}
                    min="0"
                    required
                    placeholder="e.g. 100"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">MAD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Car Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={details.category}
                  onChange={(e) => setDetails({ ...details, category: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {carCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Car Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={details.status}
                  onChange={(e) => setDetails({ ...details, status: e.target.value as CarDetails['status'] })}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="In Maintenance">In Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Features
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedFeatures.map((feature) => {
                    const isChecked = details.features.includes(feature);
                    return (
                      <div 
                        key={feature} 
                        onClick={() => handleFeatureCheckboxChange(feature)}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-5 h-5 rounded border ${
                          isChecked 
                            ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <label className={`text-sm font-medium cursor-pointer ${
                            isChecked 
                              ? 'text-blue-700 dark:text-blue-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {feature}
                          </label>
                        </div>
                        {isChecked && (
                          <div className="ml-2">
                            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Selected features: {details.features.length > 0 ? details.features.length : 'None'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Car Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={details.imageUrl}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/car-image.jpg"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mx-4">OR</span>
                  </div>
                  
                  <div>
                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                        <img
                          src={imagePreview}
                          alt="Car Preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImagePreview('');
                            alert('Invalid image URL. Please provide a valid URL.');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Required Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Car Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Vehicle Information</p>
                    <p className="text-blue-700 dark:text-blue-300 font-semibold">
                      {basicInfo.brand} {basicInfo.model} {basicInfo.year} • {basicInfo.plateNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Document Requirement</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Upload at least one document to save the vehicle. Use mobile QR code or manual upload.
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Upload Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mobile QR Upload</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Scan with your phone to upload documents</p>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {isCreatingCar && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          Creating vehicle record...
                        </span>
                      </div>
                    </div>
                  )}

                  {isPollingQR && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Waiting for mobile uploads...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* QR Code Generator */}
                  <div className="max-w-sm">
                    <Suspense fallback={
                      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    }>
                      <CarQRCodeGenerator 
                        carId={carId || 'temp-car'} 
                        carLabel={`${basicInfo.brand} ${basicInfo.model}`} 
                        onTokenGenerated={(jwtToken: string) => {
                          setQrJwtToken(jwtToken);
                          setIsPollingQR(true);
                        }}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Document Upload Grid */}
              <div className="grid gap-4">
                {/* Carte Grise */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Carte Grise</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Required
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Vehicle registration document</p>
                        
                        <div className="space-y-3">
                          <div>
                            <input
                              type="file"
                              id="carteGrise"
                              onChange={(e) => handleFileChange(e, 'carteGrise')}
                              className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {documents.carteGrise && (
                              <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {documents.carteGrise.name}
                              </p>
                            )}
                            {docUrls.carteGrise && (
                              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Uploaded {isPollingQR ? 'via QR' : 'manually'}
                              </p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="carteGriseIssued" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Issue Date
                            </label>
                            <input
                              type="date"
                              id="carteGriseIssued"
                              value={documents.carteGriseDates.issuedDate}
                              onChange={(e) => handleDocumentDateChange('carteGriseDates', 'issuedDate', e.target.value)}
                              className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Insurance</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Required
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Vehicle insurance certificate</p>
                        
                        <div className="space-y-3">
                          <div>
                            <input
                              type="file"
                              id="insurance"
                              onChange={(e) => handleFileChange(e, 'insurance')}
                              className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {documents.insurance && (
                              <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {documents.insurance.name}
                              </p>
                            )}
                            {docUrls.insurance && (
                              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Uploaded {isPollingQR ? 'via QR' : 'manually'}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="insuranceIssued" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Issue Date
                              </label>
                              <input
                                type="date"
                                id="insuranceIssued"
                                value={documents.insuranceDates.issuedDate}
                                onChange={(e) => handleDocumentDateChange('insuranceDates', 'issuedDate', e.target.value)}
                                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label htmlFor="insuranceExpiry" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="date"
                                id="insuranceExpiry"
                                value={documents.insuranceDates.expiryDate}
                                onChange={(e) => handleDocumentDateChange('insuranceDates', 'expiryDate', e.target.value)}
                                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                          {documents.insuranceDates.expiryDate && (
                            <div className="mt-2">
                              {getExpiryStatus(documents.insuranceDates.expiryDate).status === 'valid' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  ✓ Valid
                                </span>
                              )}
                              {getExpiryStatus(documents.insuranceDates.expiryDate).status === 'warning' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  ⚠ {getExpiryStatus(documents.insuranceDates.expiryDate).text}
                                </span>
                              )}
                              {getExpiryStatus(documents.insuranceDates.expiryDate).status === 'expired' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  ✕ Expired
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Inspection */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Technical Inspection</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Optional
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Technical inspection certificate</p>
                        
                        <div className="space-y-3">
                          <div>
                            <input
                              type="file"
                              id="technicalInspection"
                              onChange={(e) => handleFileChange(e, 'technicalInspection')}
                              className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {documents.technicalInspection && (
                              <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {documents.technicalInspection.name}
                              </p>
                            )}
                            {docUrls.technicalInspection && (
                              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Uploaded {isPollingQR ? 'via QR' : 'manually'}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="technicalInspectionIssued" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Issue Date
                              </label>
                              <input
                                type="date"
                                id="technicalInspectionIssued"
                                value={documents.technicalInspectionDates.issuedDate}
                                onChange={(e) => handleDocumentDateChange('technicalInspectionDates', 'issuedDate', e.target.value)}
                                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label htmlFor="technicalInspectionExpiry" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="date"
                                id="technicalInspectionExpiry"
                                value={documents.technicalInspectionDates.expiryDate}
                                onChange={(e) => handleDocumentDateChange('technicalInspectionDates', 'expiryDate', e.target.value)}
                                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                          {documents.technicalInspectionDates.expiryDate && (
                            <div className="mt-2">
                              {getExpiryStatus(documents.technicalInspectionDates.expiryDate).status === 'valid' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  ✓ Valid
                                </span>
                              )}
                              {getExpiryStatus(documents.technicalInspectionDates.expiryDate).status === 'warning' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  ⚠ {getExpiryStatus(documents.technicalInspectionDates.expiryDate).text}
                                </span>
                              )}
                              {getExpiryStatus(documents.technicalInspectionDates.expiryDate).status === 'expired' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  ✕ Expired
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Agreement */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Rental Agreement</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Optional
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Rental or lease agreement</p>
                        
                        <div className="space-y-3">
                          <div>
                            <input
                              type="file"
                              id="rentalAgreement"
                              onChange={(e) => handleFileChange(e, 'rentalAgreement')}
                              className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {documents.rentalAgreement && (
                              <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {documents.rentalAgreement.name}
                              </p>
                            )}
                            {docUrls.rentalAgreement && (
                              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Uploaded {isPollingQR ? 'via QR' : 'manually'}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="rentalAgreementStart" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Date
                              </label>
                              <input
                                type="date"
                                id="rentalAgreementStart"
                                value={documents.rentalAgreementDates.startDate}
                                onChange={(e) => handleDocumentDateChange('rentalAgreementDates', 'startDate', e.target.value)}
                                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label htmlFor="rentalAgreementEnd" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Date
                              </label>
                              <input
                                type="date"
                                id="rentalAgreementEnd"
                                value={documents.rentalAgreementDates.endDate}
                                onChange={(e) => handleDocumentDateChange('rentalAgreementDates', 'endDate', e.target.value)}
                                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Documents */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Other Documents</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Optional
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Additional documentation</p>
                        
                        <div>
                          <input
                            type="file"
                            id="otherDocuments"
                            onChange={(e) => handleFileChange(e, 'otherDocuments')}
                            className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {documents.otherDocuments && (
                            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {documents.otherDocuments.name}
                            </p>
                          )}
                          {docUrls.otherDocuments && (
                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Uploaded {isPollingQR ? 'via QR' : 'manually'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Action */}
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Ready to Upload?</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Upload selected documents to cloud storage</p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={saveDocuments} 
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium rounded-lg transition-colors"
                  >
                    Upload Documents
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              className="px-6 py-2.5"
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className={`px-6 py-2.5 ${
                Object.values(docUrls).some(url => url !== null) 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!Object.values(docUrls).some(url => url !== null)}
            >
              {Object.values(docUrls).some(url => url !== null) 
                ? 'Save Car & Complete' 
                : 'Upload Documents First'
              }
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CarAddForm; 