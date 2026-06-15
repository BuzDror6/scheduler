import { Card, Field, PageShell } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function EventBookingPage({ params }: { params: Promise<{ slug: string; eventTypeId: string }> }) {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({ where: { bookingSlug: resolvedParams.slug } });
  const eventType = user
    ? await prisma.eventType.findFirst({ where: { id: resolvedParams.eventTypeId, userId: user.id, isActive: true } })
    : null;

  if (!user || !eventType) {
    return (
      <PageShell>
        <h1 className="text-3xl font-bold">סוג פגישה לא נמצא</h1>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto grid max-w-2xl gap-5">
        <div>
          <p className="text-sm font-semibold text-brand">{eventType.durationMinutes} דקות</p>
          <h1 className="text-3xl font-bold">{eventType.title}</h1>
        </div>
        <Card>
          <form className="grid gap-4" action={`/api/public/book/${resolvedParams.slug}/create-booking`} method="post">
            <input type="hidden" name="eventTypeId" value={eventType.id} />
            <Field label="תאריך ושעה ב־UTC" name="startTime" type="datetime-local" required />
            <Field label="שם מלא" name="clientName" required />
            <Field label="אימייל" name="clientEmail" type="email" required />
            <Field label="טלפון" name="clientPhone" />
            <button className="h-11 rounded-md bg-brand font-semibold text-white" type="submit">אישור פגישה</button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
