import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scrapeLeads(tool: ToolType, input: string, batchIndex: number = 0): Promise<Lead[]> {
  const isSocial = [ToolType.INSTAGRAM, ToolType.TWITTER, ToolType.LINKEDIN, ToolType.YOUTUBE].includes(tool);
  
  const prompt = `
    TASK: Extract high-quality, verified leads for the tool: ${tool}.
    USER QUERY: "${input}"
    CURRENT BATCH: ${batchIndex + 1}
    
    GUIDELINES:
    1. EXCLUSIVITY: For this batch, focus on discovering a NEW set of leads that are distinct from standard or previous results. 
    2. VERIFICATION: Only return leads where you can reasonably infer or find high-confidence data points. Avoid placeholders like "N/A" if possible; seek the best available public information.
    3. RELEVANCE: Ensure every lead strictly matches the industry, role, or location specified in the user query.
    4. SOURCE ACCURACY: Reference actual public platforms (LinkedIn, X, Maps, Yelp, etc.) via the googleSearch tool.
    
    ${isSocial ? `SOCIAL MEDIA FOCUS:
    - Capture the specific @handle.
    - Analyze public profile data to estimate 'engagement' (e.g., "High", "3.2%", "Very Active").
    - Provide a verified 'followers' count in a readable format (e.g., "12.4k").` : ''}
    
    LEAD STRUCTURE:
    - id: A unique string identifier.
    - name: Business or individual name.
    - email: Direct or company email (crucial).
    - phone: Contact number if available.
    - company/title: Professional context.
    - bio: A 1-sentence summary of why this lead is relevant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional lead generation engine. You must output data strictly in the requested JSON schema. Do not include conversational filler. Focus on accuracy, deliverability of contact info, and strict adherence to the search niche provided by the user.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique identifier" },
              name: { type: Type.STRING, description: "Full name" },
              email: { type: Type.STRING, description: "Email address" },
              phone: { type: Type.STRING, description: "Phone number" },
              company: { type: Type.STRING, description: "Company name" },
              title: { type: Type.STRING, description: "Job title" },
              location: { type: Type.STRING, description: "City/Region" },
              website: { type: Type.STRING, description: "URL" },
              industry: { type: Type.STRING, description: "Niche" },
              handle: { type: Type.STRING, description: "Social handle" },
              followers: { type: Type.STRING, description: "Follower count" },
              engagement: { type: Type.STRING, description: "Engagement metric" },
              bio: { type: Type.STRING, description: "Relevance summary" },
              source: { type: Type.STRING, description: "Source platform" }
            },
            required: ["id", "name"]
          }
        }
      }
    });

    const text = response.text.trim();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Extraction failed at Batch ${batchIndex}:`, error);
    return [];
  }
}