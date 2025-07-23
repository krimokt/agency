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
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.title") || "Car Rental Dashboard"}
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
            {t("dashboard.overview") || "Monitor your fleet performance and manage bookings"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={goToCarsPage} size="sm" className="w-full sm:w-auto">
            {t("buttons.manageCars") || "Manage Cars"}
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Available Cars */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl dark:bg-gray-800">
            <BoxIconLine className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-4 md:mt-5">
            <div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.availableCars") || "Available Cars"}
              </span>
              <h4 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                {metrics.availableCars}
              </h4>
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl dark:bg-gray-800">
            <PaperPlaneIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-4 md:mt-5">
            <div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.activeBookings") || "Active Bookings"}
              </span>
              <h4 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                {metrics.activeBookings}
              </h4>
            </div>
          </div>
        </div>

        {/* Total Cars */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl dark:bg-gray-800">
            <DocsIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-4 md:mt-5">
            <div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.totalCars") || "Total Cars"}
              </span>
              <h4 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                {metrics.totalCars}
              </h4>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl dark:bg-gray-800">
            <DollarLineIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-4 md:mt-5">
            <div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.totalRevenue") || "Total Revenue"}
              </span>
              <h4 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white/90">
                ${metrics.totalRevenue.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Car Availability Overview */}
      <div className="w-full">
        <CarAvailabilityOverview />
      </div>
    </div>
  );
} 