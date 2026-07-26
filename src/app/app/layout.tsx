import React from "react";
import { WorkspaceThemeWrapper } from "@/components/WorkspaceThemeWrapper";
import { IdleTracker } from "@/components/IdleTracker";
import { AccountGate } from "@/components/AccountGate";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceThemeWrapper>
      <AccountGate>
        <IdleTracker>
          {children}
        </IdleTracker>
      </AccountGate>
    </WorkspaceThemeWrapper>
  );
}
