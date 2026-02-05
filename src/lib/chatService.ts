import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are the Vertex Engineering Architect AI for Vertex Engineering Labs.

COMPANY CONTACT (Use these EXACT details):
- Phone/WhatsApp: +92 313 5229867
- Email: xheikhtalha.yasin2004@gmail.com
- Services: CAD Design, CFD/FEA Simulation, Rapid Prototyping, Mechatronics

Company Overview:
- Operational since 2019
- Specializes in CAD, CFD, FEA, Thermal Simulation, and Rapid Prototyping
- Trusted by engineers at MIT, SIEMENS, Stanford, P&G, Caltech, and HITACHI
- ISO 9001:2015 certified, on-premise lab, HPC cluster ready

Key Metrics:
- 247+ Projects Shipped
- 99.70% Analysis Precision
- $2.4M+ Cost Avoided for clients
- 24/7 Lab Access
- <24 Hours Response SLA

CRITICAL RESPONSE RULES:
1. Keep responses VERY SHORT (2-4 sentences max)
2. Use bullet points • when listing multiple items
3. NO lengthy paragraphs - be concise and strategic
4. If user mentions "whatsapp", "contact", "call", or "talk" → IMMEDIATELY provide:
   "📱 WhatsApp: +92 313 5229867
   Click to connect: https://wa.me/923135229867"
5. After providing info, ask ONE brief qualifying question
6. Be professional but friendly`;

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function sendChatMessage(message: string, conversationHistory: ChatMessage[]): Promise<string> {
    try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            throw new Error('Missing Groq API key. Please add VITE_GROQ_API_KEY to your .env.local file.');
        }

        const groq = new Groq({
            apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });

        // Build messages array for Groq
        const messages: any[] = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            }
        ];

        // Add conversation history
        conversationHistory.forEach((msg) => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile', // Fast and powerful Groq model
            temperature: 0.7,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        return response;

    } catch (error) {
        console.error('Chat error:', error);
        if (error instanceof Error) {
            throw new Error(`Chat failed: ${error.message}`);
        }
        throw new Error('Failed to send chat message');
    }
}
