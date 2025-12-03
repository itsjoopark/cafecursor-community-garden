# Supabase Setup Guide

## ✅ Completed Setup

The following has been automatically configured for your project:

1. **Database Table**: `cards` table created with all necessary columns
2. **Storage Bucket**: `polaroid-images` bucket created for image uploads
3. **Security Policies**: Row Level Security (RLS) enabled with public access policies
4. **Real-time Subscriptions**: Enabled for live card updates across all users

## 🔧 Required Configuration

### Environment Variables

You need to add your Supabase credentials to your project. 

**Option 1: Copy your existing .env file**

If you already have a `.env` file with your Supabase credentials, rename it to `.env.local`:

```bash
mv .env .env.local
```

**Option 2: Create a new .env.local file**

Create a new file called `.env.local` in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wspeptlumwxpgkzcaitq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcGVwdGx1bXd4cGdremNhaXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDczODksImV4cCI6MjA4MDAyMzM4OX0.Kz8b3iCH8ciIGIqnbRX0R9FRuH96K079SeSAjoZOukM
```

> **Note**: The `.env.local` file is gitignored by default, so your credentials will not be committed to version control.

## 🚀 How It Works

### Image Upload Flow

1. When a user uploads an image, it's automatically uploaded to Supabase Storage (`polaroid-images` bucket)
2. The card data (including the Supabase image URL) is saved to the `cards` database table
3. All connected users see the new card appear in real-time via Supabase Realtime

### Card Updates

- **Position changes**: Automatically synced to database when cards are dragged
- **Title/Description edits**: Automatically synced to database when text is changed
- **Image updates**: New images are uploaded to Supabase Storage and URLs are updated

### Multi-User Collaboration

- All users can see all cards in real-time
- New cards appear automatically on all connected devices
- Cards are persisted in the database, so they remain after page refresh

## 🎨 Features

- **Public Access**: All users can create, view, update, and delete cards (no authentication required)
- **Real-time Updates**: Cards appear instantly across all connected devices
- **Persistent Storage**: All images and card data are stored in Supabase
- **Scalable**: Supports multiple users and large numbers of cards

## 🧪 Testing

After setting up the environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open multiple browser windows/tabs to test real-time collaboration

3. Upload an image and verify:
   - Image appears in Supabase Storage dashboard
   - Card data appears in the `cards` table
   - Card is visible to all users

## 📊 Supabase Dashboard

View your data and storage:
- **Database**: https://app.supabase.com/project/wspeptlumwxpgkzcaitq/editor
- **Storage**: https://app.supabase.com/project/wspeptlumwxpgkzcaitq/storage/buckets

## 🔒 Security Note

The current configuration allows **public access** to all cards and images. This is suitable for:
- Public collaborative art boards
- Event photo walls
- Community showcases

If you need user authentication and private cards in the future, you'll need to:
1. Enable Supabase Authentication
2. Update RLS policies to filter by user ID
3. Add login/signup UI to your app

## ❓ Troubleshooting

### "Failed to upload image"
- Check that `.env.local` exists with correct values
- Verify Supabase project is active
- Check browser console for detailed errors

### Cards not appearing for other users
- Ensure Realtime is enabled in Supabase project settings
- Check that RLS policies are correctly configured
- Verify both users are connected to the same project

### Images not loading
- Verify the `polaroid-images` bucket exists
- Check that bucket is set to `public`
- Ensure storage policies allow public reads

## 📝 Database Schema

```sql
-- Cards table structure
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  variant TEXT NOT NULL CHECK (variant IN ('dark', 'light')),
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  date_stamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎉 You're All Set!

Your app is now configured to use Supabase for:
- ✅ Image storage (S3-compatible bucket)
- ✅ Card data persistence (PostgreSQL database)
- ✅ Real-time collaboration (Supabase Realtime)
- ✅ Public access for all users

Enjoy your collaborative Polaroid card canvas! 📸






