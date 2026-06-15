"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui";

type UserProfile = {
  fullName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  profession: string | null;
  timezone: string;
  language: string;
  bookingSlug: string;
  websiteUrl: string | null;
  defaultLocationDetails: string | null;
};

type FormState = {
  fullName: string;
  phone: string;
  businessName: string;
  profession: string;
  timezone: string;
  language: string;
  websiteUrl: string;
  defaultLocationDetails: string;
};

const emptyForm: FormState = {
  fullName: "",
  phone: "",
  businessName: "",
  profession: "",
  timezone: "Asia/Jerusalem",
  language: "he",
  websiteUrl: "",
  defaultLocationDetails: ""
};

export function SettingsManager() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const bookingUrl = useMemo(() => {
    if (!profile) return "";
    return `${window.location.origin}/book/${profile.bookingSlug}`;
  }, [profile]);

  async function loadProfile() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/user/profile", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "לא ניתן לטעון פרופיל");
      setIsLoading(false);
      return;
    }

    const user = data.user as UserProfile;
    setProfile(user);
    setForm({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      businessName: user.businessName ?? "",
      profession: user.profession ?? "",
      timezone: user.timezone ?? "Asia/Jerusalem",
      language: user.language ?? "he",
      websiteUrl: user.websiteUrl ?? "",
      defaultLocationDetails: user.defaultLocationDetails ?? ""
    });
    setIsLoading(false);
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function updateField<T extends keyof FormState>(key: T, value: FormState[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "שמירת ההגדרות נכשלה");
      setIsSaving(false);
      return;
    }

    setProfile(data.user);
    setMessage("ההגדרות נשמרו");
    setIsSaving(false);
  }

  async function copyBookingUrl() {
    await navigator.clipboard.writeText(bookingUrl);
    setMessage("קישור ההזמנות הועתק");
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">טוען...</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <Card>
        <h2 className="text-xl font-bold">קישור עמוד ההזמנות</h2>
        <p className="mt-1 text-sm text-slate-600">זה הקישור ששלחים ללקוחות כדי לקבוע פגישה.</p>

        <div className="mt-4 grid gap-3 rounded-md bg-slate-50 p-4">
          <p className="break-all text-left text-sm font-semibold text-slate-900" dir="ltr">
            {bookingUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white" onClick={() => void copyBookingUrl()} type="button">
              העתקה
            </button>
            <a className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700" href={bookingUrl} target="_blank">
              פתיחה
            </a>
          </div>
        </div>

        {profile ? (
          <dl className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-900">אימייל</dt>
              <dd className="mt-1 break-all">{profile.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Slug</dt>
              <dd className="mt-1">{profile.bookingSlug}</dd>
            </div>
          </dl>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-xl font-bold">פרטי פרופיל</h2>
        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            שם מלא
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            שם העסק
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.businessName} onChange={(event) => updateField("businessName", event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            מקצוע
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.profession} onChange={(event) => updateField("profession", event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            טלפון
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              אזור זמן
              <select className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)}>
                <option value="Asia/Jerusalem">Asia/Jerusalem</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              שפה
              <select className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.language} onChange={(event) => updateField("language", event.target.value)}>
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            אתר
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.websiteUrl} onChange={(event) => updateField("websiteUrl", event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            מיקום ברירת מחדל
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" value={form.defaultLocationDetails} onChange={(event) => updateField("defaultLocationDetails", event.target.value)} />
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-green-700">{message}</p> : null}

          <button className="h-11 rounded-md bg-brand font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? "שומר..." : "שמירת הגדרות"}
          </button>
        </form>
      </Card>
    </div>
  );
}
