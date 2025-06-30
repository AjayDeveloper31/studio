import AppShell from "@/components/AppShell";
import ReportsClient from "@/components/ReportsClient";

export default function ReportsPage() {
  return (
    <AppShell>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <ReportsClient />
        </div>
      </main>
    </AppShell>
  );
}
