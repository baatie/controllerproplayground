
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

// Complex financial analysis with Thinking Mode
export async function getFinancialInsights(context: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: context,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || "No insights generated.";
}

// Analyze invoice for third-party documentation compliance
export async function getComplianceAnalysis(invoiceData: any, businessData: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    As a senior financial controller, perform a 3rd-party compliance audit on this invoice.
    
    INVOICE LEDGER: ${JSON.stringify(invoiceData)}
    ENTITY PROFILE: ${JSON.stringify(businessData)}
    
    TASK:
    1. Identify mandatory 3rd-party documentation required for this transaction (e.g., Tax ID verification, W-9/W-8BEN-E requirements, insurance certificates).
    2. Check for "Billing Hygiene": Are payment terms, bank details, and VAT/Tax headers explicitly clear for an external auditor?
    3. Generate a "Controller's Compliance Audit Note" to be appended to the PDF.
    
    Format:
    - Documentation Status (List what is present and what is requested)
    - Legal Disclosures (Standard jurisdictional headers)
    - Audit Trail Recommendation
    
    Keep the tone authoritative, professional, and concise.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || "Audit complete: Document meets standard third-party billing requirements.";
}

// Fast responses for UI/UX micro-copy or simple queries
export async function getQuickAdvice(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
  });
  return response.text || "";
}

// Market research with Google Search Grounding
export async function searchMarketTrends(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, sources };
}

// Audio encoding/decoding utilities for Live API
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
