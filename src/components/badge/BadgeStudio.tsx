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
import trizenLogo from "@/assets/trizen-mark.png";
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.451L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
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
      dateLabel: meetup.dateLabel,
      dateISO: meetup.dateISO,
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
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${meetup.slug}`
      : `https://ty.trizenventures.com/events/${meetup.slug}`,
  )}`;
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
    <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
      <div className="lg:col-span-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
          Preview
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
          Drag to reposition · zoom below
        </p>
        <div className="mx-auto mt-2.5 max-w-[260px] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-background-warm)] shadow-[0_14px_32px_-24px_rgba(0,0,0,0.4)] sm:max-w-[280px] lg:mx-0 lg:max-w-[300px]">
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

        <div className="mt-2.5 flex max-w-[300px] flex-wrap items-center gap-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <button
              type="button"
              className="shrink-0 rounded-md border border-[var(--color-border)] px-1.5 py-1 text-xs"
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
              className="shrink-0 rounded-md border border-[var(--color-border)] px-1.5 py-1 text-xs"
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.08).toFixed(2)))}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              locked
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"
                : "border-[var(--color-border)] text-foreground",
            )}
          >
            {locked ? (
              <Lock className="size-3" strokeWidth={1.75} />
            ) : (
              <LockOpen className="size-3" strokeWidth={1.75} />
            )}
            {locked ? "Locked" : "Lock"}
          </button>
          <button
            type="button"
            onClick={resetPhotoPosition}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-foreground"
          >
            <RotateCcw className="size-3" strokeWidth={1.75} />
            Reset
          </button>
        </div>
      </div>

      <div className="max-w-md lg:col-span-7 lg:sticky lg:top-6 lg:max-w-sm">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
            Choose a template
          </p>
          <ul className="mt-2 flex gap-2">
            {BADGE_TEMPLATES.map((t) => (
              <li key={t.id} className="w-[4.75rem]">
                <button
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "relative w-full overflow-hidden rounded-[8px] border-2 bg-[#26184a] p-1 transition-colors",
                    templateId === t.id
                      ? "border-[#e85aad] shadow-[0_0_0_1px_rgba(232,90,173,0.35)]"
                      : "border-transparent opacity-85 hover:opacity-100",
                  )}
                  aria-pressed={templateId === t.id}
                >
                  <img
                    src={`/badges/thumb-${t.id}.svg`}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <span className="mt-0.5 block text-center text-[10px] font-medium text-white/90">
                    {t.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
            Your photo
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            className="sr-only"
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-[13px] font-medium text-foreground"
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
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)]"
              >
                <X className="size-3.5" strokeWidth={1.75} />
                Remove
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
            JPG, PNG or WebP. Processed on your device.
          </p>
        </section>

        <section className="mt-4">
          <label
            htmlFor="badge-name"
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]"
          >
            Name on badge
          </label>
          <input
            id="badge-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            maxLength={48}
            className="mt-1.5 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] text-foreground outline-none focus:border-[var(--brand-accent)]"
          />
        </section>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={downloadBadge}
            className="btn-primary inline-flex w-full items-center justify-center gap-1.5 py-2 text-[13px]"
          >
            <Download className="size-3.5" strokeWidth={1.75} />
            Download badge
          </button>
          <button
            type="button"
            onClick={shareNative}
            className="btn-secondary inline-flex w-full items-center justify-center gap-1.5 py-2 text-[13px]"
          >
            <Share2 className="size-3.5" strokeWidth={1.75} />
            Share badge
          </button>
        </div>

        <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
          Share on LinkedIn, WhatsApp or X to let your network know you&apos;re
          attending.
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--brand-accent)]"
            aria-label="Share on WhatsApp"
          >
            <WhatsAppIcon className="size-3.5" />
          </a>
          <a
            href={liHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--brand-accent)]"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="size-3.5" strokeWidth={1.75} />
          </a>
          <a
            href={xHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--brand-accent)]"
            aria-label="Share on X"
          >
            <XIcon className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
