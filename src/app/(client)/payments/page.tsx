"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Payment {
  id: string;
  bookingId: string;
  carName: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded";
  method: "Credit Card" | "PayPal" | "Bank Transfer";
  cardLast4?: string;
}

interface PaymentMethod {
  id: string;
  type: "Credit Card" | "PayPal" | "Bank Account";
  name: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
  icon: string;
}

export default function PaymentsPage() {
  // Sample payments data
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "PAY-001",
      bookingId: "BK-001",
      carName: "Dacia Logan",
      date: "2023-08-15",
      amount: 325,
      status: "Paid",
      method: "Credit Card",
      cardLast4: "4242"
    },
    {
      id: "PAY-002",
      bookingId: "BK-002",
      carName: "Tesla Model 3",
      date: "2023-07-10",
      amount: 600,
      status: "Paid",
      method: "PayPal"
    },
    {
      id: "PAY-003",
      bookingId: "BK-003",
      carName: "Toyota Camry",
      date: "2023-06-20",
      amount: 375,
      status: "Paid",
      method: "Credit Card",
      cardLast4: "1234"
    },
    {
      id: "PAY-004",
      bookingId: "BK-004",
      carName: "Ford Mustang",
      date: "2023-05-05",
      amount: 330,
      status: "Refunded",
      method: "Credit Card",
      cardLast4: "4242"
    },
    {
      id: "PAY-005",
      bookingId: "BK-005",
      carName: "Honda CR-V",
      date: "2023-04-12",
      amount: 570,
      status: "Paid",
      method: "Bank Transfer"
    }
  ]);

  // Sample payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "PM-001",
      type: "Credit Card",
      name: "Visa ending in 4242",
      last4: "4242",
      expiry: "04/25",
      isDefault: true,
      icon: "/images/banks/visa.svg" // Placeholder
    },
    {
      id: "PM-002",
      type: "PayPal",
      name: "PayPal - john.doe@example.com",
      isDefault: false,
      icon: "/images/banks/payoneer.svg" // Using existing image as placeholder
    },
    {
      id: "PM-003",
      type: "Credit Card",
      name: "Mastercard ending in 1234",
      last4: "1234",
      expiry: "09/24",
      isDefault: false,
      icon: "/images/banks/societe.svg" // Placeholder
    }
  ]);

  // State for new payment method modal
  const [isAddingMethod, setIsAddingMethod] = useState(false);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Set payment method as default
  const setDefaultMethod = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  // Delete payment method
  const deletePaymentMethod = (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      setPaymentMethods(methods => methods.filter(method => method.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View your payment history and download receipts
          </p>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Booking
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <Link href={`/client/bookings/${payment.bookingId}`} className="hover:underline">
                        {payment.carName} ({payment.bookingId})
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.method} {payment.cardLast4 && <span className="text-gray-500 dark:text-gray-400">(*{payment.cardLast4})</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "Paid" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : payment.status === "Refunded"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline">
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your payment methods
              </p>
            </div>
            <button
              onClick={() => setIsAddingMethod(true)}
              className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Payment Method
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-white dark:bg-gray-800 rounded-md p-1 flex items-center justify-center">
                    <Image
                      src={method.icon}
                      alt={method.type}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {method.expiry && `Expires ${method.expiry}`}
                      {method.isDefault && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Default
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultMethod(method.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {paymentMethods.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">You don't have any payment methods.</p>
              <button 
                onClick={() => setIsAddingMethod(true)}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add a payment method
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Billing Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Address</h3>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-900 dark:text-white">John Doe</p>
                <p className="text-sm text-gray-900 dark:text-white">123 Main Street</p>
                <p className="text-sm text-gray-900 dark:text-white">New York, NY 10001</p>
                <p className="text-sm text-gray-900 dark:text-white">United States</p>
              </div>
              <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Edit Billing Address
              </button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Email</h3>
              <div className="mt-3">
                <p className="text-sm text-gray-900 dark:text-white">john.doe@example.com</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  We'll send your receipts to this email address
                </p>
              </div>
              <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Edit Billing Email
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Payment Method Modal (simplified) */}
      {isAddingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Payment Method</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This is a placeholder. In a real application, this would be a form to add a new payment method.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddingMethod(false)}
                  className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsAddingMethod(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 