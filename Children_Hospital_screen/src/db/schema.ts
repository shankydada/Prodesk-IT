import { integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const apiFetchLogs = pgTable("api_fetch_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  label: varchar("label", { length: 120 }).notNull(),
  endpoint: text("endpoint").notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  httpStatus: integer("http_status"),
  durationMs: integer("duration_ms").notNull(),
  responsePreview: jsonb("response_preview"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
