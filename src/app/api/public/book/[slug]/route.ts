import { ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Params) {
  const params = await context.params;
  const user = await prisma.user.findUnique({
    where: { bookingSlug: params.slug },
    select: {
      id: true,
      fullName: true,
      businessName: true,
      profession: true,
      profileImageUrl: true,
      timezone: true,
      language: true,
      bookingSlug: true,
      defaultLocationType: true,
      defaultLocationDetails: true
    }
  });

  if (!user) return fail("Booking page not found", 404);
  return ok({ profile: user });
}
