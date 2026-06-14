import Link from "next/link";
import { Card, PageShell } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({
    where: { bookingSlug: resolvedParams.slug },
    include: { eventTypes: { where: { isActive: true }, orderBy: { durationMinutes: "asc" } } }
  });

  if (!user) {
    return (
      <PageShell>
        <h1 className="text-3xl font-bold">עמוד הזמנות לא נמצא</h1>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-6">
        <div>
          <p className="text-sm font-semibold text-brand">{user.profession ?? "Booking"}</p>
          <h1 className="text-4xl font-bold">{user.businessName ?? user.fullName}</h1>
          <p className="mt-2 text-slate-600">בחרו סוג פגישה והמשיכו לבחירת מועד.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {user.eventTypes.map((eventType) => (
            <Link key={eventType.id} href={`/book/${resolvedParams.slug}/${eventType.id}`}>
              <Card>
                <h2 className="text-xl font-semibold">{eventType.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{eventType.durationMinutes} דקות</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
