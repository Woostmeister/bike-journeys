# 🛠️ Developer Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Key Files to Know

```
frontend/src/
├── index.css           # 🎨 Global styles & design system (MASTER STYLES)
├── App.css             # 🎯 Component-specific styles
├── App.tsx             # 🏠 Main app + navigation
├── components/
│   ├── Dashboard.tsx   # 📊 Stats & charts page
│   ├── RideForm.tsx    # ✏️ Add ride form
│   └── RideList.tsx    # 📖 Browse rides
├── Login.tsx           # 🔐 Login page
├── Signup.tsx          # ✍️ Signup page
├── AuthContext.tsx     # 🔑 Auth state management
└── ProtectedRoute.tsx  # 🛡️ Route protection

lib/supabaseClient.ts   # ⚡ Supabase config
```

## 🎨 Using the Design System

### Colors (CSS Variables)
```css
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Card backgrounds */
var(--bg-tertiary)     /* Nested elements */
var(--accent-primary)  /* Buttons, links */
var(--text-primary)    /* Main text */
var(--text-muted)      /* Secondary text */
var(--success)         /* Success states */
var(--error)           /* Error states */
var(--border)          /* Borders */
```

### Common Classes
```css
.card                  /* Standard card container */
.card-header           /* Card header section */
.card-title            /* Card title with icon */
.form-group            /* Form field wrapper */
.form-row              /* Grid layout for forms */
.input-with-icon       /* Input with left icon */
.stats-grid            /* Dashboard stats grid */
.stat-card             /* Individual stat card */
.alert                 /* Alert messages */
.alert-success         /* Success alert */
.alert-error           /* Error alert */
.animate-in            /* Page load animation */
.loading-container     /* Loading spinner center */
.spinner               /* Loading spinner */
```

## 🎯 Component Patterns

### Standard Page Layout
```tsx
<div className="animate-in">
  {/* Page Header */}
  <div style={{ marginBottom: "2rem" }}>
    <h1 style={{ marginBottom: "0.5rem" }}>🏍️ Page Title</h1>
    <p style={{ color: "var(--text-muted)" }}>Description</p>
  </div>

  {/* Content */}
  <div className="card">
    {/* Your content */}
  </div>
</div>
```

### Form Field Pattern
```tsx
<div className="form-group">
  <label htmlFor="fieldId">Field Label</label>
  <div className="input-with-icon">
    <span className="input-icon">🔍</span>
    <input
      id="fieldId"
      type="text"
      placeholder="Placeholder..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  </div>
</div>
```

### Alert Pattern
```tsx
{error && (
  <div className="alert alert-error">
    <span>❌</span>
    {error}
  </div>
)}

{message && (
  <div className="alert alert-success">
    <span>✅</span>
    {message}
  </div>
)}
```

### Loading State Pattern
```tsx
if (loading) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ color: "var(--text-muted)" }}>Loading...</p>
    </div>
  );
}
```

## 🗃️ Database Schema

```sql
Table: rides
├── id (UUID, primary key)
├── user_id (UUID, foreign key to auth.users)
├── date (DATE)
├── distance_miles (DECIMAL)
├── notes (TEXT, nullable)
├── location_name (TEXT, nullable)
├── latitude (DECIMAL, nullable)
├── longitude (DECIMAL, nullable)
├── weather_code (INTEGER, nullable)
├── temperature (DECIMAL, nullable)
└── created_at (TIMESTAMP)
```

### Row Level Security
- Users can only see/modify their own rides
- Policies enforce user_id = auth.uid()

## 🔌 API Integrations

### Supabase
```typescript
// Insert ride
await supabase.from("rides").insert([data]);

// Get user's rides
await supabase
  .from("rides")
  .select("*")
  .eq("user_id", user.id)
  .order("date", { ascending: false });

// Auth
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signUp({ email, password });
await supabase.auth.signOut();
```

### Open-Meteo Geocoding
```typescript
const response = await fetch(
  `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`
);
```

### Open-Meteo Weather
```typescript
const params = new URLSearchParams({
  latitude: String(lat),
  longitude: String(lon),
  hourly: "weathercode,temperature_2m",
  start_date: date,
  end_date: date,
});

const rideDate = new Date(date);
const today = new Date();
today.setHours(0, 0, 0, 0);

const baseUrl =
  rideDate < today
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";

const response = await fetch(`${baseUrl}?${params.toString()}`);
```

- Use the archive endpoint for any ride date **before today**; otherwise hit the forecast endpoint.
- If the weather request fails, we still insert the ride and simply leave `weather_code`/`temperature` null so the UI can display the ride without weather data.

## 🎨 Style Guidelines

### Spacing
- Use multiples of 0.5rem (8px base)
- Common: 0.5rem, 1rem, 1.5rem, 2rem

### Border Radius
- Small: 8px
- Medium: 12px  
- Large: 16-20px
- Round: 50% (circles)

### Transitions
- Micro: 0.15s
- Standard: 0.2s
- Slow: 0.3-0.4s
- Always use easing: `ease` or `ease-out`

### Font Sizes
- Large heading: 2.5rem
- Heading: 2rem
- Subheading: 1.5rem
- Body: 1rem
- Small: 0.875rem

## 🐛 Common Debugging

### Supabase Connection Issues
1. Check `.env` has correct values
2. Verify Supabase project is active
3. Check RLS policies are set up
4. Ensure auth is working

### Styles Not Applying
1. Check CSS variable names
2. Verify import order (index.css before App.css)
3. Check specificity
4. Clear browser cache

### Data Not Showing
1. Check user is authenticated
2. Verify RLS policies
3. Check database has data
4. Look at browser console

## 🚀 Deployment Checklist

- [ ] Update environment variables
- [ ] Test all authentication flows
- [ ] Verify database connections
- [ ] Check API rate limits
- [ ] Test on mobile devices
- [ ] Run production build
- [ ] Check for console errors
- [ ] Verify all routes work
- [ ] Test edge cases (no data, errors)

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Recharts Docs](https://recharts.org/en-US/)
- [Vite Docs](https://vitejs.dev)

## 🎯 Best Practices

1. **Always use TypeScript types**
2. **Memoize expensive calculations**
3. **Handle loading and error states**
4. **Provide user feedback**
5. **Keep components focused (single responsibility)**
6. **Use semantic HTML**
7. **Test on multiple screen sizes**
8. **Handle edge cases gracefully**

---

Happy coding! 🏍️💨