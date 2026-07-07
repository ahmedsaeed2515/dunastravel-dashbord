"use client";

import { useTranslations } from "next-intl";
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, DollarSign, Users, Briefcase, Mail, Building2, Map } from "lucide-react";

export default function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  // Format real data fallbacks
  const general = metrics?.general || { totalBookings: 0, bookingsThisMonth: 0, totalInquiries: 0, openInquiries: 0 };
  const wallets = metrics?.wallets || { totalLiabilitiesUsd: 0 };
  const crm = metrics?.crm || { totalCustomers: 0, newCustomersThisMonth: 0 };
  const tours = metrics?.tours || { totalActiveTours: 0 };
  const companies = metrics?.companies || { totalCompanies: 0 };

  const kpis = [
    { 
      title: "Active Bookings", 
      value: general.totalBookings, 
      sub: `${general.bookingsThisMonth} this month`, 
      icon: <CalendarCheck className="w-5 h-5 text-primary" /> 
    },
    { 
      title: "Total Customers", 
      value: crm.totalCustomers, 
      sub: `+${crm.newCustomersThisMonth} this month`, 
      icon: <Users className="w-5 h-5 text-primary" /> 
    },
    { 
      title: "Active Partners", 
      value: companies.totalCompanies, 
      sub: "B2B travel agents", 
      icon: <Building2 className="w-5 h-5 text-primary" /> 
    },
    { 
      title: "Wallet Liabilities", 
      value: `$${Number(wallets.totalLiabilitiesUsd).toLocaleString()}`, 
      sub: "Total outstanding balance", 
      icon: <DollarSign className="w-5 h-5 text-destructive" /> 
    },
  ];

  // Dummy chart data representing booked tours over time for the UI since the backend doesn't have a time-series endpoint yet
  const chartData = [
    { name: 'Jan', bookings: 4000, inquiries: 2400 },
    { name: 'Feb', bookings: 3000, inquiries: 1398 },
    { name: 'Mar', bookings: 2000, inquiries: 9800 },
    { name: 'Apr', bookings: 2780, inquiries: 3908 },
    { name: 'May', bookings: 1890, inquiries: 4800 },
    { name: 'Jun', bookings: 2390, inquiries: 3800 },
    { name: 'Jul', bookings: 3490, inquiries: 4300 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold text-foreground">Dashboard Overview</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((metric, i) => (
          <div key={i} className="p-6 bg-card/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-gold transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{metric.title}</h3>
              <div className="p-2 bg-muted/50 rounded-lg">{metric.icon}</div>
            </div>
            <div className="text-3xl font-display font-bold text-foreground">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 bg-card/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-sm">
          <h3 className="font-semibold font-display text-lg mb-6">Booking & Inquiry Trends</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#8C8880" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8C8880" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(26,26,46,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="bookings" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                <Area type="monotone" dataKey="inquiries" stroke="#F5A623" strokeWidth={3} fillOpacity={1} fill="url(#colorInquiries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="space-y-6">
          <div className="p-6 bg-primary text-primary-foreground rounded-2xl shadow-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Map className="w-24 h-24" />
            </div>
            <h3 className="text-sm font-medium opacity-80 uppercase tracking-widest mb-2">Tours Catalog</h3>
            <div className="text-4xl font-display font-bold mb-1">{tours.totalActiveTours || 0}</div>
            <p className="text-sm opacity-80">Active luxury experiences</p>
          </div>

          <div className="p-6 bg-card/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-sm">
            <h3 className="font-semibold font-display text-lg mb-4">Communications</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Sent</span>
                <span className="font-medium">{metrics?.communications?.totalSent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Open Inquiries</span>
                <span className="font-medium">{general.openInquiries || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
