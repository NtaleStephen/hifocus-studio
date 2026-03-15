import React from "react";
import { WorkspaceThemeWrapper } from "@/components/WorkspaceThemeWrapper";
import { IdleTracker } from "@/components/IdleTracker";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceThemeWrapper>
      <IdleTracker>
        {children}
      </IdleTracker>
    </WorkspaceThemeWrapper>
  );
}
