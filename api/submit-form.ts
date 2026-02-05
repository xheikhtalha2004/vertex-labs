import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { firstName, lastName, email, message } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Word count validation (minimum 20 words)
        const wordCount = message.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
        if (wordCount < 20) {
            return res.status(400).json({ error: 'Message must be at least 20 words' });
        }

        // Initialize Supabase client with service role key (backend only)
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase configuration');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Insert into Supabase
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([
                {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    message: message,
                },
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to save submission' });
        }

        return res.status(200).json({
            success: true,
            message: 'Form submitted successfully',
            data: data
        });
    } catch (error) {
        console.error('Submit form API error:', error);
        return res.status(500).json({
            error: 'Server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
