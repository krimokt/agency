"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  BoxIconLine, 
  GroupIcon, 
  PaperPlaneIcon,
  DollarLineIcon,
  DocsIcon,
} from "@/icons";

import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import CarAvailabilityOverview from '@/components/ecommerce/CarAvailabilityOverview';

// Define the type for car rental metrics
interface CarRentalMetrics {
  availableCars: number;
  activeBookings: number;
  totalCars: number;
  totalRevenue: number;
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const [metrics] = useState<CarRentalMetrics>({
    availableCars: 24,
    activeBookings: 12,
    totalCars: 35,
    totalRevenue: 15800
  });
  const router = useRouter();
  
  const goToCarsPage = () => router.push('/cars');
  const goToBookingsPage = () => router.push('/booking');

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t("navigation.dashboard")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
            {t("carReports.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={goToCarsPage} size="sm" className="w-full sm:w-auto">
            {t("buttons.manageCars")}
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 mb-6">
        {/* Available Cars */}
        <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <BoxIconLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-3 sm:mt-4">
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("cars.status.available")}
              </span>
              <h4 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                {metrics.availableCars}
              </h4>
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <PaperPlaneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-3 sm:mt-4">
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("cars.status.booked")}
              </span>
              <h4 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                {metrics.activeBookings}
              </h4>
            </div>
          </div>
        </div>

        {/* Total Cars */}
        <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <DocsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-3 sm:mt-4">
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("cars.status.maintenance")}
              </span>
              <h4 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                {metrics.totalCars}
              </h4>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <DollarLineIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-3 sm:mt-4">
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("carReports.metrics.totalRevenue")}
              </span>
              <h4 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                ${metrics.totalRevenue.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Car Availability Overview */}
      <div className="w-full overflow-hidden">
        <CarAvailabilityOverview />
      </div>
    </div>
  );
} 