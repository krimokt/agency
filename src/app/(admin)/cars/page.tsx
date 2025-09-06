"use client";

import { useState, useEffect } from "react";
import React from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
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
}

export default function CarsPage() {
  const { localData, addCar, updateCar, addBooking, addClient, updateClient, addPayment } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<CarInfo | null>(null);
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
      setIsDetailsModalOpen(true);
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
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
                    {selectedCar.carte_grise_url ? (
                      <a href={selectedCar.carte_grise_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Not uploaded</span>
                    )}
                 </div>

                  {/* Insurance */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
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
                    {selectedCar.insurance_url ? (
                      <a href={selectedCar.insurance_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Not uploaded</span>
                    )}
                 </div>

                  {/* Technical Inspection */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
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
                    {selectedCar.technical_inspection_url ? (
                      <a href={selectedCar.technical_inspection_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Not uploaded</span>
                    )}
                 </div>

                  {/* Rental Agreement */}
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
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
                    {selectedCar.rental_agreement_url ? (
                      <a href={selectedCar.rental_agreement_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Not uploaded</span>
                    )}
                 </div>
               </div>

                {/* Document Management Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Document Actions</h5>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleDocuments(selectedCar.id)}>
                      Generate QR Code
                   </Button>
                    <Button variant="outline" size="sm">
                      Upload Documents
                 </Button>
                 <Button 
                   variant="outline" 
                      size="sm"
                   onClick={() => {
                        const carteGrise = prompt('Enter Carte Grise URL (or leave empty):');
                        const insurance = prompt('Enter Insurance URL (or leave empty):');
                        const inspection = prompt('Enter Technical Inspection URL (or leave empty):');
                        const rental = prompt('Enter Rental Agreement URL (or leave empty):');
                        const other = prompt('Enter Other Documents URL (or leave empty):');
                        
                        if (carteGrise !== null || insurance !== null || inspection !== null || rental !== null || other !== null) {
                          handleUpdateDocuments(selectedCar.id, {
                            carte_grise_url: carteGrise || '',
                            insurance_url: insurance || '',
                            technical_inspection_url: inspection || '',
                            rental_agreement_url: rental || '',
                            other_documents_url: other || ''
                          });
                        }
                      }}
                    >
                      Add Document URLs
                 </Button>
             </div>
           </div>
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
      </div>
    );
}
