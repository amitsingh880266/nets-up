import type { Player, Session } from "@/types";
import { formatOvers, percentage } from "@/lib/stats/calculations";
import { formatDate } from "@/lib/utils/date";

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

interface StatCardSpec {
  label: string;
  value: string;
  accent: string;
}

// Renders a 1080x1920 (Instagram Story ratio) PNG summarizing a completed session.
export async function generateSessionShareImage(
  session: Session,
  player: Player | null,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, "#0b120a");
  bg.addColorStop(0.5, "#050505");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(
    WIDTH / 2,
    300,
    40,
    WIDTH / 2,
    300,
    700,
  );
  glow.addColorStop(0, "rgba(163, 230, 53, 0.28)");
  glow.addColorStop(1, "rgba(163, 230, 53, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `700 36px ${FONT}`;
  ctx.fillText("NETSY.IN", WIDTH / 2, 130);

  ctx.fillStyle = "#a3e635";
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText("SESSION COMPLETE", WIDTH / 2, 190);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 96px ${FONT}`;
  ctx.fillText(player?.username ?? "Player", WIDTH / 2, 300);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText(formatDate(session.startedAt), WIDTH / 2, 350);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 260px ${FONT}`;
  ctx.fillText(String(session.totalDeliveries), WIDTH / 2, 660);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `700 36px ${FONT}`;
  ctx.fillText("BALLS FACED", WIDTH / 2, 715);

  ctx.fillStyle = "#a3e635";
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText(`${formatOvers(session.legalBalls)} OVERS`, WIDTH / 2, 800);

  const stats: StatCardSpec[] = [
    {
      label: "PLAYED",
      value: `${session.played} · ${percentage(session.played, session.legalBalls)}%`,
      accent: "#34d399",
    },
    {
      label: "MIDDLE",
      value: `${session.middle} · ${percentage(session.middle, session.legalBalls)}%`,
      accent: "#a3e635",
    },
    {
      label: "EDGE",
      value: `${session.edges} · ${percentage(session.edges, session.legalBalls)}%`,
      accent: "#fbbf24",
    },
    {
      label: "MISS",
      value: `${session.misses} · ${percentage(session.misses, session.legalBalls)}%`,
      accent: "#e5e7eb",
    },
    { label: "WIDE", value: String(session.wides), accent: "#38bdf8" },
    { label: "OUT", value: String(session.outs), accent: "#f87171" },
  ];

  const gridTop = 880;
  const gridPadding = 60;
  const gap = 24;
  const cols = 2;
  const cardWidth = (WIDTH - gridPadding * 2 - gap) / cols;
  const cardHeight = 190;

  stats.forEach((stat, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = gridPadding + col * (cardWidth + gap);
    const y = gridTop + row * (cardHeight + gap);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, x, y, cardWidth, cardHeight, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, cardWidth, cardHeight, 28);
    ctx.stroke();

    ctx.fillStyle = stat.accent;
    ctx.font = `800 54px ${FONT}`;
    ctx.fillText(stat.value, x + cardWidth / 2, y + 100);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText(stat.label, x + cardWidth / 2, y + 145);
  });

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(
    "Track every ball. Improve every session.",
    WIDTH / 2,
    HEIGHT - 110,
  );

  ctx.fillStyle = "#a3e635";
  ctx.font = `800 40px ${FONT}`;
  ctx.fillText("netsy.in", WIDTH / 2, HEIGHT - 60);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate image."));
    }, "image/png");
  });
}
