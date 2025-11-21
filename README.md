# 🏍️ Bike Journeys

A beautiful, modern web application for tracking your motorcycle/bike rides with weather data, location tracking, and insightful statistics.

## ✨ Features

### 🎨 **Modern UI/UX**
- Sleek dark theme with glassmorphism effects
- Smooth animations and transitions
- Fully responsive design for mobile and desktop
- Professional color palette and typography

### 📊 **Dashboard**
- Visual statistics with animated stat cards
- Monthly distance and ride frequency charts
- Recent rides overview
- Key metrics at a glance

### ✏️ **Add Rides**
- Easy-to-use form with intelligent validation
- Location autocomplete with geocoding
- Automatic weather data fetching
- Distance tracking in miles
- Optional notes for memorable moments

### 📖 **Ride History**
- Organized by month with collapsible sections
- Search and filter functionality
- Weather conditions display
- Distance totals per month
- Beautiful ride cards with all details

### 🔐 **Authentication**
- Secure Supabase authentication
- Protected routes
- User-specific data isolation

### 🌦️ **Weather Integration**
- Automatic weather code fetching for ride dates
- Temperature recording
- Weather emoji indicators
- Open-Meteo API integration

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with CSS Variables
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Routing**: React Router v7
- **Geocoding**: Open-Meteo Geocoding API
- **Weather**: Open-Meteo Weather API

## 🧹 Cleanup from the Azure version

- Removed the legacy Azure Functions API (SQLite) now that Supabase provides the database and auth.
- Dropped the Azure Static Web Apps config; Vercel handles routing via `vercel.json`.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bike-journeys
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase:

Run this SQL in your Supabase SQL editor:

```sql
-- Create rides table
CREATE TABLE rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  distance_miles DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  weather_code INTEGER,
  temperature DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rides"
  ON rides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rides"
  ON rides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rides"
  ON rides FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rides"
  ON rides FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_rides_user_id ON rides(user_id);
CREATE INDEX idx_rides_date ON rides(date DESC);
```

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Statistics and charts
│   │   ├── RideForm.tsx       # Add new rides
│   │   └── RideList.tsx       # Browse ride history
│   ├── App.tsx                # Main app component with routing
│   ├── App.css                # Component-specific styles
│   ├── index.css              # Global styles and design system
│   ├── AuthContext.tsx        # Authentication context
│   ├── Login.tsx              # Login page
│   ├── Signup.tsx             # Signup page
│   └── ProtectedRoute.tsx     # Route protection HOC
├── lib/
│   └── supabaseClient.ts      # Supabase configuration
```

## 🎨 Design System

### Colors
- **Primary Background**: `#0a0e27` (Deep navy)
- **Secondary Background**: `#151935` (Dark blue)
- **Accent**: `#6366f1` (Vibrant indigo)
- **Text**: `#f1f5f9` (Light gray)
- **Success**: `#10b981` (Emerald)
- **Error**: `#ef4444` (Red)

### Typography
- Font Family: Inter, system fonts
- Headings: 600 weight
- Body: 400 weight

## 🔮 Future Enhancements

- [ ] Map view with ride routes
- [ ] Export rides to CSV/PDF
- [ ] Social sharing
- [ ] Bike management (multiple bikes)
- [ ] Ride categories/tags
- [ ] Photo uploads
- [ ] Maintenance tracking
- [ ] Fuel consumption tracking
- [ ] Route planning
- [ ] Achievements/badges system

## 📝 License

MIT

## 🙏 Acknowledgments

- Open-Meteo for weather and geocoding APIs
- Supabase for backend infrastructure
- Recharts for beautiful charts
- React team for the amazing framework

---

Built with ❤️ and ☕ by Carol
