"use client";

import React, { useState, useMemo, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import AddClientModal from "@/components/form/AddClientModal";
import QRCodeGenerator from "@/components/qr/QRCodeGenerator";

// Client interface
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto: string;
  dateOfBirth: string;
  licenseNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  joinDate: string;
  status: "active" | "inactive" | "blocked" | "pending";
  totalBookings: number;
  totalSpent: number;
  lastRental: {
    bookingId: string;
    carModel: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: "completed" | "active" | "cancelled";
  } | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
}

// Sample client data
const clientsData: Client[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+1 234 567 8900",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    dateOfBirth: "1985-03-15",
    licenseNumber: "DL123456789",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    joinDate: "2023-01-15",
    status: "active",
    totalBookings: 8,
    totalSpent: 12500,
    lastRental: {
      bookingId: "BK-2024-001",
      carModel: "Tesla Model 3",
      startDate: "2024-01-15",
      endDate: "2024-01-22",
      amount: 2100,
      status: "active"
    },
    emergencyContact: {
      name: "Jane Smith",
      phone: "+1 234 567 8901",
      relationship: "Spouse"
    },
    notes: "Preferred customer, always pays on time."
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 234 567 8901",
    profilePhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    dateOfBirth: "1990-07-22",
    licenseNumber: "DL987654321",
    address: {
      street: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    joinDate: "2023-03-20",
    status: "active",
    totalBookings: 5,
    totalSpent: 7800,
    lastRental: {
      bookingId: "BK-2024-002",
      carModel: "BMW X5",
      startDate: "2024-01-10",
      endDate: "2024-01-13",
      amount: 900,
      status: "completed"
    },
    emergencyContact: {
      name: "Mike Johnson",
      phone: "+1 234 567 8902",
      relationship: "Brother"
    },
    notes: "Corporate client, requires invoices."
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@email.com",
    phone: "+1 234 567 8902",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    dateOfBirth: "1982-11-08",
    licenseNumber: "DL456789123",
    address: {
      street: "789 Pine Road",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    joinDate: "2022-11-10",
    status: "active",
    totalBookings: 12,
    totalSpent: 18750,
    lastRental: {
      bookingId: "BK-2024-003",
      carModel: "Audi A4",
      startDate: "2024-01-20",
      endDate: "2024-02-03",
      amount: 4200,
      status: "completed"
    },
    emergencyContact: {
      name: "Lisa Davis",
      phone: "+1 234 567 8903",
      relationship: "Spouse"
    },
    notes: "VIP customer, frequent business traveler."
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Wilson",
    email: "emily.wilson@email.com",
    phone: "+1 234 567 8903",
    profilePhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    dateOfBirth: "1995-02-14",
    licenseNumber: "DL789123456",
    address: {
      street: "321 Elm Street",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "USA"
    },
    joinDate: "2023-08-05",
    status: "pending",
    totalBookings: 1,
    totalSpent: 450,
    lastRental: {
      bookingId: "BK-2024-004",
      carModel: "Mercedes C-Class",
      startDate: "2024-01-25",
      endDate: "2024-01-28",
      amount: 1200,
      status: "active"
    },
    emergencyContact: {
      name: "Robert Wilson",
      phone: "+1 234 567 8904",
      relationship: "Father"
    },
    notes: "New customer, document verification pending."
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@email.com",
    phone: "+1 234 567 8904",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    dateOfBirth: "1978-09-30",
    licenseNumber: "DL321654987",
    address: {
      street: "654 Maple Lane",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA"
    },
    joinDate: "2023-05-18",
    status: "inactive",
    totalBookings: 3,
    totalSpent: 1850,
    lastRental: {
      bookingId: "BK-2024-005",
      carModel: "Toyota Camry",
      startDate: "2024-01-18",
      endDate: "2024-01-20",
      amount: 400,
      status: "cancelled"
    },
    emergencyContact: {
      name: "Susan Brown",
      phone: "+1 234 567 8905",
      relationship: "Spouse"
    },
    notes: "Had payment issues in the past."
  }
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrClient, setQrClient] = useState<{ id?: string; name?: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesStatus = !statusFilter || client.status === statusFilter;
      const matchesSearch = !searchTerm || 
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);
      
      return matchesStatus && matchesSearch;
    });
  }, [clients, statusFilter, searchTerm]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const pending = clients.filter(c => c.status === 'pending').length;
    const inactive = clients.filter(c => c.status === 'inactive').length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgBookings = clients.length > 0 ? clients.reduce((sum, c) => sum + c.totalBookings, 0) / clients.length : 0;

    return { total, active, pending, inactive, totalRevenue, avgBookings };
  }, [clients]);

  const getStatusConfig = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
          dot: 'bg-green-500'
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
          dot: 'bg-yellow-500'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
          dot: 'bg-gray-500'
        };
      case 'blocked':
        return {
          label: 'Blocked',
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

  const handleViewClient = useCallback((client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClient(null);
  }, []);

  const handleAddClient = useCallback((clientData: any) => {
    const newClient: Client = {
      id: Date.now().toString(),
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      phone: clientData.phone,
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      dateOfBirth: clientData.dateOfBirth,
      licenseNumber: clientData.licenseNumber,
      address: clientData.address,
      joinDate: new Date().toISOString().split('T')[0],
      status: "active",
      totalBookings: 0,
      totalSpent: 0,
      lastRental: null,
      emergencyContact: clientData.emergencyContact,
      notes: clientData.notes,
    };
    
    setClients(prev => [newClient, ...prev]);
    setIsAddClientModalOpen(false);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Client Management
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Manage your client database and rental history
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-sm font-medium">{metrics.total} Clients</span>
          </div>
          <Button 
            onClick={() => setIsAddClientModalOpen(true)}
            variant="default" 
            className="px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </Button>
          <Button 
            onClick={() => { setQrClient({}); setIsQRModalOpen(true); }}
            variant="outline"
            className="px-6 py-3 h-auto"
          >
            📱 Generate QR (new client)
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Clients */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
          </div>
        </div>

        {/* Active Clients */}
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

        {/* Pending Clients */}
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
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">Pending</p>
          </div>
        </div>

        {/* Inactive Clients */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:border-gray-800 dark:from-gray-900/20 dark:to-gray-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900/30 group-hover:bg-gray-200 dark:group-hover:bg-gray-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">{metrics.inactive}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Inactive</p>
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
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Revenue</p>
          </div>
        </div>

        {/* Average Bookings */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{metrics.avgBookings.toFixed(1)}</p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-500">Avg Bookings</p>
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
                placeholder="Search clients..."
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
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Rental Stats
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Last Rental
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
              {filteredClients.map((client) => {
                const statusConfig = getStatusConfig(client.status);
                return (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={client.profilePhoto} 
                          alt={`${client.firstName} ${client.lastName}`} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {client.firstName} {client.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {client.id} • Since {new Date(client.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.address.city}, {client.address.state}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {client.address.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {client.totalBookings} bookings
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          ${client.totalSpent.toLocaleString()} spent
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.lastRental ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.lastRental.carModel}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(client.lastRental.startDate).toLocaleDateString()} - ${client.lastRental.amount}
                          </div>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-xs px-2 py-0.5",
                              client.lastRental.status === 'completed' && "bg-green-100 text-green-700 border-green-200",
                              client.lastRental.status === 'active' && "bg-blue-100 text-blue-700 border-blue-200",
                              client.lastRental.status === 'cancelled' && "bg-red-100 text-red-700 border-red-200"
                            )}
                          >
                            {client.lastRental.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No rentals
                        </div>
                      )}
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
                          onClick={() => handleViewClient(client)}
                          className="px-3 py-1 text-xs"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 py-1 text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setQrClient({ id: client.id, name: `${client.firstName} ${client.lastName}` }); setIsQRModalOpen(true); }}
                          className="px-3 py-1 text-xs"
                        >
                          QR
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

      {/* Client Details Modal */}
      {isModalOpen && selectedClient && (
        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-4xl w-full p-0">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Client Profile
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border",
                  getStatusConfig(selectedClient.status).className
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedClient.status).dot)} />
                {getStatusConfig(selectedClient.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={selectedClient.profilePhoto} 
                      alt={`${selectedClient.firstName} ${selectedClient.lastName}`} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-lg">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Client ID: {selectedClient.id}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedClient.email}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedClient.phone}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Date of Birth:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedClient.dateOfBirth).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">License Number:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedClient.licenseNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Join Date:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedClient.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Address & Contact</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Address:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedClient.address.street}<br/>
                      {selectedClient.address.city}, {selectedClient.address.state} {selectedClient.address.zipCode}<br/>
                      {selectedClient.address.country}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Emergency Contact:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedClient.emergencyContact.name}<br/>
                      <span className="text-sm">{selectedClient.emergencyContact.phone}</span><br/>
                      <span className="text-xs text-gray-500">{selectedClient.emergencyContact.relationship}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Statistics */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Rental Statistics</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Bookings:</span>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedClient.totalBookings}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Spent:</span>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${selectedClient.totalSpent.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Average per Booking:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${selectedClient.totalBookings > 0 ? Math.round(selectedClient.totalSpent / selectedClient.totalBookings).toLocaleString() : 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Rental Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Last Rental</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  {selectedClient.lastRental ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Vehicle:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedClient.lastRental.carModel}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(selectedClient.lastRental.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">End Date:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(selectedClient.lastRental.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Amount:</span>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ${selectedClient.lastRental.amount.toLocaleString()}
                          </div>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "text-xs px-2 py-1",
                            selectedClient.lastRental.status === 'completed' && "bg-green-100 text-green-700 border-green-200",
                            selectedClient.lastRental.status === 'active' && "bg-blue-100 text-blue-700 border-blue-200",
                            selectedClient.lastRental.status === 'cancelled' && "bg-red-100 text-red-700 border-red-200"
                          )}
                        >
                          {selectedClient.lastRental.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No rental history available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedClient.notes && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedClient.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Edit Client
              </Button>
              <Button variant="secondary" className="bg-green-600 hover:bg-green-700 text-white">
                New Booking
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSubmit={handleAddClient}
      />

      {/* QR Code Modal */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} className="max-w-md w-full p-0">
        <div className="p-4">
          <QRCodeGenerator
            clientId={qrClient?.id || ""}
            clientName={qrClient?.name}
            onClose={() => setIsQRModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
} 