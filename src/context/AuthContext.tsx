'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Define types for our local data
interface Booking {
  id: string;
  [key: string]: any;
}

interface Car {
  id: string;
  [key: string]: any;
}

interface Payment {
  id: string;
  [key: string]: any;
}

interface Client {
  id: string;
  [key: string]: any;
}

interface MaintenanceRecord {
  id: string;
  [key: string]: any;
}

interface LocalData {
  bookings: Booking[];
  cars: Car[];
  payments: Payment[];
  clients: Client[];
  maintenanceRecords: MaintenanceRecord[];
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  localData: LocalData;
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  updateBooking: (id: string, data: Partial<Booking>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  updateCar: (id: string, data: Partial<Car>) => void;
  addCar: (car: Omit<Car, 'id'>) => Car;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, data: Partial<MaintenanceRecord>) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  isLoading: true,
  loading: true, // Alias for isLoading for backward compatibility
  localData: {
    bookings: [],
    cars: [],
    payments: [],
    clients: [],
    maintenanceRecords: [],
  },
  addBooking: () => ({ id: '', }),
  updateBooking: () => {},
  addPayment: () => ({ id: '', }),
  updatePayment: () => {},
  addClient: () => ({ id: '', }),
  updateClient: () => {},
  updateCar: () => {},
  addCar: () => ({ id: '', }),
  addMaintenanceRecord: () => ({ id: '', }),
  updateMaintenanceRecord: () => {},
});

// Local storage keys
const LOCAL_ADMIN_KEY = 'localAdminSession';
const LOCAL_DATA_KEY = 'localDashboardData';

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localData, setLocalData] = useState<LocalData>({
    bookings: [],
    cars: [],
    payments: [],
    clients: [],
    maintenanceRecords: []
  });
  const router = useRouter();

  // Load local data from localStorage
  const loadLocalData = () => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(LOCAL_DATA_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as Partial<LocalData>;
          // Ensure all required properties exist with default values if missing
          setLocalData({
            bookings: parsedData.bookings || [],
            cars: parsedData.cars || [],
            payments: parsedData.payments || [],
            clients: parsedData.clients || [],
            maintenanceRecords: parsedData.maintenanceRecords || []
          });
        } catch (error) {
          console.error("Error parsing local data:", error);
          // If there's an error, initialize with empty arrays
          setLocalData({
            bookings: [],
            cars: [],
            payments: [],
            clients: [],
            maintenanceRecords: []
          });
        }
      }
    }
  };

  // Save local data to localStorage
  const saveLocalData = (data: LocalData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
    }
  };

  // Add a booking
  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking: Booking = { ...booking, id: `booking-${Date.now()}` };
    const updatedData = {
      ...localData,
      bookings: [...localData.bookings, newBooking]
    };
    setLocalData(updatedData);
    saveLocalData(updatedData);
    return newBooking;
  };

  // Update a booking
  const updateBooking = (id: string, data: Partial<Booking>) => {
    const updatedBookings = localData.bookings.map(booking => 
      booking.id === id ? { ...booking, ...data } : booking
    );
    const updatedData = { ...localData, bookings: updatedBookings };
    setLocalData(updatedData);
    saveLocalData(updatedData);
  };

  // Add a payment
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: `payment-${Date.now()}` };
    const updatedData = {
      ...localData,
      payments: [...localData.payments, newPayment]
    };
    setLocalData(updatedData);
    saveLocalData(updatedData);
    return newPayment;
  };

  // Update a payment
  const updatePayment = (id: string, data: Partial<Payment>) => {
    const updatedPayments = localData.payments.map(payment => 
      payment.id === id ? { ...payment, ...data } : payment
    );
    const updatedData = { ...localData, payments: updatedPayments };
    setLocalData(updatedData);
    saveLocalData(updatedData);
  };

  // Add a client
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: `client-${Date.now()}` };
    const updatedData = {
      ...localData,
      clients: [...localData.clients, newClient]
    };
    setLocalData(updatedData);
    saveLocalData(updatedData);
    return newClient;
  };

  // Update a client
  const updateClient = (id: string, data: Partial<Client>) => {
    const updatedClients = localData.clients.map(client => 
      client.id === id ? { ...client, ...data } : client
    );
    const updatedData = { ...localData, clients: updatedClients };
    setLocalData(updatedData);
    saveLocalData(updatedData);
  };

  // Add a car
  const addCar = (car: Omit<Car, 'id'>) => {
    const newCar: Car = { ...car, id: `car-${Date.now()}` };
    const updatedData = {
      ...localData,
      cars: [...localData.cars, newCar]
    };
    setLocalData(updatedData);
    saveLocalData(updatedData);
    return newCar;
  };

  // Update a car
  const updateCar = (id: string, data: Partial<Car>) => {
    const updatedCars = localData.cars.map(car => 
      car.id === id ? { ...car, ...data } : car
    );
    const updatedData = { ...localData, cars: updatedCars };
    setLocalData(updatedData);
    saveLocalData(updatedData);
  };

  // Add a maintenance record
  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = { ...record, id: `maint-${Date.now()}` };
    const updatedData = {
      ...localData,
      maintenanceRecords: localData.maintenanceRecords ? [...localData.maintenanceRecords, newRecord] : [newRecord]
    };
    setLocalData(updatedData);
    saveLocalData(updatedData);
    return newRecord;
  };

  // Update a maintenance record
  const updateMaintenanceRecord = (id: string, data: Partial<MaintenanceRecord>) => {
    if (!localData.maintenanceRecords) {
      return; // Nothing to update if the array doesn't exist
    }
    
    const updatedRecords = localData.maintenanceRecords.map(record => 
      record.id === id ? { ...record, ...data } : record
    );
    const updatedData = { ...localData, maintenanceRecords: updatedRecords };
    setLocalData(updatedData);
    saveLocalData(updatedData);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check for local admin session first
        if (typeof window !== 'undefined') {
          const localAdmin = localStorage.getItem(LOCAL_ADMIN_KEY);
          if (localAdmin) {
            setUser(JSON.parse(localAdmin) as unknown as User);
            loadLocalData(); // Load local dashboard data
            setIsLoading(false);
            return;
          }
        }

        // Otherwise check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email === 'admin@gmail.com' && password === 'admin') {
      const now = new Date().toISOString();
      const adminUser = {
        id: 'local-admin',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'admin@gmail.com',
        email_confirmed_at: now,
        phone: '',
        phone_confirmed_at: null,
        confirmed_at: now,
        last_sign_in_at: now,
        app_metadata: { provider: 'local', providers: ['local'] },
        user_metadata: { first_name: 'Admin', last_name: 'User' },
        identities: [],
        created_at: now,
        updated_at: now,
        is_anonymous: false,
      };
      setUser(adminUser as unknown as User);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminUser));
        localStorage.setItem('profileData', JSON.stringify({
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@gmail.com',
          updated_at: now,
        }));
        
        // Initialize local data if it doesn't exist
        if (!localStorage.getItem(LOCAL_DATA_KEY)) {
          const initialData: LocalData = {
            bookings: [],
            cars: [],
            payments: [],
            clients: [],
            maintenanceRecords: []
          };
          localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(initialData));
          setLocalData(initialData);
        } else {
          // Make sure we load and validate the existing data
          const savedData = localStorage.getItem(LOCAL_DATA_KEY);
          try {
            const parsedData = JSON.parse(savedData!) as Partial<LocalData>;
            const validatedData: LocalData = {
              bookings: parsedData.bookings || [],
              cars: parsedData.cars || [],
              payments: parsedData.payments || [],
              clients: parsedData.clients || [],
              maintenanceRecords: parsedData.maintenanceRecords || []
            };
            localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(validatedData));
            setLocalData(validatedData);
          } catch (error) {
            console.error("Error parsing existing local data:", error);
            loadLocalData();
          }
        }
      }
      return undefined;
    }

    // Default Supabase sign in
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      // Don't remove local data on sign out to persist between sessions
    }
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) {
        console.error("Error signing up:", error);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error("Exception during signup:", error);
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    signIn,
    signOut, 
    signUp: signUp,
    isLoading,
    loading: isLoading, // Alias for isLoading for backward compatibility
    localData,
    addBooking,
    updateBooking,
    addPayment,
    updatePayment,
    addClient,
    updateClient,
    updateCar,
    addCar,
    addMaintenanceRecord,
    updateMaintenanceRecord,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 