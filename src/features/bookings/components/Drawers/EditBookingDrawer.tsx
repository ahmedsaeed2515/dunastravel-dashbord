"use client";

import { useState, useEffect } from "react";
import { Booking, BookingStatus, Passenger } from "../../types";
import { 
  useUpdateBooking, 
  useUpdateBookingStatus, 
  useAssignBooking, 
  useUpsertPassengers 
} from "../../hooks/useBookings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface EditBookingDrawerProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBookingDrawer({ booking, open, onOpenChange }: EditBookingDrawerProps) {
  const updateBooking = useUpdateBooking();
  const updateStatus = useUpdateBookingStatus();
  const assignBooking = useAssignBooking();
  const upsertPassengers = useUpsertPassengers();

  // Local form states
  const [priority, setPriority] = useState<string>("NORMAL");
  const [tagsString, setTagsString] = useState<string>("");
  const [status, setStatus] = useState<BookingStatus>("PENDING");
  const [statusReason, setStatusReason] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  useEffect(() => {
     
    if (booking) {
      setPriority(booking.priority || "NORMAL");
      setTagsString(booking.tags?.join(", ") || "");
      setStatus(booking.status || "PENDING");
      setStatusReason("");
      setAssigneeId(booking.assigneeId || "");
      setPassengers(booking.passengers ? JSON.parse(JSON.stringify(booking.passengers)) : []);
    }
  }, [booking]);

  if (!booking) return null;

  const handleSaveGeneral = async () => {
    const tags = tagsString.split(",").map(t => t.trim()).filter(Boolean);
    await updateBooking.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { priority, tags }
    });
  };

  const handleSaveStatus = async () => {
    await updateStatus.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { status, reason: statusReason || undefined }
    });
  };

  const handleSaveAssignee = async () => {
    await assignBooking.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { assigneeId: assigneeId.trim() || null }
    });
  };

  const handleSavePassengers = async () => {
    // Basic validation
    if (passengers.some(p => !p.fullName.trim())) {
      toast.error("All passengers must have a full name");
      return;
    }
    await upsertPassengers.mutateAsync({
      referenceCode: booking.referenceCode,
      data: { passengers }
    });
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        fullName: "",
        passengerType: "ADULT",
        passportNumber: "",
        passportExpiry: "",
        dateOfBirth: "",
        nationality: ""
      }
    ]);
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const removePassenger = (index: number) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md md:w-[700px] md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            Edit Booking {booking.referenceCode}
          </SheetTitle>
          <SheetDescription className="mt-1 text-base">
            Modify enterprise properties, passenger records, and assignment workflow.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-12">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="assignee">Assignee</TabsTrigger>
            <TabsTrigger value="passengers">Passengers</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
            {/* GENERAL TAB */}
            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select onValueChange={(val) => val && setPriority(val)} defaultValue={priority}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags (Comma separated)</Label>
                  <Input 
                    placeholder="e.g. VIP, honeymoon, flight-included" 
                    value={tagsString} 
                    onChange={(e) => setTagsString(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSaveGeneral} 
                  disabled={updateBooking.isPending}
                  className="w-full mt-4"
                >
                  {updateBooking.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save General Details
                </Button>
              </div>
            </TabsContent>

            {/* STATUS TAB */}
            <TabsContent value="status" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Booking Status</Label>
                  <Select onValueChange={(val) => val && setStatus(val as BookingStatus)} defaultValue={status}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason / Status Note (Optional)</Label>
                  <Input 
                    placeholder="e.g. Customer requested cancellation / Payment verified" 
                    value={statusReason} 
                    onChange={(e) => setStatusReason(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSaveStatus} 
                  disabled={updateStatus.isPending}
                  className="w-full mt-4"
                >
                  {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Update Status
                </Button>
              </div>
            </TabsContent>

            {/* ASSIGNEE TAB */}
            <TabsContent value="assignee" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Assignee User ID</Label>
                  <Input 
                    placeholder="Enter Admin User ID (leave blank to unassign)" 
                    value={assigneeId} 
                    onChange={(e) => setAssigneeId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigns this booking to a staff member for dedicated processing.
                  </p>
                </div>

                <Button 
                  onClick={handleSaveAssignee} 
                  disabled={assignBooking.isPending}
                  className="w-full mt-4"
                >
                  {assignBooking.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Assignee
                </Button>
              </div>
            </TabsContent>

            {/* PASSENGERS TAB */}
            <TabsContent value="passengers" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Passenger Roster</Label>
                  <Button variant="outline" size="sm" onClick={addPassenger}>
                    <Plus className="mr-1 h-4 w-4" /> Add Passenger
                  </Button>
                </div>

                {passengers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No passengers defined. Click add passenger above.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {passengers.map((p, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-medium text-sm">Passenger #{index + 1}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0" onClick={() => removePassenger(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Full Name</Label>
                            <Input 
                              value={p.fullName} 
                              onChange={(e) => updatePassenger(index, "fullName", e.target.value)}
                              placeholder="John Doe"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select onValueChange={(val) => val && updatePassenger(index, "passengerType", val)} defaultValue={p.passengerType}>
                              <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADULT">Adult</SelectItem>
                                <SelectItem value="CHILD">Child</SelectItem>
                                <SelectItem value="INFANT">Infant</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Passport Number</Label>
                            <Input 
                              value={p.passportNumber || ""} 
                              onChange={(e) => updatePassenger(index, "passportNumber", e.target.value)}
                              placeholder="A1234567"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Passport Expiry</Label>
                            <Input 
                              type="date"
                              value={p.passportExpiry ? p.passportExpiry.split("T")[0] : ""} 
                              onChange={(e) => updatePassenger(index, "passportExpiry", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Nationality</Label>
                            <Input 
                              value={p.nationality || ""} 
                              onChange={(e) => updatePassenger(index, "nationality", e.target.value)}
                              placeholder="US"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input 
                              type="date"
                              value={p.dateOfBirth ? p.dateOfBirth.split("T")[0] : ""} 
                              onChange={(e) => updatePassenger(index, "dateOfBirth", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleSavePassengers} 
                  disabled={upsertPassengers.isPending}
                  className="w-full mt-6"
                >
                  {upsertPassengers.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save All Passengers
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
