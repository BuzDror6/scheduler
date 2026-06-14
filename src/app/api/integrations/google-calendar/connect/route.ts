import { NextResponse } from "next/server";
import { fail } from "@/lib/http";
import { currentUser } from "@/modules/auth/service";
import { googleConnectUrl } from "@/modules/calendar/google";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail("Unauthorized", 401);
  return NextResponse.redirect(googleConnectUrl(user.id));
}
