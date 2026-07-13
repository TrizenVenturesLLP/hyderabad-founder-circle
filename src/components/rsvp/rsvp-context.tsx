import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Meetup } from "@/lib/events";
import { isRsvpOpen, nextMeetup } from "@/lib/events";

type RsvpContextValue = {
  open: boolean;
  event: Meetup;
  openRsvp: (event?: Meetup) => void;
  closeRsvp: () => void;
};

const RsvpContext = createContext<RsvpContextValue | null>(null);

export function RsvpProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<Meetup>(nextMeetup);

  const openRsvp = useCallback((meetup?: Meetup) => {
    const target = meetup ?? nextMeetup;
    if (!isRsvpOpen(target)) return;
    setEvent(target);
    setOpen(true);
  }, []);

  const closeRsvp = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, event, openRsvp, closeRsvp }),
    [open, event, openRsvp, closeRsvp],
  );

  return <RsvpContext.Provider value={value}>{children}</RsvpContext.Provider>;
}

export function useRsvp() {
  const ctx = useContext(RsvpContext);
  if (!ctx) {
    throw new Error("useRsvp must be used within RsvpProvider");
  }
  return ctx;
}
