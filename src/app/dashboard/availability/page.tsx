import { PageShell } from "@/components/ui";
import { AvailabilityManager } from "./availability-manager";

export default function AvailabilityPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">זמינות</h1>
        <AvailabilityManager />
      </div>
    </PageShell>
  );
}
