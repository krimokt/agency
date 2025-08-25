# 🚗 Car Rental Management System - Setup Instructions

## 📋 Prerequisites

1. **Supabase Project**: You already have your project set up
2. **Node.js**: Version 18+ installed
3. **Environment Variables**: Copy from `env.example` to `.env.local`

## 🔧 Step 1: Environment Setup

1. **Copy environment variables**:
   ```bash
   cp env.example .env.local
   ```

2. **Verify your `.env.local` contains**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gyxehmirzpvuudiuqwai.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eGVobWlyenB2dXVkaXVxd2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTYxODIsImV4cCI6MjA2OTczMjE4Mn0.h6eA2EZ4MkWQURg5OcuYNVln53JcK11Qo5YtffJQX2k
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eGVobWlyenB2dXVkaXVxd2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1NjE4MiwiZXhwIjoyMDY5NzMyMTgyfQ.ipNujqysNyO_-7oQLcwaayJ1JYZjFEAjtqnkwNZ2Rjk
   SUPABASE_JWT_SECRET=+MCBpJCA2arWasv4m3rQjOM/nok+kIZT360eoVhETbhhm6NFuNoCQ6xjuZWyfCQyru1Gl2RDQJQ1579HSr0dyA==
   ```

## 🗄️ Step 2: Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/gyxehmirzpvuudiuqwai
2. **Navigate to SQL Editor**
3. **Copy and paste the entire content** from `database_schema.sql`
4. **Run the script** - This will create:
   - All tables (profiles, cars, bookings, payments, etc.)
   - Views for analytics
   - Functions and triggers
   - Row Level Security policies
   - Performance indexes
   - Sample data

### Option B: Using Supabase CLI

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref gyxehmirzpvuudiuqwai
   ```

4. **Run the schema**:
   ```bash
   supabase db push
   ```

## 🔐 Step 3: Authentication Setup

1. **Go to Authentication > Settings** in your Supabase dashboard
2. **Configure Site URL**: `http://localhost:3000`
3. **Add redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard-home`

## 🚀 Step 4: Run Your Application

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Visit**: `http://localhost:3000`

## 📊 Step 5: Verify Setup

### Check Database Tables
1. Go to **Table Editor** in Supabase Dashboard
2. Verify these tables exist:
   - ✅ `profiles`
   - ✅ `cars`
   - ✅ `bookings`
   - ✅ `payments`
   - ✅ `contracts`
   - ✅ `maintenance_records`
   - ✅ `staff`
   - ✅ `booking_payments`
   - ✅ `car_images`

### Check Views
1. Go to **SQL Editor**
2. Run: `SELECT * FROM booking_summary_view LIMIT 5;`
3. Run: `SELECT * FROM revenue_summary_view LIMIT 5;`

### Test Authentication
1. Visit: `http://localhost:3000/signin`
2. Try logging in with: `admin@carental.com` / `admin123`

## 🔧 Step 6: MCP Configuration

### For Cursor/VS Code with MCP

1. **Install MCP Supabase Server**:
   ```bash
   npm install -g @modelcontextprotocol/server-supabase
   ```

2. **Create MCP config** (`.mcp/servers/supabase.json`):
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": ["@modelcontextprotocol/server-supabase"],
         "env": {
           "SUPABASE_URL": "https://gyxehmirzpvuudiuqwai.supabase.co",
           "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eGVobWlyenB2dXVkaXVxd2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1NjE4MiwiZXhwIjoyMDY5NzMyMTgyfQ.ipNujqysNyO_-7oQLcwaayJ1JYZjFEAjtqnkwNZ2Rjk"
         }
       }
     }
   }
   ```

## 🎯 Step 7: Test Your Application

### Admin Dashboard
- **URL**: `http://localhost:3000/dashboard-home`
- **Login**: `admin@carental.com` / `admin123`
- **Features to test**:
  - ✅ Car management
  - ✅ Booking creation
  - ✅ Payment tracking
  - ✅ Client management
  - ✅ Maintenance records
  - ✅ Contract management

### Client Dashboard
- **URL**: `http://localhost:3000/(client)/dashboard`
- **Features to test**:
  - ✅ View available cars
  - ✅ Make bookings
  - ✅ View payment history
  - ✅ Manage profile

## 🛠️ Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**:
   ```bash
   # Restart your dev server
   npm run dev
   ```

2. **Database Connection Issues**:
   - Check your Supabase URL and keys
   - Verify RLS policies are enabled
   - Check browser console for errors

3. **Authentication Issues**:
   - Verify redirect URLs in Supabase Auth settings
   - Check if user exists in `auth.users` table

4. **TypeScript Errors**:
   ```bash
   # Regenerate types
   npx supabase gen types typescript --project-id gyxehmirzpvuudiuqwai > src/types/database.types.ts
   ```

## 📈 Next Steps

1. **Customize the UI** to match your brand
2. **Add more features** like:
   - Email notifications
   - SMS alerts
   - Payment gateway integration
   - GPS tracking
   - Insurance management

3. **Deploy to production**:
   - Vercel (recommended)
   - Netlify
   - Railway

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase dashboard logs
3. Test database connections
4. Review RLS policies

---

**🎉 Congratulations! Your car rental management system is now set up and ready to use!** 