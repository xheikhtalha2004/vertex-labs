// Test script to check what models are available with your API key
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDyRsi4wTmNGFpwN238EcyihncIhtCguXI';
const genAI = new GoogleGenerativeAI(apiKey);

console.log('Testing Gemini API...');

// Try different model names
const modelNamesToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'models/gemini-pro',
    'models/gemini-1.5-flash',
];

for (const modelName of modelNamesToTry) {
    try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS with ${modelName}: ${text.substring(0, 50)}...`);
        break; // Stop after first success
    } catch (error) {
        console.log(`❌ FAILED with ${modelName}:`, error.message);
    }
}
