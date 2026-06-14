import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";
import { availabilityRuleSchema } from "@/modules/availability/schemas";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Params) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);
    const params = await context.params;

    const input = availabilityRuleSchema.partial().parse(await request.json());
    const result = await prisma.availabilityRule.updateMany({
      where: { id: params.id, userId: user.id },
      data: input
    });
    if (!result.count) return fail("Availability rule not found", 404);

    const availability = await prisma.availabilityRule.findUniqueOrThrow({ where: { id: params.id } });
    return ok({ availability });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);
    const params = await context.params;
    const result = await prisma.availabilityRule.deleteMany({ where: { id: params.id, userId: user.id } });
    if (!result.count) return fail("Availability rule not found", 404);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
