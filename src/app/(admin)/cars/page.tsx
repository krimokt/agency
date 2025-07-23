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

// Car data interface
interface CarInfo {
  id: string;
  name: string;
  model: string;
  year: number;
  colors: string[];
  status: "Available" | "Booked" | "Maintenance";
  imageUrl: string;
  price: number;
  features?: string[];
  licensePlate: string;
  category: string;
}

interface CarRentalCardProps {
  car: CarInfo;
  onBooking?: (carId: string) => void;
  onMaintenance?: (carId: string) => void;
  onDocuments?: (carId: string) => void;
}

function CarRentalCard({ 
  car, 
  onBooking, 
  onMaintenance, 
  onDocuments 
}: CarRentalCardProps) {
  const [selectedColor, setSelectedColor] = useState(car.colors[0]);
  const { t } = useTranslation();

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

  const isActionDisabled = (action: string) => {
    if (car.status === "Maintenance") {
      return action === "booking";
    }
    if (car.status === "Booked") {
      return action === "booking";
    }
    return false;
  };

  const statusConfig = getStatusConfig(car.status);

  return (
    <div className="group relative w-full overflow-hidden bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-500 hover:-translate-y-1">
      {/* Car Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={car.imageUrl} 
          alt={`${car.name} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Status Badge - Improved */}
        <div className="absolute top-4 right-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md text-sm font-semibold shadow-lg transition-all duration-300",
            statusConfig.badge
          )}>
            <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)} />
            {t(`cars.status.${car.status.toLowerCase()}`)}
          </div>
        </div>
        
        {/* Price Badge - Improved */}
        <div className="absolute bottom-4 left-4">
          <div className="px-4 py-2 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-white font-bold shadow-lg border border-white/20">
            <span className="text-lg">${car.price}</span>
            <span className="text-sm opacity-75 ml-1">{t('cars.card.perDay')}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1 rounded-lg bg-gray-900/80 text-white text-xs font-medium backdrop-blur-sm">
            {car.category}
          </div>
        </div>
      </div>

      {/* Car Information - Enhanced */}
      <div className="p-6 space-y-5">
        {/* Header Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {car.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {car.model}
            </span>
            <span>•</span>
            <span>{car.year}</span>
            <span>•</span>
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {car.licensePlate}
            </span>
          </div>
        </div>

        {/* Color Selection - Enhanced */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('cars.card.availableColors')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {car.colors.length} {t('cars.card.options')}
            </span>
          </div>
          <div className="flex gap-2">
            {car.colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "relative w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  selectedColor === color 
                    ? "border-gray-900 dark:border-white shadow-lg ring-2 ring-blue-500 ring-offset-2" 
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                )}
                style={{ backgroundColor: color }}
                title={`Color option ${index + 1}`}
              >
                {selectedColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Features - Enhanced */}
        {car.features && car.features.length > 0 && (
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('cars.card.features')}
            </span>
            <div className="flex flex-wrap gap-2">
              {car.features.slice(0, 3).map((feature, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                >
                  {feature}
                </Badge>
              ))}
              {car.features.length > 3 && (
                <Badge 
                  variant="outline"
                  className="text-xs px-3 py-1 bg-gray-50 text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
                >
                  +{car.features.length - 3} {t('cars.card.more')}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Enhanced */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-6 gap-3">
            <Button
              variant={car.status === "Available" ? "default" : "secondary"}
              disabled={isActionDisabled("booking")}
              onClick={() => onBooking?.(car.id)}
              className={cn(
                "col-span-3 h-11 font-semibold transition-all duration-300",
                car.status === "Available" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl" 
                  : "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {car.status === "Booked" ? t('cars.card.currentlyBooked') : car.status === "Maintenance" ? t('cars.card.inService') : t('cars.card.bookNow')}
            </Button>
            
            <Button
              variant="default"
              disabled={isActionDisabled("maintenance")}
              onClick={() => onMaintenance?.(car.id)}
              className={cn(
                "col-span-2 h-11 font-semibold transition-all duration-300 flex items-center justify-center",
                "bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl"
              )}
              title={t('cars.card.scheduleMaintenanceTitle')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              {t('cars.card.maintain')}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onDocuments?.(car.id)}
              className="h-11 border-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-all duration-300"
              title={t('cars.card.viewDocumentsTitle')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

export default function CarsPage() {
  const { localData, addCar, updateCar, addBooking, addClient, updateClient, addPayment } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState([50, 200]);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');
  
  // New car form state
  const [newCar, setNewCar] = useState<Omit<CarInfo, 'id'>>({
    name: '',
    model: '',
    year: new Date().getFullYear(),
    colors: ['#1a1a1a'],
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=3270&auto=format&fit=crop',
    price: 100,
    licensePlate: '',
    category: 'Sedan',
    features: []
  });
  
  // Sample car data with real images from the internet
  const [carData, setCarData] = useState<CarInfo[]>([
    {
      id: "CAR-001",
      name: "Toyota Camry",
      model: "XLE",
      year: 2023,
      colors: ["#1a1a1a", "#ffffff", "#dc2626"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2942&auto=format&fit=crop",
      price: 75,
      licensePlate: "ABC-1234",
      category: "Sedan",
      features: ["Bluetooth", "Backup Camera", "Sunroof"]
    },
    {
      id: "CAR-002",
      name: "Dacia Logan",
      model: "Comfort",
      year: 2020,
      colors: ["#ffffff", "#c0c0c0", "#1e3a8a"],
      status: "Booked",
      imageUrl: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      price: 65,
      licensePlate: "XYZ-5678",
      category: "Sedan",
      features: ["Bluetooth", "Backup Camera", "USB-C Port"]
    },
    {
      id: "CAR-003",
      name: "Tesla Model 3",
      model: "Performance",
      year: 2023,
      colors: ["#374151", "#ffffff", "#7c2d12"],
      status: "Maintenance",
      imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=3271&auto=format&fit=crop",
      price: 120,
      licensePlate: "ELT-9012",
      category: "Electric",
      features: ["Autopilot", "Premium Interior", "Long Range"]
    },
    {
      id: "CAR-004",
      name: "Ford F-150",
      model: "Lariat",
      year: 2023,
      colors: ["#0f172a", "#0369a1", "#b91c1c"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=3270&auto=format&fit=crop",
      price: 110,
      licensePlate: "TRK-3456",
      category: "Truck",
      features: ["Towing Package", "4x4", "Navigation"]
    },
    {
      id: "CAR-005",
      name: "BMW X5",
      model: "xDrive40i",
      year: 2022,
      colors: ["#000000", "#c0c0c0", "#1e3a8a"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=3269&auto=format&fit=crop",
      price: 150,
      licensePlate: "LUX-7890",
      category: "Luxury SUV",
      features: ["Leather Seats", "Panoramic Roof", "Premium Sound"]
    },
    {
      id: "CAR-006",
      name: "Audi A4",
      model: "Quattro",
      year: 2023,
      colors: ["#374151", "#ffffff", "#7c2d12"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=3270&auto=format&fit=crop",
      price: 85,
      licensePlate: "AUD-1122",
      category: "Sedan",
      features: ["Quattro AWD", "Virtual Cockpit", "Premium Sound"]
    }
  ]);
  
  // Filtered cars based on filter criteria
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('');
    setBrandFilter('');
    setPriceRange([50, 200]);
    setYearFilter('');
    setColorFilter('');
  };
  
  // Metrics for cars - updated to use filtered cars when filters are applied
  const metrics = {
    total: carData.length,
    available: carData.filter(car => car.status === "Available").length,
    booked: carData.filter(car => car.status === "Booked").length,
    maintenance: carData.filter(car => car.status === "Maintenance").length
  };
  
  // Filtered metrics - only show when filters are applied
  const filteredMetrics = {
    total: filteredCars.length,
    available: filteredCars.filter(car => car.status === "Available").length,
    booked: filteredCars.filter(car => car.status === "Booked").length,
    maintenance: filteredCars.filter(car => car.status === "Maintenance").length
  };
  
  // Determine if any filter is active
  const isFiltered = statusFilter !== '' || 
                    brandFilter !== '' || 
                    priceRange[0] > 50 || 
                    priceRange[1] < 200 || 
                    yearFilter !== '' || 
                    colorFilter !== '';
  
  // Use filtered metrics if filters are applied, otherwise use regular metrics
  const displayMetrics = isFiltered ? filteredMetrics : metrics;

  // Sync with local data
  useEffect(() => {
    if (localData.cars && localData.cars.length > 0) {
      // Convert local cars to the CarInfo type
      const typedLocalCars = localData.cars.map(car => ({
        id: car.id,
        name: car.name || "",
        model: car.model || "",
        year: car.year || new Date().getFullYear(),
        colors: car.colors || ["#1a1a1a"],
        status: car.status as "Available" | "Booked" | "Maintenance" || "Available",
        imageUrl: car.imageUrl || "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=3270&auto=format&fit=crop",
        price: car.price || 100,
        licensePlate: car.licensePlate || "",
        category: car.category || "Sedan",
        features: car.features || []
      }));
      
      // Merge with sample data, prioritizing local data
      const localCarIds = typedLocalCars.map(c => c.id);
      const filteredSampleData = carData.filter(c => !localCarIds.includes(c.id));
      
      setCarData([...typedLocalCars, ...filteredSampleData]);
    }
  }, [localData.cars]);

  useEffect(() => {
    // Filter cars based on current filters
    let filtered = [...carData];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(car => car.status === statusFilter);
    }
    
    // Apply brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter(car => car.name === brandFilter);
    }
    
    // Apply price range filter
    filtered = filtered.filter(car => {
      return car.price >= priceRange[0] && car.price <= priceRange[1];
    });
    
    // Apply year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(car => car.year.toString() === yearFilter);
    }
    
    // Apply color filter
    if (colorFilter !== "all") {
      filtered = filtered.filter(car => car.colors.includes(colorFilter));
    }
    
    setFilteredCars(filtered);
  }, [statusFilter, brandFilter, priceRange, yearFilter, colorFilter, carData]);

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  const openDetailsModal = (car: CarInfo) => {
    setSelectedCar(car);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCar(null);
  };

  // State for booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState<CarInfo | null>(null);
  const [bookingClientType, setBookingClientType] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [bookingDetails, setBookingDetails] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pickupLocation: 'Downtown Office',
    dropoffLocation: 'Downtown Office',
    insurance: true,
    paymentMethod: 'credit_card',
    initialPayment: 0
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState('');
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedCarForDocuments, setSelectedCarForDocuments] = useState<CarInfo | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (isBookingModalOpen || isDocumentsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBookingModalOpen, isDocumentsModalOpen]);

  const handleBooking = (carId: string) => {
    console.log(`Preparing to book car: ${carId}`);
    const car = carData.find(c => c.id === carId);
    if (car && car.status === "Available") {
      setSelectedCarForBooking(car);
      setBookingDetails({
        ...bookingDetails,
        initialPayment: car.price // Set default initial payment to one day's rate
      });
      setIsBookingModalOpen(true);
    } else {
      alert(t('cars.alerts.carNotAvailable'));
    }
  };

  const handleBookingSubmit = () => {
    if (!selectedCarForBooking) return;
    
    // Validate form
    if (bookingClientType === 'existing' && !selectedClientId) {
      alert(t('cars.alerts.selectClient'));
      return;
    }
    
    if (bookingClientType === 'new') {
      if (!newClientData.firstName || !newClientData.lastName || !newClientData.email || !newClientData.phone) {
        alert(t('cars.alerts.fillRequiredFields'));
        return;
      }
    }
    
    if (!bookingDetails.startDate || !bookingDetails.endDate) {
      alert(t('cars.alerts.selectDates'));
      return;
    }
    
    // Calculate booking duration and total amount
    const startDate = new Date(bookingDetails.startDate);
    const endDate = new Date(bookingDetails.endDate);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    if (durationDays <= 0) {
      alert(t('cars.alerts.invalidDateRange'));
      return;
    }
    
    const totalAmount = durationDays * selectedCarForBooking.price;
    const paidAmount = Math.min(bookingDetails.initialPayment, totalAmount);
    const remainingAmount = totalAmount - paidAmount;
    
    // Create client if new
    let clientId = selectedClientId;
    let clientName = '';
    let clientEmail = '';
    let clientPhone = '';
    
    if (bookingClientType === 'new') {
      // Create new client
      const newClient = {
        firstName: newClientData.firstName,
        lastName: newClientData.lastName,
        email: newClientData.email,
        phone: newClientData.phone,
        address: {
          street: newClientData.address,
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        dateOfBirth: '',
        licenseNumber: newClientData.licenseNumber,
        joinDate: new Date().toISOString(),
        status: 'active' as const,
        totalBookings: 1,
        totalSpent: paidAmount,
        lastRental: null,
        emergencyContact: newClientData.emergencyContact,
        notes: 'Created during booking process'
      };
      
      // Add client to local storage
      const client = addClient(newClient);
      clientId = client.id;
      clientName = `${newClient.firstName} ${newClient.lastName}`;
      clientEmail = newClient.email;
      clientPhone = newClient.phone;
    } else {
      // Use existing client
      const client = localData.clients.find(c => c.id === selectedClientId);
      if (client) {
        clientName = `${client.firstName} ${client.lastName}`;
        clientEmail = client.email;
        clientPhone = client.phone;
        
        // Update client stats
        updateClient(clientId, {
          totalBookings: (client.totalBookings || 0) + 1,
          totalSpent: (client.totalSpent || 0) + paidAmount
        });
      }
    }
    
    // Create booking ID
    const bookingId = `BK-${Date.now().toString().substring(6)}`;
    setGeneratedBookingId(bookingId);
    
    // Create booking
    const booking = {
      id: bookingId,
      bookingNumber: bookingId,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      clientPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      carBrand: selectedCarForBooking.name,
      carModel: selectedCarForBooking.model,
      carYear: selectedCarForBooking.year,
      licensePlate: selectedCarForBooking.licensePlate,
      carImage: selectedCarForBooking.imageUrl,
      startDate: bookingDetails.startDate,
      endDate: bookingDetails.endDate,
      duration: durationDays,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      status: paidAmount === 0 ? "pending" : (paidAmount < totalAmount ? "confirmed" : "active"),
      pickupLocation: bookingDetails.pickupLocation,
      dropoffLocation: bookingDetails.dropoffLocation,
      insurance: bookingDetails.insurance,
      createdAt: new Date().toISOString()
    };
    
    // Add booking to local storage
    addBooking(booking);
    
    // Create payment if initial payment > 0
    if (paidAmount > 0) {
      const payment = {
        id: `payment-${Date.now()}`,
        bookingId: bookingId,
        clientName: clientName,
        clientEmail: clientEmail,
        clientPhone: clientPhone,
        clientPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        carModel: `${selectedCarForBooking.name} ${selectedCarForBooking.model}`,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: paidAmount === totalAmount ? "paid" : "partial",
        paymentMethod: bookingDetails.paymentMethod,
        paymentHistory: [{
          id: `py-${Date.now()}`,
          amount: paidAmount,
          date: new Date().toISOString(),
          method: bookingDetails.paymentMethod === 'credit_card' ? 'Credit Card' : 
                  bookingDetails.paymentMethod === 'debit_card' ? 'Debit Card' : 
                  bookingDetails.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer',
          transactionId: `TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          status: 'completed'
        }],
        invoiceNumber: `INV-${Date.now().toString().substring(6)}`,
        createdAt: new Date().toISOString(),
        lastPaymentDate: new Date().toISOString()
      };
      
      // Add payment to local storage
      addPayment(payment);
    }
    
    // Update car status
    const updatedCars = carData.map(car => {
      if (car.id === selectedCarForBooking.id) {
        return { ...car, status: "Booked" as const };
      }
      return car;
    });
    setCarData(updatedCars);
    
    // Update in Auth context if it's a local car
    if (selectedCarForBooking.id.startsWith('car-')) {
      updateCar(selectedCarForBooking.id, { status: "Booked" });
    }
    
    // Show invoice
    setShowInvoice(true);
  };

  const generateInvoicePDF = () => {
    if (!selectedCarForBooking) return;
    
    const durationDays = Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = durationDays * selectedCarForBooking.price * (bookingDetails.insurance ? 1.15 : 1);
    const remainingBalance = Math.max(0, totalAmount - bookingDetails.initialPayment);
    
    // Create invoice content as HTML
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - Booking #${generatedBookingId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #1f2937; }
            .invoice-title { font-size: 36px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .invoice-number { font-size: 18px; color: #6b7280; }
            .company-info { text-align: right; }
            .company-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .company-details { font-size: 14px; color: #6b7280; line-height: 1.4; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .details-section { background: #f9fafb; padding: 20px; border-radius: 8px; }
            .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .detail-label { color: #6b7280; font-weight: 500; }
            .detail-value { color: #1f2937; font-weight: 600; }
            .payment-summary { background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 30px; }
            .payment-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; }
            .payment-row.total { border-top: 2px solid #e5e7eb; margin-top: 16px; padding-top: 16px; font-size: 18px; font-weight: bold; }
            .payment-row.paid { color: #059669; }
            .payment-row.remaining { color: #dc2626; }
            .terms { background: #f9fafb; padding: 20px; border-radius: 8px; }
            .terms-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
            .terms-list { list-style: disc; margin-left: 20px; }
            .terms-list li { margin-bottom: 4px; color: #6b7280; font-size: 14px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            @media print {
              body { margin: 0; }
              .container { max-width: 100%; margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">Booking #${generatedBookingId}</div>
              </div>
              <div class="company-info">
                <div class="company-name">Car Rental Agency</div>
                <div class="company-details">
                  123 Main Street<br>
                  City, State 12345<br>
                  Phone: (123) 456-7890<br>
                  Email: info@carrental.com
                </div>
              </div>
            </div>

            <div class="details-grid">
              <div class="details-section">
                <div class="section-title">Vehicle Information</div>
                <div class="detail-row">
                  <span class="detail-label">Vehicle:</span>
                  <span class="detail-value">${selectedCarForBooking.name} ${selectedCarForBooking.model}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Year:</span>
                  <span class="detail-value">${selectedCarForBooking.year}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">License Plate:</span>
                  <span class="detail-value">${selectedCarForBooking.licensePlate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Daily Rate:</span>
                  <span class="detail-value">$${selectedCarForBooking.price}/day</span>
                </div>
              </div>

              <div class="details-section">
                <div class="section-title">Rental Period</div>
                <div class="detail-row">
                  <span class="detail-label">Start Date:</span>
                  <span class="detail-value">${new Date(bookingDetails.startDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">End Date:</span>
                  <span class="detail-value">${new Date(bookingDetails.endDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${durationDays} days</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pickup:</span>
                  <span class="detail-value">${bookingDetails.pickupLocation}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Dropoff:</span>
                  <span class="detail-value">${bookingDetails.dropoffLocation}</span>
                </div>
              </div>
            </div>

            <div class="payment-summary">
              <div class="section-title">Payment Summary</div>
              <div class="payment-row">
                <span>Rental Fee (${durationDays} days × $${selectedCarForBooking.price})</span>
                <span>$${durationDays * selectedCarForBooking.price}</span>
              </div>
              ${bookingDetails.insurance ? `
              <div class="payment-row">
                <span>Insurance Fee (15%)</span>
                <span>$${Math.round(durationDays * selectedCarForBooking.price * 0.15)}</span>
              </div>
              ` : ''}
              <div class="payment-row total">
                <span>Total Amount</span>
                <span>$${totalAmount}</span>
              </div>
              <div class="payment-row paid">
                <span>Initial Payment</span>
                <span>$${bookingDetails.initialPayment}</span>
              </div>
              <div class="payment-row remaining">
                <span>Remaining Balance</span>
                <span>$${remainingBalance}</span>
              </div>
            </div>

            <div class="terms">
              <div class="terms-title">Terms & Conditions</div>
              <ul class="terms-list">
                <li>Full payment is due at the time of vehicle return.</li>
                <li>A valid driver's license and credit card are required at pickup.</li>
                <li>Cancellations must be made 24 hours in advance for a full refund.</li>
                <li>The vehicle must be returned with the same fuel level as at pickup.</li>
                <li>Additional charges may apply for late returns or damage to the vehicle.</li>
              </ul>
            </div>

            <div class="footer">
              Thank you for choosing our car rental service!<br>
              Invoice generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a blob with the HTML content
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${generatedBookingId}_${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert(t('cars.alerts.invoiceSaved'));
  };

  const handleMaintenance = (carId: string) => {
    console.log(`Maintenance for car: ${carId}`);
    // Find the car
    const car = carData.find(c => c.id === carId);
    if (!car) return;
    
    // Update car status to Maintenance if not already
    if (car.status !== "Maintenance") {
      const updatedCars = carData.map(c => {
        if (c.id === carId) {
          return { ...c, status: "Maintenance" as const };
        }
        return c;
      });
      setCarData(updatedCars);
      
      // Update in Auth context if it's a local car
      if (car.id.startsWith('car-')) {
        updateCar(carId, { status: "Maintenance" });
      }
    }
    
    // Navigate to the maintenance page with car information
    router.push(`/maintenance?carId=${carId}&carName=${car.name}&carModel=${car.model}&licensePlate=${car.licensePlate}`);
  };

  const handleDocuments = (carId: string) => {
    console.log(`Documents for car: ${carId}`);
    const car = carData.find(c => c.id === carId);
    if (car) {
      setSelectedCarForDocuments(car);
      setIsDocumentsModalOpen(true);
    }
  };
  
  const handleAddCarSubmit = (carData: {
    basicInfo: {
      brand: string;
      model: string;
      plateNumber: string;
      year: number;
      pricePerDay: number;
    };
    details: {
      category: string;
      status: 'Available' | 'Rented' | 'In Maintenance';
      features: string[];
      imageUrl: string;
    };
    documents: any; // We don't need to use the document data for now
  }) => {
    // Generate a unique ID for the new car
    const newCarWithId: CarInfo = {
      id: `car-${Date.now()}`,
      name: carData.basicInfo.brand,
      model: carData.basicInfo.model,
      year: carData.basicInfo.year,
      colors: ['#1a1a1a', '#ffffff', '#c0c0c0'], // Default colors
      status: carData.details.status === 'Rented' ? 'Booked' : 
              carData.details.status === 'In Maintenance' ? 'Maintenance' : 'Available',
      imageUrl: carData.details.imageUrl || 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=3270&auto=format&fit=crop',
      price: carData.basicInfo.pricePerDay,
      licensePlate: carData.basicInfo.plateNumber,
      category: carData.details.category,
      features: carData.details.features
    };
    
    // Add the new car to the local data
    addCar(newCarWithId);
    
    // Update the UI
    setCarData(prevCars => [...prevCars, newCarWithId]);
    
    // Close the modal
    closeModal();
    
    // Show success message
    setShowSuccessAlert(true);
    setSuccessMessage(t('cars.alerts.carAdded', { name: carData.basicInfo.brand, model: carData.basicInfo.model }));
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header - Enhanced */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('cars.title')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t('cars.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{displayMetrics.total} {t('cars.vehiclesCount')}</span>
          </div>
          <Button 
            variant="default" 
            onClick={openModal}
            className="px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('cars.addNewCar')}
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Cars */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
              {t('cars.metrics.fleet')}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {displayMetrics.total}
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('cars.metrics.total')}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
        </div>

        {/* Available Cars */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
              {displayMetrics.total > 0 ? Math.round((displayMetrics.available / displayMetrics.total) * 100) : 0}%
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-400">
              {displayMetrics.available}
            </p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
              {t('cars.metrics.available')}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        </div>

        {/* Booked Cars */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
              {displayMetrics.total > 0 ? Math.round((displayMetrics.booked / displayMetrics.total) * 100) : 0}%
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400">
              {displayMetrics.booked}
            </p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-500">
              {t('cars.metrics.booked')}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>

        {/* Maintenance Cars */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 dark:border-amber-800 dark:from-amber-900/20 dark:to-amber-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
              {displayMetrics.total > 0 ? Math.round((displayMetrics.maintenance / displayMetrics.total) * 100) : 0}%
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-amber-700 dark:text-amber-400">
              {displayMetrics.maintenance}
            </p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
              {t('cars.metrics.maintenance')}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('cars.allCars')}
            </h3>
          <div className="flex items-center justify-between">
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('cars.allCarsSubtitle')}
            </p>
            {isFiltered && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {t('cars.filtered')} • {filteredCars.length} {t('cars.of')} {carData.length} {t('cars.carsText')}
              </span>
            )}
          </div>
          
          {/* Filter Section */}
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Status Filter */}
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('cars.filters.status')}
                </label>
                <select 
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('cars.filters.allStatuses')}</option>
                  <option value="Available">{t('cars.status.available')}</option>
                  <option value="Booked">{t('cars.status.booked')}</option>
                  <option value="Maintenance">{t('cars.status.maintenance')}</option>
                </select>
              </div>
              
              {/* Brand/Marque Filter */}
              <div>
                <label htmlFor="brandFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('cars.filters.brand')}
                </label>
                <select 
                  id="brandFilter"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('cars.filters.allBrands')}</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Audi">Audi</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Peugeot">Peugeot</option>
                  <option value="Renault">Renault</option>
                  <option value="Skoda">Skoda</option>
                  <option value="Fiat">Fiat</option>
                  <option value="Jeep">Jeep</option>
                  <option value="Volvo">Volvo</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Mini">Mini</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Citroën">Citroën</option>
                  <option value="Dacia">Dacia</option>
                  <option value="Jaguar">Jaguar</option>
                  <option value="Opel">Opel</option>
                  <option value="Chery">Chery</option>
                  <option value="BYD">BYD</option>
                  <option value="Geely">Geely</option>
                  <option value="Great Wall">Great Wall</option>
                  <option value="Dongfeng">Dongfeng</option>
                  <option value="Isuzu">Isuzu</option>
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <label htmlFor="priceFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('cars.filters.priceRange')}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center flex-1">
                    <span className="absolute left-3 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      min="50"
                      max={priceRange[1] - 5}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 50 && value < priceRange[1]) {
                          setPriceRange([value, priceRange[1]]);
                        }
                      }}
                      className="w-full pl-7 pr-2 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                  <div className="relative flex items-center flex-1">
                    <span className="absolute left-3 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      min={priceRange[0] + 5}
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= 200 && value > priceRange[0]) {
                          setPriceRange([priceRange[0], value]);
                        }
                      }}
                      className="w-full pl-7 pr-2 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
              </div>
            </div>
          </div>

              {/* Year Filter */}
              <div>
                <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('cars.filters.modelYear')}
                </label>
                <select 
                  id="yearFilter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('cars.filters.allYears')}</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>
              
              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('cars.filters.color')}
                </label>
                <div className="flex flex-wrap gap-3 py-2">
                  <button 
                    className={`w-7 h-7 rounded-full ${colorFilter === '#ffffff' ? 'ring-2 ring-offset-2 ring-blue-500' : 'border border-gray-300 dark:border-gray-600'} bg-white hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 transition-all`}
                    onClick={() => setColorFilter(colorFilter === '#ffffff' ? '' : '#ffffff')}
                  ></button>
                  <button 
                    className={`w-7 h-7 rounded-full ${colorFilter === '#000000' ? 'ring-2 ring-offset-2 ring-blue-500' : 'border border-gray-300 dark:border-gray-600'} bg-black hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 transition-all`}
                    onClick={() => setColorFilter(colorFilter === '#000000' ? '' : '#000000')}
                  ></button>
                  <button 
                    className={`w-7 h-7 rounded-full ${colorFilter === '#c0c0c0' ? 'ring-2 ring-offset-2 ring-blue-500' : 'border border-gray-300 dark:border-gray-600'} bg-gray-400 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 transition-all`}
                    onClick={() => setColorFilter(colorFilter === '#c0c0c0' ? '' : '#c0c0c0')}
                  ></button>
                  <button 
                    className={`w-7 h-7 rounded-full ${colorFilter === '#1e3a8a' ? 'ring-2 ring-offset-2 ring-blue-500' : 'border border-gray-300 dark:border-gray-600'} bg-blue-600 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 transition-all`}
                    onClick={() => setColorFilter(colorFilter === '#1e3a8a' ? '' : '#1e3a8a')}
                  ></button>
                  <button 
                    className={`w-7 h-7 rounded-full ${colorFilter === '#dc2626' ? 'ring-2 ring-offset-2 ring-blue-500' : 'border border-gray-300 dark:border-gray-600'} bg-red-600 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 transition-all`}
                    onClick={() => setColorFilter(colorFilter === '#dc2626' ? '' : '#dc2626')}
                  ></button>
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
                {t('cars.filters.resetFilters')}
                            </Button>
                        </div>
            </div>
          </div>
          
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarRentalCard
                key={car.id}
                car={car}
                onBooking={handleBooking}
                onMaintenance={handleMaintenance}
                onDocuments={handleDocuments}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Car Modal - Updated to use the new form component */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-4xl w-full p-0">
        <CarAddForm onSubmit={handleAddCarSubmit} onCancel={closeModal} />
      </Modal>

      {/* Car Details Modal placeholder */}
      {isDetailsModalOpen && selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCar.name} Details
            </h3>
            <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={selectedCar.imageUrl}
                alt={selectedCar.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <p><strong>ID:</strong> {selectedCar.id}</p>
              <p><strong>Model:</strong> {selectedCar.model}</p>
              <p><strong>Year:</strong> {selectedCar.year}</p>
              <p><strong>Category:</strong> {selectedCar.category}</p>
              <p><strong>License Plate:</strong> {selectedCar.licensePlate}</p>
              <p><strong>Status:</strong> {selectedCar.status}</p>
              <p><strong>Daily Rate:</strong> ${selectedCar.price}/day</p>
              {selectedCar.features && (
                <p><strong>Features:</strong> {selectedCar.features.join(", ")}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={closeDetailsModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
             {/* Booking Modal */}
       {isBookingModalOpen && selectedCarForBooking && (
         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto">
           <div className="min-h-full flex items-center justify-center p-4">
             <div className="w-full max-w-6xl my-8 rounded-xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
             {/* Header */}
             <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl">
               <div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                   {t('cars.booking.title')}
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                   {selectedCarForBooking.name} {selectedCarForBooking.model} ({selectedCarForBooking.year})
                 </p>
               </div>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => {
                   setIsBookingModalOpen(false);
                   setSelectedCarForBooking(null);
                   setShowInvoice(false);
                 }}
                 className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </Button>
             </div>

             {!showInvoice ? (
               <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {/* Car Summary Card */}
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                   <div className="flex items-center gap-6">
                     <div className="w-32 h-20 rounded-lg overflow-hidden shadow-md">
                       <img 
                         src={selectedCarForBooking.imageUrl} 
                         alt={selectedCarForBooking.name} 
                         className="w-full h-full object-cover"
                       />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                         {selectedCarForBooking.name} {selectedCarForBooking.model}
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                         <div>
                           <span className="text-gray-500 dark:text-gray-400">Year:</span>
                           <p className="font-semibold text-gray-900 dark:text-white">{selectedCarForBooking.year}</p>
                         </div>
                         <div>
                           <span className="text-gray-500 dark:text-gray-400">License:</span>
                           <p className="font-semibold text-gray-900 dark:text-white">{selectedCarForBooking.licensePlate}</p>
                         </div>
                         <div>
                           <span className="text-gray-500 dark:text-gray-400">Category:</span>
                           <p className="font-semibold text-gray-900 dark:text-white">{selectedCarForBooking.category}</p>
                         </div>
                         <div>
                           <span className="text-gray-500 dark:text-gray-400">Daily Rate:</span>
                           <p className="font-semibold text-green-600 dark:text-green-400 text-lg">${selectedCarForBooking.price}/day</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Client Information */}
                   <div className="space-y-6">
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                       {t('cars.booking.clientInfo')}
                     </h4>
                     
                     {/* Client Type Selection */}
                     <div className="grid grid-cols-2 gap-4">
                       <button
                         type="button"
                         className={`p-4 border-2 rounded-xl text-left transition-all ${
                           bookingClientType === 'existing' 
                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                             : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                         }`}
                         onClick={() => setBookingClientType('existing')}
                       >
                         <div className="flex items-center mb-2">
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                           </svg>
                           <span className="font-medium">{t('cars.booking.existingClient')}</span>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {t('cars.booking.existingClientDesc')}
                         </p>
                       </button>
                       
                       <button
                         type="button"
                         className={`p-4 border-2 rounded-xl text-left transition-all ${
                           bookingClientType === 'new' 
                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                             : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                         }`}
                         onClick={() => setBookingClientType('new')}
                       >
                         <div className="flex items-center mb-2">
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                           </svg>
                           <span className="font-medium">{t('cars.booking.newClient')}</span>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           {t('cars.booking.newClientDesc')}
                         </p>
                       </button>
                     </div>

                     {bookingClientType === 'existing' ? (
                       <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                           {t('cars.booking.selectClient')}*
                         </label>
                         <select
                           value={selectedClientId}
                           onChange={(e) => setSelectedClientId(e.target.value)}
                           className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         >
                           <option value="">{t('cars.booking.selectClient')}</option>
                           {localData.clients.map(client => (
                             <option key={client.id} value={client.id}>
                               {client.firstName} {client.lastName} - {client.email}
                             </option>
                           ))}
                         </select>
                       </div>
                     ) : (
                       <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               First Name*
                             </label>
                             <input
                               type="text"
                               value={newClientData.firstName}
                               onChange={(e) => setNewClientData({...newClientData, firstName: e.target.value})}
                               className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="Enter first name"
                             />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Last Name*
                             </label>
                             <input
                               type="text"
                               value={newClientData.lastName}
                               onChange={(e) => setNewClientData({...newClientData, lastName: e.target.value})}
                               className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="Enter last name"
                             />
                           </div>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Email Address*
                           </label>
                           <input
                             type="email"
                             value={newClientData.email}
                             onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="Enter email address"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Phone Number*
                           </label>
                           <input
                             type="tel"
                             value={newClientData.phone}
                             onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="Enter phone number"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Driver's License Number
                           </label>
                           <input
                             type="text"
                             value={newClientData.licenseNumber}
                             onChange={(e) => setNewClientData({...newClientData, licenseNumber: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="Enter license number"
                           />
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Booking & Payment Details */}
                   <div className="space-y-6">
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                       {t('cars.booking.bookingDetails')}
                     </h4>
                     
                     <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Start Date*
                           </label>
                           <input
                             type="date"
                             value={bookingDetails.startDate}
                             onChange={(e) => setBookingDetails({...bookingDetails, startDate: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             End Date*
                           </label>
                           <input
                             type="date"
                             value={bookingDetails.endDate}
                             onChange={(e) => setBookingDetails({...bookingDetails, endDate: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           />
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Pickup Location
                           </label>
                           <select
                             value={bookingDetails.pickupLocation}
                             onChange={(e) => setBookingDetails({...bookingDetails, pickupLocation: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           >
                             <option value="Downtown Office">Downtown Office</option>
                             <option value="Airport Terminal">Airport Terminal</option>
                             <option value="Hotel District">Hotel District</option>
                             <option value="Business Park">Business Park</option>
                             <option value="Mall">Mall</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Dropoff Location
                           </label>
                           <select
                             value={bookingDetails.dropoffLocation}
                             onChange={(e) => setBookingDetails({...bookingDetails, dropoffLocation: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           >
                             <option value="Downtown Office">Downtown Office</option>
                             <option value="Airport Terminal">Airport Terminal</option>
                             <option value="Hotel District">Hotel District</option>
                             <option value="Business Park">Business Park</option>
                             <option value="Mall">Mall</option>
                           </select>
                         </div>
                       </div>

                       <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                         <input
                           type="checkbox"
                           id="insurance"
                           checked={bookingDetails.insurance}
                           onChange={(e) => setBookingDetails({...bookingDetails, insurance: e.target.checked})}
                           className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                         <label htmlFor="insurance" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                           Include Insurance Coverage (+15% of daily rate)
                         </label>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Payment Method
                           </label>
                           <select
                             value={bookingDetails.paymentMethod}
                             onChange={(e) => setBookingDetails({...bookingDetails, paymentMethod: e.target.value})}
                             className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           >
                             <option value="credit_card">Credit Card</option>
                             <option value="debit_card">Debit Card</option>
                             <option value="cash">Cash</option>
                             <option value="bank_transfer">Bank Transfer</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Initial Payment
                           </label>
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                             <input
                               type="number"
                               min="0"
                               value={bookingDetails.initialPayment}
                               onChange={(e) => setBookingDetails({...bookingDetails, initialPayment: Number(e.target.value)})}
                               className="pl-8 pr-4 py-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="0.00"
                             />
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                             Leave as 0 for no initial payment
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                   <Button 
                     variant="outline" 
                     onClick={() => {
                       setIsBookingModalOpen(false);
                       setSelectedCarForBooking(null);
                     }}
                     className="px-8 py-3 h-auto"
                   >
                     Cancel
                   </Button>
                   <Button 
                     onClick={handleBookingSubmit}
                     className="px-8 py-3 h-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                   >
                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                     {t('cars.booking.completeBooking')}
                   </Button>
                 </div>
               </div>
             ) : (
               /* Invoice View */
               <div className="flex-1 overflow-y-auto p-6">
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
                   <div className="flex justify-between items-center mb-8">
                     <div>
                       <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('cars.invoice.title')}</h2>
                       <p className="text-lg text-gray-600 dark:text-gray-400">{t('cars.invoice.bookingNumber', { number: generatedBookingId })}</p>
                     </div>
                     <div className="text-right">
                       <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('cars.invoice.companyName')}</h3>
                       <p className="text-sm text-gray-600 dark:text-gray-400">123 Main Street</p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">City, State 12345</p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">Phone: (123) 456-7890</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8 mb-8">
                     <div>
                       <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Vehicle Information</h4>
                       <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                         <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedCarForBooking.name} {selectedCarForBooking.model}</p>
                         <p className="text-gray-600 dark:text-gray-400">{selectedCarForBooking.year} • {selectedCarForBooking.licensePlate}</p>
                         <p className="text-gray-600 dark:text-gray-400">Daily Rate: ${selectedCarForBooking.price}/day</p>
                       </div>
                     </div>
                     <div>
                       <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Rental Period</h4>
                       <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                         <p className="text-gray-800 dark:text-gray-200">
                           From: {new Date(bookingDetails.startDate).toLocaleDateString()}
                         </p>
                         <p className="text-gray-800 dark:text-gray-200">
                           To: {new Date(bookingDetails.endDate).toLocaleDateString()}
                         </p>
                         <p className="text-gray-600 dark:text-gray-400 font-medium">
                           Duration: {Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Payment Summary</h4>
                     <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                       <div className="space-y-3">
                         <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">
                             Rental Fee ({Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))} days × ${selectedCarForBooking.price})
                           </span>
                           <span className="text-gray-800 dark:text-gray-200 font-medium">
                             ${Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) * selectedCarForBooking.price}
                           </span>
                         </div>
                         {bookingDetails.insurance && (
                           <div className="flex justify-between">
                             <span className="text-gray-600 dark:text-gray-400">Insurance Fee (15%)</span>
                             <span className="text-gray-800 dark:text-gray-200 font-medium">
                               ${Math.round(Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) * selectedCarForBooking.price * 0.15)}
                             </span>
                           </div>
                         )}
                         <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                           <div className="flex justify-between text-lg font-bold">
                             <span className="text-gray-900 dark:text-white">Total Amount</span>
                             <span className="text-gray-900 dark:text-white">
                               ${Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) * selectedCarForBooking.price * (bookingDetails.insurance ? 1.15 : 1)}
                             </span>
                           </div>
                           <div className="flex justify-between mt-2">
                             <span className="text-gray-600 dark:text-gray-400">Initial Payment</span>
                             <span className="text-green-600 dark:text-green-400 font-medium">
                               ${bookingDetails.initialPayment}
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                             <span className="text-red-600 dark:text-red-400 font-medium">
                               ${Math.max(0, Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) * selectedCarForBooking.price * (bookingDetails.insurance ? 1.15 : 1) - bookingDetails.initialPayment)}
                             </span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                     <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Terms & Conditions</h4>
                     <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                       <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
                         <li>Full payment is due at the time of vehicle return.</li>
                         <li>A valid driver's license and credit card are required at pickup.</li>
                         <li>Cancellations must be made 24 hours in advance for a full refund.</li>
                         <li>The vehicle must be returned with the same fuel level as at pickup.</li>
                         <li>Additional charges may apply for late returns or damage to the vehicle.</li>
                       </ul>
                     </div>
                   </div>
                   
                   <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                     <Button 
                       variant="outline" 
                       onClick={() => window.print()}
                       className="px-6 py-3 h-auto"
                     >
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                       </svg>
                       Print Invoice
                     </Button>
                     <Button 
                       variant="outline" 
                       onClick={() => generateInvoicePDF()}
                       className="px-6 py-3 h-auto"
                     >
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                       Save as PDF
                     </Button>
                     <Button 
                       onClick={() => {
                         setIsBookingModalOpen(false);
                         setSelectedCarForBooking(null);
                         setShowInvoice(false);
                         alert(t('cars.alerts.bookingCompleted', { bookingId: generatedBookingId }));
                       }}
                       className="px-6 py-3 h-auto bg-green-600 hover:bg-green-700 text-white"
                     >
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                       Complete & Close
                     </Button>
                   </div>
                 </div>
               </div>
             )}
             </div>
           </div>
         </div>
       )}
       
       {/* Documents Modal */}
       {isDocumentsModalOpen && selectedCarForDocuments && (
         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto">
           <div className="min-h-full flex items-center justify-center p-4">
             <div className="w-full max-w-6xl my-8 rounded-xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
             {/* Header */}
             <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl">
               <div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                   {t('cars.documents.title')}
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                   {selectedCarForDocuments.name} {selectedCarForDocuments.model} ({selectedCarForDocuments.year})
                 </p>
               </div>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => {
                   setIsDocumentsModalOpen(false);
                   setSelectedCarForDocuments(null);
                 }}
                 className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </Button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6">
               {/* Vehicle Summary Card */}
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
                 <div className="flex items-center gap-6">
                   <div className="w-32 h-20 rounded-lg overflow-hidden shadow-md">
                     <img
                       src={selectedCarForDocuments.imageUrl}
                       alt={selectedCarForDocuments.name}
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <div className="flex-1">
                     <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                       {selectedCarForDocuments.name} {selectedCarForDocuments.model}
                     </h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                       <div>
                         <span className="text-gray-500 dark:text-gray-400">Year:</span>
                         <p className="font-semibold text-gray-900 dark:text-white">{selectedCarForDocuments.year}</p>
                       </div>
                       <div>
                         <span className="text-gray-500 dark:text-gray-400">License:</span>
                         <p className="font-semibold text-gray-900 dark:text-white">{selectedCarForDocuments.licensePlate}</p>
                       </div>
                       <div>
                         <span className="text-gray-500 dark:text-gray-400">Category:</span>
                         <p className="font-semibold text-gray-900 dark:text-white">{selectedCarForDocuments.category}</p>
                       </div>
                       <div>
                         <span className="text-gray-500 dark:text-gray-400">Status:</span>
                         <p className="font-semibold text-green-600 dark:text-green-400">{selectedCarForDocuments.status}</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Document Categories */}
               <div className="space-y-6">
                 {/* Registration & Legal Documents */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                       <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Registration & Legal Documents</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[
                       { name: "Vehicle Registration", date: "Valid until 2025-12-31", status: "Valid" },
                       { name: "License Certificate", date: "Valid until 2024-08-15", status: "Valid" },
                       { name: "Inspection Certificate", date: "Valid until 2024-06-30", status: "Expiring Soon" }
                     ].map((doc, index) => (
                       <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                         <div className="flex-1">
                           <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</p>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                             doc.status === "Valid" 
                               ? "bg-green-100 text-green-800 border-green-200" 
                               : "bg-amber-100 text-amber-800 border-amber-200"
                           }`}>
                             {doc.status}
                           </span>
                         </div>
                         <div className="flex gap-2 ml-4">
                           <Button variant="outline" size="sm" className="text-xs">View</Button>
                           <Button variant="outline" size="sm" className="text-xs">Download</Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Insurance Documents */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                       <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Insurance Documents</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[
                       { name: "Comprehensive Insurance", date: "Valid until 2024-12-31", status: "Valid" },
                       { name: "Third Party Insurance", date: "Valid until 2024-11-15", status: "Valid" },
                       { name: "Gap Insurance", date: "Valid until 2025-01-20", status: "Valid" }
                     ].map((doc, index) => (
                       <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                         <div className="flex-1">
                           <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</p>
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800 border-green-200">
                             {doc.status}
                           </span>
                         </div>
                         <div className="flex gap-2 ml-4">
                           <Button variant="outline" size="sm" className="text-xs">View</Button>
                           <Button variant="outline" size="sm" className="text-xs">Download</Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Maintenance & Service Records */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                       <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance & Service Records</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[
                       { name: "Last Service Record", date: "Completed 2024-01-15", status: "Up to Date" },
                       { name: "Oil Change Certificate", date: "Completed 2024-01-10", status: "Up to Date" },
                       { name: "Tire Inspection Report", date: "Due 2024-03-01", status: "Due Soon" }
                     ].map((doc, index) => (
                       <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                         <div className="flex-1">
                           <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</p>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                             doc.status === "Up to Date" 
                               ? "bg-green-100 text-green-800 border-green-200" 
                               : "bg-amber-100 text-amber-800 border-amber-200"
                           }`}>
                             {doc.status}
                           </span>
                         </div>
                         <div className="flex gap-2 ml-4">
                           <Button variant="outline" size="sm" className="text-xs">View</Button>
                           <Button variant="outline" size="sm" className="text-xs">Download</Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Financial Documents */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                       <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Documents</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[
                       { name: "Purchase Invoice", date: "2023-05-15", status: "Archived" },
                       { name: "Loan Agreement", date: "2023-05-15", status: "Active" },
                       { name: "Depreciation Schedule", date: "Updated 2024-01-01", status: "Current" }
                     ].map((doc, index) => (
                       <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                         <div className="flex-1">
                           <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</p>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                             doc.status === "Active" || doc.status === "Current"
                               ? "bg-green-100 text-green-800 border-green-200" 
                               : "bg-gray-100 text-gray-800 border-gray-200"
                           }`}>
                             {doc.status}
                           </span>
                         </div>
                         <div className="flex gap-2 ml-4">
                           <Button variant="outline" size="sm" className="text-xs">View</Button>
                           <Button variant="outline" size="sm" className="text-xs">Download</Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Rental History */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                       <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Rental History</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[
                       { name: "Rental Agreement #001", date: "2024-01-10 to 2024-01-15", status: "Completed" },
                       { name: "Rental Agreement #002", date: "2024-01-20 to 2024-01-25", status: "Completed" },
                       { name: "Damage Report #001", date: "2024-01-16", status: "Resolved" }
                     ].map((doc, index) => (
                       <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                         <div className="flex-1">
                           <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</p>
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800 border-green-200">
                             {doc.status}
                           </span>
                         </div>
                         <div className="flex gap-2 ml-4">
                           <Button variant="outline" size="sm" className="text-xs">View</Button>
                           <Button variant="outline" size="sm" className="text-xs">Download</Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Upload New Documents Section */}
               <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                 <div className="text-center">
                   <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                     <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                   <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Upload New Documents</h3>
                   <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                     Drag and drop files here, or click to select files
                   </p>
                   <Button className="mt-4" variant="outline">
                     Choose Files
                   </Button>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                 <Button 
                   className="bg-blue-600 hover:bg-blue-700 text-white"
                 >
                   Print All Documents
                 </Button>
                 <Button 
                   className="bg-green-600 hover:bg-green-700 text-white"
                 >
                   Download All Documents
                 </Button>
                 <Button 
                   className="bg-purple-600 hover:bg-purple-700 text-white"
                 >
                   Email Documents
                 </Button>
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     setIsDocumentsModalOpen(false);
                     setSelectedCarForDocuments(null);
                   }}
                 >
                   Close
                 </Button>
               </div>
             </div>
           </div>
           </div>
         </div>
       )}
      </div>
    );
  };