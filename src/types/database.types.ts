export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'admin' | 'manager' | 'employee' | 'client';
          status: 'active' | 'inactive' | 'blocked' | 'pending';
          date_of_birth: string | null;
          license_number: string | null;
          address: any | null;
          emergency_contact: any | null;
          join_date: string;
          total_bookings: number;
          total_spent: number;
          last_rental_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'manager' | 'employee' | 'client';
          status?: 'active' | 'inactive' | 'blocked' | 'pending';
          date_of_birth?: string | null;
          license_number?: string | null;
          address?: any | null;
          emergency_contact?: any | null;
          join_date?: string;
          total_bookings?: number;
          total_spent?: number;
          last_rental_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'manager' | 'employee' | 'client';
          status?: 'active' | 'inactive' | 'blocked' | 'pending';
          date_of_birth?: string | null;
          license_number?: string | null;
          address?: any | null;
          emergency_contact?: any | null;
          join_date?: string;
          total_bookings?: number;
          total_spent?: number;
          last_rental_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          name: string;
          model: string;
          year: number;
          license_plate: string;
          category: string;
          status: 'available' | 'booked' | 'maintenance' | 'out_of_service';
          price_per_day: number;
          price_per_week: number | null;
          price_per_month: number | null;
          image_url: string | null;
          images: any | null;
          colors: any | null;
          features: any | null;
          specifications: any | null;
          fuel_type: string | null;
          transmission: string | null;
          seats: number | null;
          mileage: number | null;
          insurance_info: any | null;
          registration_info: any | null;
          maintenance_schedule: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          model: string;
          year: number;
          license_plate: string;
          category: string;
          status?: 'available' | 'booked' | 'maintenance' | 'out_of_service';
          price_per_day: number;
          price_per_week?: number | null;
          price_per_month?: number | null;
          image_url?: string | null;
          images?: any | null;
          colors?: any | null;
          features?: any | null;
          specifications?: any | null;
          fuel_type?: string | null;
          transmission?: string | null;
          seats?: number | null;
          mileage?: number | null;
          insurance_info?: any | null;
          registration_info?: any | null;
          maintenance_schedule?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          model?: string;
          year?: number;
          license_plate?: string;
          category?: string;
          status?: 'available' | 'booked' | 'maintenance' | 'out_of_service';
          price_per_day?: number;
          price_per_week?: number | null;
          price_per_month?: number | null;
          image_url?: string | null;
          images?: any | null;
          colors?: any | null;
          features?: any | null;
          specifications?: any | null;
          fuel_type?: string | null;
          transmission?: string | null;
          seats?: number | null;
          mileage?: number | null;
          insurance_info?: any | null;
          registration_info?: any | null;
          maintenance_schedule?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          client_id: string;
          car_id: string;
          start_date: string;
          end_date: string;
          duration_days: number;
          total_amount: number;
          paid_amount: number;
          remaining_amount: number;
          status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
          pickup_location: string | null;
          dropoff_location: string | null;
          insurance: boolean;
          insurance_amount: number;
          deposit_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_number?: string;
          client_id: string;
          car_id: string;
          start_date: string;
          end_date: string;
          duration_days: number;
          total_amount: number;
          paid_amount?: number;
          remaining_amount: number;
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
          pickup_location?: string | null;
          dropoff_location?: string | null;
          insurance?: boolean;
          insurance_amount?: number;
          deposit_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_number?: string;
          client_id?: string;
          car_id?: string;
          start_date?: string;
          end_date?: string;
          duration_days?: number;
          total_amount?: number;
          paid_amount?: number;
          remaining_amount?: number;
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
          pickup_location?: string | null;
          dropoff_location?: string | null;
          insurance?: boolean;
          insurance_amount?: number;
          deposit_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          client_id: string;
          amount: number;
          payment_method: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'digital_wallet';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          transaction_id: string | null;
          invoice_number: string | null;
          proof_url: string | null;
          bank_name: string | null;
          payment_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          client_id: string;
          amount: number;
          payment_method: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'digital_wallet';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          invoice_number?: string | null;
          proof_url?: string | null;
          bank_name?: string | null;
          payment_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          client_id?: string;
          amount?: number;
          payment_method?: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'digital_wallet';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          invoice_number?: string | null;
          proof_url?: string | null;
          bank_name?: string | null;
          payment_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          contract_number: string;
          booking_id: string;
          client_id: string;
          car_id: string;
          contract_type: 'daily' | 'weekly' | 'monthly';
          start_date: string;
          end_date: string;
          total_amount: number;
          deposit_amount: number;
          insurance_included: boolean;
          terms: any | null;
          document_url: string | null;
          signed_date: string | null;
          status: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_number?: string;
          booking_id: string;
          client_id: string;
          car_id: string;
          contract_type: 'daily' | 'weekly' | 'monthly';
          start_date: string;
          end_date: string;
          total_amount: number;
          deposit_amount?: number;
          insurance_included?: boolean;
          terms?: any | null;
          document_url?: string | null;
          signed_date?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_number?: string;
          booking_id?: string;
          client_id?: string;
          car_id?: string;
          contract_type?: 'daily' | 'weekly' | 'monthly';
          start_date?: string;
          end_date?: string;
          total_amount?: number;
          deposit_amount?: number;
          insurance_included?: boolean;
          terms?: any | null;
          document_url?: string | null;
          signed_date?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance_records: {
        Row: {
          id: string;
          car_id: string;
          maintenance_type: string;
          description: string | null;
          service_date: string;
          cost: number;
          service_provider: string | null;
          status: 'scheduled' | 'in_progress' | 'completed';
          next_maintenance_due: string | null;
          mileage_at_service: number | null;
          parts_replaced: any | null;
          technician_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          maintenance_type: string;
          description?: string | null;
          service_date: string;
          cost: number;
          service_provider?: string | null;
          status?: 'scheduled' | 'in_progress' | 'completed';
          next_maintenance_due?: string | null;
          mileage_at_service?: number | null;
          parts_replaced?: any | null;
          technician_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          maintenance_type?: string;
          description?: string | null;
          service_date?: string;
          cost?: number;
          service_provider?: string | null;
          status?: 'scheduled' | 'in_progress' | 'completed';
          next_maintenance_due?: string | null;
          mileage_at_service?: number | null;
          parts_replaced?: any | null;
          technician_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          profile_id: string | null;
          employee_id: string | null;
          department: string | null;
          position: string | null;
          salary: number | null;
          hire_date: string | null;
          termination_date: string | null;
          manager_id: string | null;
          permissions: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          employee_id?: string | null;
          department?: string | null;
          position?: string | null;
          salary?: number | null;
          hire_date?: string | null;
          termination_date?: string | null;
          manager_id?: string | null;
          permissions?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          employee_id?: string | null;
          department?: string | null;
          position?: string | null;
          salary?: number | null;
          hire_date?: string | null;
          termination_date?: string | null;
          manager_id?: string | null;
          permissions?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_payments: {
        Row: {
          id: string;
          booking_id: string;
          payment_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          payment_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          payment_id?: string;
          amount?: number;
          created_at?: string;
        };
      };
      car_images: {
        Row: {
          id: string;
          car_id: string;
          image_url: string;
          image_type: 'main' | 'interior' | 'exterior' | 'document';
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          image_url: string;
          image_type?: 'main' | 'interior' | 'exterior' | 'document';
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          image_url?: string;
          image_type?: 'main' | 'interior' | 'exterior' | 'document';
          sort_order?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      booking_summary_view: {
        Row: {
          id: string | null;
          booking_number: string | null;
          start_date: string | null;
          end_date: string | null;
          total_amount: number | null;
          paid_amount: number | null;
          remaining_amount: number | null;
          status: string | null;
          client_name: string | null;
          client_email: string | null;
          car_name: string | null;
          license_plate: string | null;
          car_category: string | null;
        };
      };
      revenue_summary_view: {
        Row: {
          month: string | null;
          total_bookings: string | null;
          total_revenue: number | null;
          paid_revenue: number | null;
          outstanding_revenue: number | null;
          avg_booking_value: number | null;
          completed_bookings: string | null;
          active_bookings: string | null;
        };
      };
      car_performance_view: {
        Row: {
          id: string | null;
          name: string | null;
          model: string | null;
          license_plate: string | null;
          status: string | null;
          total_bookings: string | null;
          total_revenue: number | null;
          avg_revenue_per_booking: number | null;
          last_booking_date: string | null;
        };
      };
      client_activity_view: {
        Row: {
          id: string | null;
          client_name: string | null;
          email: string | null;
          total_bookings: number | null;
          total_spent: number | null;
          last_rental_date: string | null;
          recent_bookings: string | null;
          recent_spending: number | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type aliases for easier use
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Car = Database['public']['Tables']['cars']['Row'];
export type CarInsert = Database['public']['Tables']['cars']['Insert'];
export type CarUpdate = Database['public']['Tables']['cars']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Contract = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'];
export type MaintenanceRecordInsert = Database['public']['Tables']['maintenance_records']['Insert'];
export type MaintenanceRecordUpdate = Database['public']['Tables']['maintenance_records']['Update'];

export type Staff = Database['public']['Tables']['staff']['Row'];
export type StaffInsert = Database['public']['Tables']['staff']['Insert'];
export type StaffUpdate = Database['public']['Tables']['staff']['Update'];

export type BookingPayment = Database['public']['Tables']['booking_payments']['Row'];
export type BookingPaymentInsert = Database['public']['Tables']['booking_payments']['Insert'];
export type BookingPaymentUpdate = Database['public']['Tables']['booking_payments']['Update'];

export type CarImage = Database['public']['Tables']['car_images']['Row'];
export type CarImageInsert = Database['public']['Tables']['car_images']['Insert'];
export type CarImageUpdate = Database['public']['Tables']['car_images']['Update'];

// View types
export type BookingSummary = Database['public']['Views']['booking_summary_view']['Row'];
export type RevenueSummary = Database['public']['Views']['revenue_summary_view']['Row'];
export type CarPerformance = Database['public']['Views']['car_performance_view']['Row'];
export type ClientActivity = Database['public']['Views']['client_activity_view']['Row']; 