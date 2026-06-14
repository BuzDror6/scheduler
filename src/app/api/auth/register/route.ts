import { Prisma } from "@prisma/client";
import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/modules/auth/service";
import { registerSchema } from "@/modules/auth/schemas";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        bookingSlug: input.bookingSlug,
        businessName: input.businessName
      }
    });

    await createSession(user.id);
    return ok({ user: { id: user.id, email: user.email, bookingSlug: user.bookingSlug } }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("Email or booking slug already exists", 409);
    }
    return handleError(error);
  }
}
