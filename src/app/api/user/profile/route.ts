import { handleError, ok, fail } from "@/lib/http";
import { currentUser } from "@/modules/auth/service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Unauthorized", 401);
  return ok({ user });
}

export async function PUT(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return fail("Unauthorized", 401);

    const input = await request.json();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        businessName: input.businessName,
        profession: input.profession,
        timezone: input.timezone,
        language: input.language,
        websiteUrl: input.websiteUrl,
        defaultLocationDetails: input.defaultLocationDetails
      }
    });

    return ok({ user: updated });
  } catch (error) {
    return handleError(error);
  }
}
