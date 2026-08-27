"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BlogsManager } from "@/components/blogs/BlogsManager";

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Journal & Blog Management"
        description="Create, edit, and publish luxury travel articles for Dunas Travel Journal"
      />
      <BlogsManager />
    </div>
  );
}
