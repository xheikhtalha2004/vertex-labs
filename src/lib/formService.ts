import { supabase } from './supabase';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || '';

export interface ContactFormData {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<void> {
    // Client-side validation
    if (!data.firstName || !data.lastName || !data.email || !data.message) {
        throw new Error('All fields are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
    }

    const wordCount = data.message.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 20) {
        throw new Error('Message must be at least 20 words');
    }

    // Primary: admin API (creates a Lead visible in /admin/leads)
    if (ADMIN_API_URL) {
        const res = await fetch(`${ADMIN_API_URL}/api/public/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
            throw new Error(json.error || 'Failed to submit form. Please try again.');
        }
        return;
    }

    // Fallback: Supabase (when admin API URL is not configured)
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .insert([{
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                message: data.message,
            }]);

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Failed to save submission. Please try again.');
        }
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Failed to submit form');
    }
}

