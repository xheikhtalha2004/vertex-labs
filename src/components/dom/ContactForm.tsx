'use client';

import { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function ContactForm() {
    const [wordCount, setWordCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string,
        };

        setSubmitting(true);

        try {
            const { submitContactForm } = await import('../../lib/formService');
            await submitContactForm(data);

            alert('✓ Submission successful! We\'ll respond within 24 hours.');
            formRef.current?.reset();
            setWordCount(0);
        } catch (error) {
            console.error('Submit error:', error);
            alert('✗ ' + (error instanceof Error ? error.message : 'Error submitting form'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-[#A6AFBF] mb-2">First Name *</label>
                    <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full bg-[#07080B] border border-[#A6AFBF]/20 rounded-lg px-4 py-3 text-base sm:text-sm text-white
                       focus:border-[#4F6DF5]/50 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm text-[#A6AFBF] mb-2">Last Name *</label>
                    <input
                        type="text"
                        name="lastName"
                        required
                        className="w-full bg-[#07080B] border border-[#A6AFBF]/20 rounded-lg px-4 py-3 text-base sm:text-sm text-white
                       focus:border-[#4F6DF5]/50 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-[#A6AFBF] mb-2">Email Address *</label>
                <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-[#07080B] border border-[#A6AFBF]/20 rounded-lg px-4 py-3 text-base sm:text-sm text-white
                     focus:border-[#4F6DF5]/50 focus:outline-none transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm text-[#A6AFBF] mb-2">Technical Scope (Minimum 20 Words) *</label>
                <textarea
                    name="message"
                    rows={5}
                    required
                    onChange={(e) => setWordCount(e.target.value.split(/\s+/).filter((w: string) => w.length > 0).length)}
                    className="w-full bg-[#07080B] border border-[#A6AFBF]/20 rounded-lg px-4 py-3 text-base sm:text-sm text-white resize-none
                     focus:border-[#4F6DF5]/50 focus:outline-none transition-colors"
                />
                <div className="text-right text-xs text-[#A6AFBF]/60 mt-1">
                    Word count: {wordCount}
                </div>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {submitting ? 'Submitting...' : 'Execute Submission'}
                <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-[#A6AFBF]/60">
                End-to-End TLS 1.3 Encryption • Response SLA: 24hrs
            </p>
        </form>
    );
}
