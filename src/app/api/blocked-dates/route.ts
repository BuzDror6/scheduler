import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";
import { blockedDateSchema } from "@/modules/availability/schemas";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Unauthorized", 401);

  const blockedDates = await prisma.blockedDate.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" }
  });
  return ok({ blockedDates });
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);

    const input = blockedDateSchema.parse(await request.json());
    const blockedDate = await prisma.blockedDate.create({
      data: { ...input, date: new Date(`${input.date}T00:00:00.000Z`), userId: user.id }
    });
    return ok({ blockedDate }, 201);
  } catch (error) {
    return handleError(error);
  }
}
