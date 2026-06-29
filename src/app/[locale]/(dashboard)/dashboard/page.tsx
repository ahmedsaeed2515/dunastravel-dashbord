"use client";

import { useTranslations } from "next-intl";

export default function DashboardPage() {
  // const t = useTranslations("Dashboard");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold text-foreground">Dashboard Overview</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$45,231.89", sub: "+20.1% from last month", icon: "💰" },
          { title: "Active Bookings", value: "+2350", sub: "+180.1% from last month", icon: "📅" },
          { title: "New Inquiries", value: "12", sub: "+19% from last month", icon: "✉️" },
          { title: "Conversion Rate", value: "8.2%", sub: "+0.5% from last month", icon: "📈" },
        ].map((metric, i) => (
          <div key={i} className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              <span className="text-xl">{metric.icon}</span>
            </div>
            <div className="text-2xl font-display font-semibold text-foreground">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings Placeholder */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm min-h-[400px]">
          <h3 className="font-semibold mb-4">Recent Bookings</h3>
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chart / Table Loading...
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm min-h-[400px]">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chart Loading...
          </div>
        </div>
      </div>
    </div>
  );
}
