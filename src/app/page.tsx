import { ButtonLink, PageShell } from "@/components/ui";

export default function HomePage() {
  return (
    <PageShell>
      <section className="grid min-h-[80vh] content-center gap-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-brand">MVP Scheduling SaaS</p>
          <h1 className="text-4xl font-bold tracking-normal text-ink sm:text-6xl">מערכת זימון תורים לעסקים</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            ניהול זמינות, סוגי פגישות, עמוד הזמנה ציבורי, התראות אימייל וחיבור Google Calendar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/register">פתיחת חשבון</ButtonLink>
          <ButtonLink href="/login">כניסה</ButtonLink>
        </div>
      </section>
    </PageShell>
  );
}
