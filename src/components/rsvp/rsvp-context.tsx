import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Meetup } from "@/lib/events";
import { getMeetups, getNextMeetup, isRsvpOpen, nextMeetup as fallbackNext } from "@/lib/events";

type RsvpContextValue = {
  open: boolean;
  event: Meetup;
  openRsvp: (event?: Meetup) => void;
  closeRsvp: () => void;
};

const RsvpContext = createContext<RsvpContextValue | null>(null);

export function RsvpProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultEvent, setDefaultEvent] = useState<Meetup>(fallbackNext);
  const [event, setEvent] = useState<Meetup>(fallbackNext);

  useEffect(() => {
    void getMeetups().then((list) => {
      const next = getNextMeetup(list);
      if (next) {
        setDefaultEvent(next);
        setEvent((current) =>
          current.slug === fallbackNext.slug ? next : current,
        );
      }
    });
  }, []);

  const openRsvp = useCallback(
    (meetup?: Meetup) => {
      const target = meetup ?? defaultEvent;
      if (!isRsvpOpen(target)) return;
      setEvent(target);
      setOpen(true);
    },
    [defaultEvent],
  );

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
