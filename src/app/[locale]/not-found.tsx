import { Link } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-bold mb-4 font-mono text-primary">404</h1>
      <h2 className="text-2xl font-bold mb-4">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground mb-8 max-w-md text-sm">
        الصفحة أو المورد الذي تبحث عنه غير موجود أو ربما تم نقله أو حذفه.
      </p>
      <Link href="/admin" className={buttonVariants({ variant: "default", className: "font-bold rounded-xl" })}>
        العودة للوحة التحكم الرئيسية 🏠
      </Link>
    </div>
  );
}
