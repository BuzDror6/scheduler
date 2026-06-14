import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";
import { eventTypeSchema } from "@/modules/event-types/schemas";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Params) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);
    const params = await context.params;

    const input = eventTypeSchema.partial().parse(await request.json());
    const result = await prisma.eventType.updateMany({
      where: { id: params.id, userId: user.id },
      data: input
    });
    if (!result.count) return fail("Event type not found", 404);

    const eventType = await prisma.eventType.findUniqueOrThrow({ where: { id: params.id } });

    return ok({ eventType });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);
    const params = await context.params;

    const result = await prisma.eventType.updateMany({
      where: { id: params.id, userId: user.id },
      data: { isActive: false }
    });
    if (!result.count) return fail("Event type not found", 404);

    const eventType = await prisma.eventType.findUniqueOrThrow({ where: { id: params.id } });

    return ok({ eventType });
  } catch (error) {
    return handleError(error);
  }
}
