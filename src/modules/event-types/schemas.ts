import { z } from "zod";

export const eventTypeSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  locationType: z.enum(["PHONE_CALL", "GOOGLE_MEET", "ZOOM", "IN_PERSON", "CUSTOM"]),
  locationDetails: z.string().optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(240).default(0),
  bufferAfterMinutes: z.number().int().min(0).max(240).default(0),
  minimumNoticeMinutes: z.number().int().min(0).max(43200).default(60),
  maxDaysInAdvance: z.number().int().min(1).max(365).default(60),
  maxBookingsPerDay: z.number().int().min(1).max(100).optional(),
  isActive: z.boolean().default(true)
});
