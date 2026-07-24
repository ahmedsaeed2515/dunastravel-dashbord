"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { authApi } from "@/features/auth/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 end-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Card className="relative z-10 w-full max-w-md border-border/80 shadow-md bg-card/95 backdrop-blur-md p-2">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-3 shadow-sm">
            D
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-foreground">
            {tCommon("appName")}
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            {tCommon("adminSuite")}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tAuth("emailLabel")}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-9 dir-ltr text-start"
                  placeholder={tAuth("emailPlaceholder")}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tAuth("passwordLabel")}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-9 dir-ltr text-start"
                  placeholder={tAuth("passwordPlaceholder")}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="gold"
              className="w-full h-10 mt-2 gap-2 text-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? tAuth("signingIn") : tAuth("signInButton")}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
