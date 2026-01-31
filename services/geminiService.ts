import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ToolType, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Maps raw Gemini API errors to user-friendly strings with actionable advice.
 */
function handleGeminiError(error: any): string {
  const msg = error?.message || String(error);
  
  if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
    return "Rate limit exceeded. Action: Please wait 60 seconds before starting a new extraction.";
  }
  
  if (msg.includes("400")) {
    return "Invalid request. Action: Try refining your search keywords or checking your input URL.";
  }
  
  if (msg.includes("500") || msg.includes("503") || msg.includes("overloaded")) {
    return "Gemini is currently under heavy load. Action: Please try again in a few moments.";
  }
  
  if (msg.includes("SAFETY") || msg.includes("blocked")) {
    return "The search query triggered safety filters. Action: Try using more professional or generalized terms.";
  }

  return `Extraction error: ${msg}. Action: Check your connection and try again.`;
}

export async function scrapeLeads(tool: ToolType, input: string, batchIndex: number = 0): Promise<Lead[]> {
  // Rotate focus strategy based on batchIndex to ensure uniqueness across iterations
  const strategies = [
    "Focus on top-tier decision makers (CEOs, VPs, Founders) in major tech hubs.",
    "Focus on operational and marketing leads in mid-market companies.",
    "Focus on regional offices and localized branches.",
    "Focus on fast-growing startups and recently funded ventures.",
    "Focus on established enterprise-level organizations.",
    "Focus on specialized consultants and niche practitioners.",
    "Target prospects in the Western US and European markets.",
    "Target prospects in the Eastern US and Asian-Pacific tech hubs."
  ];
  
  const currentStrategy = strategies[batchIndex % strategies.length];

  const prompt = `
    TASK: Exhaustive Lead Extraction & Intel Gathering (Batch #${batchIndex + 1})
    ENGINE: ${tool}
    SOURCE/CONTEXT: "${input}"
    STRATEGY: ${currentStrategy}

    GUIDELINES FOR DATA QUALITY:
    1. UNIQUENESS: This is batch #${batchIndex + 1}. Do NOT return results that would likely overlap with basic first-page results. 
    2. NAMES: Use full professional names (e.g., "Sarah J. Peterson" instead of "Sarah").
    3. EMAILS: Provide highly probable professional business emails. Avoid "info@", "admin@", or "sales@" unless specific to the tool. Prefer "first.last@company.com" or similar verified formats.
    4. PHONES: Use standard international or localized formatting (e.g., "+1 (555) 012-3456").
    5. LOCATION: Provide specific City and State/Country (e.g., "Austin, TX" or "London, UK").
    6. COMPANY: Include the legal or well-known trade name of the entity.

    EDGE CASE HANDLING:
    - If a specific field is unavailable, infer the most likely high-quality value based on the domain and industry.
    - NEVER use "N/A", "Unknown", or "Placeholder" values. 
    - Ensure every object has a unique "id" string (e.g., "lead_batch${batchIndex}_idx0").

    OUTPUT: Return EXACTLY a JSON array of 50-70 objects.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite Lead Generation Specialist. Your goal is to provide deep-web intelligence that is 100% accurate, formatted for enterprise CRM ingestion, and unique across multiple query batches.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Full professional name" },
              email: { type: Type.STRING, description: "Verified business email address" },
              phone: { type: Type.STRING, description: "Direct or office phone number" },
              company: { type: Type.STRING, description: "Current employer or business name" },
              title: { type: Type.STRING, description: "Professional job title" },
              location: { type: Type.STRING, description: "Physical office or residence location" },
              website: { type: Type.STRING, description: "Official business or personal website" },
              industry: { type: Type.STRING, description: "Primary industry vertical" },
              source: { type: Type.STRING, description: "URL or platform where lead was identified" }
            },
            required: ["id", "name", "email", "company"]
          }
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No data returned from the intelligence engine.");
    }

    const text = response.text?.trim();
    if (!text) return [];

    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error(`Batch ${batchIndex} extraction failed:`, error);
    throw new Error(handleGeminiError(error));
  }
}