"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui";

type AvailabilityRule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type FormState = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  dayOfWeek: "0",
  startTime: "09:00",
  endTime: "17:00",
  isActive: true
};

const days = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" }
];

function dayLabel(dayOfWeek: number) {
  return days.find((day) => day.value === dayOfWeek)?.label ?? "לא ידוע";
}

function isValidRange(startTime: string, endTime: string) {
  return startTime < endTime;
}

export function AvailabilityManager() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const groupedRules = useMemo(() => {
    return days.map((day) => ({
      ...day,
      rules: rules.filter((rule) => rule.dayOfWeek === day.value)
    }));
  }, [rules]);

  async function loadRules() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/availability", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "לא ניתן לטעון זמינות");
      setIsLoading(false);
      return;
    }

    setRules(data.availability);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadRules();
  }, []);

  function updateField<T extends keyof FormState>(key: T, value: FormState[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function payloadFromForm() {
    return {
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
      isActive: form.isActive
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isValidRange(form.startTime, form.endTime)) {
      setError("שעת הסיום חייבת להיות אחרי שעת ההתחלה");
      return;
    }

    setIsSaving(true);
    const response = await fetch(editingId ? `/api/availability/${editingId}` : "/api/availability", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFromForm())
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "שמירת הזמינות נכשלה");
      setIsSaving(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setMessage(editingId ? "הזמינות עודכנה" : "חלון זמינות נוסף");
    await loadRules();
    setIsSaving(false);
  }

  async function deleteRule(rule: AvailabilityRule) {
    setError("");
    setMessage("");

    const response = await fetch(`/api/availability/${rule.id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "מחיקת הזמינות נכשלה");
      return;
    }

    setMessage("חלון הזמינות נמחק");
    await loadRules();
  }

  async function toggleRule(rule: AvailabilityRule) {
    setError("");
    setMessage("");

    const response = await fetch(`/api/availability/${rule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rule.isActive })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "עדכון הזמינות נכשל");
      return;
    }

    await loadRules();
  }

  async function applyDefaultWeek() {
    setIsSaving(true);
    setError("");
    setMessage("");

    const activeWeekdays = [0, 1, 2, 3, 4];

    for (const dayOfWeek of activeWeekdays) {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          isActive: true
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "יצירת זמינות ברירת מחדל נכשלה");
        setIsSaving(false);
        return;
      }
    }

    setMessage("נוספה זמינות ראשון עד חמישי, 09:00-17:00");
    await loadRules();
    setIsSaving(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">שעות עבודה שבועיות</h2>
            <p className="mt-1 text-sm text-slate-600">אלה השעות שמתוכן ייווצרו מועדים פנויים להזמנה.</p>
          </div>
          <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:opacity-60" disabled={isSaving} onClick={applyDefaultWeek} type="button">
            ראשון-חמישי 09:00-17:00
          </button>
        </div>

        {isLoading ? <p className="text-sm text-slate-600">טוען...</p> : null}

        <div className="grid gap-3">
          {groupedRules.map((day) => (
            <section key={day.value} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">{day.label}</h3>
                {day.rules.length === 0 ? <span className="text-sm text-slate-500">סגור</span> : null}
              </div>

              <div className="mt-3 grid gap-2">
                {day.rules.map((rule) => (
                  <article key={rule.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold">
                        {rule.startTime} - {rule.endTime}
                      </p>
                      <p className={`mt-1 text-xs font-semibold ${rule.isActive ? "text-green-700" : "text-slate-500"}`}>
                        {rule.isActive ? "פעיל" : "כבוי"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="h-9 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white"
                        onClick={() => {
                          setEditingId(rule.id);
                          setForm({
                            dayOfWeek: String(rule.dayOfWeek),
                            startTime: rule.startTime,
                            endTime: rule.endTime,
                            isActive: rule.isActive
                          });
                          setError("");
                          setMessage("");
                        }}
                        type="button"
                      >
                        עריכה
                      </button>
                      <button className="h-9 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700" onClick={() => toggleRule(rule)} type="button">
                        {rule.isActive ? "כיבוי" : "הפעלה"}
                      </button>
                      <button className="h-9 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700" onClick={() => deleteRule(rule)} type="button">
                        מחיקה
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">{editingId ? "עריכת זמינות" : "חלון זמינות חדש"}</h2>
        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            יום
            <select className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.dayOfWeek} onChange={(event) => updateField("dayOfWeek", event.target.value)}>
              {days.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              התחלה
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" required type="time" value={form.startTime} onChange={(event) => updateField("startTime", event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              סיום
              <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" required type="time" value={form.endTime} onChange={(event) => updateField("endTime", event.target.value)} />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input checked={form.isActive} className="h-4 w-4" type="checkbox" onChange={(event) => updateField("isActive", event.target.checked)} />
            פעיל
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-green-700">{message}</p> : null}

          <button className="h-11 rounded-md bg-brand font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "שומר..." : editingId ? "שמירת שינויים" : "הוספת זמינות"}
          </button>

          {editingId ? (
            <button
              className="h-11 rounded-md border border-slate-300 font-semibold text-slate-700"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setError("");
                setMessage("");
              }}
              type="button"
            >
              ביטול עריכה
            </button>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
