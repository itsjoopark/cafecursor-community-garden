# 🚀 Quick Start - Supabase Configuration

## ⚡ One-Time Setup (Required)

Your `.env` file needs to be renamed and contain the correct environment variables for the app to work.

### Step 1: Rename your .env file

Run this command in your terminal:

```bash
cd /Users/ellenpark73591/Desktop/CursorCafeTO/CursorPromo
mv .env .env.local
```

### Step 2: Update .env.local with these values

Open `.env.local` and make sure it contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wspeptlumwxpgkzcaitq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcGVwdGx1bXd4cGdremNhaXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDczODksImV4cCI6MjA4MDAyMzM4OX0.Kz8b3iCH8ciIGIqnbRX0R9FRuH96K079SeSAjoZOukM
```

### Step 3: Restart your development server

```bash
npm run dev
```

## ✨ Test It Out

1. Open http://localhost:3000
2. Click the camera button and upload an image
3. The image will be saved to Supabase Storage
4. Open another browser window - you should see the same card!
5. Try dragging cards, editing text - changes sync across all users

## 📖 More Info

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed documentation about how everything works.

---

**That's it! Your app is now connected to Supabase! 🎉**






