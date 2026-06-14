import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/modules/auth/service";

export async function DELETE() {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);

    await prisma.calendarConnection.updateMany({
      where: { userId: user.id, provider: "GOOGLE" },
      data: { isActive: false }
    });

    return ok({ disconnected: true });
  } catch (error) {
    return handleError(error);
  }
}
