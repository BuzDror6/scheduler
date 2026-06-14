import { randomUUID } from "crypto";
import { addMinutes } from "date-fns";
import { handleError, ok, fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/modules/bookings/schemas";
import { getAvailableSlots } from "@/modules/bookings/slots";
import { sendBookingEmails } from "@/modules/email/service";
import { createGoogleCalendarEvent } from "@/modules/calendar/google";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: Params) {
  try {
    const params = await context.params;
    const input = createBookingSchema.parse(await request.json());
    const owner = await prisma.user.findUnique({ where: { bookingSlug: params.slug } });
    if (!owner) return fail("Booking page not found", 404);

    const eventType = await prisma.eventType.findFirst({
      where: { id: input.eventTypeId, userId: owner.id, isActive: true }
    });
    if (!eventType) return fail("Event type not found", 404);

    const date = input.startTime.slice(0, 10);
    const availableSlots = await getAvailableSlots(params.slug, eventType.id, date);
    if (!availableSlots.includes(new Date(input.startTime).toISOString())) {
      return fail("This time slot is no longer available", 409);
    }

    const booking = await prisma.$transaction(async (tx) => {
      const startTime = new Date(input.startTime);
      const endTime = addMinutes(startTime, eventType.durationMinutes);

      const overlapping = await tx.booking.findFirst({
        where: {
          userId: owner.id,
          status: "CONFIRMED",
          startTime: { lt: endTime },
          endTime: { gt: startTime }
        }
      });

      if (overlapping) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.booking.create({
        data: {
          userId: owner.id,
          eventTypeId: eventType.id,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          clientNotes: input.clientNotes,
          startTime,
          endTime,
          timezone: owner.timezone,
          cancellationToken: randomUUID(),
          rescheduleToken: randomUUID()
        }
      });
    });

    await sendBookingEmails({ owner, eventType, booking });
    await createGoogleCalendarEvent({ owner, eventType, booking });

    return ok({ booking }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return fail("This time slot is no longer available", 409);
    }
    return handleError(error);
  }
}
