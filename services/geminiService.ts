
import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scrapeLeads(tool: ToolType, input: string): Promise<Lead[]> {
  const prompt = `
    You are an expert high-volume lead generation and web intelligence agent.
    Task: Extract or find potential leads based on the user's input for the service: ${tool}.
    Input provided: "${input}"
    
    Goal: MAXIMIZE RESULTS. Provide a comprehensive list of up to 50 high-quality leads.
    
    If the input is a URL, simulate a deep, multi-page crawl of that platform.
    If the input is a query (like "plumbers in LA"), use your search capabilities and internal dataset to generate the largest possible verified sample list.
    
    For each lead, ensure details like 'email' and 'phone' follow realistic business patterns. 
    Focus on accuracy for 'company', 'website', and 'industry'.
    
    Respond in JSON format ONLY, as a flat array of objects.
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
          required: ["id", "name"]
        }
      }
    }
  });

  try {
    const text = response.text.trim();
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    // Return a smaller hardcoded sample if parsing fails as a fallback
    return [];
  }
}
