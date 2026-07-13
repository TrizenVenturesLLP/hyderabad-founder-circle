import { lazy, Suspense, useState } from "react";
import { useRsvp } from "./rsvp-context";

const RsvpDialog = lazy(() =>
  import("./RsvpDialog").then((m) => ({ default: m.RsvpDialog })),
);

/** Loads the heavy RSVP dialog only after the first open request. */
export function LazyRsvpDialog() {
  const { open } = useRsvp();
  const [shouldLoad, setShouldLoad] = useState(false);

  if (open && !shouldLoad) {
    setShouldLoad(true);
  }

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <RsvpDialog />
    </Suspense>
  );
}
