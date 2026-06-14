# Scheduler MVP

Appointment scheduling SaaS MVP built with Next.js, TypeScript, Prisma and MySQL.

## Stack

- Next.js full-stack app
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL
- JWT cookie authentication
- SMTP email scaffolding
- Google Calendar OAuth scaffolding

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
APP_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
TOKEN_ENCRYPTION_KEY=
```

## Database

The V1 database includes:

- users
- event_types
- availability_rules
- blocked_dates
- bookings
- calendar_connections
- email_logs
- audit_logs

Future modules are marked in `prisma/schema.prisma`.

## Hostinger Deployment

Use **Node.js Web App** and import this repository from GitHub.

Recommended settings:

- Framework: Next.js
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: 20+

Use the MySQL database from Hostinger and place the connection string in `DATABASE_URL`.

Before first production run:

```bash
npm run prisma:deploy
```

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Profile:

- `GET /api/user/profile`
- `PUT /api/user/profile`

Event Types:

- `GET /api/event-types`
- `POST /api/event-types`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`

Availability:

- `GET /api/availability`
- `POST /api/availability`
- `PUT /api/availability/:id`
- `DELETE /api/availability/:id`

Public Booking:

- `GET /api/public/book/:slug`
- `GET /api/public/book/:slug/event-types`
- `GET /api/public/book/:slug/available-slots`
- `POST /api/public/book/:slug/create-booking`

Bookings:

- `GET /api/bookings`
- `POST /api/bookings/:id/cancel`

Google Calendar:

- `GET /api/integrations/google-calendar/connect`
- `GET /api/integrations/google-calendar/callback`
- `DELETE /api/integrations/google-calendar/disconnect`

## Current MVP Status

Implemented scaffold:

- Authentication foundation
- User profile API
- Event type API
- Availability API
- Blocked dates API
- Public booking profile and event type API
- Slot generation foundation
- Booking creation with double-booking check
- Email sending hook
- Google Calendar hook
- Dashboard and public booking page skeleton

Next steps:

- Connect real PostgreSQL database
- Run migrations
- Add complete forms for event types and availability
- Complete Google OAuth token encryption and event creation
- Add email verification and forgot/reset password flow
