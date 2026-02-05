-- Run this SQL in your Supabase SQL Editor
-- This will create the contact_submissions table if it doesn't exist

-- Create table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for the contact form)
DROP POLICY IF EXISTS "Allow public inserts" ON contact_submissions;
CREATE POLICY "Allow public inserts" 
ON contact_submissions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow service role to do everything
DROP POLICY IF EXISTS "Allow service role all" ON contact_submissions;
CREATE POLICY "Allow service role all" 
ON contact_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
