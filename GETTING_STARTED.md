# 🚀 Getting Started - Quick Setup Guide

## ⚡ 5-Minute Setup

### 1️⃣ Install Dependencies (1 min)
```bash
cd frontend
npm install
```

### 2️⃣ Set Up Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run this:

```sql
-- Create the rides table
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

-- Create security policies
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

-- Create indexes
CREATE INDEX idx_rides_user_id ON rides(user_id);
CREATE INDEX idx_rides_date ON rides(date DESC);
```

4. Go to **Settings → API** and copy your:
   - Project URL
   - Anon/Public key

### 3️⃣ Configure Environment (1 min)

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual values from Supabase!

### 4️⃣ Start Development Server (30 sec)
```bash
npm run dev
```

### 5️⃣ Open Browser (30 sec)
Visit: `http://localhost:5173`

---

## 🎉 First Steps

1. **Sign Up**: Create your account
2. **Add First Ride**: Click "Add Ride" and record a journey
3. **View Dashboard**: See your stats appear!
4. **Browse History**: Check out the organized ride list

---

## 🎨 What You'll See

### First Time (No Rides Yet)
- Welcome message
- Empty state with friendly prompt
- "Add your first ride" call-to-action

### After Adding Rides
- Dashboard with growing stats
- Charts showing trends
- Searchable ride history
- Weather data for each ride

---

## 💡 Pro Tips

### Adding Rides
- **Location**: Start typing any city/place, select from dropdown
- **Weather**: Automatically fetched based on date + location
- **Notes**: Great for memorable moments or bike performance notes

### Browsing History
- **Search**: Filter by location, date, or notes
- **Months**: Click to expand/collapse
- **Cards**: Hover to see highlight effect

### Dashboard
- **Stats**: Update in real-time as you add rides
- **Charts**: Show last 12 months
- **Trends**: Identify your riding patterns

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
✅ Check your `.env` file has correct values  
✅ Verify Supabase project is active  
✅ Make sure you ran the SQL setup script

### "No rides showing"
✅ Confirm you're logged in  
✅ Check RLS policies are set up  
✅ Try adding a new ride to test

### "Location search not working"
✅ Check internet connection  
✅ Open-Meteo API should work globally  
✅ Try a well-known city name

### "Styles look broken"
✅ Clear browser cache (Ctrl+Shift+R)  
✅ Check both index.css and App.css loaded  
✅ Try different browser

---

## 📱 Mobile Access

The app is fully responsive! Open it on your phone:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Visit: `http://YOUR_IP:5173` on phone
3. Ensure phone is on same WiFi network

---

## 🚀 Going to Production

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag & drop `dist` folder
- **Your own server**: Serve `dist` folder

### Environment Variables
Remember to set your `VITE_SUPABASE_*` variables in your deployment platform!

---

## 📚 Next Steps

1. **Customize**: Edit colors in `index.css` (CSS variables)
2. **Extend**: Add features (see CHANGELOG for ideas)
3. **Share**: Deploy and share with friends
4. **Track**: Start logging your rides consistently

---

## 🎯 Key Files You Might Edit

```
frontend/src/
├── index.css              ← Change colors/theme here
├── App.css                ← Adjust component styles
├── components/
│   ├── Dashboard.tsx      ← Modify dashboard stats/charts
│   ├── RideForm.tsx       ← Customize form fields
│   └── RideList.tsx       ← Change ride display
```

---

## 🆘 Need Help?

### Common Issues
- **Auth**: Check Supabase email settings
- **Database**: Verify RLS policies
- **API**: Confirm environment variables
- **UI**: Clear cache, check console

### Resources
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

---

## 🎊 You're Ready!

Everything is set up and ready to go. Just:
```bash
npm run dev
```

And start tracking your rides! 🏍️💨

Enjoy your beautiful new app! ✨

---

**Questions?** Check the other guide files:
- `README.md` - Full documentation
- `DEV_GUIDE.md` - Developer reference
- `DESIGN_GUIDE.md` - Visual design details
- `CHANGELOG.md` - What's new
- `VISUAL_SUMMARY.md` - UI preview