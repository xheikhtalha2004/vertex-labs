import { supabase } from './supabase';

export interface ContactFormData {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<void> {
    try {
        // Client-side validation
        if (!data.firstName || !data.lastName || !data.email || !data.message) {
            throw new Error('All fields are required');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }

        // Word count validation (minimum 20 words)
        const wordCount = data.message.trim().split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 20) {
            throw new Error('Message must be at least 20 words');
        }

        // Insert directly into Supabase (using anon key from client)
        const { error } = await supabase
            .from('contact_submissions')
            .insert([
                {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    message: data.message,
                },
            ]);

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Failed to save submission. Please try again.');
        }
    } catch (error) {
        console.error('Submit form error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to submit form');
    }
}
