
import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scrapeLeads(tool: ToolType, input: string, batchIndex: number = 0): Promise<Lead[]> {
  const prompt = `
    You are an elite, high-capacity lead generation engine (Batch #${batchIndex + 1}).
    Task: Conduct an exhaustive extraction of unique leads for: ${tool}.
    Input Query/Source: "${input}"
    
    CRITICAL INSTRUCTION: 
    - Provide a batch of 50-70 HIGHLY UNIQUE leads.
    - Since this is batch #${batchIndex + 1}, ensure these leads are DIFFERENT from previous batches.
    - Focus on different segments, geographical sub-areas, or alphabetized clusters related to the input.
    - If the input is a URL, simulate a deep crawl of page ${batchIndex + 1}.
    
    Requirements:
    - Provide realistic but simulated data including Name, Company, verified-style Email, Phone, and precise Location.
    - Return ONLY a valid JSON array of objects.
    
    Response format: JSON array only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            company: { type: Type.STRING },
            title: { type: Type.STRING },
            location: { type: Type.STRING },
            website: { type: Type.STRING },
            industry: { type: Type.STRING },
            source: { type: Type.STRING }
          },
          required: ["id", "name", "email"]
        }
      }
    }
  });

  try {
    const text = response.text.trim();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Batch ${batchIndex} failed:`, error);
    return [];
  }
}
