"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FetchResult = {
  ok: boolean;
  label?: string;
  endpoint?: string;
  fetchedAt?: string;
  durationMs?: number;
  status?: number;
  statusText?: string;
  responseType?: string;
  parseWarning?: string | null;
  data?: unknown;
  error?: string;
  fieldErrors?: {
    label?: string | null;
    endpoint?: string | null;
  };
};

type FetchLog = {
  id: number;
  label: string;
  endpoint: string;
  status: string;
  httpStatus: number | null;
  durationMs: number;
  responsePreview: unknown;
  errorMessage: string | null;
  createdAt: string;
};

type FieldErrors = {
  label?: string;
  endpoint?: string;
};

const EXAMPLE_ENDPOINT = "https://jsonplaceholder.typicode.com/todos/1";
const MAX_LABEL_LENGTH = 120;
const MAX_ENDPOINT_LENGTH = 2_000;

function cleanInput(value: string, maxLength: number) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, maxLength);
}

function sanitizeLabelInput(value: string) {
  return cleanInput(value, MAX_LABEL_LENGTH).replace(/[<>&"'`]/g, "");
}

function sanitizeEndpointInput(value: string) {
  return cleanInput(value, MAX_ENDPOINT_LENGTH).replace(/[<>"'`]/g, "");
}

function validateEndpoint(endpoint: string) {
  try {
    const parsedUrl = new URL(endpoint);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function formatPayload(payload: unknown) {
  if (payload === undefined || payload === null || payload === "") {
    return "No data found.";
  }

  if (Array.isArray(payload) && payload.length === 0) {
    return "No data found.";
  }

  if (typeof payload === "object" && Object.keys(payload as Record<string, unknown>).length === 0) {
    return "No data found.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return "Unable to display this response safely.";
  }
}

function getResultData(result: FetchResult | null) {
  if (!result) {
    return null;
  }

  if (result.error) {
    return { error: result.error };
  }

  return result.data ?? null;
}

export default function ApiFetchingPanel() {
  const [label, setLabel] = useState("Daily census validation");
  const [endpoint, setEndpoint] = useState(EXAMPLE_ENDPOINT);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<FetchResult | null>(null);
  const [logs, setLogs] = useState<FetchLog[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Ready to fetch API data.");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");

  const preview = useMemo(() => formatPayload(getResultData(result)), [result]);
  const filteredLogs = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();

    if (!query) {
      return logs;
    }

    return logs.filter((log) => `${log.label} ${log.endpoint} ${log.status} ${log.httpStatus ?? ""}`.toLowerCase().includes(query));
  }, [historyQuery, logs]);

  async function loadHistory() {
    setIsLoadingLogs(true);
    setHistoryError(null);

    try {
      const response = await fetch("/api/fetch-logs", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        logs?: FetchLog[];
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Request history is temporarily unavailable.");
      }

      setLogs(Array.isArray(payload.logs) ? payload.logs : []);
    } catch (error) {
      setLogs([]);
      setHistoryError(error instanceof Error ? error.message : "Request history is temporarily unavailable.");
    } finally {
      setIsLoadingLogs(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  function validateForm() {
    const nextErrors: FieldErrors = {};
    const trimmedLabel = label.trim();
    const trimmedEndpoint = endpoint.trim();

    if (!trimmedLabel) {
      nextErrors.label = "Request label is required.";
    }

    if (!trimmedEndpoint) {
      nextErrors.endpoint = "API URL is required.";
    } else if (!validateEndpoint(trimmedEndpoint)) {
      nextErrors.endpoint = "Enter a complete HTTP or HTTPS URL.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setStatusMessage("Please correct the highlighted fields before fetching.");
      return;
    }

    setIsFetching(true);
    setStatusMessage("Fetching API data. This may take a moment on a slow connection.");
    setResult(null);

    try {
      const response = await fetch("/api/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          label: sanitizeLabelInput(label),
          endpoint: sanitizeEndpointInput(endpoint),
        }),
      });

      const payload = (await response.json().catch(() => null)) as FetchResult | null;

      if (!payload) {
        throw new Error("The API response could not be parsed safely.");
      }

      if (payload.fieldErrors) {
        setFieldErrors({
          label: payload.fieldErrors.label ?? undefined,
          endpoint: payload.fieldErrors.endpoint ?? undefined,
        });
      }

      setResult(payload);
      setStatusMessage(payload.ok ? "API fetch completed successfully." : payload.error || "The API fetch completed with an error.");
      console.log("[Analytics] User interacted with API Fetching");
      await loadHistory();
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "Unable to fetch data right now.",
      });
      setStatusMessage("Unable to fetch data. Check the connection and try again.");
      console.log("[Analytics] User interacted with API Fetching");
    } finally {
      setIsFetching(false);
    }
  }

  function handleLabelChange(value: string) {
    setLabel(sanitizeLabelInput(value));
    if (fieldErrors.label) {
      setFieldErrors((current) => ({ ...current, label: undefined }));
    }
  }

  function handleEndpointChange(value: string) {
    setEndpoint(sanitizeEndpointInput(value));
    if (fieldErrors.endpoint) {
      setFieldErrors((current) => ({ ...current, endpoint: undefined }));
    }
  }

  function handleHistoryQueryChange(value: string) {
    setHistoryQuery(sanitizeLabelInput(value));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8 lg:py-12">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Children&apos;s Hospital Screen</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">API Fetching Console</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              A resilient staff-facing workspace for pulling API data, validating request inputs, and keeping consistent operational records.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" role="status" aria-live="polite">
            <span className="block font-semibold text-slate-950">System status</span>
            <span>{statusMessage}</span>
          </div>
        </div>
      </header>

      <main className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="fetch-form-title">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Primary action</p>
            <h2 id="fetch-form-title" className="text-2xl font-semibold text-slate-950">Fetch API data</h2>
            <p className="text-sm leading-6 text-slate-600">Enter a readable label and a complete public API URL. Requests run through the server to avoid browser CORS interruptions.</p>
          </div>

          <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit} noValidate aria-busy={isFetching}>
            <div>
              <label htmlFor="request-label" className="block text-sm font-semibold text-slate-900">Request label</label>
              <input
                id="request-label"
                name="request-label"
                type="text"
                value={label}
                onChange={(event) => handleLabelChange(event.target.value)}
                aria-invalid={Boolean(fieldErrors.label)}
                aria-describedby={fieldErrors.label ? "request-label-error" : "request-label-help"}
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200 ${fieldErrors.label ? "border-red-600" : "border-slate-300"}`}
                placeholder="Example: Evening bed census"
                autoComplete="off"
                required
              />
              <p id="request-label-help" className="mt-2 text-sm text-slate-500">Use a label staff and managers can recognize later.</p>
              {fieldErrors.label ? <p id="request-label-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.label}</p> : null}
            </div>

            <div>
              <label htmlFor="api-url" className="block text-sm font-semibold text-slate-900">API URL</label>
              <input
                id="api-url"
                name="api-url"
                type="url"
                value={endpoint}
                onChange={(event) => handleEndpointChange(event.target.value)}
                aria-invalid={Boolean(fieldErrors.endpoint)}
                aria-describedby={fieldErrors.endpoint ? "api-url-error" : "api-url-help"}
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200 ${fieldErrors.endpoint ? "border-red-600" : "border-slate-300"}`}
                placeholder={EXAMPLE_ENDPOINT}
                autoComplete="url"
                required
              />
              <p id="api-url-help" className="mt-2 text-sm text-slate-500">Only complete HTTP or HTTPS URLs are accepted.</p>
              {fieldErrors.endpoint ? <p id="api-url-error" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.endpoint}</p> : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isFetching}
                aria-busy={isFetching}
                aria-label="Fetch API data"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isFetching ? "Fetching…" : "Fetch API data"}
              </button>
              <button
                type="button"
                aria-label="Reset form to sample API request"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                onClick={() => {
                  handleLabelChange("Daily census validation");
                  handleEndpointChange(EXAMPLE_ENDPOINT);
                  setFieldErrors({});
                  setStatusMessage("Sample request restored.");
                }}
              >
                Use sample
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="response-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Output</p>
              <h2 id="response-title" className="mt-2 text-2xl font-semibold text-slate-950">Response preview</h2>
            </div>
            {isFetching ? (
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700" role="status" aria-live="polite">
                <span className="h-3 w-3 animate-pulse rounded-full bg-slate-950" aria-hidden="true" />
                Loading
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {result ? (
              <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Status: {result.status ?? (result.ok ? "OK" : "Error")}</span>
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Duration: {result.durationMs ?? 0}ms</span>
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Type: {result.responseType ?? "system"}</span>
              </div>
            ) : null}

            {result?.parseWarning ? <p className="mt-4 rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-700">{result.parseWarning}</p> : null}

            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-50" aria-live="polite">
              {isFetching ? "Fetching data from the remote API…" : preview}
            </pre>
          </div>
        </section>
      </main>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="history-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Manager view</p>
            <h2 id="history-title" className="mt-2 text-2xl font-semibold text-slate-950">Recent request history</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Structured logs keep operational outputs consistent and reviewable.</p>
          </div>
          <button
            type="button"
            aria-label="Refresh request history"
            aria-busy={isLoadingLogs}
            disabled={isLoadingLogs}
            onClick={loadHistory}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            {isLoadingLogs ? "Refreshing…" : "Refresh history"}
          </button>
        </div>

        <div className="mt-6">
          <label htmlFor="history-search" className="block text-sm font-semibold text-slate-900">Search request history</label>
          <input
            id="history-search"
            name="history-search"
            type="search"
            value={historyQuery}
            onChange={(event) => handleHistoryQueryChange(event.target.value)}
            aria-label="Search request history by label endpoint status or HTTP code"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
            placeholder="Search by label, endpoint, status, or HTTP code"
            autoComplete="off"
          />
        </div>

        <div className="mt-6" aria-live="polite" aria-busy={isLoadingLogs}>
          {isLoadingLogs ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-700" role="status">
              Loading request history…
            </div>
          ) : historyError ? (
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-700" role="alert">
              {historyError}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-700">
              No data found. Completed API fetches or matching search results will appear here.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <caption className="sr-only">Recent API fetch request history</caption>
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Label</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-4 py-3 font-semibold">HTTP</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Duration</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="max-w-xs px-4 py-4 align-top">
                          <span className="block font-semibold text-slate-950">{log.label}</span>
                          <span className="block truncate text-slate-500">{log.endpoint}</span>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">{log.status}</td>
                        <td className="px-4 py-4 align-top text-slate-700">{log.httpStatus ?? "—"}</td>
                        <td className="px-4 py-4 align-top text-slate-700">{log.durationMs}ms</td>
                        <td className="px-4 py-4 align-top text-slate-700">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
