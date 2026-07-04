import ApiFetchingPanel from "./api-fetching-panel";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <ApiFetchingPanel />
    </main>
  );
}
