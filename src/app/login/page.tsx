"use client";

import { useState, type FormEvent } from "react";
import { Card, Field, PageShell } from "@/components/ui";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData))
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Login failed");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <PageShell>
      <div className="mx-auto grid max-w-md gap-5">
        <h1 className="text-3xl font-bold">כניסה</h1>
        <Card>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <Field label="אימייל" name="email" type="email" required />
            <Field label="סיסמה" name="password" type="password" required />
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            <button className="h-11 rounded-md bg-brand font-semibold text-white" type="submit">כניסה</button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
