import React from "react";
import { Car, CheckCircle, Clock, AlertTriangle, Calendar, Eye, Phone, User, TrendingUp, ArrowRight, ArrowLeft, Filter, Search, MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Enhanced Badge component with better styling
const variants = {
  gray: "bg-slate-100 text-slate-700 border border-slate-200",
  "gray-subtle": "bg-slate-50 text-slate-600 border border-slate-100",
  blue: "bg-blue-500 text-white shadow-lg shadow-blue-500/25",
  "blue-subtle": "bg-blue-50 text-blue-700 border border-blue-200",
  purple: "bg-purple-500 text-white shadow-lg shadow-purple-500/25",
  "purple-subtle": "bg-purple-50 text-purple-700 border border-purple-200",
  amber: "bg-amber-500 text-white shadow-lg shadow-amber-500/25",
  "amber-subtle": "bg-amber-50 text-amber-700 border border-amber-200",
  red: "bg-red-500 text-white shadow-lg shadow-red-500/25",
  "red-subtle": "bg-red-50 text-red-700 border border-red-200",
  pink: "bg-pink-500 text-white shadow-lg shadow-pink-500/25",
  "pink-subtle": "bg-pink-50 text-pink-700 border border-pink-200",
  green: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
  "green-subtle": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  teal: "bg-teal-500 text-white shadow-lg shadow-teal-500/25",
  "teal-subtle": "bg-teal-50 text-teal-700 border border-teal-200",
  inverted: "bg-slate-900 text-white shadow-lg shadow-slate-900/25",
  success: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
  warning: "bg-amber-500 text-white shadow-lg shadow-amber-500/25",
  error: "bg-red-500 text-white shadow-lg shadow-red-500/25"
};

const sizes = {
  sm: "text-xs h-6 px-2.5 font-medium",
  md: "text-sm h-7 px-3 font-medium",
  lg: "text-sm h-8 px-4 font-semibold"
};

interface BadgeProps {
  children?: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: React.ReactNode;
  className?: string;
}

const Badge = ({ children, variant = "gray", size = "md", icon, className }: BadgeProps) => {
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full whitespace-nowrap transition-all duration-200",
      variants[variant],
      sizes[size],
      className
    )}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </div>
  );
};

// Enhanced Circle Progress with better animations
interface CircleProgressProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

const CircleProgress = ({
  value,
  maxValue,
  size = 48,
  strokeWidth = 4,
  className,
  color = "#10b981"
}: CircleProgressProps) => {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(animatedValue / maxValue, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-700">
          {Math.round(percentage * 100)}%
        </span>
      </div>
    </div>
  );
};

// Data interfaces (same as before)
interface CarNotice {
  id: string;
  licensePlate: string;
  type: 'insurance' | 'registration' | 'service';
  description: string;
  dueDate: string;
  urgency: 'expired' | 'near-due';
  carImage: string;
  carModel: string;
  modelYear: number;
}

interface RecentAction {
  id: string;
  licensePlate: string;
  carModel: string;
  action: 'booked' | 'maintenance' | 'returned';
  timestamp: string;
  customer?: string;
  status: 'completed' | 'in-progress' | 'scheduled';
}

interface CarInUse {
  id: string;
  carImage: string;
  carModel: string;
  licensePlate: string;
  clientAvatar: string;
  clientName: string;
  clientPhone: string;
  rentalStartDate?: string;
  estimatedReturn?: string;
}

interface CarAvailabilityData {
  totalCars: number;
  availableCars: number;
  bookedCars: number;
  maintenanceCars: number;
  notices: CarNotice[];
  recentActions: RecentAction[];
  carsInUse: CarInUse[];
}

// Main component with enhanced design
interface CarAvailabilityOverviewProps {
  data?: CarAvailabilityData;
}

const CarAvailabilityOverview: React.FC<CarAvailabilityOverviewProps> = ({
  data = {
    totalCars: 150,
    availableCars: 89,
    bookedCars: 45,
    maintenanceCars: 16,
    notices: [
      {
        id: '1',
        licensePlate: 'ABC-123',
        type: 'insurance',
        description: 'Insurance policy has expired and needs immediate renewal',
        dueDate: '2024-01-15',
        urgency: 'expired',
        carImage: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop',
        carModel: 'Toyota Camry',
        modelYear: 2022
      },
      {
        id: '2',
        licensePlate: 'XYZ-789',
        type: 'service',
        description: 'Scheduled oil change and maintenance check',
        dueDate: '2024-02-01',
        urgency: 'near-due',
        carImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
        carModel: 'Honda Civic',
        modelYear: 2023
      },
      {
        id: '3',
        licensePlate: 'DEF-456',
        type: 'registration',
        description: 'Vehicle registration expires in 10 days',
        dueDate: '2024-01-30',
        urgency: 'near-due',
        carImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop',
        carModel: 'BMW 3 Series',
        modelYear: 2021
      }
    ],
    recentActions: [
      {
        id: '1',
        licensePlate: 'GHI-789',
        carModel: 'Tesla Model 3',
        action: 'booked',
        timestamp: '2024-01-20T14:30:00Z',
        customer: 'John Smith',
        status: 'completed'
      },
      {
        id: '2',
        licensePlate: 'JKL-456',
        carModel: 'Mercedes C-Class',
        action: 'maintenance',
        timestamp: '2024-01-20T11:15:00Z',
        status: 'in-progress'
      },
      {
        id: '3',
        licensePlate: 'MNO-123',
        carModel: 'Audi A4',
        action: 'returned',
        timestamp: '2024-01-20T09:45:00Z',
        customer: 'Sarah Johnson',
        status: 'completed'
      }
    ],
    carsInUse: [
      {
        id: 'car1',
        carImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&h=250&q=80',
        carModel: 'Toyota Aqua Hybrid 1.5 CVT',
        licensePlate: 'AES-151',
        clientAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=JohnDoe',
        clientName: 'John Doe',
        clientPhone: '+1 (555) 123-4567',
        rentalStartDate: '2024-01-18',
        estimatedReturn: '2024-01-25'
      },
      {
        id: 'car2',
        carImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&h=250&q=80',
        carModel: 'BMW 3 Series 320i',
        licensePlate: 'BWM-789',
        clientAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=JaneSmith',
        clientName: 'Jane Smith',
        clientPhone: '+1 (555) 987-6543',
        rentalStartDate: '2024-01-19',
        estimatedReturn: '2024-01-26'
      },
      {
        id: 'car3',
        carImage: 'https://images.unsplash.com/photo-1542282085-f42139e8876c?auto=format&fit=crop&w=400&h=250&q=80',
        carModel: 'Mercedes-Benz C-Class C300',
        licensePlate: 'MBZ-456',
        clientAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PeterJones',
        clientName: 'Peter Jones',
        clientPhone: '+1 (555) 234-5678',
        rentalStartDate: '2024-01-20',
        estimatedReturn: '2024-01-27'
      },
      {
        id: 'car4',
        carImage: 'https://images.unsplash.com/photo-1599422960007-2708365691d1?auto=format&fit=crop&w=400&h=250&q=80',
        carModel: 'Audi A4 2.0 TFSI',
        licensePlate: 'AUD-101',
        clientAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AliceBrown',
        clientName: 'Alice Brown',
        clientPhone: '+1 (555) 345-6789',
        rentalStartDate: '2024-01-21',
        estimatedReturn: '2024-01-28'
      }
    ]
  }
}) => {
  const { t } = useTranslation();
  
  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'insurance':
        return <AlertTriangle className="w-4 h-4" />;
      case 'registration':
        return <Calendar className="w-4 h-4" />;
      case 'service':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'booked':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4" />;
      case 'returned':
        return <Car className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getUtilizationRate = () => {
    return Math.round(((data.bookedCars + data.maintenanceCars) / data.totalCars) * 100);
  };

  // --- Add scroll logic for carsInUse ---
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollBy = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Fleet Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("fleet.overview") || "Fleet Overview"}</h1>
            <p className="text-slate-600 text-base md:text-lg">{t("fleet.description") || "Monitor your vehicle fleet performance and status in real-time"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              {t("buttons.filter") || "Filter"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">
              <Search className="w-4 h-4" />
              {t("buttons.search") || "Search"}
            </button>
            <Badge variant="blue" icon={<TrendingUp className="w-4 h-4" />}>
              {getUtilizationRate()}% {t("fleet.utilization") || "Utilization"}
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Fleet */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                <Car className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
              </div>
              <Badge variant="gray-subtle" size="sm">{t("fleet.totalFleet") || "Total Fleet"}</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{data.totalCars}</h3>
              <p className="text-slate-600 font-medium">{t("fleet.vehicles") || "Vehicles"}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="w-4 h-4" />
                <span>{t("fleet.activeFleetSize") || "Active fleet size"}</span>
              </div>
            </div>
          </div>

          {/* Available Cars */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <Badge variant="green-subtle" size="sm">{t("cars.available") || "Available"}</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{data.availableCars}</h3>
                  <p className="text-slate-600 font-medium">{t("fleet.readyToRent") || "Ready to rent"}</p>
                </div>
                <CircleProgress
                  value={data.availableCars}
                  maxValue={data.totalCars}
                  size={48}
                  strokeWidth={4}
                  color="#10b981"
                />
              </div>
            </div>
          </div>

          {/* Booked Cars */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Car className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <Badge variant="blue-subtle" size="sm">{t("cars.rented") || "Rented"}</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{data.bookedCars}</h3>
                  <p className="text-slate-600 font-medium">{t("fleet.currentlyOut") || "Currently out"}</p>
                </div>
                <CircleProgress
                  value={data.bookedCars}
                  maxValue={data.totalCars}
                  size={48}
                  strokeWidth={4}
                  color="#3b82f6"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Cars */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <Badge variant="amber-subtle" size="sm">{t("cars.maintenance") || "Service"}</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{data.maintenanceCars}</h3>
                  <p className="text-slate-600 font-medium">{t("fleet.inMaintenance") || "In maintenance"}</p>
                </div>
                <CircleProgress
                  value={data.maintenanceCars}
                  maxValue={data.totalCars}
                  size={48}
                  strokeWidth={4}
                  color="#f59e0b"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Rentals Section (inside the same card) */}
        {data.carsInUse.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">{t("fleet.activeRentals") || "Active Rentals"}</h2>
                <p className="text-slate-600 mt-1">{t("fleet.activeRentalsDescription") || "Currently rented vehicles and customer details"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="blue-subtle" size="md" icon={<Car className="w-4 h-4" />}>
                  {data.carsInUse.length} {t("fleet.vehicles") || "vehicles"}
                </Badge>
                <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                  {t("buttons.viewAll") || "View all"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              {/* Arrow Buttons */}
              {canScrollLeft && (
                <button
                  aria-label="Scroll left"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg p-2 rounded-full border border-slate-200 transition-colors hidden md:block"
                  style={{ marginLeft: '-24px' }}
                  onClick={() => scrollBy(-320)}
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
              )}
              {canScrollRight && (
                <button
                  aria-label="Scroll right"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg p-2 rounded-full border border-slate-200 transition-colors hidden md:block"
                  style={{ marginRight: '-24px' }}
                  onClick={() => scrollBy(320)}
                >
                  <ArrowRight className="w-5 h-5 text-slate-700" />
                </button>
              )}
              <div
                ref={scrollRef}
                className="flex overflow-x-auto pb-6 gap-4 md:gap-6 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {data.carsInUse.map((car) => (
                  <div
                    key={car.id}
                    className="flex-shrink-0 w-72 md:w-80 snap-start"
                  >
                    <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      {/* Enhanced Car Image Section */}
                      <div className="relative h-40 md:h-48 overflow-hidden">
                        <img
                          src={car.carImage}
                          alt={car.carModel}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="success" size="sm">
                            {t("fleet.inUse") || "In Use"}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <p className="font-mono text-sm opacity-90">{car.licensePlate}</p>
                        </div>
                        <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Enhanced Car Details */}
                      <div className="p-4 md:p-6">
                        <div className="mb-4">
                          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">{car.carModel}</h3>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
                            {car.rentalStartDate && (
                              <span>{t("fleet.since") || "Since"} {formatDate(car.rentalStartDate)}</span>
                            )}
                            {car.estimatedReturn && (
                              <span>• {t("fleet.until") || "Until"} {formatDate(car.estimatedReturn)}</span>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Customer Section */}
                        <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {car.clientAvatar ? (
                              <img
                                src={car.clientAvatar}
                                alt={car.clientName}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm md:text-base font-semibold text-slate-900">{car.clientName}</p>
                              <p className="text-xs md:text-sm text-slate-500">{t("booking.customer") || "Customer"}</p>
                            </div>
                          </div>
                          <a
                            href={`tel:${car.clientPhone}`}
                            className="flex items-center gap-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="hidden md:inline">{t("buttons.call") || "Call"}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarAvailabilityOverview; 