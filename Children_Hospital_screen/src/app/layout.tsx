import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Children's Hospital Screen API Fetching",
  description: "Resilient API fetching console for hospital floor staff.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
