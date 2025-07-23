import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';

// Define interfaces
export interface MaintenanceData {
  carId: string;
  serviceDate: string;
  maintenanceType: string;
  description: string;
  cost: number;
  serviceProvider: string;
  receipt: File | null;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  nextMaintenanceDue?: string;
  otherMaintenanceType?: string;
  selectedMaintenanceTypes: string[];
}

interface CarOption {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
}

interface MaintenanceFormProps {
  cars: CarOption[];
  onSubmit: (data: MaintenanceData) => void;
  onCancel: () => void;
  initialCarId?: string;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ cars, onSubmit, onCancel, initialCarId }) => {
  // Form state
  const [formData, setFormData] = useState<MaintenanceData>({
    carId: initialCarId || '',
    serviceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'Oil Change',
    description: '',
    cost: 0,
    serviceProvider: '',
    receipt: null,
    status: 'Completed',
    nextMaintenanceDue: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    otherMaintenanceType: '',
    selectedMaintenanceTypes: ['Oil Change'],
  });

  // Update carId when initialCarId changes
  useEffect(() => {
    if (initialCarId) {
      setFormData(prevData => ({
        ...prevData,
        carId: initialCarId
      }));
    }
  }, [initialCarId]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        receipt: e.target.files[0],
      });
    }
  };

  // Handle maintenance type checkbox change
  const handleMaintenanceTypeCheckbox = (type: string) => {
    const updatedTypes = formData.selectedMaintenanceTypes.includes(type)
      ? formData.selectedMaintenanceTypes.filter(t => t !== type)
      : [...formData.selectedMaintenanceTypes, type];
    
    // Always update the primary maintenance type to the first selected type or empty if none selected
    const primaryType = updatedTypes.length > 0 ? updatedTypes[0] : '';
    
    // Calculate next maintenance due date based on the primary type
    const nextDue = updatedTypes.length > 0 
      ? calculateNextMaintenanceDue(primaryType, formData.serviceDate)
      : formData.nextMaintenanceDue;
    
    setFormData({
      ...formData,
      selectedMaintenanceTypes: updatedTypes,
      maintenanceType: primaryType,
      nextMaintenanceDue: nextDue,
    });
  };

  // Calculate next maintenance due date based on maintenance type
  const calculateNextMaintenanceDue = (maintenanceType: string, currentDate: string) => {
    const date = new Date(currentDate);
    
    switch (maintenanceType) {
      case 'Oil Change':
        // Oil change typically every 3 months or 5,000 km
        date.setMonth(date.getMonth() + 3);
        break;
      case 'Tire Replacement':
        // Tire replacement typically every 3-5 years
        date.setFullYear(date.getFullYear() + 3);
        break;
      case 'Brake Service':
        // Brake service typically every 1 year
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'Engine Repair':
        // Engine check typically every 6 months after repair
        date.setMonth(date.getMonth() + 6);
        break;
      case 'Battery Replacement':
        // Battery check typically every 2 years
        date.setFullYear(date.getFullYear() + 2);
        break;
      case 'Suspension Repair':
        // Suspension check typically every 1 year
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'Fluid Check/Refill':
        // Fluid check typically every 3 months
        date.setMonth(date.getMonth() + 3);
        break;
      case 'Filter Replacement':
        // Filter replacement typically every 6 months
        date.setMonth(date.getMonth() + 6);
        break;
      case 'Wheel Alignment':
        // Wheel alignment typically every 1 year
        date.setFullYear(date.getFullYear() + 1);
        break;
      // Body & Paint repairs typically don't have scheduled follow-ups
      default:
        // Default to 6 months
        date.setMonth(date.getMonth() + 6);
    }
    
    return date.toISOString().split('T')[0];
  };

  // Handle service date change to update next maintenance due date
  const handleServiceDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newServiceDate = e.target.value;
    const nextDue = formData.maintenanceType 
      ? calculateNextMaintenanceDue(formData.maintenanceType, newServiceDate)
      : newServiceDate;
    
    setFormData({
      ...formData,
      serviceDate: newServiceDate,
      nextMaintenanceDue: nextDue,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine selected maintenance types with "Other" if specified
    const maintenanceTypes = [...formData.selectedMaintenanceTypes];
    if (formData.otherMaintenanceType) {
      maintenanceTypes.push(`Other: ${formData.otherMaintenanceType}`);
    }
    
    // Create a description that includes all selected maintenance types
    let enhancedDescription = formData.description;
    if (maintenanceTypes.length > 0) {
      enhancedDescription = `Maintenance performed: ${maintenanceTypes.join(', ')}\n\n${formData.description}`;
    }
    
    onSubmit({
      ...formData,
      description: enhancedDescription,
    });
  };

  // Maintenance types grouped by category
  const maintenanceTypes = {
    mechanical: [
      'Oil Change',
      'Tire Replacement',
      'Brake Service',
      'Engine Repair',
      'Battery Replacement',
      'Suspension Repair',
      'Fluid Check/Refill',
      'Filter Replacement',
      'Wheel Alignment',
    ],
    bodyPaint: [
      'Paint Repair',
      'Dent Removal',
      'Scratch Repair',
      'Bumper Repair',
      'Body Panel Replacement',
      'Rust Treatment',
    ],
  };

  // Status options
  const statusOptions = [
    'Completed',
    'Scheduled',
    'In Progress'
  ];

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {/* Car Selection */}
          <div>
            <label htmlFor="carId" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">🚗</span>
              Select Car <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="carId"
              name="carId"
              value={formData.carId}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a car --</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} {car.model} ({car.licensePlate})
                </option>
              ))}
            </select>
          </div>

          {/* Service Date */}
          <div>
            <label htmlFor="serviceDate" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">🗓</span>
              Date of Service <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              id="serviceDate"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleServiceDateChange}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Maintenance Type Checklist */}
          <div>
            <label className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">🔧</span>
              Maintenance Type <span className="text-red-500 ml-1">*</span>
            </label>
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {/* Mechanical Maintenance Section */}
              <div className="border-b border-gray-300 dark:border-gray-600">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Mechanical Maintenance</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {maintenanceTypes.mechanical.map((type) => (
                    <label 
                      key={type} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.selectedMaintenanceTypes.includes(type) 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 text-amber-700 dark:text-amber-400' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedMaintenanceTypes.includes(type)}
                        onChange={() => handleMaintenanceTypeCheckbox(type)}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${
                        formData.selectedMaintenanceTypes.includes(type)
                          ? 'bg-amber-500 border-amber-500 dark:bg-amber-600 dark:border-amber-600 flex items-center justify-center'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.selectedMaintenanceTypes.includes(type) && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Body & Paint Repairs Section */}
              <div className="border-b border-gray-300 dark:border-gray-600">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Body & Paint Repairs</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {maintenanceTypes.bodyPaint.map((type) => (
                    <label 
                      key={type} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.selectedMaintenanceTypes.includes(type) 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 text-amber-700 dark:text-amber-400' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedMaintenanceTypes.includes(type)}
                        onChange={() => handleMaintenanceTypeCheckbox(type)}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${
                        formData.selectedMaintenanceTypes.includes(type)
                          ? 'bg-amber-500 border-amber-500 dark:bg-amber-600 dark:border-amber-600 flex items-center justify-center'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.selectedMaintenanceTypes.includes(type) && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Other Maintenance Section */}
              <div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Other Maintenance</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center">
                    <label 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all mr-3 ${
                        formData.selectedMaintenanceTypes.includes('Other') 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 text-amber-700 dark:text-amber-400' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedMaintenanceTypes.includes('Other')}
                        onChange={() => handleMaintenanceTypeCheckbox('Other')}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${
                        formData.selectedMaintenanceTypes.includes('Other')
                          ? 'bg-amber-500 border-amber-500 dark:bg-amber-600 dark:border-amber-600 flex items-center justify-center'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.selectedMaintenanceTypes.includes('Other') && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      Other
                    </label>
                    
                    <input
                      type="text"
                      id="otherMaintenanceType"
                      name="otherMaintenanceType"
                      value={formData.otherMaintenanceType}
                      onChange={handleInputChange}
                      placeholder="Specify other maintenance type..."
                      className={`flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !formData.selectedMaintenanceTypes.includes('Other') ? 'opacity-50' : ''
                      }`}
                      disabled={!formData.selectedMaintenanceTypes.includes('Other')}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {formData.selectedMaintenanceTypes.length === 0 && (
              <p className="mt-2 text-sm text-red-500">Please select at least one maintenance type</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">📊</span>
              Status <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {statusOptions.map((status) => (
                <label 
                  key={status} 
                  className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.status === status 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 text-amber-700 dark:text-amber-400' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="mr-2">
                    {status === 'Completed' && '✅'}
                    {status === 'Scheduled' && '📅'}
                    {status === 'In Progress' && '⏳'}
                  </span>
                  {status}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">📝</span>
              Description <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Provide details about the maintenance performed..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cost */}
          <div>
            <label htmlFor="cost" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">💰</span>
              Cost (MAD) <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">MAD</span>
              </div>
            </div>
          </div>

          {/* Service Provider */}
          <div>
            <label htmlFor="serviceProvider" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">🏪</span>
              Service Provider
            </label>
            <input
              type="text"
              id="serviceProvider"
              name="serviceProvider"
              value={formData.serviceProvider}
              onChange={handleInputChange}
              placeholder="Name of garage or mechanic (optional)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Next Maintenance Due */}
          <div>
            <label htmlFor="nextMaintenanceDue" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">⏰</span>
              Next Maintenance Due
            </label>
            <div className="flex items-center">
              <input
                type="date"
                id="nextMaintenanceDue"
                name="nextMaintenanceDue"
                value={formData.nextMaintenanceDue}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Auto-calculated
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Suggested date based on maintenance type (can be modified)
            </p>
          </div>

          {/* Receipt Upload */}
          <div>
            <label htmlFor="receipt" className="flex items-center text-base font-medium text-gray-900 dark:text-white mb-2">
              <span className="mr-2">📄</span>
              Upload Receipt
            </label>
            <input
              type="file"
              id="receipt"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.receipt && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✅ {formData.receipt.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload invoice or receipt (optional)
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white"
            disabled={formData.selectedMaintenanceTypes.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Save Maintenance Record
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm; 