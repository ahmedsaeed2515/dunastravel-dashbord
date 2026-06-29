"use client";

import { User } from "../../types";
import { ViewDetailsDrawer } from "@/components/shared/drawers/ViewDetailsDrawer";
import { Timeline, TimelineItem } from "@/components/shared/ui/Timeline";
import { format } from "date-fns";
import { Mail, Phone, CalendarDays, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserDetailsDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDrawer({ user, open, onOpenChange }: UserDetailsDrawerProps) {
  if (!user) return null;

  return (
    <ViewDetailsDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="User Details"
      description="View full profile and activity logs."
    >
      <div className="space-y-8">
        {/* Profile Header section */}
        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {user.phone}
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> Role
            </span>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Joined
            </span>
            <span className="text-sm font-medium">
              {format(new Date(user.createdAt), "MMM do, yyyy")}
            </span>
          </div>
        </div>

        {/* Audit Timeline */}
        <div>
          <h4 className="text-sm font-semibold mb-4 border-b pb-2">Audit Timeline</h4>
          <Timeline>
            <TimelineItem
              icon={<Shield className="h-4 w-4 text-primary" />}
              title="Account Created"
              description={`Role assigned: ${user.role}`}
              time={format(new Date(user.createdAt), "PPp")}
            />
            {user.updatedAt !== user.createdAt && (
              <TimelineItem
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                title="Profile Updated"
                time={format(new Date(user.updatedAt), "PPp")}
              />
            )}
          </Timeline>
        </div>
      </div>
    </ViewDetailsDrawer>
  );
}
