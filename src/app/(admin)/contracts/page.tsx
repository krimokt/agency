"use client";

import React, { useState, useMemo, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

// Contract interface
interface Contract {
  id: string;
  contractNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  carId: string;
  carModel: string;
  carPlateNumber: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paidAmount: number;
  status: "active" | "completed" | "cancelled" | "expired";
  contractType: "daily" | "weekly" | "monthly";
  insurance: boolean;
  deposit: number;
  terms: string[];
  signedDate: string;
  documentUrl: string;
  notes: string;
}

// Sample contract data
const contractsData: Contract[] = [
  {
    id: "1",
    contractNumber: "CT-2024-001",
    clientId: "CL-001",
    clientName: "John Smith",
    clientEmail: "john.smith@email.com",
    carId: "CAR-001",
    carModel: "Tesla Model 3",
    carPlateNumber: "ABC-123",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
    totalAmount: 2100,
    paidAmount: 2100,
    status: "active",
    contractType: "daily",
    insurance: true,
    deposit: 500,
    terms: [
      "Vehicle must be returned in the same condition",
      "Fuel level must match pickup level",
      "No smoking in the vehicle",
      "Maximum 200 miles per day"
    ],
    signedDate: "2024-01-14",
    documentUrl: "/contracts/CT-2024-001.pdf",
    notes: "Client requested early pickup at 8 AM"
  },
  {
    id: "2",
    contractNumber: "CT-2024-002",
    clientId: "CL-002",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.johnson@email.com",
    carId: "CAR-002",
    carModel: "BMW X5",
    carPlateNumber: "XYZ-789",
    startDate: "2024-01-10",
    endDate: "2024-01-13",
    totalAmount: 900,
    paidAmount: 900,
    status: "completed",
    contractType: "daily",
    insurance: false,
    deposit: 300,
    terms: [
      "Standard rental terms apply",
      "Client has own insurance coverage"
    ],
    signedDate: "2024-01-09",
    documentUrl: "/contracts/CT-2024-002.pdf",
    notes: "Completed successfully, vehicle returned on time"
  },
  {
    id: "3",
    contractNumber: "CT-2024-003",
    clientId: "CL-003",
    clientName: "Mike Davis",
    clientEmail: "mike.davis@email.com",
    carId: "CAR-003",
    carModel: "Audi A4",
    carPlateNumber: "DEF-456",
    startDate: "2024-01-20",
    endDate: "2024-02-03",
    totalAmount: 4200,
    paidAmount: 2100,
    status: "active",
    contractType: "weekly",
    insurance: true,
    deposit: 800,
    terms: [
      "Extended rental period",
      "Weekly rate applies",
      "Insurance included",
      "Unlimited mileage"
    ],
    signedDate: "2024-01-19",
    documentUrl: "/contracts/CT-2024-003.pdf",
    notes: "Business client, requires monthly invoice"
  },
  {
    id: "4",
    contractNumber: "CT-2024-004",
    clientId: "CL-004",
    clientName: "Emily Wilson",
    clientEmail: "emily.wilson@email.com",
    carId: "CAR-004",
    carModel: "Mercedes C-Class",
    carPlateNumber: "GHI-789",
    startDate: "2024-01-25",
    endDate: "2024-01-28",
    totalAmount: 1200,
    paidAmount: 600,
    status: "active",
    contractType: "daily",
    insurance: true,
    deposit: 400,
    terms: [
      "Standard daily rental",
      "Insurance coverage included",
      "GPS navigation included"
    ],
    signedDate: "2024-01-24",
    documentUrl: "/contracts/CT-2024-004.pdf",
    notes: "First-time customer, provided extra orientation"
  },
  {
    id: "5",
    contractNumber: "CT-2024-005",
    clientId: "CL-005",
    clientName: "David Brown",
    clientEmail: "david.brown@email.com",
    carId: "CAR-005",
    carModel: "Toyota Camry",
    carPlateNumber: "JKL-012",
    startDate: "2024-01-18",
    endDate: "2024-01-20",
    totalAmount: 400,
    paidAmount: 0,
    status: "cancelled",
    contractType: "daily",
    insurance: false,
    deposit: 200,
    terms: [
      "Basic rental terms",
      "No insurance coverage"
    ],
    signedDate: "2024-01-17",
    documentUrl: "/contracts/CT-2024-005.pdf",
    notes: "Cancelled due to client emergency"
  }
];

export default function ContractsPage() {
  const [contracts] = useState<Contract[]>(contractsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesStatus = !statusFilter || contract.status === statusFilter;
      const matchesSearch = !searchTerm || 
        contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.carModel.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [contracts, statusFilter, searchTerm]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const cancelled = contracts.filter(c => c.status === 'cancelled').length;
    const totalRevenue = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
    const totalPaid = contracts.reduce((sum, c) => sum + c.paidAmount, 0);
    const pendingAmount = totalRevenue - totalPaid;

    return { total, active, completed, cancelled, totalRevenue, totalPaid, pendingAmount };
  }, [contracts]);

  const getStatusConfig = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
          dot: 'bg-green-500'
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
          dot: 'bg-blue-500'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
          dot: 'bg-red-500'
        };
      case 'expired':
        return {
          label: 'Expired',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
          dot: 'bg-gray-500'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const handleViewContract = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  }, []);

  const handleDownloadContract = useCallback((contract: Contract) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = contract.documentUrl;
    link.download = `${contract.contractNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedContract(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Contract Management
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Manage client contracts and rental agreements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium">{metrics.total} Contracts</span>
          </div>
          <Button 
            variant="default" 
            className="px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Contract
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Contracts */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contracts</p>
          </div>
        </div>

        {/* Active Contracts */}
        <div className="group relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{metrics.active}</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-500">Active</p>
          </div>
        </div>

        {/* Completed Contracts */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{metrics.completed}</p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-500">Completed</p>
          </div>
        </div>

        {/* Cancelled Contracts */}
        <div className="group relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{metrics.cancelled}</p>
            <p className="text-sm font-medium text-red-600 dark:text-red-500">Cancelled</p>
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
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Total Revenue</p>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="group relative overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">${metrics.pendingAmount.toLocaleString()}</p>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">Pending</p>
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
                placeholder="Search contracts..."
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
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredContracts.length} of {contracts.length} contracts
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContracts.map((contract) => {
                const statusConfig = getStatusConfig(contract.status);
                return (
                  <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {contract.contractNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Signed: {new Date(contract.signedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contract.clientName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {contract.clientEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contract.carModel}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {contract.carPlateNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {contract.contractType} rental
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${contract.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Paid: ${contract.paidAmount.toLocaleString()}
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
                          onClick={() => handleViewContract(contract)}
                          className="px-3 py-1 text-xs"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadContract(contract)}
                          className="px-3 py-1 text-xs"
                        >
                          Download
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

      {/* Contract Details Modal */}
      {isModalOpen && selectedContract && (
        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-4xl w-full p-0">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contract Details
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border",
                  getStatusConfig(selectedContract.status).className
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedContract.status).dot)} />
                {getStatusConfig(selectedContract.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Contract Number:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.contractNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Contract Type:</span>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {selectedContract.contractType} Rental
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Signed Date:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedContract.signedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Insurance:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.insurance ? 'Included' : 'Not Included'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Deposit:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${selectedContract.deposit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Client Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Client Name:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.clientName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Client ID:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.clientId}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.clientEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.carModel}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Plate Number:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.carPlateNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Vehicle ID:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.carId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${selectedContract.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Paid Amount:</span>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${selectedContract.paidAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${(selectedContract.totalAmount - selectedContract.paidAmount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Rental Period</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedContract.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">End Date:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedContract.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Terms and Conditions</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  {selectedContract.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Notes */}
            {selectedContract.notes && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedContract.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDownloadContract(selectedContract)}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Download Contract
              </Button>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Edit Contract
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 