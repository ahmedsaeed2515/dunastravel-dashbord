"use client";

import { WalletDirectoryItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  User, 
  Wallet, 
  PlusCircle, 
  MinusCircle, 
  History, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  Download,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface WalletsDirectoryTableProps {
  data: WalletDirectoryItem[];
  isLoading: boolean;
  onViewLedger: (wallet: WalletDirectoryItem) => void;
  onDeposit: (wallet: WalletDirectoryItem) => void;
  onDebit: (wallet: WalletDirectoryItem) => void;
}

export function WalletsDirectoryTable({
  data,
  isLoading,
  onViewLedger,
  onDeposit,
  onDebit,
}: WalletsDirectoryTableProps) {
  const tCommon = useTranslations("common");
  const tFinance = useTranslations("finance");

  const handleExportCsv = () => {
    if (!data.length) {
      toast.error("لا توجد محافظ للتصدير حالياً");
      return;
    }

    try {
      const headers = [
        "اسم الشريك / الحساب",
        "الرمز التعريفي / البريد",
        "النوع",
        "الرصيد المتاح (USD)",
        "نسبة العمولة %",
        "إجمالي الحركات المالية",
        "حالة المحفظة",
      ];

      const rows = data.map((w) => [
        `"${w.owner?.name || "شريك غير مسمى"}"`,
        `"${w.owner?.referenceCode || w.owner?.email || w.ownerId || ""}"`,
        `"${w.ownerType === "COMPANY" ? "شركة سياحية (B2B)" : "وكيل سياحي (Agent)"}"`,
        `"${Number(w.balance || 0).toFixed(2)}"`,
        `"${w.owner?.commissionRate || 0}%"`,
        `"${w.transactionsCount || 0}"`,
        `"${w.status === "ACTIVE" ? "نشط ومفعل" : w.status || "معطل"}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `wallets_directory_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير دليل المحافظ المالية بنجاح بصيغة CSV");
    } catch (err) {
      toast.error("حدث خطأ أثناء تصدير المحافظ");
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>جاري تحميل دليل محافظ الشركاء والوكلاء...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 border-2 border-dashed border-border/80 rounded-2xl text-center space-y-3 bg-muted/10">
        <Wallet className="h-10 w-10 mx-auto text-amber-500/60" />
        <p className="font-bold text-sm text-foreground">لا توجد محافظ شركاء مسجلة حالياً</p>
        <p className="text-xs max-w-md mx-auto text-muted-foreground">
          يتم إنشاء وتفعيل المحافظ المالية تلقائياً عند تسجيل شركات سياحية B2B أو وكلاء سفر جدد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground">
          إجمالي محافظ الشركاء: <span className="text-foreground font-mono">{data.length}</span> محفظة
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="font-bold rounded-xl gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 cursor-pointer"
        >
          <Download className="h-4 w-4" /> تصدير دليل المحافظ CSV
        </Button>
      </div>

      <div className="border border-border/60 rounded-2xl overflow-hidden shadow-xs">
      <table className="w-full text-xs text-start">
        <thead className="bg-muted/60 font-bold text-muted-foreground uppercase tracking-wider text-[11px] border-b border-border/60">
          <tr>
            <th className="p-3.5">الشريك / الحساب</th>
            <th className="p-3.5">النوع والصلاحية</th>
            <th className="p-3.5">الرصيد المتاح</th>
            <th className="p-3.5">نسبة العمولة</th>
            <th className="p-3.5">حركة القيود</th>
            <th className="p-3.5">الحالة</th>
            <th className="p-3.5 text-right">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-card">
          {data.map((wallet) => {
            const isCompany = wallet.ownerType === "COMPANY";
            const owner = wallet.owner;
            const balance = Number(wallet.balance) || 0;

            return (
              <tr key={wallet.id} className="hover:bg-muted/20 transition-colors">
                {/* Partner Name & Details */}
                <td className="p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isCompany ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {isCompany ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground text-xs">{owner?.name || "شريك غير مسمى"}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {owner?.referenceCode ? `#${owner.referenceCode}` : owner?.email || wallet.ownerId}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Type & Role Badge */}
                <td className="p-3.5">
                  {isCompany ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">
                      🏢 {owner?.type || "شركة B2B"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] border border-purple-500/20">
                      👤 {owner?.role || "وكيل سفر"}
                    </span>
                  )}
                </td>

                {/* Balance */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={`font-black text-sm ${
                      balance > 0 ? "text-emerald-600 dark:text-emerald-400" : balance === 0 ? "text-muted-foreground" : "text-destructive"
                    }`}>
                      ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{wallet.currency || "USD"}</span>
                  </div>
                </td>

                {/* Commission Rate */}
                <td className="p-3.5 font-semibold text-muted-foreground">
                  {owner?.commissionRate !== undefined && owner?.commissionRate > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      {owner.commissionRate}% افتراضي
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  )}
                </td>

                {/* Transactions Count */}
                <td className="p-3.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    {wallet.transactionsCount ?? 0} معاملة
                  </span>
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-max border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> {wallet.status === 'ACTIVE' ? 'نشط' : wallet.status || "نشط"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      onClick={() => onDeposit(wallet)}
                      size="xs"
                      variant="outline"
                      title="إيداع رصيد في المحفظة"
                      className="h-7 px-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg cursor-pointer"
                    >
                      <PlusCircle className="h-3 w-3 me-1" />
                      إيداع
                    </Button>
                    <Button
                      onClick={() => onDebit(wallet)}
                      size="xs"
                      variant="outline"
                      title="خصم رصيد من المحفظة"
                      className="h-7 px-2 text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 rounded-lg cursor-pointer"
                    >
                      <MinusCircle className="h-3 w-3 me-1" />
                      خصم
                    </Button>
                    <Button
                      onClick={() => onViewLedger(wallet)}
                      size="xs"
                      variant="gold"
                      title="عرض كشف الحساب والعمليات"
                      className="h-7 px-2 text-xs font-bold gap-1 shadow-xs rounded-lg cursor-pointer"
                    >
                      <History className="h-3 w-3" />
                      كشف الحساب
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);
}
