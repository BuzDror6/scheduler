import { google } from "googleapis";
import type { Booking, EventType, User } from "@prisma/client";

export function googleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function googleConnectUrl(userId: string) {
  const client = googleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: userId
  });
}

export async function createGoogleCalendarEvent(_input: { owner: User; eventType: EventType; booking: Booking }) {
  // V1 hook: after OAuth token encryption is configured, create the Google Calendar event here.
  return null;
}
