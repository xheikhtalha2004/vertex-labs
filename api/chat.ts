import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API configuration error' }), { status: 500 });
        }

        const { messages } = await req.json();

        // Get the last user message to feed into the "User: " slot of our prompt structure if needed,
        // or just pass the whole history to Gemini directly. 
        // The V1 Logic used a "Context" string. We should prepend this context.

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Updated to 1.5-flash for speed/cost

        // Construct the conversation history for Gemini
        // We'll insert the System Prompt logic as the first "model" instruction or pre-prompt.

        const systemPrompt = `You are the Vertex Engineering Architect AI for Vertex Engineering Labs.

COMPANY CONTACT (Use these EXACT details):
- Phone/WhatsApp: +92 313 5229867
- Email: business.vertexlabs@gmail.com
- Services: CAD Design, CFD/FEA Simulation, Rapid Prototyping, Mechatronics

CRITICAL RESPONSE RULES:
1. Keep responses VERY SHORT (2-4 sentences max)
2. Use bullet points • when listing multiple items
3. NO lengthy paragraphs - be concise and strategic
4. If user mentions "whatsapp", "contact", "call", or "talk" → IMMEDIATELY provide:
   "📱 WhatsApp: +92 313 5229867
   Click to connect: https://wa.me/923135229867"
5. After providing info, ask ONE brief qualifying question
6. Be professional but friendly`;

        // Convert 'ai' SDK messages to Gemini format if needed, OR just build a simpler prompt for the completion.
        // For simplicity and to match V1 logic which used a context block, we'll build the prompt manually.

        const lastMessage = messages[messages.length - 1];
        const history = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n');

        const fullPrompt = `${systemPrompt}

Previous chat:
${history}

User: ${lastMessage.content}

Reply concisely:`;

        const result = await model.generateContentStream(fullPrompt);
        const stream = GoogleGenerativeAIStream(result);

        return new StreamingTextResponse(stream);

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
