import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";
import { availabilityRuleSchema } from "@/modules/availability/schemas";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Unauthorized", 401);

  const availability = await prisma.availabilityRule.findMany({
    where: { userId: user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });
  return ok({ availability });
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);

    const input = availabilityRuleSchema.parse(await request.json());
    const availability = await prisma.availabilityRule.create({ data: { ...input, userId: user.id } });
    return ok({ availability }, 201);
  } catch (error) {
    return handleError(error);
  }
}
