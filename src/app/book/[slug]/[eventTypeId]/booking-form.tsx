"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Field } from "@/components/ui";

type BookingFormProps = {
  eventTypeId: string;
  slug: string;
};

export function BookingForm({ eventTypeId, slug }: BookingFormProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);

  const slotFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("he-IL", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }, []);

  async function loadSlots(date: string) {
    setSelectedDate(date);
    setSelectedSlot("");
    setSlots([]);
    setError("");

    if (!date) return;

    setIsLoadingSlots(true);
    const response = await fetch(`/api/public/book/${slug}/available-slots?eventTypeId=${eventTypeId}&date=${date}`, {
      cache: "no-store"
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "טעינת שעות פנויות נכשלה");
      setIsLoadingSlots(false);
      return;
    }

    setSlots(data.slots ?? []);
    setIsLoadingSlots(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!selectedSlot) {
      setError("בחר שעה פנויה");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    const response = await fetch(`/api/public/book/${slug}/create-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId,
        startTime: selectedSlot,
        clientName: formData.get("clientName"),
        clientEmail: formData.get("clientEmail"),
        clientPhone: formData.get("clientPhone"),
        clientNotes: formData.get("clientNotes")
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error === "This time slot is no longer available" ? "המועד הזה לא פנוי לפי הזמינות שהוגדרה. נסה שעה בתוך שעות העבודה שהגדרת." : data.error ?? "יצירת הפגישה נכשלה");
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/booking-confirmed";
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        תאריך
        <input
          className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand"
          min={new Date().toISOString().slice(0, 10)}
          required
          type="date"
          value={selectedDate}
          onChange={(event) => void loadSlots(event.target.value)}
        />
      </label>

      <section className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700">שעות פנויות</p>
          {isLoadingSlots ? <span className="text-xs font-semibold text-slate-500">טוען...</span> : null}
        </div>

        {!selectedDate ? <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-600">בחר תאריך כדי לראות שעות פנויות.</p> : null}

        {selectedDate && !isLoadingSlots && slots.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-600">אין שעות פנויות בתאריך הזה.</p>
        ) : null}

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((slot) => (
            <button
              key={slot}
              className={`h-10 rounded-md border text-sm font-semibold ${selectedSlot === slot ? "border-brand bg-brand text-white" : "border-slate-300 bg-white text-slate-800"}`}
              onClick={() => {
                setSelectedSlot(slot);
                setError("");
              }}
              type="button"
            >
              {slotFormatter.format(new Date(slot))}
            </button>
          ))}
        </div>
      </section>

      <Field label="שם מלא" name="clientName" required />
      <Field label="אימייל" name="clientEmail" type="email" required />
      <Field label="טלפון" name="clientPhone" />
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        הערות
        <textarea className="min-h-24 rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-brand" name="clientNotes" />
      </label>
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button className="h-11 rounded-md bg-brand font-semibold text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "מאשר..." : "אישור פגישה"}
      </button>
    </form>
  );
}
