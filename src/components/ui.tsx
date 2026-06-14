import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>;
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white shadow-sm" href={href}>
      {children}
    </Link>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">{children}</section>;
}

export function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand" name={name} type={type} required={required} />
    </label>
  );
}
