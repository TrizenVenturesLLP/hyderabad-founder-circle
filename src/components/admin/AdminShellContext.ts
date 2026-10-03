import { createContext } from "react";

export const AdminShellContext = createContext<{ workspaceLabel: string }>({
  workspaceLabel: "Admin console",
});
