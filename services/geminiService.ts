
import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scrapeLeads(tool: ToolType, input: string, batchIndex: number = 0): Promise<Lead[]> {
  // We use batchIndex to vary the search query or focus area to avoid duplicates
  const prompt = `
    You are an elite, high-capacity lead generation engine (Iterative Mode - Batch #${batchIndex + 1}).
    Task: Extract 80-100 HIGHLY UNIQUE leads for: ${tool}.
    Base Input: "${input}"
    
    STRATEGY FOR THIS BATCH: 
    - Since this is batch #${batchIndex + 1}, focus on a DIFFERENT subset of data.
    - If it's a geographic search, look at a different neighborhood or suburb.
    - If it's a company search, look at companies starting with different letters or in different revenue tiers.
    - Use the googleSearch tool to find specific result pages or niche directories that haven't been visited in previous batches.
    
    CRITICAL QUALITY RULES:
    - Every lead MUST have a valid-looking business email.
    - Do NOT repeat any leads from previous conceptual batches.
    - Return exactly 80-100 leads in this response.
    
    Response format: JSON array of objects.
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
