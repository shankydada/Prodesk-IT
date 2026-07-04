export const dynamic = "force-dynamic";

const MAX_LABEL_LENGTH = 120;
const MAX_ENDPOINT_LENGTH = 2_000;
const FETCH_TIMEOUT_MS = 10_000;
const PREVIEW_LIMIT = 20_000;

function cleanControlCharacters(value: string, maxLength: number) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

function sanitizeLabel(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return cleanControlCharacters(value, MAX_LABEL_LENGTH).replace(/[<>&"'`]/g, "");
}

function sanitizeEndpoint(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return cleanControlCharacters(value, MAX_ENDPOINT_LENGTH).replace(/[<>"'`]/g, "");
}

function validateUrl(endpoint: string) {
  try {
    const parsedUrl = new URL(endpoint);
    const isHttp = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    const hasHostname = parsedUrl.hostname.length > 0;

    if (!isHttp || !hasHostname) {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
}

function summarizePayload(payload: unknown): unknown {
  if (payload === null || typeof payload !== "object") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.slice(0, 10);
  }

  const entries = Object.entries(payload as Record<string, unknown>).slice(0, 20);
  return Object.fromEntries(entries);
}

async function readResponseSafely(response: Response) {
  const text = await response.text();
  const clippedText = text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}…` : text;

  if (!clippedText) {
    return {
      data: null,
      parseWarning: "The API returned an empty response body.",
      responseType: "empty",
    };
  }

  try {
    return {
      data: summarizePayload(JSON.parse(clippedText)),
      parseWarning: null,
      responseType: "json",
    };
  } catch {
    return {
      data: clippedText,
      parseWarning: "The API did not return valid JSON, so a text preview is shown.",
      responseType: "text",
    };
  }
}

async function writeLog(log: {
  label: string;
  endpoint: string;
  status: "success" | "error";
  httpStatus: number | null;
  durationMs: number;
  responsePreview: unknown;
  errorMessage: string | null;
}) {
  try {
    const [{ db }, { apiFetchLogs }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    await db.insert(apiFetchLogs).values(log);
  } catch (error) {
    console.error("[API Fetching] Failed to write request log", error);
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let label = "Untitled request";
  let endpoint = "";

  try {
    const body = (await request.json().catch(() => null)) as {
      label?: unknown;
      endpoint?: unknown;
    } | null;

    label = sanitizeLabel(body?.label) || "Untitled request";
    endpoint = sanitizeEndpoint(body?.endpoint);

    const parsedUrl = validateUrl(endpoint);

    if (!label || !endpoint || !parsedUrl) {
      const message = "Enter a request label and a valid HTTP or HTTPS API URL.";
      await writeLog({
        label,
        endpoint,
        status: "error",
        httpStatus: 400,
        durationMs: Date.now() - startedAt,
        responsePreview: null,
        errorMessage: message,
      });

      return Response.json(
        {
          ok: false,
          error: message,
          fieldErrors: {
            label: label ? null : "Request label is required.",
            endpoint: parsedUrl ? null : "Use a complete HTTP or HTTPS URL.",
          },
        },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(parsedUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      const parsedResponse = await readResponseSafely(response);
      const durationMs = Date.now() - startedAt;
      const responsePayload = {
        status: response.status,
        statusText: response.statusText,
        responseType: parsedResponse.responseType,
        parseWarning: parsedResponse.parseWarning,
        data: parsedResponse.data,
      };

      await writeLog({
        label,
        endpoint: parsedUrl.toString(),
        status: response.ok ? "success" : "error",
        httpStatus: response.status,
        durationMs,
        responsePreview: responsePayload,
        errorMessage: response.ok ? null : `Remote API responded with HTTP ${response.status}.`,
      });

      return Response.json(
        {
          ok: response.ok,
          label,
          endpoint: parsedUrl.toString(),
          fetchedAt: new Date().toISOString(),
          durationMs,
          ...responsePayload,
        },
        { status: response.ok ? 200 : 502 },
      );
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const message = isAbort
        ? "The request timed out. Please check connectivity and try again."
        : "Unable to reach the API. Please check the URL or network connection.";

      await writeLog({
        label,
        endpoint: parsedUrl.toString(),
        status: "error",
        httpStatus: isAbort ? 408 : 503,
        durationMs: Date.now() - startedAt,
        responsePreview: null,
        errorMessage: message,
      });

      return Response.json(
        {
          ok: false,
          error: message,
        },
        { status: isAbort ? 408 : 503 },
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = "The request could not be processed safely.";

    await writeLog({
      label,
      endpoint,
      status: "error",
      httpStatus: 500,
      durationMs: Date.now() - startedAt,
      responsePreview: null,
      errorMessage: message,
    });

    console.error("[API Fetching] Unexpected route error", error);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
