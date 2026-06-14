import { z } from "zod";

export const createBookingSchema = z.object({
  eventTypeId: z.string().min(1),
  startTime: z.string().datetime(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientNotes: z.string().optional()
});
