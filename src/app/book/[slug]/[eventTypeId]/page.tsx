import { Card, PageShell } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "./booking-form";

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
          <BookingForm eventTypeId={eventType.id} slug={resolvedParams.slug} />
        </Card>
      </div>
    </PageShell>
  );
}
