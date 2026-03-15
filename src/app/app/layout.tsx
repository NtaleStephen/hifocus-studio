import React from "react";
import { WorkspaceThemeWrapper } from "@/components/WorkspaceThemeWrapper";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceThemeWrapper>
      {children}
    </WorkspaceThemeWrapper>
  );
}
