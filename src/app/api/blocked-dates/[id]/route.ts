import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Params) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);
    const params = await context.params;
    const result = await prisma.blockedDate.deleteMany({ where: { id: params.id, userId: user.id } });
    if (!result.count) return fail("Blocked date not found", 404);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
