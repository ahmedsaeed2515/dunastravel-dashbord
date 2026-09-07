"use client";

import { useState, Suspense } from "react";
import { UsersTable } from "@/features/users/components/UsersTable/UsersTable";
import { TableSkeleton } from "@/components/shared/ui/Skeletons";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ShieldCheck,
  Crown,
  Shield,
  Building2,
  Briefcase,
  UserCheck,
  Globe,
  CheckCircle2,
  Lock,
  Users,
  Layers,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface RoleDefinition {
  id: string;
  nameKey: string;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  badgeEn: string;
  colorClass: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  icon: React.ElementType;
  descriptionAr: string;
  descriptionEn: string;
  permissionsAr: string[];
  permissionsEn: string[];
}

const ROLES_DEFINITIONS: RoleDefinition[] = [
  {
    id: "SUPER_ADMIN",
    nameKey: "superAdmin",
    nameAr: "مدير نظام رئيسي (Super Admin)",
    nameEn: "Super Administrator",
    badgeAr: "أعلى صلاحية مطلقة",
    badgeEn: "Highest Authority",
    colorClass: "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400",
    badgeVariant: "default",
    icon: Crown,
    descriptionAr: "الوصول الكامل وغير المقيد لكافة مكونات النظام، سجلات التدقيق الأمني، وقواعد البيانات.",
    descriptionEn: "Unrestricted access across all system modules, security audit trails, and infrastructure.",
    permissionsAr: [
      "التحكم الكامل في سجلات التدقيق الأمني (Audit Logs)",
      "إنشاء وترقية مديري النظام (Admins)",
      "تعديل وتجاوز كافة البيانات والسياسات المالية",
      "إدارة مفاتيح الذكاء الاصطناعي وإعدادات البنية التحتية",
    ],
    permissionsEn: [
      "Full access to Security Audit Logs",
      "Create and escalate Admin accounts",
      "Override financial settings and ledgers",
      "Manage AI key pools and system infrastructure",
    ],
  },
  {
    id: "ADMIN",
    nameKey: "admin",
    nameAr: "مدير عمليات النظام (Admin)",
    nameEn: "Operations Administrator",
    badgeAr: "إدارة العمليات والمنصة",
    badgeEn: "Operations & Platform",
    colorClass: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    badgeVariant: "default",
    icon: ShieldCheck,
    descriptionAr: "إدارة شاملة لعمليات الحجوزات، البرامج السياحية، العملاء، شركات ووكلاء B2B، والمستخدمين.",
    descriptionEn: "Complete management of bookings, tour itineraries, CRM clients, B2B partners, and users.",
    permissionsAr: [
      "إدارة وتعديل أدوار وصلاحيات المستخدمين والشركات والوكلاء",
      "إدارة وتأكيد وتعديل الحجوزات والمدفوعات",
      "إنشاء البرامج السياحية وتعديل خطط الرحلات والأسعار",
      "مراقبة النشاط الحي وإيقاف/تفعيل الحسابات",
    ],
    permissionsEn: [
      "Manage user roles, company accounts, and agent profiles",
      "Manage, confirm, and modify bookings and invoices",
      "Publish and edit tour itineraries and packages",
      "Monitor live activity stream and suspend/reactivate users",
    ],
  },
  {
    id: "COMPANY",
    nameKey: "company",
    nameAr: "شريك سياحي (B2B Company)",
    nameEn: "B2B Travel Partner Company",
    badgeAr: "بوابة الشركات",
    badgeEn: "B2B Corporate Portal",
    colorClass: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
    badgeVariant: "secondary",
    icon: Building2,
    descriptionAr: "حساب الشركة السياحية الشريكة مع إمكانية حجز الرحلات بأسعار الشركاء وإدارة المحفظة والوكلاء.",
    descriptionEn: "Corporate agency partner account with wholesale access, sub-agent management, and digital wallet.",
    permissionsAr: [
      "حجز البرامج السياحية بأسعار وعمولات B2B",
      "إدارة ومتابعة وكلاء السفر التابعين للشركة",
      "متابعة رصيد المحفظة والعمولات وسجل السحوبات",
      "إدارة ملف الشركة وسجل حجوزات المجموعات",
    ],
    permissionsEn: [
      "Book luxury tours at B2B contracted commission rates",
      "Manage affiliated travel agents under company roster",
      "Track corporate wallet balance and commission ledger",
      "Manage company profile and group booking requests",
    ],
  },
  {
    id: "AGENT",
    nameKey: "agent",
    nameAr: "وكيل سياحي فردي (Travel Agent)",
    nameEn: "B2B Travel Agent",
    badgeAr: "وكيل معتمد",
    badgeEn: "Authorized Agent",
    colorClass: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    badgeVariant: "secondary",
    icon: Briefcase,
    descriptionAr: "وكيل سفر معتمد يقوم بإنشاء حجوزات لعملائه ومتابعة عمولاته الشخصية على كل حجز مؤكد.",
    descriptionEn: "Certified travel agent generating client bookings and tracking personal commission earnings.",
    permissionsAr: [
      "إنشاء حجوزات للعملاء واستلام تأكيدات فورية",
      "متابعة سجل العمولات المستحقة والصادرة",
      "إرسال واستقبال طلبات الرحلات المخصصة (Tailor-Made)",
    ],
    permissionsEn: [
      "Create client bookings with instant confirmation flows",
      "Track earned commissions and payout status",
      "Submit and manage tailor-made custom inquiries",
    ],
  },
  {
    id: "USER",
    nameKey: "user",
    nameAr: "مسافر مسجل (Standard Traveler)",
    nameEn: "Registered Traveler",
    badgeAr: "عميل نهائي",
    badgeEn: "Customer",
    colorClass: "border-slate-500/30 bg-slate-500/5 text-slate-600 dark:text-slate-400",
    badgeVariant: "outline",
    icon: UserCheck,
    descriptionAr: "العميل الفعلي المسافر، يمتلك ملفاً شخصياً وسجل حجوزات ومفضلة ورحلات مخصصة.",
    descriptionEn: "Direct traveler account with personal booking history, itinerary management, and reviews.",
    permissionsAr: [
      "استعراض تفاصيل وتحديثات الحجوزات الشخصية",
      "طلب رحلات مخصصة والتواصل مع خدمة العملاء والذكاء الاصطناعي",
      "كتابة تقييمات الرحلات وإدارة المفضلة",
    ],
    permissionsEn: [
      "View personal itinerary and live booking updates",
      "Request tailor-made luxury tours and consult GuideR AI",
      "Submit tour reviews and manage saved favorites",
    ],
  },
  {
    id: "GUEST",
    nameKey: "guest",
    nameAr: "زائر (Guest)",
    nameEn: "Public Guest",
    badgeAr: "بدون تسجيل",
    badgeEn: "Unauthenticated",
    colorClass: "border-zinc-500/20 bg-zinc-500/5 text-zinc-500",
    badgeVariant: "outline",
    icon: Globe,
    descriptionAr: "مستخدم عام يتصفح برامج الرحلات السياحية العامة ويستفسر بدون حساب دائم.",
    descriptionEn: "Public visitor browsing available public tours and sending initial lead inquiries.",
    permissionsAr: [
      "استعراض كتالوج البرامج السياحية العامة",
      "إرسال استفسار مبدئي أو طلب تسعيرة مخصصة",
    ],
    permissionsEn: [
      "Browse public catalog and travel guides",
      "Submit inquiry forms and request custom quotes",
    ],
  },
];

const PERMISSIONS_MATRIX = [
  { resource: "لوحة التحكم والإحصائيات (Dashboard)", resourceEn: "Dashboard & Analytics", super: "كامل", admin: "كامل", company: "إحصائيات B2B", agent: "إحصائيات B2B", user: "—", guest: "—" },
  { resource: "إدارة وتعيين الأدوار (Roles & Permissions)", resourceEn: "Roles & Permissions", super: "كامل", admin: "كامل", company: "—", agent: "—", user: "—", guest: "—" },
  { resource: "المستخدمين والمراقبة (Users & CRM)", resourceEn: "Users & CRM", super: "كامل", admin: "كامل", company: "—", agent: "—", user: "الملف فقط", guest: "—" },
  { resource: "الحجوزات (Bookings & Checkout)", resourceEn: "Bookings & Checkout", super: "كامل", admin: "كامل", company: "حجوزات الشركة", agent: "حجوزات الوكيل", user: "حجوزاته فقط", guest: "إنشاء فقط" },
  { resource: "البرامج السياحية (Tours & CMS)", resourceEn: "Tours & CMS", super: "كامل", admin: "كامل", company: "عرض B2B", agent: "عرض B2B", user: "عرض عام", guest: "عرض عام" },
  { resource: "المحفظة والعمولات (Wallets & Finance)", resourceEn: "Wallets & Finance", super: "كامل", admin: "كامل", company: "محفظة الشركة", agent: "عمولاته فقط", user: "—", guest: "—" },
  { resource: "سجلات التدقيق الأمني (Audit Logs)", resourceEn: "Security Audit Logs", super: "كامل", admin: "—", company: "—", agent: "—", user: "—", guest: "—" },
];

export default function RolesPage() {
  const tRoles = useTranslations("roles");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<string>("roles-overview");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={tRoles("title")}
        description={tRoles("description")}
      />

      <Tabs
        defaultValue="roles-overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-2 w-full sm:w-[460px] h-11 p-1 bg-muted/70 rounded-xl">
            <TabsTrigger value="roles-overview" className="text-xs font-bold gap-2 rounded-lg">
              <Layers className="h-4 w-4 text-amber-500" />
              <span>{isAr ? "مصفوفة وصلاحيات الأدوار" : "Roles & Permissions Matrix"}</span>
            </TabsTrigger>
            <TabsTrigger value="users-roles" className="text-xs font-bold gap-2 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{isAr ? "تعيين أدوار المستخدمين" : "Assign User Roles"}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAB 1: ROLES & MATRIX OVERVIEW ─── */}
        <TabsContent value="roles-overview" className="space-y-6 pt-1">
          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES_DEFINITIONS.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className={`p-2.5 rounded-xl border ${role.colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={role.badgeVariant} className="font-bold text-[11px]">
                        {isAr ? role.badgeAr : role.badgeEn}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-extrabold flex items-center gap-2">
                      <span>{isAr ? role.nameAr : role.nameEn}</span>
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1 text-muted-foreground">
                      {isAr ? role.descriptionAr : role.descriptionEn}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 border-t border-border/50">
                    <p className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{isAr ? "أبرز الصلاحيات والامتيازات:" : "Key Capabilities:"}</span>
                    </p>
                    <ul className="space-y-1.5">
                      {(isAr ? role.permissionsAr : role.permissionsEn).map((perm, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Granular Permission Comparison Matrix */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                <span>{isAr ? "مصفوفة مقارنة الصلاحيات والوصول الأمني" : "Access Control Comparison Matrix"}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "توضيح حدود الوصول والعمليات المتاحة لكل دور داخل وحدات منصة دوناس ترافيل."
                  : "Overview of permission boundaries and module access across platform roles."}
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/80">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/60 text-muted-foreground uppercase font-bold border-b border-border/80">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "الوحدة / المورد" : "Module / Resource"}</th>
                    <th className="py-3 px-3 text-center text-purple-600 dark:text-purple-400">SUPER_ADMIN</th>
                    <th className="py-3 px-3 text-center text-amber-600 dark:text-amber-400">ADMIN</th>
                    <th className="py-3 px-3 text-center text-blue-600 dark:text-blue-400">COMPANY</th>
                    <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">AGENT</th>
                    <th className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">USER</th>
                    <th className="py-3 px-3 text-center text-zinc-500">GUEST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {PERMISSIONS_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-foreground">
                        {isAr ? row.resource : row.resourceEn}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-purple-600 dark:text-purple-400">
                        {row.super}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                        {row.admin}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {row.company}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {row.agent}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {row.user}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {row.guest}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 2: USERS DIRECTORY & ROLE EDITING ─── */}
        <TabsContent value="users-roles" className="space-y-4 pt-1">
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <div className="mb-4 space-y-1">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>{isAr ? "إدارة وتعيين أدوار وصلاحيات المستخدمين" : "User Role Assignments"}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "يمكنك تعديل دور أي مستخدم مباشرة بالضغط على إجراءات المستخدم ثم 'تعديل الصلاحيات والبيانات'."
                  : "Change any user's role and account credentials via the row action menu."}
              </p>
            </div>
            <Suspense fallback={<TableSkeleton />}>
              <UsersTable />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
