import { CommunicationsView } from "@/features/communications/components/CommunicationsView";

export default function CommunicationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Communications & Inquiries</h2>
      </div>
      <CommunicationsView />
    </div>
  );
}
