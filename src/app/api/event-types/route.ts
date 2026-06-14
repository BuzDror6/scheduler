import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";
import { eventTypeSchema } from "@/modules/event-types/schemas";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Unauthorized", 401);

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return ok({ eventTypes });
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);

    const input = eventTypeSchema.parse(await request.json());
    const eventType = await prisma.eventType.create({ data: { ...input, userId: user.id } });
    return ok({ eventType }, 201);
  } catch (error) {
    return handleError(error);
  }
}
