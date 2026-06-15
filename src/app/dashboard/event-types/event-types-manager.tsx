"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui";

type LocationType = "PHONE_CALL" | "GOOGLE_MEET" | "ZOOM" | "IN_PERSON" | "CUSTOM";

type EventType = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  locationType: LocationType;
  locationDetails: string | null;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeMinutes: number;
  maxDaysInAdvance: number;
  maxBookingsPerDay: number | null;
  isActive: boolean;
};

type FormState = {
  title: string;
  description: string;
  durationMinutes: string;
  locationType: LocationType;
  locationDetails: string;
  bufferBeforeMinutes: string;
  bufferAfterMinutes: string;
  minimumNoticeMinutes: string;
  maxDaysInAdvance: string;
  maxBookingsPerDay: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  durationMinutes: "30",
  locationType: "GOOGLE_MEET",
  locationDetails: "",
  bufferBeforeMinutes: "0",
  bufferAfterMinutes: "0",
  minimumNoticeMinutes: "60",
  maxDaysInAdvance: "60",
  maxBookingsPerDay: "",
  isActive: true
};

const locationLabels: Record<LocationType, string> = {
  PHONE_CALL: "שיחת טלפון",
  GOOGLE_MEET: "Google Meet",
  ZOOM: "Zoom",
  IN_PERSON: "פגישה פיזית",
  CUSTOM: "מותאם אישית"
};

function numberOrDefault(value: string, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function eventToForm(eventType: EventType): FormState {
  return {
    title: eventType.title,
    description: eventType.description ?? "",
    durationMinutes: String(eventType.durationMinutes),
    locationType: eventType.locationType,
    locationDetails: eventType.locationDetails ?? "",
    bufferBeforeMinutes: String(eventType.bufferBeforeMinutes),
    bufferAfterMinutes: String(eventType.bufferAfterMinutes),
    minimumNoticeMinutes: String(eventType.minimumNoticeMinutes),
    maxDaysInAdvance: String(eventType.maxDaysInAdvance),
    maxBookingsPerDay: eventType.maxBookingsPerDay ? String(eventType.maxBookingsPerDay) : "",
    isActive: eventType.isActive
  };
}

export function EventTypesManager() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const editingTitle = useMemo(() => {
    if (!editingId) return "סוג פגישה חדש";
    return "עריכת סוג פגישה";
  }, [editingId]);

  async function loadEventTypes() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/event-types", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "לא ניתן לטעון סוגי פגישות");
      setIsLoading(false);
      return;
    }

    setEventTypes(data.eventTypes);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadEventTypes();
  }, []);

  function updateField<T extends keyof FormState>(key: T, value: FormState[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function payloadFromForm() {
    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      durationMinutes: numberOrDefault(form.durationMinutes, 30),
      locationType: form.locationType,
      locationDetails: form.locationDetails.trim() || undefined,
      bufferBeforeMinutes: numberOrDefault(form.bufferBeforeMinutes, 0),
      bufferAfterMinutes: numberOrDefault(form.bufferAfterMinutes, 0),
      minimumNoticeMinutes: numberOrDefault(form.minimumNoticeMinutes, 60),
      maxDaysInAdvance: numberOrDefault(form.maxDaysInAdvance, 60),
      maxBookingsPerDay: form.maxBookingsPerDay ? numberOrDefault(form.maxBookingsPerDay, 1) : undefined,
      isActive: form.isActive
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const response = await fetch(editingId ? `/api/event-types/${editingId}` : "/api/event-types", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFromForm())
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "שמירת סוג הפגישה נכשלה");
      setIsSaving(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setMessage(editingId ? "סוג הפגישה עודכן" : "סוג הפגישה נוצר");
    await loadEventTypes();
    setIsSaving(false);
  }

  async function toggleActive(eventType: EventType) {
    setError("");
    const response = await fetch(`/api/event-types/${eventType.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !eventType.isActive })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "עדכון הסטטוס נכשל");
      return;
    }

    await loadEventTypes();
  }

  async function deactivate(eventType: EventType) {
    setError("");
    const response = await fetch(`/api/event-types/${eventType.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "כיבוי סוג הפגישה נכשל");
      return;
    }

    await loadEventTypes();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">סוגי הפגישות שלך</h2>
            <p className="mt-1 text-sm text-slate-600">סוגים פעילים יוצגו בעמוד ההזמנות הציבורי.</p>
          </div>
          <button
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setMessage("");
              setError("");
            }}
            type="button"
          >
            חדש
          </button>
        </div>

        {isLoading ? <p className="text-sm text-slate-600">טוען...</p> : null}

        {!isLoading && eventTypes.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-600">
            עדיין אין סוגי פגישות. צור את הראשון בטופס.
          </div>
        ) : null}

        <div className="grid gap-3">
          {eventTypes.map((eventType) => (
            <article key={eventType.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{eventType.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {eventType.durationMinutes} דקות · {locationLabels[eventType.locationType]}
                  </p>
                  {eventType.description ? <p className="mt-2 text-sm text-slate-600">{eventType.description}</p> : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${eventType.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {eventType.isActive ? "פעיל" : "כבוי"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="h-9 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white"
                  onClick={() => {
                    setEditingId(eventType.id);
                    setForm(eventToForm(eventType));
                    setMessage("");
                    setError("");
                  }}
                  type="button"
                >
                  עריכה
                </button>
                <button className="h-9 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700" onClick={() => toggleActive(eventType)} type="button">
                  {eventType.isActive ? "כיבוי" : "הפעלה"}
                </button>
                <button className="h-9 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700" onClick={() => deactivate(eventType)} type="button">
                  הסרה
                </button>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">{editingTitle}</h2>
        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            שם הפגישה
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            תיאור קצר
            <textarea className="min-h-24 rounded-md border border-slate-300 p-3 text-slate-900 outline-none focus:border-brand" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              משך בדקות
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" min="5" required type="number" value={form.durationMinutes} onChange={(event) => updateField("durationMinutes", event.target.value)} />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              סוג מיקום
              <select className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.locationType} onChange={(event) => updateField("locationType", event.target.value as LocationType)}>
                {Object.entries(locationLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            פרטי מיקום
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" placeholder="קישור, כתובת או הסבר קצר" value={form.locationDetails} onChange={(event) => updateField("locationDetails", event.target.value)} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              מרווח לפני
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" min="0" type="number" value={form.bufferBeforeMinutes} onChange={(event) => updateField("bufferBeforeMinutes", event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              מרווח אחרי
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" min="0" type="number" value={form.bufferAfterMinutes} onChange={(event) => updateField("bufferAfterMinutes", event.target.value)} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              התראה מראש בדקות
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" min="0" type="number" value={form.minimumNoticeMinutes} onChange={(event) => updateField("minimumNoticeMinutes", event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              ימים קדימה להזמנה
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" min="1" type="number" value={form.maxDaysInAdvance} onChange={(event) => updateField("maxDaysInAdvance", event.target.value)} />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            מקסימום הזמנות ביום
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" min="1" placeholder="ללא הגבלה" type="number" value={form.maxBookingsPerDay} onChange={(event) => updateField("maxBookingsPerDay", event.target.value)} />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input checked={form.isActive} className="h-4 w-4" type="checkbox" onChange={(event) => updateField("isActive", event.target.checked)} />
            פעיל בעמוד ההזמנות
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-green-700">{message}</p> : null}

          <button className="h-11 rounded-md bg-brand font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "שומר..." : editingId ? "שמירת שינויים" : "יצירת סוג פגישה"}
          </button>
        </form>
      </Card>
    </div>
  );
}
