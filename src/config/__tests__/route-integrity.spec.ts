import { describe, it, expect } from "vitest";
import { adminRoutes } from "../admin-routes";
import fs from "fs";
import path from "path";

describe("Admin Route Integrity", () => {
  const routesDir = path.join(process.cwd(), "src", "app", "[locale]", "(dashboard)");

  const extractRoutes = (obj: any): string[] => {
    let routes: string[] = [];
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        routes.push(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        routes = routes.concat(extractRoutes(obj[key]));
      }
    }
    return routes;
  };

  const allRoutes = extractRoutes(adminRoutes);

  it("should have no malformed href strings or illegal tokens", () => {
    allRoutes.forEach((route) => {
      expect(route).not.toContain("undefined");
      expect(route).not.toContain("null");
      expect(route).not.toContain("[object Object]");
      expect(route).not.toContain("Something");
      expect(route).not.toContain("//");
      expect(route).not.toMatch(/^\/(en|ar|es|pt|it)\//); // Should be canonical un-localized path template
    });
  });

  it("should resolve every admin route to an actual filesystem page.tsx", () => {
    allRoutes.forEach((route) => {
      // Strips leading slash and checks under src/app/[locale]/(dashboard)/
      const relativePath = route.startsWith("/") ? route.slice(1) : route;
      const expectedFile = path.join(routesDir, relativePath, "page.tsx");
      const exists = fs.existsSync(expectedFile);
      expect(exists, `Expected page.tsx for route '${route}' at ${expectedFile}`).toBe(true);
    });
  });

  it("should include all audited routes in the route registry", () => {
    const auditedRoutes = [
      "/admin/inquiries",
      "/admin/companies",
      "/admin/finance/commissions",
      "/admin/finance/wallet",
      "/admin/communications",
      "/admin/content",
      "/admin/media",
    ];

    auditedRoutes.forEach((audited) => {
      expect(allRoutes).toContain(audited);
    });
  });
});
