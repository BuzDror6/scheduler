import { Card, PageShell } from "@/components/ui";

export default function AvailabilityPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">זמינות</h1>
        <Card>
          <p className="text-slate-600">כאן נגדיר שעות שבועיות וימים חסומים מול `/api/availability` ו־`/api/blocked-dates`.</p>
        </Card>
      </div>
    </PageShell>
  );
}
