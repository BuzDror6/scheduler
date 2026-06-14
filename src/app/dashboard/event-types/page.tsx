import { Card, PageShell } from "@/components/ui";

export default function EventTypesPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">סוגי פגישות</h1>
        <Card>
          <p className="text-slate-600">בשלב הבא נחבר כאן טופס יצירה/עריכה מול `/api/event-types`.</p>
        </Card>
      </div>
    </PageShell>
  );
}
