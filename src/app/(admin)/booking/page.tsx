"use client";

import React, { useState, useMemo, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

// Booking interface
interface Booking {
  id: string;
  bookingNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientPhoto: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  licensePlate: string;
  carImage: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  pickupLocation: string;
  dropoffLocation: string;
  insurance: boolean;
  createdAt: string;
}

// Sample booking data
const bookingsData: Booking[] = [
  {
    id: "1",
    bookingNumber: "BK-2024-001",
    clientName: "John Smith",
    clientEmail: "john.smith@email.com",
    clientPhone: "+1 234 567 8900",
    clientPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    carBrand: "Tesla",
    carModel: "Model 3",
    carYear: 2023,
    licensePlate: "TES-123",
    carImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=60&fit=crop",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
    duration: 7,
    totalAmount: 2100,
    paidAmount: 1500,
    remainingAmount: 600,
    status: "active",
    pickupLocation: "Downtown Office",
    dropoffLocation: "Airport Terminal",
    insurance: true,
    createdAt: "2024-01-10"
  },
  {
    id: "2",
    bookingNumber: "BK-2024-002",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.johnson@email.com",
    clientPhone: "+1 234 567 8901",
    clientPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    carBrand: "BMW",
    carModel: "X5",
    carYear: 2022,
    licensePlate: "BMW-789",
    carImage: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=100&h=60&fit=crop",
    startDate: "2024-01-10",
    endDate: "2024-01-13",
    duration: 3,
    totalAmount: 900,
    paidAmount: 900,
    remainingAmount: 0,
    status: "completed",
    pickupLocation: "City Center",
    dropoffLocation: "City Center",
    insurance: false,
    createdAt: "2024-01-05"
  },
  {
    id: "3",
    bookingNumber: "BK-2024-003",
    clientName: "Mike Davis",
    clientEmail: "mike.davis@email.com",
    clientPhone: "+1 234 567 8902",
    clientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    carBrand: "Audi",
    carModel: "A4",
    carYear: 2023,
    licensePlate: "AUD-456",
    carImage: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=100&h=60&fit=crop",
    startDate: "2024-01-20",
    endDate: "2024-02-03",
    duration: 14,
    totalAmount: 4200,
    paidAmount: 2000,
    remainingAmount: 2200,
    status: "confirmed",
    pickupLocation: "Hotel District",
    dropoffLocation: "Business Park",
    insurance: true,
    createdAt: "2024-01-15"
  },
  {
    id: "4",
    bookingNumber: "BK-2024-004",
    clientName: "Emily Wilson",
    clientEmail: "emily.wilson@email.com",
    clientPhone: "+1 234 567 8903",
    clientPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    carBrand: "Mercedes",
    carModel: "C-Class",
    carYear: 2023,
    licensePlate: "MER-321",
    carImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100&h=60&fit=crop",
    startDate: "2024-01-25",
    endDate: "2024-01-28",
    duration: 3,
    totalAmount: 1200,
    paidAmount: 0,
    remainingAmount: 1200,
    status: "pending",
    pickupLocation: "Airport",
    dropoffLocation: "Downtown",
    insurance: true,
    createdAt: "2024-01-20"
  },
  {
    id: "5",
    bookingNumber: "BK-2024-005",
    clientName: "David Brown",
    clientEmail: "david.brown@email.com",
    clientPhone: "+1 234 567 8904",
    clientPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    carBrand: "Toyota",
    carModel: "Camry",
    carYear: 2022,
    licensePlate: "TOY-654",
    carImage: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=100&h=60&fit=crop",
    startDate: "2024-01-18",
    endDate: "2024-01-20",
    duration: 2,
    totalAmount: 400,
    paidAmount: 400,
    remainingAmount: 0,
    status: "cancelled",
    pickupLocation: "Mall",
    dropoffLocation: "Mall",
    insurance: false,
    createdAt: "2024-01-16"
  }
];

export default function BookingPage() {
  const { t } = useTranslation();
  const [bookings] = useState<Booking[]>(bookingsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      const matchesSearch = !searchTerm || 
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.carBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.carModel.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchTerm]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'active').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingPayments = bookings.reduce((sum, b) => sum + b.remainingAmount, 0);

    return { total, active, pending, completed, totalRevenue, pendingPayments };
  }, [bookings]);

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: t('booking.status.pending'),
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
          dot: 'bg-yellow-500'
        };
      case 'confirmed':
        return {
          label: t('booking.status.confirmed'),
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
          dot: 'bg-blue-500'
        };
      case 'active':
        return {
          label: t('booking.status.active'),
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
          dot: 'bg-green-500'
        };
      case 'completed':
        return {
          label: t('booking.status.completed'),
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
          dot: 'bg-gray-500'
        };
      case 'cancelled':
        return {
          label: t('booking.status.cancelled'),
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
          dot: 'bg-red-500'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const handleViewBooking = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('booking.title')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t('booking.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{metrics.total} {t('booking.bookingsCount')}</span>
          </div>
          <Button 
            variant="default" 
            className="px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('booking.newBooking')}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Bookings */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('booking.metrics.total')}</p>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="group relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{metrics.active}</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-500">{t('booking.metrics.active')}</p>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="group relative overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{metrics.pending}</p>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">{t('booking.metrics.pending')}</p>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{metrics.completed}</p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-500">{t('booking.metrics.completed')}</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">{t('booking.metrics.revenue')}</p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="group relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">${metrics.pendingPayments.toLocaleString()}</p>
            <p className="text-sm font-medium text-red-600 dark:text-red-500">{t('booking.metrics.pendingPayments')}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('booking.filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('booking.filters.allStatus')}</option>
              <option value="pending">{t('booking.status.pending')}</option>
              <option value="confirmed">{t('booking.status.confirmed')}</option>
              <option value="active">{t('booking.status.active')}</option>
              <option value="completed">{t('booking.status.completed')}</option>
              <option value="cancelled">{t('booking.status.cancelled')}</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('booking.filters.showing', { showing: filteredBookings.length, total: bookings.length })}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.booking')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.client')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.vehicle')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.duration')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.amount')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('booking.table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {booking.bookingNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={booking.clientPhoto} 
                          alt={booking.clientName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.clientName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.clientPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={booking.carImage} 
                          alt={`${booking.carBrand} ${booking.carModel}`} 
                          className="w-16 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.carBrand} {booking.carModel}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.licensePlate} • {booking.carYear}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.duration} days
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${booking.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs">
                          <span className="text-green-600 dark:text-green-400">
                            Paid: ${booking.paidAmount.toLocaleString()}
                          </span>
                          {booking.remainingAmount > 0 && (
                            <span className="text-red-600 dark:text-red-400 block">
                              Due: ${booking.remainingAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border",
                          statusConfig.className
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)} />
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBooking(booking)}
                          className="px-3 py-1 text-xs"
                        >
                          {t('booking.actions.view')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 py-1 text-xs"
                        >
                          {t('booking.actions.edit')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-4xl w-full p-0">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('booking.modal.title')}
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border",
                  getStatusConfig(selectedBooking.status).className
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedBooking.status).dot)} />
                {getStatusConfig(selectedBooking.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('booking.modal.clientInfo')}</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedBooking.clientPhoto} 
                      alt={selectedBooking.clientName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.clientName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedBooking.clientEmail}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Phone: {selectedBooking.clientPhone}
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('booking.modal.vehicleInfo')}</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedBooking.carImage} 
                      alt={`${selectedBooking.carBrand} ${selectedBooking.carModel}`} 
                      className="w-20 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedBooking.carBrand} {selectedBooking.carModel}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedBooking.licensePlate} • {selectedBooking.carYear}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('booking.modal.bookingDetails')}</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.bookingNumber')}:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedBooking.bookingNumber}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.duration')}:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedBooking.duration} {t('booking.modal.days')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.startDate')}:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedBooking.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.endDate')}:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedBooking.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.pickup')}:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedBooking.pickupLocation}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.dropoff')}:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedBooking.dropoffLocation}
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('booking.modal.paymentInfo')}</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                                          <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.totalAmount')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${selectedBooking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.paidAmount')}:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${selectedBooking.paidAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.remaining')}:</span>
                        <span className={cn(
                          "font-semibold",
                          selectedBooking.remainingAmount > 0 
                            ? "text-red-600 dark:text-red-400" 
                            : "text-green-600 dark:text-green-400"
                        )}>
                          ${selectedBooking.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('booking.modal.fields.insurance')}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedBooking.insurance ? t('booking.modal.included') : t('booking.modal.notIncluded')}
                        </span>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                {t('booking.modal.buttons.close')}
              </Button>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                {t('booking.modal.buttons.edit')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 