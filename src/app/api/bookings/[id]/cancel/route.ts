import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Params) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);
    const params = await context.params;

    const result = await prisma.booking.updateMany({
      where: { id: params.id, userId: user.id },
      data: { status: "CANCELLED" }
    });
    if (!result.count) return fail("Booking not found", 404);

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: params.id } });

    return ok({ booking });
  } catch (error) {
    return handleError(error);
  }
}
