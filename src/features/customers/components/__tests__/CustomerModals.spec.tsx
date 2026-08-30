import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CustomerProfileModal } from "../CustomerProfile/CustomerProfileModal";
import { EditCustomerDialog } from "../EditCustomerDialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Customer } from "../../types";

const mockCustomer: Customer = {
  id: "cust-123",
  customerNumber: "CUST-2026-0001",
  name: "Lady Eleanor Vance",
  email: "eleanor@luxurytravel.com",
  phone: "+44 20 7946 0912",
  isVip: true,
  status: "ACTIVE",
  tags: ["VIP", "LuxuryNile"],
  segments: ["VIP Luxury"],
  nationality: "British",
  bookingsCount: 3,
  notesCount: 2,
  documentsCount: 1,
  totalSpent: 12500,
  outstandingBalance: 0,
  createdAt: "2026-01-15T10:00:00Z",
};

vi.mock("../../hooks/useCustomers", () => ({
  useCustomerDetail: () => ({
    data: {
      ...mockCustomer,
      passportNumber: "P98765432",
      gender: "FEMALE",
      dateOfBirth: "1988-04-12",
      preferredLanguage: "en",
      preferredCurrency: "USD",
      preferredDestination: "Luxor & Aswan",
      preferredTravelType: "Luxury Nile Cruises",
      customerSource: "REFERRAL",
      bookings: [],
      notes: [],
      documents: [],
      timeline: [],
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useUpdateCustomerCrm: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useAddCustomerNote: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
  useAddCustomerDocument: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

describe("Customer Pop-up Modals", () => {
  it("renders CustomerProfileModal pop-up with luxury metrics and tabs", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerProfileModal
          customer={mockCustomer}
          open={true}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText("Lady Eleanor Vance")).toBeInTheDocument();
    expect(screen.getByText("#CUST-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("VIP Concierge")).toBeInTheDocument();
  });

  it("renders EditCustomerDialog pop-up with edit fields", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <EditCustomerDialog
          customer={mockCustomer}
          isOpen={true}
          onClose={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByDisplayValue("Lady Eleanor Vance")).toBeInTheDocument();
    expect(screen.getByDisplayValue("eleanor@luxurytravel.com")).toBeInTheDocument();
  });
});
