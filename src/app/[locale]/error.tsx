"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-3xl font-display font-bold tracking-tight mb-2">عذراً، حدث خطأ غير متوقع!</h2>
      <p className="text-muted-foreground mb-8 max-w-[500px] text-sm">
        حدث خطأ أثناء معالجة الطلب في لوحة التحكم. تم تسجيل الخطأ وإخطار الفريق الفني.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default" className="font-bold rounded-xl">
          إعادة المحاولة 🔄
        </Button>
        <Button onClick={() => window.location.href = '/ar/admin'} variant="outline" className="font-bold rounded-xl">
          العودة للوحة التحكم 🏠
        </Button>
      </div>
    </div>
  );
}
