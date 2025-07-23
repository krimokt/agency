"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CarInfo {
  id: string;
  name: string;
  model: string;
  year: number;
  colors: string[];
  status: string;
  imageUrl: string;
  price: number;
  licensePlate: string;
  category: string;
  features: string[];
}

export default function ClientDashboard() {
  // Sample car data
  const [availableCars, setAvailableCars] = useState<CarInfo[]>([
    {
      id: "CAR-001",
      name: "Toyota Camry",
      model: "XLE",
      year: 2023,
      colors: ["#1a1a1a", "#ffffff", "#dc2626"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2942&auto=format&fit=crop",
      price: 75,
      licensePlate: "ABC-1234",
      category: "Sedan",
      features: ["Bluetooth", "Backup Camera", "Sunroof"]
    },
    {
      id: "CAR-003",
      name: "Tesla Model 3",
      model: "Long Range",
      year: 2023,
      colors: ["#ffffff", "#ff0000", "#0000ff"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2971&auto=format&fit=crop",
      price: 120,
      licensePlate: "EV-5678",
      category: "Electric",
      features: ["Autopilot", "Premium Sound", "Glass Roof"]
    },
    {
      id: "CAR-005",
      name: "Ford Mustang",
      model: "GT",
      year: 2022,
      colors: ["#ff0000", "#000000", "#0000ff"],
      status: "Available",
      imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5f452d1f2?q=80&w=2940&auto=format&fit=crop",
      price: 110,
      licensePlate: "MST-789",
      category: "Sports",
      features: ["V8 Engine", "Leather Seats", "Performance Package"]
    }
  ]);

  // User's active bookings
  const [activeBookings, setActiveBookings] = useState([
    {
      id: "BK-001",
      carName: "Dacia Logan",
      startDate: "2023-08-15",
      endDate: "2023-08-20",
      status: "Active",
      totalPrice: 325
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
        <p className="opacity-90">Manage your car rentals and bookings from your personal dashboard.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{activeBookings.length}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Spent</h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">$325</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loyalty Points</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">125</p>
        </div>
      </div>

      {/* Active Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Active Bookings</h2>
        </div>
        
        <div className="p-6">
          {activeBookings.length > 0 ? (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{booking.carName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${booking.totalPrice}</span>
                    <Link href={`/client/bookings/${booking.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">You don't have any active bookings.</p>
              <Link href="/client/book" className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                Book a car now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Featured Available Cars */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Available Cars</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Check out these cars available for booking
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCars.map((car) => (
              <div key={car.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <Image
                    src={car.imageUrl}
                    alt={`${car.name} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-medium text-gray-900 dark:text-white">{car.name} {car.model}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{car.year} • {car.category}</p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">${car.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
                  </div>
                  
                  <div className="mt-4 flex gap-1">
                    {car.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <Link 
                      href={`/client/book?car=${car.id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/client/book"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Available Cars
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 