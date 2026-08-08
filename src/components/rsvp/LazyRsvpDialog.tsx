import { lazy, Suspense, useEffect, useState } from "react";
import { useRsvp } from "@/components/rsvp/rsvp-context";

const RsvpDialog = lazy(() =>
  import("./RsvpDialog").then((m) => ({ default: m.RsvpDialog })),
);

/** Loads the heavy RSVP dialog only after the first open request. */
export function LazyRsvpDialog() {
  const { open } = useRsvp();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (open) setShouldLoad(true);
  }, [open]);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <RsvpDialog />
    </Suspense>
  );
}
