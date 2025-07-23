"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Payment interface
interface Payment {
  id: string;
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientPhoto: string;
  carModel: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "paid" | "partial" | "overdue" | "pending";
  paymentMethod: "credit_card" | "cash" | "bank_transfer" | "debit_card";
  paymentHistory: {
    id: string;
    amount: number;
    date: string;
    method: string;
    transactionId: string;
    status: "completed" | "failed" | "pending";
  }[];
  invoiceNumber: string;
  createdAt: string;
  lastPaymentDate?: string;
}

// Sample payment data
const paymentsData: Payment[] = [
  {
    id: "1",
    bookingId: "BK-2024-001",
    clientName: "John Smith",
    clientEmail: "john.smith@email.com",
    clientPhone: "+1 234 567 8900",
    clientPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    carModel: "Tesla Model 3",
    totalAmount: 2100,
    paidAmount: 1500,
    remainingAmount: 600,
    dueDate: "2024-01-25",
    status: "partial",
    paymentMethod: "credit_card",
    paymentHistory: [
      {
        id: "py1",
        amount: 1000,
        date: "2024-01-10",
        method: "Credit Card",
        transactionId: "TXN-001",
        status: "completed"
      },
      {
        id: "py2",
        amount: 500,
        date: "2024-01-15",
        method: "Credit Card",
        transactionId: "TXN-002",
        status: "completed"
      }
    ],
    invoiceNumber: "INV-2024-001",
    createdAt: "2024-01-10",
    lastPaymentDate: "2024-01-15"
  },
  {
    id: "2",
    bookingId: "BK-2024-002",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.johnson@email.com",
    clientPhone: "+1 234 567 8901",
    clientPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    carModel: "BMW X5",
    totalAmount: 900,
    paidAmount: 900,
    remainingAmount: 0,
    dueDate: "2024-01-13",
    status: "paid",
    paymentMethod: "bank_transfer",
    paymentHistory: [
      {
        id: "py3",
        amount: 900,
        date: "2024-01-08",
        method: "Bank Transfer",
        transactionId: "TXN-003",
        status: "completed"
      }
    ],
    invoiceNumber: "INV-2024-002",
    createdAt: "2024-01-05",
    lastPaymentDate: "2024-01-08"
  },
  {
    id: "3",
    bookingId: "BK-2024-003",
    clientName: "Mike Davis",
    clientEmail: "mike.davis@email.com",
    clientPhone: "+1 234 567 8902",
    clientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    carModel: "Audi A4",
    totalAmount: 4200,
    paidAmount: 2000,
    remainingAmount: 2200,
    dueDate: "2024-01-18",
    status: "overdue",
    paymentMethod: "credit_card",
    paymentHistory: [
      {
        id: "py4",
        amount: 2000,
        date: "2024-01-12",
        method: "Credit Card",
        transactionId: "TXN-004",
        status: "completed"
      }
    ],
    invoiceNumber: "INV-2024-003",
    createdAt: "2024-01-15",
    lastPaymentDate: "2024-01-12"
  },
  {
    id: "4",
    bookingId: "BK-2024-004",
    clientName: "Emily Wilson",
    clientEmail: "emily.wilson@email.com",
    clientPhone: "+1 234 567 8903",
    clientPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    carModel: "Mercedes C-Class",
    totalAmount: 1200,
    paidAmount: 0,
    remainingAmount: 1200,
    dueDate: "2024-01-28",
    status: "pending",
    paymentMethod: "credit_card",
    paymentHistory: [],
    invoiceNumber: "INV-2024-004",
    createdAt: "2024-01-20"
  },
  {
    id: "5",
    bookingId: "BK-2024-005",
    clientName: "David Brown",
    clientEmail: "david.brown@email.com",
    clientPhone: "+1 234 567 8904",
    clientPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    carModel: "Toyota Camry",
    totalAmount: 400,
    paidAmount: 200,
    remainingAmount: 200,
    dueDate: "2024-01-15",
    status: "overdue",
    paymentMethod: "cash",
    paymentHistory: [
      {
        id: "py5",
        amount: 200,
        date: "2024-01-16",
        method: "Cash",
        transactionId: "CASH-001",
        status: "completed"
      }
    ],
    invoiceNumber: "INV-2024-005",
    createdAt: "2024-01-16",
    lastPaymentDate: "2024-01-16"
  }
];

export default function PaymentPage() {
  const { localData, addPayment, updatePayment } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(paymentsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  // New payment form state
  const [newClientName, setNewClientName] = useState<string>('');
  const [newBookingId, setNewBookingId] = useState<string>('');
  const [newCarModel, setNewCarModel] = useState<string>('');
  const [newTotalAmount, setNewTotalAmount] = useState<number>(0);
  
  // Sync with local data if available
  useEffect(() => {
    if (localData.payments && localData.payments.length > 0) {
      // Merge local data with sample data, prioritizing local data
      const localPaymentIds = localData.payments.map(p => p.id);
      const filteredSampleData = paymentsData.filter(p => !localPaymentIds.includes(p.id));
      
      // Convert local payments to the Payment type
      const typedLocalPayments = localData.payments.map(p => ({
        id: p.id,
        bookingId: p.bookingId || "",
        clientName: p.clientName || "",
        clientEmail: p.clientEmail || "",
        clientPhone: p.clientPhone || "",
        clientPhoto: p.clientPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        carModel: p.carModel || "",
        totalAmount: p.totalAmount || 0,
        paidAmount: p.paidAmount || 0,
        remainingAmount: p.remainingAmount || 0,
        dueDate: p.dueDate || new Date().toISOString(),
        status: p.status as any || "pending",
        paymentMethod: p.paymentMethod as any || "credit_card",
        paymentHistory: p.paymentHistory || [],
        invoiceNumber: p.invoiceNumber || `INV-${Date.now()}`,
        createdAt: p.createdAt || new Date().toISOString(),
        lastPaymentDate: p.lastPaymentDate
      }));
      
      setPayments([...typedLocalPayments, ...filteredSampleData]);
    }
  }, [localData.payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesStatus = !statusFilter || payment.status === statusFilter;
      const matchesSearch = !searchTerm || 
        payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchTerm]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const partial = payments.filter(p => p.status === 'partial').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalOutstanding = payments.reduce((sum, p) => sum + p.remainingAmount, 0);
    const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.remainingAmount, 0);

    return { 
      total, paid, partial, overdue, pending, 
      totalRevenue, totalPaid, totalOutstanding, overdueAmount 
    };
  }, [payments]);

  const getStatusConfig = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
          dot: 'bg-green-500'
        };
      case 'partial':
        return {
          label: 'Partial',
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
          dot: 'bg-blue-500'
        };
      case 'overdue':
        return {
          label: 'Overdue',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
          dot: 'bg-red-500'
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
          dot: 'bg-yellow-500'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const handleViewPayment = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  }, []);
  
  const handleSubmitPayment = useCallback(() => {
    // Handle updating an existing payment
    if (selectedPayment) {
      if (paymentAmount <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }
      
      // Create a new payment history entry
      const newPaymentHistory = {
        id: `py-${Date.now()}`,
        amount: paymentAmount,
        date: new Date().toISOString(),
        method: paymentMethod === 'credit_card' ? 'Credit Card' : 
                paymentMethod === 'debit_card' ? 'Debit Card' : 
                paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer',
        transactionId: `TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        status: 'completed' as const
      };
      
      // Calculate new payment amounts
      const newPaidAmount = Math.min(selectedPayment.paidAmount + paymentAmount, selectedPayment.totalAmount);
      const newRemainingAmount = Math.max(0, selectedPayment.totalAmount - newPaidAmount);
      
      // Determine new status
      let newStatus: 'paid' | 'partial' | 'pending' | 'overdue' = 'partial';
      if (newRemainingAmount === 0) {
        newStatus = 'paid';
      } else if (newRemainingAmount === selectedPayment.totalAmount) {
        newStatus = 'pending';
      } else if (isOverdue(selectedPayment.dueDate) && newRemainingAmount > 0) {
        newStatus = 'overdue';
      }
      
      // Update the payment in the local state
      const updatedPayment = {
        ...selectedPayment,
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        lastPaymentDate: new Date().toISOString(),
        paymentHistory: [...selectedPayment.paymentHistory, newPaymentHistory]
      };
      
      // Update the payments array
      const updatedPayments = payments.map(p => 
        p.id === selectedPayment.id ? updatedPayment : p
      );
      
      setPayments(updatedPayments);
      
      // Update in Auth context if it's a local payment
      if (selectedPayment.id.startsWith('payment-')) {
        updatePayment(selectedPayment.id, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          lastPaymentDate: new Date().toISOString(),
          paymentHistory: [...selectedPayment.paymentHistory, newPaymentHistory]
        });
      } else {
        // Add as a new payment to local storage if it's a sample payment
        addPayment({
          ...selectedPayment,
          id: `payment-${Date.now()}`,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          lastPaymentDate: new Date().toISOString(),
          paymentHistory: [...selectedPayment.paymentHistory, newPaymentHistory]
        });
      }
      
      // Show success notification
      alert(`Payment of $${paymentAmount} recorded successfully!`);
    } 
    // Handle creating a new payment
    else {
      // Validate form
      if (!newClientName) {
        alert('Please enter a client name');
        return;
      }
      if (!newBookingId) {
        alert('Please enter a booking ID');
        return;
      }
      if (!newCarModel) {
        alert('Please enter a car model');
        return;
      }
      if (newTotalAmount <= 0) {
        alert('Please enter a valid total amount');
        return;
      }
      if (paymentAmount < 0) {
        alert('Please enter a valid payment amount');
        return;
      }
      
      // Calculate payment details
      const paidAmount = Math.min(paymentAmount, newTotalAmount);
      const remainingAmount = Math.max(0, newTotalAmount - paidAmount);
      
      // Determine status
      let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
      if (paidAmount === newTotalAmount) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partial';
      }
      
      // Create payment history if there's an initial payment
      const paymentHistory = paidAmount > 0 ? [{
        id: `py-${Date.now()}`,
        amount: paidAmount,
        date: new Date().toISOString(),
        method: paymentMethod === 'credit_card' ? 'Credit Card' : 
                paymentMethod === 'debit_card' ? 'Debit Card' : 
                paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer',
        transactionId: `TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        status: 'completed' as const
      }] : [];
      
      // Create new payment
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        bookingId: newBookingId,
        clientName: newClientName,
        clientEmail: `${newClientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        clientPhone: '+1 234 567 8900',
        clientPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        carModel: newCarModel,
        totalAmount: newTotalAmount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: status,
        paymentMethod: paymentMethod as any,
        paymentHistory: paymentHistory,
        invoiceNumber: `INV-${Date.now().toString().substring(6)}`,
        createdAt: new Date().toISOString(),
        lastPaymentDate: paidAmount > 0 ? new Date().toISOString() : undefined
      };
      
      // Add to payments array
      setPayments([newPayment, ...payments]);
      
      // Add to local storage
      addPayment(newPayment);
      
      // Show success notification
      alert(`New payment created successfully!${paidAmount > 0 ? ` Initial payment of $${paidAmount} recorded.` : ''}`);
    }
    
    // Close the modal and reset state
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
    setPaymentAmount(0);
    setNewClientName('');
    setNewBookingId('');
    setNewCarModel('');
    setNewTotalAmount(0);
  }, [
    selectedPayment, 
    paymentAmount, 
    paymentMethod, 
    payments, 
    addPayment, 
    updatePayment,
    newClientName,
    newBookingId,
    newCarModel,
    newTotalAmount
  ]);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Payment Management
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Track payments, outstanding balances, and financial reports
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            <span className="text-sm font-medium">{metrics.total} Invoices</span>
          </div>
          <Button 
            variant="default" 
            className="px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              setSelectedPayment(null);
              setPaymentAmount(0);
              setPaymentMethod('credit_card');
              setIsPaymentModalOpen(true);
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {/* Total Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">${metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Total Revenue</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="group relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">${metrics.totalPaid.toLocaleString()}</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-500">Total Collected</p>
          </div>
        </div>

        {/* Outstanding */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 dark:border-amber-800 dark:from-amber-900/20 dark:to-amber-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">${metrics.totalOutstanding.toLocaleString()}</p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Outstanding</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="group relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-300">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">${metrics.overdueAmount.toLocaleString()}</p>
            <p className="text-sm font-medium text-red-600 dark:text-red-500">Overdue</p>
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.paid}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.partial}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Partial Payments</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.overdue}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
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
                placeholder="Search payments..."
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
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Amount Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
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
              {filteredPayments.map((payment) => {
                const statusConfig = getStatusConfig(payment.status);
                const overdue = isOverdue(payment.dueDate) && payment.remainingAmount > 0;
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {payment.invoiceNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.bookingId}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={payment.clientPhoto} 
                          alt={payment.clientName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.clientName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.clientEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.carModel}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          Total: ${payment.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Paid: ${payment.paidAmount.toLocaleString()}
                        </div>
                        {payment.remainingAmount > 0 && (
                          <div className={cn(
                            "text-xs font-medium",
                            overdue ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                          )}>
                            Due: ${payment.remainingAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={cn(
                          "text-sm font-medium",
                          overdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                        )}>
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </div>
                        {overdue && (
                          <div className="text-xs text-red-500 dark:text-red-400">
                            {Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </div>
                        )}
                        {payment.lastPaymentDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last: {new Date(payment.lastPaymentDate).toLocaleDateString()}
                          </div>
                        )}
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
                          onClick={() => handleViewPayment(payment)}
                          className="px-3 py-1 text-xs"
                        >
                          View
                        </Button>
                        {payment.remainingAmount > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setPaymentAmount(payment.remainingAmount);
                              setPaymentMethod(payment.paymentMethod);
                              setIsPaymentModalOpen(true);
                            }}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} className="max-w-lg w-full p-0">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedPayment ? 'Record Payment' : 'New Payment'}
              </h3>
              {selectedPayment && (
                <div className="text-sm text-gray-500">
                  {selectedPayment.invoiceNumber}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {selectedPayment ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img 
                      src={selectedPayment.clientPhoto} 
                      alt={selectedPayment.clientName} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedPayment.clientName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPayment.carModel}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${selectedPayment.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                      <div className="font-medium text-red-600 dark:text-red-400">
                        ${selectedPayment.remainingAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter client name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Booking ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter booking ID"
                      value={newBookingId}
                      onChange={(e) => setNewBookingId(e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Car Model
                    </label>
                    <input
                      type="text"
                      placeholder="Enter car model"
                      value={newCarModel}
                      onChange={(e) => setNewCarModel(e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="Enter total amount"
                        value={newTotalAmount || ''}
                        onChange={(e) => setNewTotalAmount(Number(e.target.value))}
                        className="pl-8 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="pl-8 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={selectedPayment ? selectedPayment.remainingAmount : 999999}
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmitPayment}
              >
                Submit Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Details Modal */}
      {isModalOpen && selectedPayment && (
        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-4xl w-full p-0">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payment Details
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border",
                  getStatusConfig(selectedPayment.status).className
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedPayment.status).dot)} />
                {getStatusConfig(selectedPayment.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Invoice Number:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedPayment.invoiceNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Booking ID:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedPayment.bookingId}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedPayment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                      <div className={cn(
                        "font-medium",
                        isOverdue(selectedPayment.dueDate) && selectedPayment.remainingAmount > 0
                          ? "text-red-600 dark:text-red-400" 
                          : "text-gray-900 dark:text-white"
                      )}>
                        {new Date(selectedPayment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Client Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedPayment.clientPhoto} 
                      alt={selectedPayment.clientName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedPayment.clientName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPayment.clientEmail}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Phone: {selectedPayment.clientPhone}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Summary</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Service:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedPayment.carModel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${selectedPayment.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Paid Amount:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${selectedPayment.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                      <span className={cn(
                        "font-bold text-lg",
                        selectedPayment.remainingAmount > 0 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-green-600 dark:text-green-400"
                      )}>
                        ${selectedPayment.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  {selectedPayment.paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPayment.paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${payment.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(payment.date).toLocaleDateString()} • {payment.method}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {payment.transactionId}
                            </div>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-xs px-2 py-1",
                              payment.status === 'completed' && "bg-green-100 text-green-700 border-green-200",
                              payment.status === 'pending' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                              payment.status === 'failed' && "bg-red-100 text-red-700 border-red-200"
                            )}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No payment history available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              {selectedPayment.remainingAmount > 0 && (
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setPaymentAmount(selectedPayment.remainingAmount);
                    setPaymentMethod(selectedPayment.paymentMethod);
                    setIsPaymentModalOpen(true);
                    closeModal();
                  }}
                >
                  Record Payment
                </Button>
              )}
              <Button variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
                Send Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 