import Link from "next/link";
import { Card, PageShell } from "@/components/ui";

const links = [
  { href: "/dashboard/bookings", label: "פגישות" },
  { href: "/dashboard/event-types", label: "סוגי פגישות" },
  { href: "/dashboard/availability", label: "זמינות" },
  { href: "/dashboard/settings", label: "הגדרות" }
];

export default function DashboardPage() {
  return (
    <PageShell>
      <div className="grid gap-6">
        <div>
          <p className="text-sm font-semibold text-brand">Dashboard</p>
          <h1 className="text-3xl font-bold">ניהול הזמנות</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card>
                <span className="text-lg font-semibold">{link.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
