import { ok } from "@/lib/http";

export async function GET() {
  return ok({
    message: "Google OAuth callback is scaffolded. Next step: encrypt and store tokens in calendar_connections."
  });
}
