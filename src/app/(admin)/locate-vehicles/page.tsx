"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge/Badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface CarLocation {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  year: number;
  status: string;
  category: string;
  image_url: string;
  features: string[];
  price_per_day: number;
  // Location data
  current_location?: string;
  last_seen?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  // Document status
  carte_grise_url?: string;
  insurance_url?: string;
  technical_inspection_url?: string;
  carte_grise_expiry_date?: string;
  insurance_expiry_date?: string;
  technical_inspection_expiry_date?: string;
}

// Component that uses useSearchParams
function LocateVehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<CarLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedCar, setSelectedCar] = useState<CarLocation | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
      
      // Add mock location data for demonstration
      const carsWithLocation = (data || []).map(car => ({
        ...car,
        current_location: getRandomLocation(),
        last_seen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        gps_coordinates: getRandomCoordinates()
      }));
      
      setCars(carsWithLocation);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Handle car parameter from URL
  useEffect(() => {
    const carId = searchParams.get('car');
    if (carId && cars.length > 0) {
      const car = cars.find(c => c.id === carId);
      if (car) {
        setSelectedCar(car);
        setIsMapModalOpen(true);
      }
    }
  }, [searchParams, cars]);

  // Mock location data for demonstration
  const getRandomLocation = () => {
    const locations = [
      'Downtown Office - Parking Lot A',
      'Airport Terminal - Level 2',
      'Shopping Mall - North Entrance',
      'Hotel District - Street Parking',
      'Business Center - Garage B',
      'Residential Area - Block 3',
      'City Center - Public Parking',
      'Suburb Station - Platform 1'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getRandomCoordinates = () => {
    return {
      latitude: 33.5731 + (Math.random() - 0.5) * 0.1, // Casablanca area
      longitude: -7.5898 + (Math.random() - 0.5) * 0.1
    };
  };

  // Filter cars based on search and status
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.current_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || car.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getDocumentStatus = (car: CarLocation) => {
    const now = new Date();
    const issues = [];
    
    if (car.insurance_expiry_date) {
      const expiry = new Date(car.insurance_expiry_date);
      if (expiry < now) issues.push('Insurance Expired');
      else if (expiry.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
        issues.push('Insurance Expiring Soon');
      }
    }
    
    if (car.technical_inspection_expiry_date) {
      const expiry = new Date(car.technical_inspection_expiry_date);
      if (expiry < now) issues.push('Inspection Expired');
      else if (expiry.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
        issues.push('Inspection Expiring Soon');
      }
    }
    
    return issues;
  };

  const handleLocateCar = (car: CarLocation) => {
    setSelectedCar(car);
    setIsMapModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error Loading Vehicles</h3>
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
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vehicle Location Tracking</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and locate your fleet vehicles in real-time
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <Button
              onClick={fetchCars}
              variant="outline"
            >
              Refresh Locations
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{cars.length}</p>
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
                {cars.filter(car => car.status === 'Available').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Use</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {cars.filter(car => car.status === 'Booked').length}
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
                {cars.filter(car => car.status === 'Maintenance').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Vehicles
            </label>
            <input
              type="text"
              placeholder="Search by brand, model, plate, or location..."
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
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCars.map((car) => {
                  const statusConfig = getStatusConfig(car.status);
                  const documentIssues = getDocumentStatus(car);
                  
                  return (
                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
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
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {car.plate_number}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {car.year} • {car.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                          statusConfig.badge
                        )}>
                          <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)}></div>
                          {car.status}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {car.current_location}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {car.last_seen ? new Date(car.last_seen).toLocaleString() : 'Unknown'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {documentIssues.length > 0 ? (
                            documentIssues.map((issue, index) => (
                              <Badge key={index} color="error" size="sm">
                                {issue}
                              </Badge>
                            ))
                          ) : (
                            <Badge color="success" size="sm">
                              All Valid
                            </Badge>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLocateCar(car)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Locate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Map View Placeholder */
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Map View</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Interactive map view coming soon. Currently showing list view.
            </p>
            <Button
              onClick={() => setViewMode('list')}
              variant="outline"
            >
              Switch to List View
            </Button>
          </div>
        </div>
      )}

      {/* Map Modal */}
      <Modal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} className="max-w-4xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Vehicle Location - {selectedCar?.brand} {selectedCar?.model}
          </h2>
          
          {selectedCar && (
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-16 h-12 overflow-hidden rounded-lg">
                  <Image
                    width={64}
                    height={48}
                    src={selectedCar.image_url}
                    alt={`${selectedCar.brand} ${selectedCar.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedCar.brand} {selectedCar.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {selectedCar.plate_number}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                    getStatusConfig(selectedCar.status).badge
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedCar.status).dot)}></div>
                    {selectedCar.status}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Location
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCar.current_location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Seen
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedCar.last_seen ? new Date(selectedCar.last_seen).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GPS Coordinates
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {selectedCar.gps_coordinates ? 
                        `${selectedCar.gps_coordinates.latitude.toFixed(6)}, ${selectedCar.gps_coordinates.longitude.toFixed(6)}` : 
                        'Not available'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Map Placeholder */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Interactive Map</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Coming Soon</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsMapModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (selectedCar.gps_coordinates) {
                      const url = `https://www.google.com/maps?q=${selectedCar.gps_coordinates.latitude},${selectedCar.gps_coordinates.longitude}`;
                      window.open(url, '_blank');
                    }
                  }}
                  disabled={!selectedCar.gps_coordinates}
                  className="flex-1"
                >
                  Open in Google Maps
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

// Main export with Suspense wrapper
export default function LocateVehiclesPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading vehicle tracking...</p>
          </div>
        </div>
      </div>
    }>
      <LocateVehiclesContent />
    </Suspense>
  );
}
