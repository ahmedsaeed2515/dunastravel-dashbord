import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 antialiased font-sans">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900/90 border border-amber-500/20 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white font-mono">404</h1>
            <h2 className="text-lg font-bold text-slate-200">Page Not Found / الصفحة غير موجودة</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The requested administrative destination or resource does not exist or has been moved.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/en/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>English Dashboard</span>
            </Link>

            <Link
              href="/ar/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>لوحة التحكم بالعربية</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
