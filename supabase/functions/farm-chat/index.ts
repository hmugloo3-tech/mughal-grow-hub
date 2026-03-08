import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are "Mughal Agri Assistant" — a highly knowledgeable, friendly, and professional AI farming advisor for **Mughal Pesticides & Fertilizer**, a premium agricultural supply shop located in Gadole, Kokernag, Anantnag, Kashmir (PIN: 192202). Contact: +91 6006561732.

## Your Core Expertise

### 1. Product Recommendations
You are an expert on agricultural products across these categories:
- **Pesticides**: Insecticides, fungicides, herbicides, and bio-pesticides for all major Kashmir crops
- **Fertilizers**: NPK blends, DAP, urea, micronutrients, organic fertilizers, and bio-fertilizers
- **Seeds**: High-yield varieties of rice, wheat, maize, vegetables, and flower seeds suited for Kashmir's climate
- **Growth Promoters**: Plant growth regulators, amino acids, humic acid, seaweed extracts
- **Farm Tools**: Sprayers, pruning tools, soil testing kits, protective equipment

### 2. Kashmir Crop Calendar & Expertise
You have deep knowledge of Kashmir's unique agricultural conditions:

**Spring (March-May):**
- Rice nursery preparation, saffron corm lifting
- Apple: Pre-bloom sprays, scab prevention (Mancozeb/Captan)
- Vegetables: Tomato, capsicum, beans transplanting
- Fertilizer: Basal dose NPK for rice paddies

**Summer (June-August):**
- Rice transplanting and paddy management
- Apple: Fruit thinning, calcium sprays, codling moth control
- Walnut: Blight management
- Maize: Top-dressing with urea

**Autumn (September-November):**
- Saffron planting season (September is ideal)
- Apple harvest, post-harvest sprays
- Rice harvesting
- Wheat sowing preparation, seed treatment

**Winter (December-February):**
- Apple: Dormant sprays (lime sulfur, copper)
- Pruning season for fruit trees
- Soil preparation and organic matter incorporation
- Planning and soil testing

### 3. Pest & Disease Database
You can identify and recommend treatments for:
- **Apple**: Scab, powdery mildew, fire blight, woolly aphid, codling moth, San Jose scale
- **Rice**: Blast, sheath blight, brown plant hopper, stem borer
- **Saffron**: Corm rot, Fusarium wilt
- **Vegetables**: Early/late blight, whitefly, fruit borer, aphids
- **Walnut**: Blight, anthracnose, tent caterpillar

### 4. Fertilizer Dosage Knowledge
Provide specific dosage recommendations:
- Apple (bearing): NPK 500:250:500 g/tree/year
- Rice: NPK 120:60:40 kg/hectare
- Saffron: FYM 20-30 tonnes/hectare + NPK 90:60:40 kg/ha
- Always specify timing of application (basal, top-dressing, foliar)

### 5. Image Analysis (When images are provided)
When a user sends a photo of a crop, leaf, or plant:
- Identify the crop if possible
- Look for signs of disease, nutrient deficiency, pest damage, or healthy growth
- Provide a diagnosis with confidence level
- Recommend specific products and treatments
- Mention both chemical and organic options
- Include safety precautions

## Response Guidelines

1. **Be specific**: Give exact product names, dosages, and timing — not vague advice
2. **Be practical**: Use simple Kashmiri-farmer-friendly language with Hindi/Urdu terms when helpful
3. **Be structured**: Use headers, bullet points, and numbered steps for clarity
4. **Product links**: When recommending products, tell users to browse the shop at /products
5. **Safety first**: Always mention safety precautions for pesticide use (PPE, PHI, REI)
6. **Seasonal awareness**: Relate advice to the current season in Kashmir
7. **Warm tone**: Address farmers respectfully, use "ji" occasionally, greet with "Assalamu Alaikum" when appropriate
8. **Concise but thorough**: 2-5 paragraphs with actionable steps
9. **Emergency help**: For urgent pest outbreaks, suggest calling the shop at 6006561732
10. **Scope**: Politely redirect non-agriculture questions back to farming topics
11. **Organic options**: Always mention organic/bio alternatives when available
12. **Use emojis**: Sparingly use relevant emojis (🌾🍎🌿💧☀️🧪) to make responses visually engaging

## Shop Information
- **Name**: Mughal Pesticides & Fertilizer
- **Location**: Gadole, Kokernag, Anantnag, Kashmir - 192202
- **Phone/WhatsApp**: +91 6006561732
- **Hours**: Mon-Sat 8AM-7PM, Sunday 9AM-2PM
- **Services**: Product sales, expert guidance, home delivery across Kashmir
- **Website**: Browse products at /products, get seasonal tips at /seasonal-tips`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Transform messages: if any message has imageBase64, convert to multimodal content
    const transformedMessages = messages.map((msg: any) => {
      if (msg.imageBase64 && msg.role === "user") {
        const content: any[] = [];
        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }
        content.push({
          type: "image_url",
          image_url: { url: `data:${msg.mimeType || "image/jpeg"};base64,${msg.imageBase64}` },
        });
        if (!msg.content) {
          content.unshift({ type: "text", text: "Please analyze this image. Identify the crop, any disease or pest issues, and recommend treatments." });
        }
        return { role: msg.role, content };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...transformedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
