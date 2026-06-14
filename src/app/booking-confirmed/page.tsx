import { PageShell, ButtonLink } from "@/components/ui";

export default function BookingConfirmedPage() {
  return (
    <PageShell>
      <div className="grid min-h-[70vh] content-center gap-4">
        <h1 className="text-4xl font-bold">הפגישה אושרה</h1>
        <p className="text-slate-600">אישור נשלח באימייל.</p>
        <ButtonLink href="/">חזרה לעמוד הבית</ButtonLink>
      </div>
    </PageShell>
  );
}
