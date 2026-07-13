"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { PlusCircle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  const { user } = usePermissions();
  const today = new Date();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          Welcome back, {user?.name?.split(' ')[0] || 'Executive'}
          {user?.role && (
            <Badge variant="secondary" className="text-xs tracking-wider border-primary/20 text-primary">
              {user.role}
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 mt-1">
          <CalendarDays className="h-4 w-4" />
          {format(today, "EEEE, MMMM do, yyyy")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Placeholder Quick Actions */}
        <Button variant="outline" className="shadow-sm">
          Generate Report
        </Button>
        <Button className="shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Booking
        </Button>
      </div>
    </div>
  );
}
