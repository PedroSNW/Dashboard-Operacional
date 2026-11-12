// supabase/functions/seguranca-viaria-ia/index.ts
// Supabase Edge Function: Central de IA - Etapa 1: Integração com Gemini AI
// D'Granel Transportes - Sistema Operacional de Segurança Viária

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const MAX_BODY_BYTES = 25 * 1024;
const MAX_PROMPT_CHARS = 1000;
const MAX_CONCURRENT_REQUESTS_PER_INSTANCE = 3;
const USER_RATE_LIMIT = 10;
const USER_RATE_WINDOW_MS = 60_000;
const GEMINI_TIMEOUT_MS = 35_000;

const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

// Controle em memória por instância.
// Importante: Edge Functions podem executar em várias instâncias; este controle
// é uma proteção básica local, não substitui rate limiting distribuído.
let activeRequests = 0;
const userRequestTimestamps = new Map<string, number[]>();

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  const configuredOrigins = (Deno.env.get("DASHBOARD_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  // Se a variável estiver configurada, somente as origens listadas são aceitas.
  // Sem configuração, mantém "*" para facilitar a primeira implantação/teste.
  const allowOrigin = configuredOrigins.length === 0
    ? "*"
    : origin && configuredOrigins.includes(origin)
    ? origin
    : "";

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(
  req: Request,
  data: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  const configuredOrigins = (Deno.env.get("DASHBOARD_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0 || !origin) return true;
  return configuredOrigins.includes(origin);
}

async function readJsonBodyLimited(req: Request): Promise<Record<string, unknown>> {
  const contentLength = req.headers.get("content-length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (!Number.isFinite(declaredLength) || declaredLength < 0) {
      throw new HttpError("Cabeçalho Content-Length inválido.", 400);
    }
    if (declaredLength > MAX_BODY_BYTES) {
      throw new HttpError("Tamanho da requisição excede o limite de 25 KB.", 413);
    }
  }

  if (!req.body) {
    throw new HttpError("Corpo da requisição ausente.", 400);
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new HttpError("Tamanho da requisição excede o limite de 25 KB.", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bodyBytes));
  } catch {
    throw new HttpError("O corpo da requisição deve conter JSON válido.", 400);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError("O corpo da requisição deve ser um objeto JSON.", 400);
  }

  return parsed as Record<string, unknown>;
}

function enforceUserRateLimit(userId: string): void {
  const now = Date.now();
  const windowStart = now - USER_RATE_WINDOW_MS;

  // Remove registros antigos e limita o crescimento do mapa.
  for (const [id, timestamps] of userRequestTimestamps.entries()) {
    const recent = timestamps.filter((timestamp) => timestamp > windowStart);
    if (recent.length === 0) {
      userRequestTimestamps.delete(id);
    } else {
      userRequestTimestamps.set(id, recent);
    }
  }

  const recentRequests = (userRequestTimestamps.get(userId) ?? [])
    .filter((timestamp) => timestamp > windowStart);

  if (recentRequests.length >= USER_RATE_LIMIT) {
    throw new HttpError(
      "Limite de solicitações atingido. Aguarde um minuto antes de tentar novamente.",
      429,
    );
  }

  recentRequests.push(now);
  userRequestTimestamps.set(userId, recentRequests);
}

function getGeminiModel(): string {
  const model = (Deno.env.get("GEMINI_MODEL") || DEFAULT_GEMINI_MODEL).trim();

  // Evita que o valor do Secret altere a estrutura do endpoint.
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(model)) {
    throw new HttpError("O Secret GEMINI_MODEL possui um identificador inválido.", 500);
  }

  return model;
}

/**
 * Obtém a chave pública do Supabase com resolução em cascata:
 * 1. SUPABASE_ANON_KEY (se disponível)
 * 2. SUPABASE_PUBLISHABLE_KEYS (JSON, utilizando exclusivamente a propriedade 'default')
 * Retorna string vazia se nenhuma chave for encontrada.
 */
function getSupabasePublicKey(): string {
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  if (anonKey) return anonKey;

  const rawPublishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")?.trim();
  if (rawPublishableKeys) {
    try {
      const parsed = JSON.parse(rawPublishableKeys);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.default === "string" &&
        parsed.default.trim()
      ) {
        return parsed.default.trim();
      }
    } catch {
      // Ignora falha de parse JSON e retorna string vazia para validação controlada
    }
  }

  return "";
}

serve(async (req: Request) => {
  // CORS preflight.
  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(req)) {
      return new Response(null, { status: 403, headers: getCorsHeaders(req) });
    }
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (!isOriginAllowed(req)) {
    return jsonResponse(req, {
      success: false,
      error: "Origem não autorizada.",
    }, 403);
  }

  if (req.method !== "POST") {
    return jsonResponse(req, {
      success: false,
      error: "Método HTTP não permitido. Utilize POST.",
    }, 405);
  }

  if (activeRequests >= MAX_CONCURRENT_REQUESTS_PER_INSTANCE) {
    return jsonResponse(req, {
      success: false,
      error: "Servidor ocupado no momento. Tente novamente em instantes.",
    }, 429);
  }

  activeRequests++;

  try {
    // 1. Valida o cabeçalho Bearer.
    const authHeader = req.headers.get("Authorization");
    const tokenMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
    const token = tokenMatch?.[1]?.trim();

    if (!token) {
      throw new HttpError(
        "Acesso não autorizado: token Bearer ausente ou malformado.",
        401,
      );
    }

    // 2. Valida o JWT consultando o Supabase Auth no servidor.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = getSupabasePublicKey();

    if (!supabaseUrl || !supabaseKey) {
      throw new HttpError(
        "Configuração do servidor Supabase incompleta.",
        500,
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user?.id) {
      throw new HttpError(
        "Sessão inválida, expirada ou não autenticada no Supabase.",
        401,
      );
    }

    const userEmail = (user.email ?? "").trim().toLowerCase();
    if (!userEmail.endsWith("@dgranel.com.br")) {
      throw new HttpError(
        "Acesso restrito a contas corporativas @dgranel.com.br.",
        403,
      );
    }

    // 3. Aplica limite básico por usuário autenticado.
    enforceUserRateLimit(user.id);

    // 4. Valida o payload sem truncar nem substituir entradas inválidas.
    const body = await readJsonBodyLimited(req);
    const rawPrompt = typeof body.prompt === "string"
      ? body.prompt
      : typeof body.message === "string"
      ? body.message
      : "";

    const prompt = rawPrompt.trim();

    if (!prompt) {
      throw new HttpError("Informe uma pergunta no campo prompt ou message.", 400);
    }

    if (prompt.length > MAX_PROMPT_CHARS) {
      throw new HttpError(
        `A pergunta excede o limite de ${MAX_PROMPT_CHARS} caracteres.`,
        413,
      );
    }

    // 5. Obtém a chave Gemini exclusivamente dos Secrets do servidor.
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
    if (!geminiApiKey) {
      throw new HttpError(
        "Chave GEMINI_API_KEY não configurada nos Secrets do Supabase.",
        500,
      );
    }

    const geminiModel = getGeminiModel();
    const geminiEndpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;

    const geminiPayload = {
      systemInstruction: {
        parts: [{
          text:
            "Você é o assistente de Inteligência Artificial da Central de Segurança Viária da D'Granel Transportes. Responda sempre em português brasileiro de forma clara, profissional, concisa e objetiva. Não invente dados, indicadores ou causas. Quando não houver informação suficiente, deixe isso explícito.",
        }],
      },
      contents: [{
        role: "user",
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      },
    };

    // 6. Chama a Gemini API com timeout e retry em caso de HTTP 503 ou AbortError (até 2 retries)
    const maxAttempts = 3; // 1 inicial + 2 retries
    let attempt = 0;
    let geminiResponse: Response | null = null;

    // Helper para intervalo entre tentativas
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (attempt < maxAttempts) {
      attempt++;
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), GEMINI_TIMEOUT_MS);
      let isTimeout = false;

      try {
        geminiResponse = await fetch(geminiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
          body: JSON.stringify(geminiPayload),
          signal: abortController.signal,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          isTimeout = true;
          console.error("Gemini fetch error", {
            attempt,
            name: "AbortError",
            reason: "Timeout individual atingido",
          });

          if (attempt >= maxAttempts) {
            throw new HttpError(
              "A inteligência artificial está demorando mais que o esperado para responder. Tente novamente em alguns instantes.",
              504,
            );
          }
        } else {
          // Falha genérica de rede, DNS ou conexão – não repete, encerra com 502
          console.error("Gemini fetch error", { attempt, name: (error as any)?.name });
          throw new HttpError(
            "Falha de conexão com a Gemini API. Tente novamente mais tarde.",
            502,
          );
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // Se sofreu timeout e ainda tem tentativas, aguarda back-off e repete
      if (isTimeout) {
        const backoff = attempt === 1 ? 2000 : 4000;
        await sleep(backoff);
        continue;
      }

      // Se a resposta foi bem-sucedida (HTTP 2xx), prossegue com o processamento
      if (geminiResponse && geminiResponse.ok) {
        break;
      }

      if (geminiResponse) {
        // Registra o status HTTP desta tentativa
        console.error("Gemini API response status", { attempt, status: geminiResponse.status });

        // Retry somente para HTTP 503 (UNAVAILABLE)
        if (geminiResponse.status === 503 && attempt < maxAttempts) {
          // Libera o stream da resposta anterior antes do back-off
          try {
            await geminiResponse.body?.cancel();
          } catch {
            // Falha de cancelamento não deve interromper o fluxo de retry
          }
          const backoff = attempt === 1 ? 2000 : 4000;
          await sleep(backoff);
          continue;
        }
      }

      // Qualquer outro status HTTP não-200 (400, 401, 403, 429 etc.) encerra sem retry
      break;
    }

    // Proteção caso não haja resposta (não esperado nesta altura)
    if (!geminiResponse) {
      throw new HttpError("Falha inesperada ao chamar a Gemini API.", 502);
    }

    if (!geminiResponse.ok) {
      const status = geminiResponse.status;

      // Diagnostic instrumentation – captures status and possible error payload
      let parsedCode: unknown = undefined;
      let parsedStatus: unknown = undefined;
      let parsedMessage: string | undefined = undefined;
      try {
        const bodyText = await geminiResponse.text(); // read once
        const parsed = JSON.parse(bodyText);
        if (parsed && typeof parsed === "object" && "error" in parsed) {
          const err = (parsed as any).error;
          parsedCode = err?.code;
          parsedStatus = err?.status;
          if (typeof err?.message === "string") {
            parsedMessage = err.message.slice(0, 300);
          }
        }
      } catch {
        // If parsing fails or no error.message, keep parsedMessage undefined
      }

      console.error("Gemini API error response", {
        status,
        code: parsedCode,
        errorStatus: parsedStatus,
        message: parsedMessage,
      });

      if (status === 429) {
        throw new HttpError(
          "Limite de uso da Gemini API atingido. Tente novamente em instantes.",
          429,
        );
      }

      if (status === 400) {
        throw new HttpError(
          "A Gemini API rejeitou a solicitação. Verifique o modelo e o formato da requisição.",
          502,
        );
      }

      if (status === 401 || status === 403) {
        throw new HttpError(
          "A Gemini API recusou as credenciais configuradas no servidor.",
          502,
        );
      }

      if (status === 503) {
        throw new HttpError(
          "A inteligência artificial está temporariamente sobrecarregada. Aguarde alguns instantes e tente novamente.",
          503,
        );
      }

      throw new HttpError(
        "Não foi possível concluir a solicitação na Gemini API.",
        502,
      );
    }

    let geminiData: Record<string, unknown>;
    try {
      geminiData = await geminiResponse.json();
    } catch {
      throw new HttpError(
        "A Gemini API retornou uma resposta inválida.",
        502,
      );
    }

    const candidates = geminiData.candidates as Array<Record<string, unknown>> | undefined;
    const firstCandidate = candidates?.[0];
    const candidateContent = firstCandidate?.content as
      | { parts?: Array<{ text?: string }> }
      | undefined;

    const candidateText = candidateContent?.parts
      ?.map((part) => part.text ?? "")
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!candidateText) {
      throw new HttpError(
        "A Gemini API não retornou uma resposta textual.",
        502,
      );
    }

    const usage = geminiData.usageMetadata as
      | Record<string, number>
      | undefined;

    return jsonResponse(req, {
      success: true,
      model: geminiModel,
      prompt,
      response: candidateText,
      meta: {
        promptTokens: usage?.promptTokenCount ?? 0,
        candidatesTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
        finishReason: firstCandidate?.finishReason ?? "STOP",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(req, {
        success: false,
        error: error.message,
      }, error.status);
    }

    // Registra diagnóstico sanitizado no servidor sem expor tokens, chaves, cabeçalhos ou payloads
    const errorType = error instanceof Error ? error.name : "UnknownError";
    console.error(`[Central IA Error] Tipo: ${errorType} | Falha não tratada durante a execução da função.`);

    // Não devolve mensagens, stack traces, tokens ou detalhes internos ao cliente.
    return jsonResponse(req, {
      success: false,
      error: "Ocorreu um erro interno durante a execução da Central de IA.",
    }, 500);
  } finally {
    activeRequests--;
  }
});
