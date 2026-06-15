import { PageShell } from "@/components/ui";
import { BookingsManager } from "./bookings-manager";

export default function BookingsPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">פגישות</h1>
        <BookingsManager />
      </div>
    </PageShell>
  );
}
