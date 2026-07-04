import { apiFetchLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/db");
    const logs = await db
      .select({
        id: apiFetchLogs.id,
        label: apiFetchLogs.label,
        endpoint: apiFetchLogs.endpoint,
        status: apiFetchLogs.status,
        httpStatus: apiFetchLogs.httpStatus,
        durationMs: apiFetchLogs.durationMs,
        responsePreview: apiFetchLogs.responsePreview,
        errorMessage: apiFetchLogs.errorMessage,
        createdAt: apiFetchLogs.createdAt,
      })
      .from(apiFetchLogs)
      .orderBy(desc(apiFetchLogs.createdAt))
      .limit(12);

    return Response.json({ ok: true, logs });
  } catch (error) {
    console.error("[API Fetching] Failed to read request logs", error);
    return Response.json(
      {
        ok: false,
        logs: [],
        error: "Request history is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
