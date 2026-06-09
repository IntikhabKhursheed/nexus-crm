import { env } from "../config/env.js";

type GrokMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GrokChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function stripCodeFences(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }

  return trimmed;
}

function extractJson(content: string) {
  const cleaned = stripCodeFences(content);

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const sliced = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    }

    throw new Error("Grok returned content that could not be parsed as JSON.");
  }
}

async function postToGrok(messages: GrokMessage[]) {
  if (!env.groqApiKey) {
    throw new Error("Groq API key is missing. Set GROQ_API_KEY (or the legacy GROK_API / GROK_API_KEY / XAI_API_KEY aliases).");
  }

  const requestBody = {
    model: env.groqModel,
    messages,
    stream: false
  };

  console.info("[AI][Groq] Request", {
    baseUrl: env.groqBaseUrl,
    model: env.groqModel,
    messageCount: messages.length,
    messages: messages.map((message) => ({
      role: message.role,
      contentPreview: message.content.slice(0, 400)
    }))
  });

  const response = await fetch(`${env.groqBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.groqApiKey}`
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(env.aiRequestTimeoutMs)
  });

  const responseText = await response.text();

  console.info("[AI][Groq] Response", {
    ok: response.ok,
    status: response.status,
    bodyPreview: responseText.slice(0, 500)
  });

  if (!response.ok) {
    throw new Error(`Groq API request failed with status ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText) as GrokChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

async function runJsonPrompt<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const content = await postToGrok([
    {
      role: "system",
      content: `${systemPrompt}\n\nReturn valid JSON only. Do not wrap the response in markdown or extra commentary.`
    },
    {
      role: "user",
      content: userPrompt
    }
  ]);

  return extractJson(content) as T;
}

export async function generateContactEnrichment<T>(prompt: string) {
  return runJsonPrompt<T>(
    "You are a precise B2B sales research assistant for NexusCRM. Build concise, practical enrichment data that a salesperson can trust.",
    prompt
  );
}

export async function generateSalesDraft<T>(prompt: string) {
  return runJsonPrompt<T>(
    "You are a senior sales copywriter for a CRM. Write polished, personalized, conversion-focused sales content.",
    prompt
  );
}

export async function generateSalesAnalysis<T>(prompt: string) {
  return runJsonPrompt<T>(
    "You are a revenue operations analyst. Produce structured, evidence-based sales analysis and forecasting.",
    prompt
  );
}

export { postToGrok, extractJson };
