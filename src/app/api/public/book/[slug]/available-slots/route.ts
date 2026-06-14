import { NextRequest } from "next/server";
import { handleError, ok } from "@/lib/http";
import { getAvailableSlots } from "@/modules/bookings/slots";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: Params) {
  try {
    const params = await context.params;
    const eventTypeId = request.nextUrl.searchParams.get("eventTypeId");
    const date = request.nextUrl.searchParams.get("date");

    if (!eventTypeId || !date) {
      return ok({ slots: [] });
    }

    const slots = await getAvailableSlots(params.slug, eventTypeId, date);
    return ok({ slots });
  } catch (error) {
    return handleError(error);
  }
}
