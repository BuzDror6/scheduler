import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Unauthorized", 401);

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { eventType: true },
    orderBy: { startTime: "asc" }
  });

  return ok({ bookings });
}
