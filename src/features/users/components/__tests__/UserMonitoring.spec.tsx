import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { UserMonitoringMetricsBanner } from "../UserMonitoringMetricsBanner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../hooks/useUsers", () => ({
  useUserMonitoringOverview: () => ({
    data: {
      totalUsers: 1420,
      activeUsers: 1380,
      suspendedUsers: 12,
      vipUsers: 85,
      newUsers: { today: 14, last7Days: 92, last30Days: 310 },
      rolesDistribution: { ADMIN: 5, USER: 1300, AGENT: 45, COMPANY: 70 },
      activityMetrics: { past24HoursEvents: 540, past24HoursLogins: 210 },
    },
    isLoading: false,
  }),
}));

describe("UserMonitoringMetricsBanner", () => {
  it("renders live user metrics and statistics correctly", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserMonitoringMetricsBanner />
      </QueryClientProvider>
    );

    expect(screen.getByText("1,420")).toBeInTheDocument();
    expect(screen.getByText("1,380")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
  });
});
