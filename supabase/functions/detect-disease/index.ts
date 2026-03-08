import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert agricultural plant pathologist specializing in crop disease detection from leaf images. You serve farmers in Kashmir and South Asia.

When shown a leaf image, analyze it carefully and respond using the tool provided.

Guidelines:
- If the plant looks healthy with no visible disease symptoms, set is_healthy to true and disease_name to "Healthy Plant"
- Identify the crop type if possible (Rice, Wheat, Tomato, Potato, Apple, Maize, Cotton, Capsicum, Brinjal, Saffron, etc.)
- If you cannot identify the crop, set crop_name to "Unknown"
- Provide confidence as a percentage (0-100)
- Severity should be "Low", "Medium", or "High"
- Treatment recommendations should be practical and farmer-friendly
- Include both chemical and organic treatment options
- Dosage should be per acre
- Safety tips should cover protective equipment and spray timing`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` },
              },
              {
                type: "text",
                text: "Analyze this leaf image for crop diseases. Identify the crop and any diseases present. Provide detailed treatment recommendations.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_disease_analysis",
              description: "Report the results of crop disease analysis from a leaf image.",
              parameters: {
                type: "object",
                properties: {
                  is_healthy: { type: "boolean", description: "Whether the plant appears healthy with no disease" },
                  crop_name: { type: "string", description: "Identified crop name (e.g. Rice, Wheat, Tomato, Apple)" },
                  disease_name: { type: "string", description: "Name of the detected disease, or 'Healthy Plant' if none" },
                  confidence: { type: "number", description: "Confidence level 0-100" },
                  severity: { type: "string", enum: ["Low", "Medium", "High", "None"], description: "Disease severity" },
                  symptoms: { type: "string", description: "Visible symptoms described" },
                  causes: { type: "string", description: "What causes this disease" },
                  treatment: {
                    type: "object",
                    properties: {
                      recommended_pesticide: { type: "string" },
                      dosage_per_acre: { type: "string" },
                      best_spray_time: { type: "string" },
                      preventive_measures: { type: "array", items: { type: "string" } },
                      organic_options: { type: "array", items: { type: "string" } },
                    },
                    required: ["recommended_pesticide", "dosage_per_acre", "best_spray_time", "preventive_measures", "organic_options"],
                  },
                  safety_tips: { type: "array", items: { type: "string" }, description: "Spray safety instructions" },
                },
                required: ["is_healthy", "crop_name", "disease_name", "confidence", "severity", "symptoms", "causes", "treatment", "safety_tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_disease_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI could not analyze the image. Please try a clearer photo." }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-disease error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
