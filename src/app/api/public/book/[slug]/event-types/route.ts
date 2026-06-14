import { ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Params) {
  const params = await context.params;
  const user = await prisma.user.findUnique({ where: { bookingSlug: params.slug } });
  if (!user) return fail("Booking page not found", 404);

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { durationMinutes: "asc" }
  });

  return ok({ eventTypes });
}
