import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';

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
  }) => void;
  onCancel: () => void;
}

const CarAddForm: React.FC<CarAddFormProps> = ({ onSubmit, onCancel }) => {
  // Current step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  
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
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      basicInfo,
      details,
      documents,
    });
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentStep === 1 && '🟦 STEP 1: Basic Information'}
          {currentStep === 2 && '🟨 STEP 2: Car Details'}
          {currentStep === 3 && '🟥 STEP 3: Required Documents'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {currentStep === 1 && 'Provide basic information about the car'}
          {currentStep === 2 && 'Add details and features of the car'}
          {currentStep === 3 && 'Upload required documentation'}
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
            <div className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Documents</div>
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
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plate Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="plateNumber"
                  value={basicInfo.plateNumber}
                  onChange={(e) => setBasicInfo({ ...basicInfo, plateNumber: e.target.value })}
                  required
                  placeholder="e.g. ABC-1234"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center text-blue-700 dark:text-blue-300 font-medium">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    🚗 Vehicle: {basicInfo.brand} {basicInfo.model} {basicInfo.year} ({basicInfo.plateNumber})
                  </span>
                </div>
              </div>

              {/* Carte Grise */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="carteGrise" className="block text-base font-medium text-gray-900 dark:text-white mb-1">
                      📄 Carte Grise (Vehicle Registration) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Official car ownership paper (required)
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="file"
                          id="carteGrise"
                          onChange={(e) => handleFileChange(e, 'carteGrise')}
                          required
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {documents.carteGrise && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            ✅ {documents.carteGrise.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="carteGriseIssued" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          📅 Issued Date
                        </label>
                        <input
                          type="date"
                          id="carteGriseIssued"
                          value={documents.carteGriseDates.issuedDate}
                          onChange={(e) => handleDocumentDateChange('carteGriseDates', 'issuedDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="insurance" className="block text-base font-medium text-gray-900 dark:text-white mb-1">
                      📄 Assurance Voiture (Insurance) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Valid insurance paper (required)
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="file"
                          id="insurance"
                          onChange={(e) => handleFileChange(e, 'insurance')}
                          required
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {documents.insurance && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            ✅ {documents.insurance.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="insuranceIssued" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          📅 Issued Date
                        </label>
                        <input
                          type="date"
                          id="insuranceIssued"
                          value={documents.insuranceDates.issuedDate}
                          onChange={(e) => handleDocumentDateChange('insuranceDates', 'issuedDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="insuranceExpiry" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ⏳ Expiry Date
                        </label>
                        <input
                          type="date"
                          id="insuranceExpiry"
                          value={documents.insuranceDates.expiryDate}
                          onChange={(e) => handleDocumentDateChange('insuranceDates', 'expiryDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {documents.insuranceDates.expiryDate && (
                        <div className="flex items-center">
                          {getExpiryStatus(documents.insuranceDates.expiryDate).status === 'valid' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              ✅ Valid
                            </span>
                          )}
                          {getExpiryStatus(documents.insuranceDates.expiryDate).status === 'warning' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              ⚠️ {getExpiryStatus(documents.insuranceDates.expiryDate).text}
                            </span>
                          )}
                          {getExpiryStatus(documents.insuranceDates.expiryDate).status === 'expired' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              ❌ Expired
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Inspection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="technicalInspection" className="block text-base font-medium text-gray-900 dark:text-white mb-1">
                      📄 Visite Technique (Inspection Report)
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Proves the car passed technical inspection
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="file"
                          id="technicalInspection"
                          onChange={(e) => handleFileChange(e, 'technicalInspection')}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {documents.technicalInspection && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            ✅ {documents.technicalInspection.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="technicalInspectionIssued" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          📅 Issued Date
                        </label>
                        <input
                          type="date"
                          id="technicalInspectionIssued"
                          value={documents.technicalInspectionDates.issuedDate}
                          onChange={(e) => handleDocumentDateChange('technicalInspectionDates', 'issuedDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="technicalInspectionExpiry" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ⏳ Expiry Date
                        </label>
                        <input
                          type="date"
                          id="technicalInspectionExpiry"
                          value={documents.technicalInspectionDates.expiryDate}
                          onChange={(e) => handleDocumentDateChange('technicalInspectionDates', 'expiryDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {documents.technicalInspectionDates.expiryDate && (
                        <div className="flex items-center">
                          {getExpiryStatus(documents.technicalInspectionDates.expiryDate).status === 'valid' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              ✅ Valid
                            </span>
                          )}
                          {getExpiryStatus(documents.technicalInspectionDates.expiryDate).status === 'warning' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              ⚠️ {getExpiryStatus(documents.technicalInspectionDates.expiryDate).text}
                            </span>
                          )}
                          {getExpiryStatus(documents.technicalInspectionDates.expiryDate).status === 'expired' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              ❌ Expired
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Agreement */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="rentalAgreement" className="block text-base font-medium text-gray-900 dark:text-white mb-1">
                      📄 Contrat de Location (Rental Agreement)
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Optional contract if needed for business
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="file"
                          id="rentalAgreement"
                          onChange={(e) => handleFileChange(e, 'rentalAgreement')}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {documents.rentalAgreement && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            ✅ {documents.rentalAgreement.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="rentalAgreementStart" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          📅 Start Date
                        </label>
                        <input
                          type="date"
                          id="rentalAgreementStart"
                          value={documents.rentalAgreementDates.startDate}
                          onChange={(e) => handleDocumentDateChange('rentalAgreementDates', 'startDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="rentalAgreementEnd" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ⏳ End Date
                        </label>
                        <input
                          type="date"
                          id="rentalAgreementEnd"
                          value={documents.rentalAgreementDates.endDate}
                          onChange={(e) => handleDocumentDateChange('rentalAgreementDates', 'endDate', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Documents */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="otherDocuments" className="block text-base font-medium text-gray-900 dark:text-white mb-1">
                      📄 Other Documents
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Any additional paperwork
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="file"
                          id="otherDocuments"
                          onChange={(e) => handleFileChange(e, 'otherDocuments')}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {documents.otherDocuments && (
                          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            ✅ {documents.otherDocuments.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">📅 Optional</span>
                      </div>
                    </div>
                  </div>
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
              ⬅ Back
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
              Next ➡
            </Button>
          ) : (
            <Button
              type="submit"
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700"
            >
              ✅ Submit Car
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CarAddForm; 