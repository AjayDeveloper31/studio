import AppShell from "@/components/AppShell";
import DashboardClient from "@/components/DashboardClient";

export default function DashboardPage() {
  return (
    <AppShell>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <DashboardClient />
      </main>
    </AppShell>
  );
}
