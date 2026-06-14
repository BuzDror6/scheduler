import nodemailer from "nodemailer";
import type { Booking, EventType, User } from "@prisma/client";

function transporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

export async function sendBookingEmails(input: { owner: User; eventType: EventType; booking: Booking }) {
  const mailer = transporter();
  if (!mailer) return;

  const from = process.env.EMAIL_FROM ?? "Scheduler <no-reply@example.com>";
  const when = `${input.booking.startTime.toISOString()} - ${input.booking.endTime.toISOString()}`;

  await mailer.sendMail({
    from,
    to: input.owner.email,
    subject: "New appointment booked",
    text: `Client: ${input.booking.clientName}\nEmail: ${input.booking.clientEmail}\nPhone: ${input.booking.clientPhone ?? ""}\nEvent: ${input.eventType.title}\nTime: ${when}\nNotes: ${input.booking.clientNotes ?? ""}`
  });

  await mailer.sendMail({
    from,
    to: input.booking.clientEmail,
    subject: "Your appointment is confirmed",
    text: `Your appointment with ${input.owner.businessName ?? input.owner.fullName} is confirmed.\nEvent: ${input.eventType.title}\nTime: ${when}\nLocation: ${input.eventType.locationDetails ?? input.owner.defaultLocationDetails ?? ""}`
  });
}
