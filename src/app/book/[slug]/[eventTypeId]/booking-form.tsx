"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui";

type BookingFormProps = {
  eventTypeId: string;
  slug: string;
};

export function BookingForm({ eventTypeId, slug }: BookingFormProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const startValue = String(formData.get("startTime") ?? "");

    if (!startValue) {
      setError("בחר תאריך ושעה");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch(`/api/public/book/${slug}/create-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId,
        startTime: new Date(startValue).toISOString(),
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
      <Field label="תאריך ושעה" name="startTime" type="datetime-local" required />
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
