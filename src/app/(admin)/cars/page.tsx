"use client";

import { useState, useEffect } from "react";
import React from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CarAddForm from "@/components/form/CarAddForm";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Pagination from "@/components/tables/Pagination";
import { supabase } from "@/lib/supabase";

// Car data interface matching Supabase add_new_car table
interface CarInfo {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  year: number;
  price_per_day: number;
  category: string;
  status: "Available" | "Booked" | "Maintenance";
  features: string[];
  image_url: string;
  created_at: string;
  updated_at: string;
  // Document URLs
  carte_grise_url?: string | null;
  insurance_url?: string | null;
  technical_inspection_url?: string | null;
  rental_agreement_url?: string | null;
  other_documents_url?: string | null;
  // Document dates
  carte_grise_issue_date?: string | null;
  carte_grise_expiry_date?: string | null;
  insurance_issue_date?: string | null;
  insurance_expiry_date?: string | null;
  technical_inspection_issue_date?: string | null;
  technical_inspection_expiry_date?: string | null;
  rental_agreement_start_date?: string | null;
  rental_agreement_end_date?: string | null;
}

export default function CarsPage() {
  const { localData, addCar, updateCar, addBooking, addClient, updateClient, addPayment } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<CarInfo | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{url: string, documentType: string, carInfo: any, qrCodeDataUrl?: string} | null>(null);
  
  // Document date states
  const [documentDates, setDocumentDates] = useState({
    carte_grise: {
      issue_date: '',
      expiry_date: ''
    },
    insurance: {
      issue_date: '',
      expiry_date: ''
    },
    technical_inspection: {
      issue_date: '',
      expiry_date: ''
    },
    rental_agreement: {
      start_date: '',
      end_date: ''
    }
  });
  const router = useRouter();
  const { t } = useTranslation();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View toggle state - start with default, then hydrate from localStorage
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate view mode from localStorage after component mounts
  useEffect(() => {
    const saved = localStorage.getItem('cars-view-mode');
    if (saved === 'table' || saved === 'cards') {
      setViewMode(saved);
    }
    setIsHydrated(true);
  }, []);

  // Initialize document dates when a car is selected
  useEffect(() => {
    if (selectedCar) {
      setDocumentDates({
        carte_grise: {
          issue_date: selectedCar.carte_grise_issue_date || '',
          expiry_date: selectedCar.carte_grise_expiry_date || ''
        },
        insurance: {
          issue_date: selectedCar.insurance_issue_date || '',
          expiry_date: selectedCar.insurance_expiry_date || ''
        },
        technical_inspection: {
          issue_date: selectedCar.technical_inspection_issue_date || '',
          expiry_date: selectedCar.technical_inspection_expiry_date || ''
        },
        rental_agreement: {
          start_date: selectedCar.rental_agreement_start_date || '',
          end_date: selectedCar.rental_agreement_end_date || ''
        }
      });
    }
  }, [selectedCar]);

  // Update localStorage when view mode changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cars-view-mode', viewMode);
    }
  }, [viewMode, isHydrated]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [carData, setCarData] = useState<CarInfo[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);

  // Fetch cars from Supabase
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('add_new_car')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setCarData(data || []);
      setFilteredCars(data || []);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Real-time updates for document management
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isDetailsModalOpen && selectedCar) {
      // Poll every 3 seconds when document management modal is open
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('add_new_car')
            .select('*')
            .eq('id', selectedCar.id)
            .single();

          if (!error && data) {
            // Update both carData and selectedCar with the latest document URLs
            setCarData(prevCars => 
              prevCars.map(car => 
                car.id === selectedCar.id ? { ...car, ...data } : car
              )
            );
            setSelectedCar({ ...selectedCar, ...data });
          }
        } catch (err) {
          console.error('Error polling car updates:', err);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isDetailsModalOpen, selectedCar]);

  // Also poll when upload modal is open
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isUploadModalOpen && selectedCar) {
      // Poll every 2 seconds when upload modal is open
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('add_new_car')
            .select('*')
            .eq('id', selectedCar.id)
            .single();

          if (!error && data) {
            // Update both carData and selectedCar with the latest document URLs
            setCarData(prevCars => 
              prevCars.map(car => 
                car.id === selectedCar.id ? { ...car, ...data } : car
              )
            );
            setSelectedCar({ ...selectedCar, ...data });
          }
        } catch (err) {
          console.error('Error polling car updates:', err);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isUploadModalOpen, selectedCar]);

  useEffect(() => {
    // Filter cars based on current filters
    let filtered = [...carData];
    
    if (statusFilter) {
      filtered = filtered.filter(car => car.status === statusFilter);
    }
    
    if (brandFilter) {
      filtered = filtered.filter(car => car.brand.toLowerCase().includes(brandFilter.toLowerCase()));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCars(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [carData, statusFilter, brandFilter, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCars = filteredCars.slice(startIndex, endIndex);

  const handleAddCar = async (carData: {
    basicInfo: any;
    details: any;
    documents: any;
    documentUrls: Record<string, string | null>;
  }) => {
    try {
      const { data, error } = await supabase
        .from('add_new_car')
        .insert({
          brand: carData.basicInfo.brand,
          model: carData.basicInfo.model,
          plate_number: carData.basicInfo.plateNumber,
          year: carData.basicInfo.year,
          price_per_day: carData.basicInfo.pricePerDay,
          category: carData.details.category,
          status: carData.details.status,
          features: carData.details.features || [],
          image_url: carData.details.imageUrl || 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=3270&auto=format&fit=crop',
          // Include document URLs
          carte_grise_url: carData.documentUrls.carteGrise,
          insurance_url: carData.documentUrls.insurance,
          technical_inspection_url: carData.documentUrls.technicalInspection,
          rental_agreement_url: carData.documentUrls.rentalAgreement,
          other_documents_url: carData.documentUrls.otherDocuments
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Refresh the cars list
      await fetchCars();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding car:', err);
      alert('Failed to add car. Please try again.');
    }
  };

  const handleBooking = async (carId: string) => {
    try {
    const car = carData.find(c => c.id === carId);
      if (car) {
        // Update car status in Supabase
        const { error } = await supabase
          .from('add_new_car')
          .update({ status: 'Booked' })
          .eq('id', carId);
        
        if (error) {
          throw error;
        }
        
        // Refresh the cars list
        await fetchCars();
      }
    } catch (err) {
      console.error('Error updating car status:', err);
      alert('Failed to update car status. Please try again.');
    }
  };

  const handleMaintenance = async (carId: string) => {
    try {
    const car = carData.find(c => c.id === carId);
      if (car) {
        // Update car status in Supabase
        const { error } = await supabase
          .from('add_new_car')
          .update({ status: 'Maintenance' })
          .eq('id', carId);
        
        if (error) {
          throw error;
        }
        
        // Refresh the cars list
        await fetchCars();
      }
    } catch (err) {
      console.error('Error updating car status:', err);
      alert('Failed to update car status. Please try again.');
    }
  };

  const handleDocuments = (carId: string) => {
    const car = carData.find(c => c.id === carId);
    if (car) {
      setSelectedCar(car);
      setIsUploadModalOpen(true);
    }
  };

  const handleDocumentClick = (documentType: string) => {
    if (!selectedCar) return;
    
    setSelectedDocumentType(documentType);
    
    // Check if document exists - if yes, open it, if no, show upload modal
    const documentUrl = selectedCar[`${documentType}_url` as keyof CarInfo] as string;
    if (documentUrl) {
      // Open document in new tab
      window.open(documentUrl, '_blank');
    } else {
      // Show upload modal
      setIsUploadModalOpen(true);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCar) return;

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('carId', selectedCar.id);
      formData.append('documentType', documentType);

      // Upload file
      const response = await fetch('/api/cars/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh cars data
        await fetchCars();
        
        // Show success message
        const docName = documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        alert(`${docName} uploaded successfully! Document replaced.`);
        
        // Keep modal open so user can continue managing documents
        // Refresh the selected car data
        const updatedCar = carData.find(car => car.id === selectedCar?.id);
        if (updatedCar) {
          setSelectedCar(updatedCar);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleDateChange = (documentType: string, dateField: string, value: string) => {
    setDocumentDates(prev => ({
      ...prev,
      [documentType]: {
        ...prev[documentType as keyof typeof prev],
        [dateField]: value
      }
    }));
  };

  const handleSaveDocumentDates = async () => {
    if (!selectedCar) return;

    try {
      const response = await fetch('/api/cars/update-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: selectedCar.id,
          documents: {
            carte_grise_issue_date: documentDates.carte_grise.issue_date,
            carte_grise_expiry_date: documentDates.carte_grise.expiry_date,
            insurance_issue_date: documentDates.insurance.issue_date,
            insurance_expiry_date: documentDates.insurance.expiry_date,
            technical_inspection_issue_date: documentDates.technical_inspection.issue_date,
            technical_inspection_expiry_date: documentDates.technical_inspection.expiry_date,
            rental_agreement_start_date: documentDates.rental_agreement.start_date,
            rental_agreement_end_date: documentDates.rental_agreement.end_date,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document dates');
      }

      const result = await response.json();
      if (result.success) {
        await fetchCars();
        alert('Document dates saved successfully!');
      } else {
        throw new Error(result.error || 'Failed to save document dates');
      }
    } catch (error) {
      console.error('Error saving document dates:', error);
      alert('Failed to save document dates. Please try again.');
    }
  };

  const handleUpdateDocuments = async (carId: string, documents: Record<string, string>) => {
    try {
      const response = await fetch('/api/cars/update-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          documents
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update documents');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the cars list to show updated documents
        await fetchCars();
        alert('Documents updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update documents');
      }
    } catch (error) {
      console.error('Error updating documents:', error);
      alert('Failed to update documents. Please try again.');
    }
  };

  const handleGenerateQRForReupload = async (carId: string, documentType: string) => {
    try {
      const response = await fetch('/api/qr/generate-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          documentType,
          action: 'reupload'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Use the uploadUrl directly from the API response
        const uploadUrl = result.uploadUrl;
        
        // Find the car info for display
        const carInfo = carData.find(car => car.id === carId);
        
        // Set QR code data and open modal
        setQrCodeData({
          url: uploadUrl,
          documentType,
          carInfo,
          qrCodeDataUrl: result.qrCodeDataUrl
        });
        setIsQRModalOpen(true);
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR for reupload:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const handleDeleteCar = (car: CarInfo) => {
    setCarToDelete(car);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCar = async () => {
    if (!carToDelete) return;
    
    try {
      const response = await fetch(`/api/cars/delete?id=${carToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Car deleted successfully');
        fetchCars(); // Refresh the cars list
        setIsDeleteModalOpen(false);
        setCarToDelete(null);
      } else {
        alert(data.error || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Failed to delete car');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Available":
        return {
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
          dot: "bg-emerald-500"
        };
      case "Booked":
        return {
          badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          dot: "bg-blue-500"
        };
      case "Maintenance":
        return {
          badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
          dot: "bg-amber-500"
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
          dot: "bg-gray-500"
        };
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cars Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your car fleet with comprehensive information and document handling
          </p>
        </div>
        <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isHydrated && viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
            </svg>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isHydrated && viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
          </div>
          <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
              Add New Car
          </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cars...</p>
            </div>
          </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error Loading Cars</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
                          <Button
                onClick={fetchCars}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !error && carData.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No cars found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started by adding your first car to the fleet.
          </p>
               <Button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add New Car
               </Button>
          </div>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!loading && !error && carData.length > 0 && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                     </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cars</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{carData.length}</p>
                         </div>
                         </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {carData.filter(car => car.status === 'Available').length}
            </p>
          </div>
                   </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Booked</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {carData.filter(car => car.status === 'Booked').length}
            </p>
          </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {carData.filter(car => car.status === 'Maintenance').length}
            </p>
          </div>
                       </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Cars
                           </label>
                           <input
                             type="text"
              placeholder="Search by name, model, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
              <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
                </label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              
              <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand
                </label>
                <select 
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              <option value="">All Brands</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Tesla">Tesla</option>
              <option value="BMW">BMW</option>
              <option value="Ford">Ford</option>
                  <option value="Dacia">Dacia</option>
                </select>
              </div>
              
          <div className="flex items-end">
                          <Button
                            variant="outline"
                     onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setBrandFilter('');
              }}
              className="w-full"
            >
              Clear Filters
                            </Button>
                        </div>
            </div>
          </div>
          
      {/* Cars Display - Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Car
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Plate Number
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Year
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Price/Day
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentCars.map((car) => {
                  const statusConfig = getStatusConfig(car.status);
                  return (
                    <TableRow key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 overflow-hidden rounded-lg">
                            <Image
                              width={64}
                              height={48}
                              src={car.image_url}
                              alt={`${car.brand} ${car.model}`}
                         className="w-full h-full object-cover"
                       />
                     </div>
                         <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {car.brand} {car.model}
                         </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {car.features?.slice(0, 2).join(', ')}
                              {car.features && car.features.length > 2 && '...'}
                         </div>
                         </div>
                         </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-900 dark:text-white">
                          {car.plate_number}
                         </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white">
                          {car.year}
                         </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <Badge
                          size="sm"
                          color="primary"
                        >
                          {car.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                          statusConfig.badge
                        )}>
                          <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)}></div>
                          {car.status}
                         </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {car.price_per_day} MAD
                         </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBooking(car.id)}
                            disabled={car.status === 'Booked' || car.status === 'Maintenance'}
                            className="text-xs"
                          >
                            Book
                          </Button>
                   <Button 
                            size="sm"
                     variant="outline" 
                            onClick={() => handleMaintenance(car.id)}
                            disabled={car.status === 'Maintenance'}
                            className="text-xs"
                          >
                            Maintenance
                   </Button>
                   <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocuments(car.id)}
                            className="text-xs"
                          >
                            Documents
                   </Button>
                   <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCar(car)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            Delete
                   </Button>
                 </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
                   </div>
                   
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCars.length)} of {filteredCars.length} cars
                       </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                     </div>
                       </div>
          )}
                     </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentCars.map((car) => {
            const statusConfig = getStatusConfig(car.status);
            return (
              <div key={car.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Car Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    width={300}
                    height={200}
                    src={car.image_url}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                      statusConfig.badge
                    )}>
                      <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)}></div>
                      {car.status}
                         </div>
                           </div>
                           </div>
                
                {/* Car Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {car.brand} {car.model}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Plate:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{car.plate_number}</span>
                           </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Year:</span>
                      <span className="text-gray-900 dark:text-white">{car.year}</span>
                           </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <Badge size="sm" color="primary">{car.category}</Badge>
                         </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Price/Day:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.price_per_day} MAD</span>
                     </div>
                   </div>
                   
                  {/* Features */}
                  {car.features && car.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {car.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                        {car.features.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{car.features.length - 3} more</span>
                        )}
                     </div>
                   </div>
                  )}
                   
                  {/* Actions */}
                  <div className="flex gap-2">
                     <Button 
                      size="sm"
                       variant="outline" 
                      onClick={() => handleBooking(car.id)}
                      disabled={car.status === 'Booked' || car.status === 'Maintenance'}
                      className="flex-1 text-xs"
                     >
                      Book
                     </Button>
                     <Button 
                      size="sm"
                       variant="outline" 
                      onClick={() => handleMaintenance(car.id)}
                      disabled={car.status === 'Maintenance'}
                      className="flex-1 text-xs"
                     >
                      Service
                     </Button>
                     <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleDocuments(car.id)}
                      className="flex-1 text-xs"
                    >
                      Docs
                     </Button>
                     <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCar(car)}
                      className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Delete
                     </Button>
                   </div>
                 </div>
              </div>
            );
          })}
               </div>
             )}
      
      {/* Pagination for Cards View */}
      {viewMode === 'cards' && totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
         </div>
       )}
       
        </>
      )}

      {/* Add Car Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Add New Car
          </h2>
          <CarAddForm
            onSubmit={handleAddCar}
            onCancel={() => setIsModalOpen(false)}
          />
               </div>
      </Modal>

      {/* Car Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        <div className="p-6 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Car Details - {selectedCar?.brand} {selectedCar?.model}
          </h2>
          
          {selectedCar && (
            <div className="space-y-6">
              {/* Car Image and Basic Info */}
              <div className="flex gap-6">
                <div className="w-64 h-48 overflow-hidden rounded-lg">
                  <Image
                    width={256}
                    height={192}
                    src={selectedCar.image_url}
                    alt={`${selectedCar.brand} ${selectedCar.model}`}
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedCar.brand} {selectedCar.model}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                       <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Plate Number</label>
                      <p className="text-gray-900 dark:text-white font-mono">{selectedCar.plate_number}</p>
                       </div>
                       <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</label>
                      <p className="text-gray-900 dark:text-white">{selectedCar.year}</p>
                       </div>
                       <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                      <p className="text-gray-900 dark:text-white">{selectedCar.category}</p>
                       </div>
                       <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Price/Day</label>
                      <p className="text-gray-900 dark:text-white">{selectedCar.price_per_day} MAD</p>
                     </div>
                   </div>
                 </div>
               </div>

              {/* Features */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCar.features?.map((feature, index) => (
                    <Badge key={index} size="sm" color="primary">
                      {feature}
                    </Badge>
                     ))}
                   </div>
                 </div>

              {/* Document Management */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Document Management</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Car documents and registration files
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Carte Grise */}
                  <div 
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleDocumentClick('carte_grise')}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Carte Grise</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle Registration</p>
                      </div>
                    </div>
                    
                    {/* Document Status and Dates */}
                    <div className="space-y-2">
                      {selectedCar.carte_grise_url ? (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Click to view document
                          </span>
                          <Badge color="success" size="sm">Uploaded</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Click to upload document
                          </span>
                          <Badge color="error" size="sm">Missing</Badge>
                        </div>
                      )}
                      
                      {/* Issue Date */}
                      {selectedCar.carte_grise_issue_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Issued:</span> {new Date(selectedCar.carte_grise_issue_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Expiry Date */}
                      {selectedCar.carte_grise_expiry_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Expires:</span> {new Date(selectedCar.carte_grise_expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div 
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleDocumentClick('insurance')}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Insurance</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Policy</p>
                      </div>
                    </div>
                    
                    {/* Document Status and Dates */}
                    <div className="space-y-2">
                      {selectedCar.insurance_url ? (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Click to view document
                          </span>
                          <Badge color="success" size="sm">Uploaded</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Click to upload document
                          </span>
                          <Badge color="error" size="sm">Missing</Badge>
                        </div>
                      )}
                      
                      {/* Issue Date */}
                      {selectedCar.insurance_issue_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Issued:</span> {new Date(selectedCar.insurance_issue_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Expiry Date */}
                      {selectedCar.insurance_expiry_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Expires:</span> {new Date(selectedCar.insurance_expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technical Inspection */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Technical Inspection</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Inspection Report</p>
                      </div>
                    </div>
                    
                    {/* Document Status and Dates */}
                    <div className="space-y-2">
                      {selectedCar.technical_inspection_url ? (
                        <div className="flex items-center justify-between">
                          <a href={selectedCar.technical_inspection_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            View Document
                          </a>
                          <Badge color="success" size="sm">Uploaded</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Not uploaded</span>
                          <Badge color="error" size="sm">Missing</Badge>
                        </div>
                      )}
                      
                      {/* Issue Date */}
                      {selectedCar.technical_inspection_issue_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Issued:</span> {new Date(selectedCar.technical_inspection_issue_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Expiry Date */}
                      {selectedCar.technical_inspection_expiry_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Expires:</span> {new Date(selectedCar.technical_inspection_expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rental Agreement */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Rental Agreement</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rental Contract</p>
                      </div>
                    </div>
                    
                    {/* Document Status and Dates */}
                    <div className="space-y-2">
                      {selectedCar.rental_agreement_url ? (
                        <div className="flex items-center justify-between">
                          <a href={selectedCar.rental_agreement_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            View Document
                          </a>
                          <Badge color="success" size="sm">Uploaded</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Not uploaded</span>
                          <Badge color="error" size="sm">Missing</Badge>
                        </div>
                      )}
                      
                      {/* Start Date */}
                      {selectedCar.rental_agreement_start_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Start:</span> {new Date(selectedCar.rental_agreement_start_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* End Date */}
                      {selectedCar.rental_agreement_end_date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">End:</span> {new Date(selectedCar.rental_agreement_end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Management Actions */}
           </div>
         </div>
       )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-6 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Delete Car
          </h2>
          
          {carToDelete && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 overflow-hidden rounded-lg">
                  <Image
                    width={64}
                    height={48}
                    src={carToDelete.image_url}
                    alt={`${carToDelete.brand} ${carToDelete.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {carToDelete.brand} {carToDelete.model}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {carToDelete.plate_number} • {carToDelete.year}
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-red-600 dark:text-red-400 mr-2">⚠️</div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Warning:</strong> This action cannot be undone. All car data, documents, and related records will be permanently deleted.
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteCar}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Car
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

        {/* New Enhanced Document Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} showCloseButton={false} maxHeight="90vh" className="max-w-2xl">
          <div className="max-w-8xl w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Document Management</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upload and manage vehicle documents</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          
            {/* Content */}
            <div className="p-6">
              {selectedCar && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img 
                          src={selectedCar.image_url} 
                          alt={`${selectedCar.brand} ${selectedCar.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{selectedCar.brand} {selectedCar.model}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCar.plate_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status: </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCar.status}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Documents List */}
                <div className="space-y-4">
                  {[
                    { 
                      name: 'Carte Grise', 
                      key: 'carte_grise',
                      urlKey: 'carte_grise_url',
                      issueDate: 'carte_grise_issue_date',
                      expiryDate: 'carte_grise_expiry_date'
                    },
                    { 
                      name: 'Insurance', 
                      key: 'insurance',
                      urlKey: 'insurance_url',
                      issueDate: 'insurance_issue_date',
                      expiryDate: 'insurance_expiry_date'
                    },
                    { 
                      name: 'Technical Inspection', 
                      key: 'technical_inspection',
                      urlKey: 'technical_inspection_url',
                      issueDate: 'technical_inspection_issue_date',
                      expiryDate: 'technical_inspection_expiry_date'
                    },
                    { 
                      name: 'Rental Agreement', 
                      key: 'rental_agreement',
                      urlKey: 'rental_agreement_url',
                      issueDate: 'rental_agreement_start_date',
                      expiryDate: 'rental_agreement_end_date'
                    },
                    { 
                      name: 'Other Documents', 
                      key: 'other_documents',
                      urlKey: 'other_documents_url',
                      issueDate: null,
                      expiryDate: null
                    }
                  ].map((doc) => (
                    <div key={doc.key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{doc.name}</h3>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const hasDocument = !!selectedCar?.[doc.urlKey as keyof CarInfo];
                            if (!hasDocument) {
                              return (
                                <>
                                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Not uploaded</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => selectedCar && handleGenerateQRForReupload(selectedCar.id, doc.key)}
                                    className="ml-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    QR Upload
                                  </Button>
                                </>
                              );
                            }

                            // Check if document is expired
                            const expiryDateKey = doc.expiryDate as keyof CarInfo;
                            const expiryDate = expiryDateKey ? selectedCar?.[expiryDateKey] as string : null;
                            const isExpired = expiryDate && new Date(expiryDate) < new Date();
                            
                            if (isExpired) {
                              return (
                                <>
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">Expired</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const url = selectedCar[doc.urlKey as keyof CarInfo] as string;
                                      if (url) window.open(url, '_blank');
                                    }}
                                    className="ml-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => selectedCar && handleGenerateQRForReupload(selectedCar.id, doc.key)}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    Re-upload
                                  </Button>
                                </>
                              );
                            }

                            // Check if document expires soon (within 30 days)
                            const daysUntilExpiry = expiryDate ? Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                            const expiresSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                            
                            if (expiresSoon) {
                              return (
                                <>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Expires in {daysUntilExpiry} days</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const url = selectedCar[doc.urlKey as keyof CarInfo] as string;
                                      if (url) window.open(url, '_blank');
                                    }}
                                    className="ml-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => selectedCar && handleGenerateQRForReupload(selectedCar.id, doc.key)}
                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                  >
                                    Update
                                  </Button>
                                </>
                              );
                            }

                            // Document is valid
                            return (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600 dark:text-green-400">Valid</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const url = selectedCar[doc.urlKey as keyof CarInfo] as string;
                                    if (url) window.open(url, '_blank');
                                  }}
                                  className="ml-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => selectedCar && handleGenerateQRForReupload(selectedCar.id, doc.key)}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  QR Replace
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className={`grid gap-4 ${doc.key === 'other_documents' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {selectedCar?.[doc.urlKey as keyof CarInfo] ? 'Replace File' : 'Upload File'}
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, doc.key)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {selectedCar?.[doc.urlKey as keyof CarInfo] && (
                            <p className="text-xs text-gray-500 mt-1">
                              Current document will be replaced with the new file
                            </p>
                          )}
                        </div>
                        
                        {doc.key !== 'other_documents' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                {doc.key === 'rental_agreement' ? 'Start Date' : 'Issue Date'}
                              </label>
                              <input
                                type="date"
                                value={
                                  doc.key === 'rental_agreement' 
                                    ? (documentDates.rental_agreement?.start_date || selectedCar?.[doc.issueDate as keyof CarInfo] as string || '')
                                    : ((documentDates as any)[doc.key]?.issue_date || selectedCar?.[doc.issueDate as keyof CarInfo] as string || '')
                                }
                                onChange={(e) => handleDateChange(doc.key, doc.key === 'rental_agreement' ? 'start_date' : 'issue_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                {doc.key === 'rental_agreement' ? 'End Date' : 'Expiry Date'}
                              </label>
                              <input
                                type="date"
                                value={
                                  doc.key === 'rental_agreement' 
                                    ? (documentDates.rental_agreement?.end_date || selectedCar?.[doc.expiryDate as keyof CarInfo] as string || '')
                                    : ((documentDates as any)[doc.key]?.expiry_date || selectedCar?.[doc.expiryDate as keyof CarInfo] as string || '')
                                }
                                onChange={(e) => handleDateChange(doc.key, doc.key === 'rental_agreement' ? 'end_date' : 'expiry_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Expiry Status Alert */}
                      {doc.expiryDate && selectedCar?.[doc.urlKey as keyof CarInfo] && (() => {
                        const expiryDate = selectedCar[doc.expiryDate as keyof CarInfo] as string;
                        if (!expiryDate) return null;
                        
                        const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (daysUntilExpiry < 0) {
                          return (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <div className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Document Expired</h4>
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    This document expired {Math.abs(daysUntilExpiry)} days ago. Please upload a new version immediately.
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => selectedCar && handleGenerateQRForReupload(selectedCar.id, doc.key)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                                >
                                  Re-upload Now
                                </Button>
                              </div>
                            </div>
                          );
                        } else if (daysUntilExpiry <= 30) {
                          return (
                            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <div className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5">⚠️</div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">Expires Soon</h4>
                                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                    This document expires in {daysUntilExpiry} days. Consider updating it soon.
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => selectedCar && handleGenerateQRForReupload(selectedCar.id, doc.key)}
                                  className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs px-3 py-1"
                                >
                                  Update
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCar && [selectedCar.carte_grise_url, selectedCar.insurance_url, selectedCar.technical_inspection_url, selectedCar.rental_agreement_url, selectedCar.other_documents_url].filter(Boolean).length} of 5 documents uploaded
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveDocumentDates}
                      variant="primary"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} className="max-w-md">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            QR Code for Document Upload
          </h2>
          
          {qrCodeData && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img 
                      src={qrCodeData.carInfo?.image_url} 
                      alt={`${qrCodeData.carInfo?.brand} ${qrCodeData.carInfo?.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {qrCodeData.carInfo?.brand} {qrCodeData.carInfo?.model}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {qrCodeData.carInfo?.plate_number}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Document: {qrCodeData.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 inline-block">
                <div className="w-60 h-60 flex items-center justify-center bg-white">
                  {qrCodeData.qrCodeDataUrl ? (
                    <img
                      src={qrCodeData.qrCodeDataUrl}
                      alt="QR Code"
                      width="240"
                      height="240"
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-500">
                      Loading QR Code...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your phone to upload or replace the document
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeData.url).then(() => {
                        alert('Upload URL copied to clipboard!');
                      });
                    }}
                    className="flex-1 text-xs"
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(qrCodeData.url, '_blank')}
                    className="flex-1 text-xs"
                  >
                    Open Link
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  📱 <strong>Instructions:</strong> Open your phone's camera app and point it at the QR code. 
                  Tap the notification that appears to open the upload page.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsQRModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}