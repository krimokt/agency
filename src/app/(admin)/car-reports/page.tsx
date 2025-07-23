"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import BarChartOne from '@/components/charts/bar/BarChartOne';
import PieChartOne from '@/components/charts/pie/PieChartOne';
import { useTranslation } from '@/hooks/useTranslation';

// Define types
interface CarFinancialData {
  id: string;
  name: string;
  model: string;
  plateNumber: string;
  revenue: number;
  maintenanceCost: number;
  insuranceCost: number;
  otherCosts: number;
  staffSalaryShare: number; // Added staff salary allocation per car
  totalCost: number;
  profit: number;
}

const CarReportsPage = () => {
  const { t } = useTranslation();
  
  // State for filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [notes, setNotes] = useState<string>('');
  
  // Sample data
  const cars: CarFinancialData[] = [
    {
      id: 'car-001',
      name: 'Toyota',
      model: 'Camry',
      plateNumber: 'ABC-123',
      revenue: 25000,
      maintenanceCost: 3500,
      insuranceCost: 1200,
      otherCosts: 800,
      staffSalaryShare: 4000, // Staff salary allocation for this car
      totalCost: 9500, // Updated to include staff salary
      profit: 15500, // Updated profit calculation
    },
    {
      id: 'car-002',
      name: 'Dacia',
      model: 'Logan',
      plateNumber: 'XYZ-456',
      revenue: 18000,
      maintenanceCost: 2800,
      insuranceCost: 900,
      otherCosts: 600,
      staffSalaryShare: 3500, // Staff salary allocation for this car
      totalCost: 7800, // Updated to include staff salary
      profit: 10200, // Updated profit calculation
    },
    {
      id: 'car-003',
      name: 'Tesla',
      model: 'Model 3',
      plateNumber: 'ELT-789',
      revenue: 35000,
      maintenanceCost: 2000,
      insuranceCost: 1800,
      otherCosts: 1200,
      staffSalaryShare: 5500, // Staff salary allocation for this car
      totalCost: 10500, // Updated to include staff salary
      profit: 24500, // Updated profit calculation
    },
    {
      id: 'car-004',
      name: 'Ford',
      model: 'F-150',
      plateNumber: 'TRK-012',
      revenue: 28000,
      maintenanceCost: 4200,
      insuranceCost: 1500,
      otherCosts: 900,
      staffSalaryShare: 4500, // Staff salary allocation for this car
      totalCost: 11100, // Updated to include staff salary
      profit: 16900, // Updated profit calculation
    },
    {
      id: 'car-005',
      name: 'Honda',
      model: 'Civic',
      plateNumber: 'HND-345',
      revenue: 22000,
      maintenanceCost: 2500,
      insuranceCost: 1100,
      otherCosts: 700,
      staffSalaryShare: 3800, // Staff salary allocation for this car
      totalCost: 8100, // Updated to include staff salary
      profit: 13900, // Updated profit calculation
    },
  ];

  // Filter cars based on selection
  const filteredCars = selectedCar === 'all' 
    ? cars 
    : cars.filter(car => car.id === selectedCar);

  // Calculate summary data
  const summaryData = {
    totalRevenue: filteredCars.reduce((sum, car) => sum + car.revenue, 0),
    totalMaintenanceCost: filteredCars.reduce((sum, car) => sum + car.maintenanceCost, 0),
    totalInsuranceCost: filteredCars.reduce((sum, car) => sum + car.insuranceCost, 0),
    totalOtherCosts: filteredCars.reduce((sum, car) => sum + car.otherCosts, 0),
    totalStaffSalary: filteredCars.reduce((sum, car) => sum + car.staffSalaryShare, 0),
    totalCost: filteredCars.reduce((sum, car) => sum + car.totalCost, 0),
    totalProfit: filteredCars.reduce((sum, car) => sum + car.profit, 0),
  };

  // Chart data for Revenue vs Costs
  const barChartData = {
    labels: filteredCars.map(car => `${car.name} ${car.model}`),
    datasets: [
      {
        label: t('carReports.charts.revenue'),
        data: filteredCars.map(car => car.revenue),
        backgroundColor: '#2563EB',
      },
      {
        label: t('carReports.charts.totalCosts'),
        data: filteredCars.map(car => car.totalCost),
        backgroundColor: '#EF4444',
      },
      {
        label: t('carReports.charts.profit'),
        data: filteredCars.map(car => car.profit),
        backgroundColor: '#10B981',
      },
    ],
  };

  // Pie chart data for cost breakdown
  const pieChartData = {
    labels: [
      t('carReports.charts.maintenance'),
      t('carReports.charts.insurance'),
      t('carReports.charts.staffSalary'),
      t('carReports.charts.other'),
      t('carReports.charts.profit')
    ],
    datasets: [
      {
        data: [
          summaryData.totalMaintenanceCost,
          summaryData.totalInsuranceCost,
          summaryData.totalStaffSalary,
          summaryData.totalOtherCosts,
          summaryData.totalProfit,
        ],
        backgroundColor: ['#F59E0B', '#8B5CF6', '#3B82F6', '#EC4899', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'pdf') => {
    alert(`${t('carReports.alerts.exporting')} ${format.toUpperCase()}...`);
    // Implementation would go here
  };

  return (
    <>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Page Title & Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('carReports.title')}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('carReports.subtitle')}
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:mt-0 sm:flex-row sm:items-center sm:gap-3">
              <Button 
                onClick={() => handleExport('csv')}
                className="mb-2 sm:mb-0 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                {t('carReports.buttons.exportCSV')}
              </Button>
              <Button 
                onClick={() => handleExport('pdf')}
                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                {t('carReports.buttons.exportPDF')}
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="dateStart" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('carReports.filters.dateRange')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="dateStart"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 dark:text-gray-400">{t('carReports.filters.to')}</span>
                <input
                  type="date"
                  id="dateEnd"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <label htmlFor="carSelect" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('carReports.filters.selectCar')}
              </label>
              <select
                id="carSelect"
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('carReports.filters.allCars')}</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} {car.model} ({car.plateNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total Revenue */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('carReports.metrics.totalRevenue')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Maintenance Cost */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('carReports.metrics.maintenanceCost')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalMaintenanceCost)}</p>
              </div>
            </div>
          </div>

          {/* Insurance Cost */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('carReports.metrics.insuranceCost')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalInsuranceCost)}</p>
              </div>
            </div>
          </div>

          {/* Staff Salary */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('carReports.metrics.staffSalary')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalStaffSalary)}</p>
              </div>
            </div>
          </div>

          {/* Profit */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('carReports.metrics.totalProfit')}</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summaryData.totalProfit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('carReports.charts.revenueVsCosts')}</h3>
            <div className="h-80">
              <BarChartOne data={barChartData} />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('carReports.charts.costBreakdown')}</h3>
            <div className="h-80">
              <PieChartOne data={pieChartData} />
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('carReports.table.title')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.car')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.plateNumber')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.revenue')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.maintenance')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.insurance')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.otherCosts')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.staffSalary')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.totalCost')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t('carReports.table.profit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((car) => (
                    <tr key={car.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/25">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {car.name} {car.model}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{car.plateNumber}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(car.revenue)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(car.maintenanceCost)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(car.insuranceCost)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(car.otherCosts)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(car.staffSalaryShare)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(car.totalCost)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-green-600 dark:text-green-400">{formatCurrency(car.profit)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 font-medium">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white" colSpan={2}>{t('carReports.table.totals')}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatCurrency(summaryData.totalRevenue)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatCurrency(summaryData.totalMaintenanceCost)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatCurrency(summaryData.totalInsuranceCost)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatCurrency(summaryData.totalOtherCosts)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatCurrency(summaryData.totalStaffSalary)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatCurrency(summaryData.totalCost)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-green-600 dark:text-green-400">{formatCurrency(summaryData.totalProfit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Notes Area */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{t('carReports.notes.title')}</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('carReports.notes.placeholder')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="mt-4 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">
              {t('carReports.buttons.saveNotes')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarReportsPage; 