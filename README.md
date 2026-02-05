# Vertex Labs V2 - Setup Guide

## 🎉 What's Been Updated

V2 now includes all the features from V1:

✅ **AI Chatbot** - Floating chat button with Google Gemini AI integration  
✅ **Contact Form** - Functional form with Supabase backend  
✅ **Bug Fixes** - Removed non-functional buttons, fixed navigation  
✅ **Contact Info** - Updated with real phone/email  
✅ **WhatsApp Integration** - Direct WhatsApp handoff from chatbot  

## 📋 Environment Setup

### Step 1: Copy Environment Variables

```bash
cp .env.example .env.local
```

### Step 2: Fill In Your API Keys

Edit `.env.local` and add your credentials:

```env
# Required for AI Chatbot
VITE_GOOGLE_AI_STUDIO_API_KEY=your_google_ai_api_key

# Required for Contact Form
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Number (already configured)
VITE_WHATSAPP_NUMBER=+923135229867
```

#### How to Get API Keys:

**Google AI Studio API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste into `.env.local`

**Supabase Keys:**
1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy URL, anon key, and service_role key

### Step 3: Set Up Supabase Table

Create a table in your Supabase project:

```sql
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);

-- Add Row Level Security (optional but recommended)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert
CREATE POLICY "Allow backend inserts" ON contact_submissions
  FOR INSERT TO service_role
  WITH CHECK (true);
```

## 🚀 Running Locally

```bash
# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## 🧪 Testing Features

### Test AI Chatbot:
1. Click floating chat button (bottom-right)
2. Try quick replies or type a message
3. Ask about "WhatsApp" to trigger handoff feature

### Test Contact Form:
1. Scroll to contact section 
2. Fill all fields (minimum 20 words in message)
3. Submit and check for success message
4. Verify entry appears in Supabase dashboard

### Test Navigation:
1. Click navbar links (Services, Archive, Contact)
2. Click footer links
3. Verify smooth scrolling works

## 📦 Building for Production

```bash
npm run build
```

## 🌐 Deploying to Vercel

### Option 1: Deploy via GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Updated V2 with AI chatbot and contact form"
   git push origin main
   ```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `VITE_GOOGLE_AI_STUDIO_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_WHATSAPP_NUMBER`
5. Deploy!

### Option 2: Deploy via Vercel CLI

```bash
npx vercel
```

Follow the prompts and add environment variables when asked.

## 🐛 Troubleshooting

### AI Chatbot not responding:
- Check `VITE_GOOGLE_AI_STUDIO_API_KEY` is set correctly
- Check browser console for errors
- Verify API key has Gemini API enabled

### Contact form not submitting:
- Check all Supabase keys are set
- Verify Supabase table exists with correct schema
- Check Supabase dashboard → Table Editor for submissions

### "Module not found" errors:
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## 📝 Notes

- The AI chatbot uses Google Gemini API (requires internet)
- Contact form submissions are stored in Supabase
- WhatsApp number can be changed in `.env.local`
- All 3D graphics and animations from original V2 are preserved

## 📧 Contact

- **Email**: xheikhtalha.yasin2004@gmail.com
- **WhatsApp**: +92 313 5229867
