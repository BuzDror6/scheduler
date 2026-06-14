import { Card, PageShell } from "@/components/ui";

export default function SettingsPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">הגדרות</h1>
        <Card>
          <p className="text-slate-600">פרופיל, אזור זמן, קישור הזמנות וחיבור Google Calendar.</p>
        </Card>
      </div>
    </PageShell>
  );
}
