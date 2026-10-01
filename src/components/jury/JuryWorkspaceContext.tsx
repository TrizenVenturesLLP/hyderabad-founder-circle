import { createContext, useContext } from "react";
import type { JuryHackathon, JuryUser } from "@/lib/jury-api";

export type JuryWorkspaceState = {
  user: JuryUser | null;
  hackathons: JuryHackathon[];
  currentHackathon: JuryHackathon | null;
  loading: boolean;
  error: string;
};

export const JuryWorkspaceContext = createContext<JuryWorkspaceState>({
  user: null,
  hackathons: [],
  currentHackathon: null,
  loading: true,
  error: "",
});

export function useJuryWorkspace() {
  return useContext(JuryWorkspaceContext);
}
