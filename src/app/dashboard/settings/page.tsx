import { PageShell } from "@/components/ui";
import { SettingsManager } from "./settings-manager";

export default function SettingsPage() {
  return (
    <PageShell>
      <div className="grid gap-5">
        <h1 className="text-3xl font-bold">הגדרות</h1>
        <SettingsManager />
      </div>
    </PageShell>
  );
}
