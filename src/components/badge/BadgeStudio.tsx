import { useEffect, useRef, useState } from "react";
import {
  Download,
  ImagePlus,
  Linkedin,
  Lock,
  LockOpen,
  RotateCcw,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Meetup } from "@/lib/events";
import { isMeetupDateConfirmed, meetupDateLabel } from "@/lib/events";
import trizenLogo from "@/assets/trizen-mark.png";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  BADGE_HEIGHT,
  BADGE_TEMPLATES,
  BADGE_WIDTH,
  badgeShareText,
  drawBadge,
  loadImageFromFile,
  type BadgeTemplateId,
} from "@/lib/badge-studio";
import { cn } from "@/lib/utils";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.451L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const fieldClass =
  "h-[48px] w-full rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-sm text-foreground shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus-visible:border-[var(--brand-accent)] focus-visible:ring-1 focus-visible:ring-[var(--brand-accent)]/30";

const chipBtnClass =
  "inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[12px] font-medium text-foreground transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-background-alt)]";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

type Props = {
  meetup: Meetup;
  initialName?: string;
};

export function BadgeStudio({ meetup, initialName = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [templateId, setTemplateId] = useState<BadgeTemplateId>("circle");
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1.05);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [locked, setLocked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = trizenLogo;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBadge({
      ctx,
      templateId,
      name,
      eventTitle: meetup.title,
      dateLabel: meetupDateLabel(meetup),
      dateISO: isMeetupDateConfirmed(meetup) ? meetup.dateISO : "",
      city: meetup.city,
      photo,
      logo,
      zoom,
      offsetX,
      offsetY,
    });
  }, [templateId, name, meetup, photo, logo, zoom, offsetX, offsetY]);

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.(heic|heif)$/i.test(file.name)) {
      toast.error("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      setPhoto(img);
      setZoom(1.05);
      setOffsetX(0);
      setOffsetY(0);
      setLocked(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load that image.",
      );
    }
  }

  function resetPhotoPosition() {
    setZoom(1.05);
    setOffsetX(0);
    setOffsetY(0);
  }

  function downloadBadge() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!photo) {
      toast.message("Upload a photo first to personalize your badge.");
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Could not export badge.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hfn-badge-${meetup.slug}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Badge downloaded");
      },
      "image/png",
      0.95,
    );
  }

  async function shareNative() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = badgeShareText(meetup.title);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 0.95),
      );
      if (!blob) throw new Error("export failed");
      const file = new File([blob], `hfn-badge-${meetup.slug}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: meetup.title });
        return;
      }
      if (navigator.share) {
        await navigator.share({
          text,
          title: meetup.title,
          url: window.location.href,
        });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.message("Share text copied — download the badge, then post it.");
    } catch {
      // user cancelled or unsupported
    }
  }

  const shareText = badgeShareText(meetup.title);
  const eventUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${meetup.slug}`
      : `https://community.trizenventures.com/events/${meetup.slug}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (locked || !photo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetX,
      oy: offsetY,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging || !dragStart.current || locked) return;
    const dx = (e.clientX - dragStart.current.x) / 140;
    const dy = (e.clientY - dragStart.current.y) / 140;
    setOffsetX(Math.max(-1, Math.min(1, dragStart.current.ox + dx)));
    setOffsetY(Math.max(-1, Math.min(1, dragStart.current.oy + dy)));
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    setDragging(false);
    dragStart.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
      {/* Preview */}
      <div className="lg:col-span-6">
        <SectionLabel>Preview</SectionLabel>
        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          Drag to reposition · use zoom below
        </p>

        <div className="mx-auto mt-4 max-w-[300px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-background-alt)] sm:max-w-[320px] lg:mx-0 lg:max-w-[340px]">
          <canvas
            ref={canvasRef}
            width={BADGE_WIDTH}
            height={BADGE_HEIGHT}
            className={cn(
              "block w-full touch-none",
              photo && !locked
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-default",
            )}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>

        <div className="mx-auto mt-4 flex max-w-[340px] flex-col gap-3 lg:mx-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center border border-[var(--color-border)] text-sm text-foreground transition-colors hover:bg-[var(--color-background-alt)]"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.08).toFixed(2)))}
              aria-label="Zoom out"
            >
              −
            </button>
            <input
              type="range"
              min={1}
              max={2}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full accent-[var(--brand-accent)]"
              aria-label="Zoom"
            />
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center border border-[var(--color-border)] text-sm text-foreground transition-colors hover:bg-[var(--color-background-alt)]"
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.08).toFixed(2)))}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLocked((v) => !v)}
              className={cn(
                chipBtnClass,
                locked &&
                  "border-[var(--brand-accent)] bg-[color-mix(in_oklab,var(--brand-accent)_8%,transparent)] text-[var(--brand-accent)]",
              )}
            >
              {locked ? (
                <Lock className="size-3.5" strokeWidth={1.75} />
              ) : (
                <LockOpen className="size-3.5" strokeWidth={1.75} />
              )}
              {locked ? "Locked" : "Lock position"}
            </button>
            <button
              type="button"
              onClick={resetPhotoPosition}
              className={chipBtnClass}
            >
              <RotateCcw className="size-3.5" strokeWidth={1.75} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="lg:col-span-6 lg:sticky lg:top-24">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <section>
            <SectionLabel>Choose a template</SectionLabel>
            <ul className="mt-3 flex gap-3">
              {BADGE_TEMPLATES.map((t) => (
                <li key={t.id} className="w-[5.5rem]">
                  <button
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "relative w-full overflow-hidden border bg-[#26184a] p-1.5 transition-colors",
                      templateId === t.id
                        ? "border-[var(--brand-accent)]"
                        : "border-[var(--color-border)] opacity-80 hover:opacity-100",
                    )}
                    aria-pressed={templateId === t.id}
                  >
                    <img
                      src={`/badges/thumb-${t.id}.svg`}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    <span className="mt-1 block text-center text-[11px] font-medium text-white/90">
                      {t.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 border-t border-[var(--color-border)] pt-6">
            <SectionLabel>Your photo</SectionLabel>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
              >
                <ImagePlus className="size-3.5" strokeWidth={1.75} />
                {photo ? "Replace photo" : "Upload photo"}
              </button>
              {photo ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    resetPhotoPosition();
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className={chipBtnClass}
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                  Remove
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
              JPG, PNG or WebP · stays on your device
            </p>
          </section>

          <section className="mt-6 border-t border-[var(--color-border)] pt-6">
            <label htmlFor="badge-name">
              <SectionLabel>Name on badge</SectionLabel>
            </label>
            <input
              id="badge-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              maxLength={48}
              className={cn(fieldClass, "mt-3")}
            />
          </section>

          <div className="mt-6 flex flex-col gap-2.5 border-t border-[var(--color-border)] pt-6">
            <button
              type="button"
              onClick={downloadBadge}
              className="btn-primary inline-flex w-full items-center justify-center gap-2"
            >
              <Download className="size-3.5" strokeWidth={1.75} />
              Download badge
            </button>
            <button
              type="button"
              onClick={shareNative}
              className="btn-secondary inline-flex w-full items-center justify-center gap-2"
            >
              <Share2 className="size-3.5" strokeWidth={1.75} />
              Share badge
            </button>
          </div>

          <div className="mt-6 border-t border-[var(--color-border)] pt-5">
            <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              Share on LinkedIn, WhatsApp or X to let your network know
              you&apos;re attending.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-9 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                aria-label="Share on WhatsApp"
              >
                <WhatsAppIcon className="size-3.5" />
              </a>
              <a
                href={liHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-9 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="size-3.5" strokeWidth={1.75} />
              </a>
              <a
                href={xHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-9 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                aria-label="Share on X"
              >
                <XIcon className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">
          Event · {meetup.title} · {meetupDateLabel(meetup)}
        </p>
      </div>
    </div>
  );
}
