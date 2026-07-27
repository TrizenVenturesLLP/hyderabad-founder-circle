export const BADGE_WIDTH = 1080;
export const BADGE_HEIGHT = 1350;

export type BadgeTemplateId = "circle" | "square";

export type BadgeTemplate = {
  id: BadgeTemplateId;
  label: string;
  /** Preview thumb hint for the photo well shape */
  shape: "circle" | "rounded";
};

export const BADGE_TEMPLATES: BadgeTemplate[] = [
  { id: "circle", label: "Circle", shape: "circle" },
  { id: "square", label: "Frame", shape: "rounded" },
];

export type BadgeDrawInput = {
  ctx: CanvasRenderingContext2D;
  templateId: BadgeTemplateId;
  name: string;
  eventTitle: string;
  dateLabel: string;
  dateISO: string;
  city: string;
  photo: HTMLImageElement | ImageBitmap | null;
  /** Trizen logo for the footer (optional) */
  logo?: HTMLImageElement | ImageBitmap | null;
  /** Photo zoom (1 = cover, up to ~2) */
  zoom: number;
  /** Offset of photo center within the well, in well-radius units (-1..1) */
  offsetX: number;
  offsetY: number;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Deep purple radial field (Keka-style)
  const g = ctx.createRadialGradient(
    BADGE_WIDTH * 0.5,
    BADGE_HEIGHT * 0.38,
    60,
    BADGE_WIDTH * 0.5,
    BADGE_HEIGHT * 0.55,
    780,
  );
  g.addColorStop(0, "#5a3a9a");
  g.addColorStop(0.35, "#3d2670");
  g.addColorStop(0.7, "#26184a");
  g.addColorStop(1, "#140e28");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, BADGE_WIDTH, BADGE_HEIGHT);

  // Soft center lift
  const glow = ctx.createRadialGradient(
    BADGE_WIDTH * 0.5,
    BADGE_HEIGHT * 0.32,
    20,
    BADGE_WIDTH * 0.5,
    BADGE_HEIGHT * 0.32,
    380,
  );
  glow.addColorStop(0, "rgba(140, 100, 220, 0.35)");
  glow.addColorStop(1, "rgba(80, 40, 160, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, BADGE_WIDTH, BADGE_HEIGHT);

  // Concentric arc motif
  ctx.save();
  ctx.strokeStyle = "rgba(200, 180, 255, 0.14)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      BADGE_WIDTH * 0.5,
      BADGE_HEIGHT * 0.42,
      240 + i * 75,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawPhotoInWell(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | ImageBitmap | null,
  cx: number,
  cy: number,
  size: number,
  shape: "circle" | "rounded",
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  ctx.save();
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.closePath();
  } else {
    roundRect(ctx, cx - size / 2, cy - size / 2, size, size, size * 0.12);
  }
  ctx.clip();

  // Placeholder fill
  ctx.fillStyle = "#ece6f8";
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);

  if (photo) {
    const pw = "naturalWidth" in photo ? photo.naturalWidth || photo.width : photo.width;
    const ph =
      "naturalHeight" in photo ? photo.naturalHeight || photo.height : photo.height;
    const cover = Math.max(size / pw, size / ph) * zoom;
    const dw = pw * cover;
    const dh = ph * cover;
    const maxShift = (Math.max(dw, dh) - size) / 2;
    const dx = cx - dw / 2 + offsetX * maxShift;
    const dy = cy - dh / 2 + offsetY * maxShift;
    ctx.drawImage(photo, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = "rgba(60, 40, 110, 0.45)";
    ctx.font = "500 36px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Your photo", cx, cy);
  }
  ctx.restore();

  // Ring
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 8;
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundRect(
      ctx,
      cx - size / 2 - 2,
      cy - size / 2 - 2,
      size + 4,
      size + 4,
      size * 0.12,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    let last = lines[maxLines - 1];
    while (last.length > 3 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

/** Draw the full badge onto the provided canvas context (expects canvas sized BADGE_WIDTH x BADGE_HEIGHT). */
export function drawBadge(input: BadgeDrawInput) {
  const {
    ctx,
    templateId,
    name,
    eventTitle,
    dateLabel,
    dateISO,
    photo,
    logo,
    zoom,
    offsetX,
    offsetY,
  } = input;

  drawBackground(ctx);

  // Top copy
  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 600 52px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("I am attending!", BADGE_WIDTH / 2, 150);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 54px system-ui, -apple-system, sans-serif";
  const titleLines = wrapLines(ctx, eventTitle || "Hyderabad Founders Network", 860, 3);
  let titleY = 230;
  for (const line of titleLines) {
    ctx.fillText(line, BADGE_WIDTH / 2, titleY);
    titleY += 64;
  }

  const shape = templateId === "circle" ? "circle" : "rounded";
  const wellSize = templateId === "circle" ? 460 : 440;
  const wellY = 620;
  drawPhotoInWell(
    ctx,
    photo,
    BADGE_WIDTH / 2,
    wellY,
    wellSize,
    shape,
    zoom,
    offsetX,
    offsetY,
  );

  // Confetti accents (magenta + gold)
  const accents = [
    { x: 220, y: 480, c: "#f0c040" },
    { x: 860, y: 520, c: "#e85aad" },
    { x: 250, y: 780, c: "#ff6bcb" },
    { x: 830, y: 760, c: "#f5d76e" },
    { x: 300, y: 540, c: "#e85aad" },
    { x: 780, y: 560, c: "#f0c040" },
  ];
  for (const a of accents) {
    ctx.beginPath();
    ctx.fillStyle = a.c;
    ctx.arc(a.x, a.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // Squiggle marks
  ctx.save();
  ctx.strokeStyle = "#e85aad";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(190, 560);
  ctx.quadraticCurveTo(210, 540, 230, 565);
  ctx.stroke();
  ctx.strokeStyle = "#f0c040";
  ctx.beginPath();
  ctx.moveTo(850, 600);
  ctx.quadraticCurveTo(870, 575, 890, 605);
  ctx.stroke();
  ctx.restore();

  // Name
  const displayName = (name || "Your Name").trim().toUpperCase();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 64px system-ui, -apple-system, sans-serif";
  const nameLines = wrapLines(ctx, displayName, 900, 2);
  let nameY = 920;
  for (const line of nameLines) {
    ctx.fillText(line, BADGE_WIDTH / 2, nameY);
    nameY += 72;
  }

  // Footer bar — left: HFN + Trizen logo/text · right: weekday + date
  const footerH = 140;
  ctx.fillStyle = "#1a1235";
  ctx.fillRect(0, BADGE_HEIGHT - footerH, BADGE_WIDTH, footerH);

  const footerMidY = BADGE_HEIGHT - footerH / 2;
  const leftX = 48;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "700 28px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Hyderabad Founders Network", leftX, footerMidY - 28);

  const brandY = footerMidY + 22;
  let brandTextX = leftX;
  if (logo) {
    const lw =
      "naturalWidth" in logo ? logo.naturalWidth || logo.width : logo.width;
    const lh =
      "naturalHeight" in logo ? logo.naturalHeight || logo.height : logo.height;
    const targetH = 36;
    const targetW = (lw / lh) * targetH;
    ctx.drawImage(logo, leftX, brandY - targetH / 2, targetW, targetH);
    brandTextX = leftX + targetW + 12;
  }
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillStyle = "#f0c040";
  ctx.fillText("Trizen Community", brandTextX, brandY);

  // Right: day + date
  let weekday = "";
  let dateLine = dateLabel || "";
  if (dateISO) {
    const d = new Date(`${dateISO}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
      dateLine = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  if (weekday) {
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(weekday, BADGE_WIDTH - 48, footerMidY - 18);
    ctx.font = "700 28px system-ui, sans-serif";
    ctx.fillText(dateLine, BADGE_WIDTH - 48, footerMidY + 18);
  } else {
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(dateLine, BADGE_WIDTH - 48, footerMidY);
  }
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image. Try JPG or PNG."));
    };
    img.src = url;
  });
}

export function badgeShareText(eventTitle: string) {
  return `I'm attending ${eventTitle} with Hyderabad Founders Network. See you there!`;
}
