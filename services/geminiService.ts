import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scrapeLeads(tool: ToolType, input: string, batchIndex: number = 0): Promise<Lead[]> {
  const isSocial = [ToolType.INSTAGRAM, ToolType.TWITTER, ToolType.LINKEDIN, ToolType.YOUTUBE].includes(tool);
  
  const prompt = `
    You are an elite, high-capacity lead generation engine (Iterative Mode - Batch #${batchIndex + 1}).
    Task: Extract 80-100 HIGHLY UNIQUE leads for: ${tool}.
    Base Input: "${input}"
    
    STRATEGY FOR THIS BATCH: 
    - Since this is batch #${batchIndex + 1}, focus on a DIFFERENT subset of data.
    - If it's a geographic search, look at a different neighborhood or suburb.
    - If it's a social/people search, focus on different keywords or profile segments.
    - Use the googleSearch tool to find specific result pages or niche directories that haven't been visited in previous batches.
    
    ${isSocial ? `FOR SOCIAL PLATFORMS:
    - Extract engagement metrics (e.g. '2.4% ER').
    - Extract follower counts (e.g. '150k').
    - Identify handles (e.g. '@username').
    - Look specifically for public contact info in bios or linked trees.` : ''}
    
    CRITICAL QUALITY RULES:
    - Every lead MUST have a valid-looking name and preferably a contact method (email/phone/handle).
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
            handle: { type: Type.STRING },
            followers: { type: Type.STRING },
            engagement: { type: Type.STRING },
            bio: { type: Type.STRING },
            source: { type: Type.STRING }
          },
          required: ["id", "name"]
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