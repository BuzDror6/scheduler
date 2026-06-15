import { PageShell } from "@/components/ui";
import { EventTypesManager } from "./event-types-manager";

export default function EventTypesPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">סוגי פגישות</h1>
        <EventTypesManager />
      </div>
    </PageShell>
  );
}
