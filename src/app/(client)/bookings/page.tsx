"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Booking {
  id: string;
  carId: string;
  carName: string;
  carModel: string;
  carImage: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Cancelled";
  totalPrice: number;
}

export default function BookingsPage() {
  // Sample bookings data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "BK-001",
      carId: "CAR-002",
      carName: "Dacia Logan",
      carModel: "Comfort",
      carImage: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      startDate: "2023-08-15",
      endDate: "2023-08-20",
      status: "Active",
      totalPrice: 325
    },
    {
      id: "BK-002",
      carId: "CAR-003",
      carName: "Tesla Model 3",
      carModel: "Long Range",
      carImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2971&auto=format&fit=crop",
      startDate: "2023-07-10",
      endDate: "2023-07-15",
      status: "Completed",
      totalPrice: 600
    },
    {
      id: "BK-003",
      carId: "CAR-001",
      carName: "Toyota Camry",
      carModel: "XLE",
      carImage: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2942&auto=format&fit=crop",
      startDate: "2023-06-20",
      endDate: "2023-06-25",
      status: "Completed",
      totalPrice: 375
    },
    {
      id: "BK-004",
      carId: "CAR-005",
      carName: "Ford Mustang",
      carModel: "GT",
      carImage: "https://images.unsplash.com/photo-1584345604476-8ec5f452d1f2?q=80&w=2940&auto=format&fit=crop",
      startDate: "2023-05-05",
      endDate: "2023-05-08",
      status: "Completed",
      totalPrice: 330
    },
    {
      id: "BK-005",
      carId: "CAR-004",
      carName: "Honda CR-V",
      carModel: "Touring",
      carImage: "https://images.pexels.com/photos/12051370/pexels-photo-12051370.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      startDate: "2023-04-12",
      endDate: "2023-04-18",
      status: "Cancelled",
      totalPrice: 570
    }
  ]);

  // Filter for active and past bookings
  const activeBookings = bookings.filter(booking => booking.status === "Active");
  const pastBookings = bookings.filter(booking => booking.status !== "Active");

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your active and past car rentals
          </p>
        </div>
        
        {/* Active Bookings */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Bookings</h2>
          
          {activeBookings.length > 0 ? (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative h-48 md:h-full">
                      <Image
                        src={booking.carImage}
                        alt={`${booking.carName} ${booking.carModel}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 md:col-span-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{booking.carName} {booking.carModel}</h3>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {booking.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Booking #{booking.id}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Return Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-white">{calculateDuration(booking.startDate, booking.endDate)} days</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-2 sm:mb-0">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Price</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">${booking.totalPrice}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link 
                            href={`/client/bookings/${booking.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </Link>
                          <button 
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">You don't have any active bookings.</p>
              <Link href="/client/book" className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                Book a car now
              </Link>
            </div>
          )}
        </div>
        
        {/* Past Bookings */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Past Bookings</h2>
          
          {pastBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Car
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pastBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <Image
                              src={booking.carImage}
                              alt={booking.carName}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.carName} {booking.carModel}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Booking #{booking.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateDuration(booking.startDate, booking.endDate)} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === "Completed" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${booking.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/client/bookings/${booking.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View
                        </Link>
                        {booking.status === "Completed" && (
                          <button className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
                            Book Again
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">You don't have any past bookings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 