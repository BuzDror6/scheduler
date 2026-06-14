import { Card, PageShell } from "@/components/ui";

export default function BookingsPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">פגישות</h1>
        <Card>
          <p className="text-slate-600">כאן תוצג רשימת הפגישות מה־API: לקוח, תאריך, שעה, סוג פגישה וסטטוס.</p>
        </Card>
      </div>
    </PageShell>
  );
}
