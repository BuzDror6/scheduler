import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/modules/auth/service";
import { loginSchema } from "@/modules/auth/schemas";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return fail("Invalid email or password", 401);
    }

    await createSession(user.id);
    return ok({ user: { id: user.id, email: user.email, bookingSlug: user.bookingSlug } });
  } catch (error) {
    return handleError(error);
  }
}
