import Link from "next/link";
import { Compass, Home, Map, Users, CalendarCheck, ArrowRight, ArrowLeft, Globe, Shield } from "lucide-react";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#090C10] text-slate-100 flex flex-col justify-between p-4 sm:p-8 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        
        {/* Top Minimal Brand Bar */}
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-base shadow-xs">
              D
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-foreground block font-display">
                DUNAS TRAVEL
              </span>
              <span className="text-[10px] text-amber-500/80 font-mono uppercase tracking-widest block">
                Luxury Concierge & Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border/50">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>Admin Console 404</span>
          </div>
        </header>

        {/* Central Luxury 404 Hero */}
        <main className="max-w-3xl w-full mx-auto my-auto py-12 text-center space-y-8">
          
          {/* Animated Golden Compass Crest */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-b from-card to-background border border-amber-500/40 text-amber-400 shadow-2xl flex items-center justify-center group">
              <Compass className="w-12 h-12 text-amber-400 stroke-[1.8] animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-500/20" />
            </div>
          </div>

          {/* Typography Hierarchy */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono tracking-widest">
              <span>ERR_HTTP_404</span>
              <span>•</span>
              <span>DESTINATION_UNREACHABLE</span>
            </div>

            <h1 className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              404
            </h1>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              الصفحة غير موجودة • Destination Not Found
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              المسار أو المورد الإداري الذي تحاول الوصول إليه غير متاح حالياً أو ربما تم نقله إلى وجهة أخرى داخل المنظومة.
            </p>
          </div>

          {/* Quick Navigation Hub (4 Essential Portals) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-start pt-2 max-w-2xl mx-auto">
            
            {/* 1. Dashboard Portal */}
            <Link
              href="/ar/admin"
              className="p-4 rounded-2xl bg-card/80 hover:bg-card border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-amber-400 transition-colors">
                    لوحة التحكم المركزية
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Overview & Live Metrics
                  </div>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </Link>

            {/* 2. Tours Portal */}
            <Link
              href="/ar/admin/tours"
              className="p-4 rounded-2xl bg-card/80 hover:bg-card border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-amber-400 transition-colors">
                    كتالوج الرحلات السياحية
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Luxury Tours & Programs
                  </div>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </Link>

            {/* 3. Customers CRM Portal */}
            <Link
              href="/ar/admin/customers"
              className="p-4 rounded-2xl bg-card/80 hover:bg-card border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-amber-400 transition-colors">
                    إدارة العملاء والمسافرين (CRM)
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    VIP Profiles & 360° View
                  </div>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </Link>

            {/* 4. Bookings Portal */}
            <Link
              href="/ar/admin/bookings"
              className="p-4 rounded-2xl bg-card/80 hover:bg-card border border-border/80 hover:border-amber-500/50 transition-all duration-300 group shadow-xs hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-amber-400 transition-colors">
                    سجل الحجوزات والعمليات
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Reservations & Payments
                  </div>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Multilingual Switcher Strip */}
          <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 pe-2">
              <Globe className="h-3.5 w-3.5 text-amber-500" />
              <span>تبديل لغة لوحة التحكم:</span>
            </span>

            <Link
              href="/ar/admin"
              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              العربية (AR)
            </Link>
            <Link
              href="/en/admin"
              className="px-3 py-1 rounded-lg text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              English (EN)
            </Link>
            <Link
              href="/es/admin"
              className="px-3 py-1 rounded-lg text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              Español (ES)
            </Link>
            <Link
              href="/it/admin"
              className="px-3 py-1 rounded-lg text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              Italiano (IT)
            </Link>
            <Link
              href="/pt/admin"
              className="px-3 py-1 rounded-lg text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              Português (PT)
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-5xl w-full mx-auto text-center py-4 border-t border-border/40 text-xs text-muted-foreground/60 font-mono">
          © {new Date().getFullYear()} Dunas Travel Operations Platform. All Rights Reserved.
        </footer>
      </body>
    </html>
  );
}
