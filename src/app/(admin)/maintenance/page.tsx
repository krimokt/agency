"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import MaintenanceForm, { MaintenanceData } from "@/components/form/MaintenanceForm";
import { useSearchParams } from "next/navigation";

// Types
interface MaintenanceRecord {
  id: string;
  carId: string;
  carName: string;
  carModel: string;
  licensePlate: string;
  serviceDate: string;
  maintenanceType: string;
  description: string;
  cost: number;
  serviceProvider: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  nextMaintenanceDue?: string;
  otherMaintenanceType?: string;
  selectedMaintenanceTypes: string[];
  createdAt: string;
}

interface CarOption {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
}

interface FilterState {
  car: string;
  status: string;
  type: string;
  start: string;
  end: string;
}

// Client component that uses useSearchParams
function MaintenanceWithParams() {
  // Get auth context
  const { localData, addMaintenanceRecord } = useAuth();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: '1',
      carId: '1',
      carName: 'Toyota',
      carModel: 'Camry',
      licensePlate: 'ABC-123',
      serviceDate: '2023-05-15',
      maintenanceType: 'Oil Change',
      description: 'Regular oil change and filter replacement',
      cost: 350,
      serviceProvider: 'Quick Lube Service',
      status: 'Completed',
      nextMaintenanceDue: '2023-08-15',
      selectedMaintenanceTypes: ['Oil Change', 'Filter Replacement'],
      otherMaintenanceType: '',
      createdAt: '2023-05-15T10:30:00Z',
    },
    {
      id: '2',
      carId: '2',
      carName: 'Honda',
      carModel: 'Accord',
      licensePlate: 'XYZ-789',
      serviceDate: '2023-06-20',
      maintenanceType: 'Brake Service',
      description: 'Front brake pad replacement',
      cost: 800,
      serviceProvider: 'Auto Repair Shop',
      status: 'Completed',
      nextMaintenanceDue: '2024-06-20',
      selectedMaintenanceTypes: ['Brake Service'],
      otherMaintenanceType: '',
      createdAt: '2023-06-20T14:45:00Z',
    },
    {
      id: '3',
      carId: '3',
      carName: 'Ford',
      carModel: 'Explorer',
      licensePlate: 'DEF-456',
      serviceDate: '2023-07-05',
      maintenanceType: 'Tire Replacement',
      description: 'Replaced all four tires with all-season tires',
      cost: 2400,
      serviceProvider: 'Tire Center',
      status: 'Scheduled',
      nextMaintenanceDue: '2026-07-05',
      selectedMaintenanceTypes: ['Tire Replacement'],
      otherMaintenanceType: '',
      createdAt: '2023-07-01T09:15:00Z',
    },
    {
      id: '4',
      carId: '1',
      carName: 'Toyota',
      carModel: 'Camry',
      licensePlate: 'ABC-123',
      serviceDate: '2023-08-10',
      maintenanceType: 'Engine Repair',
      description: 'Check engine light diagnosis and repair',
      cost: 1200,
      serviceProvider: 'Dealership Service Center',
      status: 'In Progress',
      nextMaintenanceDue: '2024-02-10',
      selectedMaintenanceTypes: ['Engine Repair'],
      otherMaintenanceType: '',
      createdAt: '2023-08-10T11:00:00Z',
    },
  ]);
  const [cars, setCars] = useState<CarOption[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([]);
  
  // Get car ID from URL if present
  const carIdFromUrl = searchParams.get('carId');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    car: '',
    status: '',
    type: '',
    start: '',
    end: ''
  });

  // Initialize data
  useEffect(() => {
    // Get car ID from URL parameters if available
    if (carIdFromUrl) {
      setSelectedCarId(carIdFromUrl);
      setIsModalOpen(true);
    }
    
    // Load cars from local storage
    if (localData?.cars) {
      const carOptions: CarOption[] = localData.cars.map((car: any) => ({
        id: car.id,
        name: car.name,
        model: car.model,
        licensePlate: car.licensePlate
      }));
      setCars(carOptions);
    }
    
    // Load maintenance records from local storage
    if (localData?.maintenanceRecords && Array.isArray(localData.maintenanceRecords)) {
      // Ensure all required fields are present in each record
      const validRecords = localData.maintenanceRecords.filter((record: any) => {
        return record && record.id && record.carId && record.maintenanceType;
      }).map((record: any) => {
        // Ensure selectedMaintenanceTypes exists, default to array with maintenanceType if missing
        if (!record.selectedMaintenanceTypes) {
          record.selectedMaintenanceTypes = [record.maintenanceType];
        }
        return record;
      });
      
      // Use type assertion to handle the type mismatch
      setMaintenanceRecords(validRecords as MaintenanceRecord[]);
    }
  }, [localData, searchParams, carIdFromUrl]);
  
  // Update filtered records when records or filters change
  useEffect(() => {
    let filtered = [...maintenanceRecords];
    
    // Apply car filter
    if (filters.car) {
      filtered = filtered.filter(record => record.carId === filters.car);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }
    
    // Apply maintenance type filter
    if (filters.type) {
      filtered = filtered.filter(record => record.maintenanceType === filters.type);
    }
    
    // Apply date range filter
    if (filters.start) {
      filtered = filtered.filter(record => record.serviceDate >= filters.start);
    }
    if (filters.end) {
      filtered = filtered.filter(record => record.serviceDate <= filters.end);
    }
    
    setFilteredRecords(filtered);
  }, [maintenanceRecords, filters]);

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCarId('');
  };

  // Handle maintenance form submission
  const handleMaintenanceSubmit = (data: MaintenanceData) => {
    // Find the selected car to get its details
    const selectedCar = cars.find(car => car.id === data.carId);
    
    if (selectedCar) {
      // Create a new maintenance record
      const newRecord = {
        id: Date.now().toString(),
        carId: data.carId,
        carName: selectedCar.name,
        carModel: selectedCar.model,
        licensePlate: selectedCar.licensePlate,
        serviceDate: data.serviceDate,
        maintenanceType: data.maintenanceType,
        description: data.description,
        cost: data.cost,
        serviceProvider: data.serviceProvider,
        status: data.status,
        nextMaintenanceDue: data.nextMaintenanceDue,
        selectedMaintenanceTypes: data.selectedMaintenanceTypes,
        otherMaintenanceType: data.otherMaintenanceType || '',
        createdAt: new Date().toISOString(),
      };

      // Add the new record to the state
      setMaintenanceRecords(prevRecords => [newRecord, ...prevRecords]);
      
      // Add to local storage if function exists
      if (addMaintenanceRecord) {
        addMaintenanceRecord(newRecord);
      }
      
      // Close the modal
      closeModal();
      
      // Show success message
      alert('Maintenance record added successfully!');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      car: '',
      status: '',
      type: '',
      start: '',
      end: ''
    });
  };

  // Calculate days until next maintenance
  const getDaysUntilNextMaintenance = (nextDate?: string): number => {
    if (!nextDate) return 0;
    
    const today = new Date();
    const nextMaintenance = new Date(nextDate);
    const diffTime = nextMaintenance.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case 'Scheduled':
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case 'In Progress':
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  // Get maintenance type icon
  const getMaintenanceTypeIcon = (type: string): string => {
    switch (type) {
      case 'Oil Change':
        return '🛢️';
      case 'Tire Replacement':
        return '🛞';
      case 'Brake Service':
        return '🛑';
      case 'Engine Repair':
        return '🔧';
      case 'Battery':
        return '🔋';
      case 'Suspension':
        return '🔩';
      default:
        return '🔨';
    }
  };

  // Get unique maintenance types from records
  const maintenanceTypes = Array.from(new Set(maintenanceRecords.map(record => record.maintenanceType)));

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Vehicle Maintenance
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Track and manage maintenance records for your fleet
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-medium">{maintenanceRecords.length} Records</span>
          </div>
          <Button 
            variant="default" 
            onClick={openModal}
            className="px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Maintenance Record
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Filter Maintenance Records
          </h3>
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Car Filter */}
              <div>
                <label htmlFor="carFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Car
                </label>
                <select 
                  id="carFilter"
                  value={filters.car}
                  onChange={(e) => setFilters({...filters, car: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cars</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} {car.model} ({car.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select 
                  id="statusFilter"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
              
              {/* Type Filter */}
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Type
                </label>
                <select 
                  id="typeFilter"
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="dateStart" className="sr-only">From</label>
                    <input
                      type="date"
                      id="dateStart"
                      value={filters.start}
                      onChange={(e) => setFilters({...filters, start: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="From"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateEnd" className="sr-only">To</label>
                    <input
                      type="date"
                      id="dateEnd"
                      value={filters.end}
                      onChange={(e) => setFilters({...filters, end: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Records List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Maintenance Records
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredRecords.length} records found
          </p>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.map((record) => {
                  const daysUntilNext = getDaysUntilNextMaintenance(record.nextMaintenanceDue);
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.carName} {record.carModel}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {record.licensePlate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(record.serviceDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">
                            {getMaintenanceTypeIcon(record.maintenanceType)}
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {record.maintenanceType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.cost.toLocaleString()} MAD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(record.status)}`}>
                          {record.status === 'Completed' && '✅'}
                          {record.status === 'Scheduled' && '📅'}
                          {record.status === 'In Progress' && '⏳'}
                          {' '}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.nextMaintenanceDue ? (
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(record.nextMaintenanceDue).toLocaleDateString()}
                            </div>
                            <div className="text-xs">
                              {daysUntilNext < 0 ? (
                                <span className="text-red-600 dark:text-red-400">Overdue by {Math.abs(daysUntilNext)} days</span>
                              ) : daysUntilNext <= 30 ? (
                                <span className="text-amber-600 dark:text-amber-400">In {daysUntilNext} days</span>
                              ) : (
                                <span className="text-green-600 dark:text-green-400">In {daysUntilNext} days</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No maintenance records found</p>
          </div>
        )}
      </div>

      {/* Maintenance Form Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-6xl w-full p-0">
        <div className="rounded-xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-t-xl">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Vehicle Maintenance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedCarId && cars.find(car => car.id === selectedCarId) ? 
                  `${cars.find(car => car.id === selectedCarId)?.name} ${cars.find(car => car.id === selectedCarId)?.model} (${cars.find(car => car.id === selectedCarId)?.licensePlate})` : 
                  "Record maintenance details for your vehicle"}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={closeModal}
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <MaintenanceForm 
              cars={cars} 
              onSubmit={handleMaintenanceSubmit} 
              onCancel={closeModal} 
              initialCarId={selectedCarId}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Main component with Suspense boundary
const MaintenancePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaintenanceWithParams />
    </Suspense>
  );
};

export default MaintenancePage; 