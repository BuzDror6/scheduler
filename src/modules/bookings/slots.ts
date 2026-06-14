import { addMinutes, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function withMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return next;
}

export async function getAvailableSlots(userSlug: string, eventTypeId: string, dateIso: string) {
  const user = await prisma.user.findUnique({ where: { bookingSlug: userSlug } });
  if (!user) return [];

  const eventType = await prisma.eventType.findFirst({
    where: { id: eventTypeId, userId: user.id, isActive: true }
  });
  if (!eventType) return [];

  const localDate = new Date(`${dateIso}T12:00:00`);
  const zonedDate = toZonedTime(localDate, user.timezone);
  const dayOfWeek = zonedDate.getDay();

  const rules = await prisma.availabilityRule.findMany({
    where: { userId: user.id, dayOfWeek, isActive: true }
  });

  const blocked = await prisma.blockedDate.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(`${dateIso}T00:00:00.000Z`),
        lt: new Date(`${dateIso}T23:59:59.999Z`)
      }
    }
  });

  if (blocked.some((block) => block.isFullDay)) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: "CONFIRMED",
      startTime: { lt: new Date(`${dateIso}T23:59:59.999Z`) },
      endTime: { gt: new Date(`${dateIso}T00:00:00.000Z`) }
    }
  });

  const slots: string[] = [];
  const now = new Date();
  const noticeLimit = addMinutes(now, eventType.minimumNoticeMinutes);

  for (const rule of rules) {
    let cursor = timeToMinutes(rule.startTime);
    const end = timeToMinutes(rule.endTime);

    while (cursor + eventType.durationMinutes <= end) {
      const localStart = withMinutes(new Date(`${dateIso}T00:00:00`), cursor);
      const startUtc = fromZonedTime(localStart, user.timezone);
      const endUtc = addMinutes(startUtc, eventType.durationMinutes);

      const overlapsBooking = bookings.some((booking) => {
        const blockedStart = addMinutes(booking.startTime, -eventType.bufferBeforeMinutes);
        const blockedEnd = addMinutes(booking.endTime, eventType.bufferAfterMinutes);
        return startUtc < blockedEnd && endUtc > blockedStart;
      });

      const overlapsBlockedTime = blocked.some((block) => {
        if (block.isFullDay || !block.startTime || !block.endTime) return block.isFullDay;
        const blockStart = fromZonedTime(withMinutes(new Date(`${dateIso}T00:00:00`), timeToMinutes(block.startTime)), user.timezone);
        const blockEnd = fromZonedTime(withMinutes(new Date(`${dateIso}T00:00:00`), timeToMinutes(block.endTime)), user.timezone);
        return startUtc < blockEnd && endUtc > blockStart;
      });

      if (!isBefore(startUtc, noticeLimit) && !overlapsBooking && !overlapsBlockedTime) {
        slots.push(startUtc.toISOString());
      }

      cursor += 15;
    }
  }

  return slots;
}
