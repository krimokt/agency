// Script to add a sample car to local storage
// Run this in your browser console after logging in

const LOCAL_DATA_KEY = 'localDashboardData';

// Get current data from local storage
const savedData = localStorage.getItem(LOCAL_DATA_KEY);
let localData = savedData ? JSON.parse(savedData) : {
  bookings: [],
  cars: [],
  payments: [],
  clients: [],
  maintenanceRecords: []
};

// Create a new car
const newCar = {
  id: `car-${Date.now()}`,
  name: "Mercedes-Benz",
  model: "E-Class",
  year: 2023,
  colors: ["#000000", "#c0c0c0", "#1e3a8a"],
  status: "Available",
  imageUrl: "https://images.unsplash.com/photo-1563720223185-11069d519438?q=80&w=3270&auto=format&fit=crop",
  price: 120,
  licensePlate: "MB-5678",
  category: "Luxury Sedan",
  features: ["Leather Seats", "Navigation", "Bluetooth", "Heated Seats", "Sunroof"]
};

// Add car to local data
localData.cars = [...(localData.cars || []), newCar];

// Save back to local storage
localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(localData));

console.log("Sample car added successfully!");
console.log("Please refresh the page to see the new car."); 