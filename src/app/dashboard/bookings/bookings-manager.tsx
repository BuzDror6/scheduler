"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";

type BookingStatus = "CONFIRMED" | "CANCELLED" | "RESCHEDULED" | "COMPLETED" | "NO_SHOW" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "REFUNDED";

type Booking = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  clientNotes: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: BookingStatus;
  eventType: {
    title: string;
    durationMinutes: number;
    locationType: string;
    locationDetails: string | null;
  };
};

const statusLabels: Record<BookingStatus, string> = {
  CONFIRMED: "מאושרת",
  CANCELLED: "בוטלה",
  RESCHEDULED: "נקבעה מחדש",
  COMPLETED: "הושלמה",
  NO_SHOW: "לא הגיע",
  PAYMENT_PENDING: "ממתינה לתשלום",
  PAYMENT_FAILED: "תשלום נכשל",
  REFUNDED: "הוחזר תשלום"
};

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("he-IL", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }, []);

  async function loadBookings() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/bookings", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "לא ניתן לטעון פגישות");
      setIsLoading(false);
      return;
    }

    setBookings(data.bookings ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  async function cancelBooking(booking: Booking) {
    setError("");
    setMessage("");

    const response = await fetch(`/api/bookings/${booking.id}/cancel`, { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "ביטול הפגישה נכשל");
      return;
    }

    setMessage("הפגישה בוטלה");
    await loadBookings();
  }

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">רשימת פגישות</h2>
          <p className="mt-1 text-sm text-slate-600">פגישות שנקבעו דרך עמוד ההזמנה הציבורי.</p>
        </div>
        <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700" onClick={() => void loadBookings()} type="button">
          רענון
        </button>
      </div>

      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}
      {message ? <p className="mb-4 text-sm font-semibold text-green-700">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-600">טוען...</p> : null}

      {!isLoading && bookings.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-600">עדיין אין פגישות.</div>
      ) : null}

      <div className="grid gap-3">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-md border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{booking.clientName}</h3>
                <p className="mt-1 text-sm text-slate-600">{booking.eventType.title}</p>
                <p className="mt-2 font-semibold text-slate-900">{dateFormatter.format(new Date(booking.startTime))}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                {statusLabels[booking.status]}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-semibold text-slate-900">אימייל</dt>
                <dd className="mt-1 break-all">{booking.clientEmail}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">טלפון</dt>
                <dd className="mt-1">{booking.clientPhone || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">מיקום</dt>
                <dd className="mt-1">{booking.eventType.locationDetails || booking.eventType.locationType}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">אזור זמן</dt>
                <dd className="mt-1">{booking.timezone}</dd>
              </div>
            </dl>

            {booking.clientNotes ? <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{booking.clientNotes}</p> : null}

            {booking.status === "CONFIRMED" ? (
              <div className="mt-4">
                <button className="h-9 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700" onClick={() => void cancelBooking(booking)} type="button">
                  ביטול פגישה
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}
