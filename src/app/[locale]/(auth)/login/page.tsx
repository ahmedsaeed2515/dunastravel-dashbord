"use client";

import * as React from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { authApi } from "@/features/auth/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { useTranslations } from "next-intl";
import LanguageSwitcherDropdown from "@/components/ui/language-switcher-dropdown";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isRtl = locale === "ar";

  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authApi.login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || tAuth("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#060D23] text-foreground selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden font-sans">
      {/* ========================================================================= */}
      {/* HALF 1: FORM PANEL                                                        */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[50%] xl:w-[46%] 2xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-gradient-to-b from-[#081330] via-[#060F26] to-[#040A1A] border-e border-amber-500/20 relative z-20">
        {/* Ambient Top Glow */}
        <div
          className="absolute top-0 start-1/4 w-72 h-40 bg-amber-500/10 blur-[90px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Header Bar inside Form */}
        <header className="flex items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-30">
          <div className="flex items-center gap-3">
            <img
              src="/dunas-travel-logo.png"
              alt="Dunas Travel"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Action Utilities (Language Selector + Public Site Link) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcherDropdown />

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all select-none"
              title="Public Site"
            >
              <ExternalLink size={12} className="text-amber-400" />
              <span className="hidden sm:inline">
                {isRtl ? "الموقع العام" : "Public Site"}
              </span>
            </a>
          </div>
        </header>

        {/* Central Content Area */}
        <main className="my-auto py-8 sm:py-10 max-w-md w-full mx-auto relative z-20">
          <div className="text-start mb-6 space-y-2">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[2px] text-amber-400">
              ✦ DUNAS TRAVEL · EXECUTIVE SUITE ✦
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {tCommon("appName")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {tCommon("adminSuite")} —{" "}
              {isRtl
                ? "بوابة الإدارة المركزية والتحكم في العمليات السياحية"
                : "Centralized Administrative & Operations Portal"}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-destructive/15 border border-destructive/40 text-destructive text-xs font-medium rounded-xl text-start shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                {tAuth("emailLabel")}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-10 h-11 bg-white/5 border-white/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder:text-slate-500 text-sm rounded-xl dir-ltr text-start"
                  placeholder={tAuth("emailPlaceholder")}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-start">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                {tAuth("passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-10 pe-11 h-11 bg-white/5 border-white/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder:text-slate-500 text-sm rounded-xl dir-ltr text-start"
                  placeholder={tAuth("passwordPlaceholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                />
                <span>{isRtl ? "تذكر هذه الجلسة" : "Remember this session"}</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !email.trim() || !password}
              variant="gold"
              className="w-full h-11 mt-3 gap-2 text-xs font-bold uppercase tracking-[1.5px] rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{tAuth("signingIn")}</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{tAuth("signInButton")}</span>
                </>
              )}
            </Button>
          </form>
        </main>

        {/* Footer Note */}
        <footer className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 relative z-20">
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-amber-400" />
            <span>256-bit SSL Administrative Security Protocol</span>
          </div>
          <span>v2.5 Enterprise</span>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* HALF 2: CINEMATIC VISUAL HERO PANEL                                       */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[54%] 2xl:w-[58%] min-h-screen relative overflow-hidden flex-col justify-between p-12 xl:p-16 select-none bg-black">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[15000ms] hover:scale-105"
          style={{
            backgroundImage: `url('/imgs/admin-login-hero.jpg')`,
          }}
        />

        {/* Luxury Obsidian Gradient Vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: isRtl
              ? "linear-gradient(270deg, rgba(6, 13, 35, 0.94) 0%, rgba(6, 13, 35, 0.4) 45%, rgba(6, 13, 35, 0.75) 100%)"
              : "linear-gradient(90deg, rgba(6, 13, 35, 0.94) 0%, rgba(6, 13, 35, 0.4) 45%, rgba(6, 13, 35, 0.75) 100%)",
          }}
        />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#040A1A] via-transparent to-[#040A1A]/70" />

        {/* Ambient Glow */}
        <div
          className="absolute top-1/4 end-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Top Eyebrow */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/30 text-[11px] font-bold text-amber-300 uppercase tracking-widest shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Authorized Personnel Only</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-amber-400 drop-shadow" />
            ))}
            <span className="ms-1.5 font-bold text-white text-xs">Dunas Pro</span>
          </div>
        </div>

        {/* Center Brand Statement */}
        <div className="relative z-20 my-auto max-w-xl text-start">
          <div className="space-y-6">
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              {isRtl ? (
                <>
                  منظومة التحكم المتكاملة للعمليات السياحية في{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                    مصر والشرق الأوسط
                  </span>
                </>
              ) : (
                <>
                  Integrated Command Center for Bespoke Operations Across{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                    Egypt & The Mediterranean
                  </span>
                </>
              )}
            </h2>

            <div className="p-6 rounded-3xl bg-black/50 backdrop-blur-xl border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 start-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
              <p className="text-sm xl:text-base text-slate-100 font-medium leading-relaxed">
                {isRtl
                  ? "«إدارة متكاملة للحجوزات الفاخرة، أسطول النقل، الفنادق، والجولات السياحية بدقة متناهية ودعم لحظي لجميع المسافرين والشركاء الدوليين.»"
                  : '"Unified management for bespoke reservations, luxury fleet dispatch, hotels, and private expeditions with real-time international coordination."'}
              </p>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-amber-300 font-semibold">
                <span>Dunas Travel International Operations Hub</span>
                <span className="text-slate-400">SOC-2 Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="relative z-20 pt-6 border-t border-white/15">
          <div className="grid grid-cols-3 gap-4 text-start">
            <div className="space-y-1">
              <span className="block text-2xl xl:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                100%
              </span>
              <span className="block text-[11px] text-slate-300 font-medium">
                {isRtl ? "متابعة فورية للعمليات" : "Real-time Operations"}
              </span>
            </div>

            <div className="space-y-1 border-s border-white/15 ps-4">
              <span className="block text-2xl xl:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                RBAC
              </span>
              <span className="block text-[11px] text-slate-300 font-medium">
                {isRtl ? "حماية وصلاحيات متعددة" : "Enterprise Security"}
              </span>
            </div>

            <div className="space-y-1 border-s border-white/15 ps-4">
              <span className="block text-2xl xl:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                24/7
              </span>
              <span className="block text-[11px] text-slate-300 font-medium">
                {isRtl ? "جاهزية واستقرار النظام" : "High Availability"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
