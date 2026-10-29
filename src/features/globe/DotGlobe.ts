import { geoDistance, geoEquirectangular, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { DAKAR, MONTREAL } from "@/content/journey";
import { clamp } from "@/lib/env";
import { monoFont } from "@/lib/text";

type LonLat = [number, number];

const HALF_PI = 1.5707;
const COLORS = { mint: "#16F2B3", amber: "#FCD34D", pink: "#F626AF" };

/**
 * Globe en points (continents échantillonnés), dessiné sur canvas.
 * `progress` = 1 centre Dakar ; en descendant vers 0, le globe tourne vers Montréal et l'arc se trace.
 */
export class DotGlobe {
  private dots: LonLat[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private size = 0;
  private dpr = 1;
  private rot: [number, number] = [17.44, -14.69];
  private drag: [number, number] = [0, 0];
  private dragFrom: { x: number; y: number } | null = null;
  private readonly graticule = geoGraticule10();
  private readonly arc = geoInterpolate(DAKAR, MONTREAL);
  private readonly cleanups: (() => void)[] = [];

  constructor(private readonly canvas: HTMLCanvasElement) {
    void this.loadLand();
    this.resize();
    const move = (e: PointerEvent) => {
      if (!this.dragFrom) return;
      this.drag[0] += (e.clientX - this.dragFrom.x) * 0.35;
      this.drag[1] -= (e.clientY - this.dragFrom.y) * 0.25;
      this.dragFrom = { x: e.clientX, y: e.clientY };
    };
    const up = () => { this.dragFrom = null; };
    const down = (e: PointerEvent) => { this.dragFrom = { x: e.clientX, y: e.clientY }; };
    canvas.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    this.cleanups.push(() => {
      canvas.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    });
  }

  /** Échantillonne les terres sur une grille régulière (densité corrigée selon la latitude). */
  private async loadLand() {
    const topo = (await import("world-atlas/land-110m.json")).default as unknown as Topology<{ land: GeometryCollection }>;
    const land = feature(topo, topo.objects.land);
    const W = 720, H = 360, off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const ox = off.getContext("2d", { willReadFrequently: true })!;
    ox.fillStyle = "#fff";
    ox.beginPath();
    geoPath(geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]), ox)(land);
    ox.fill();
    const data = ox.getImageData(0, 0, W, H).data;
    const isLand = (lon: number, lat: number) =>
      data[(Math.floor(((90 - lat) / 180) * H) * W + Math.floor(((lon + 180) / 360) * W)) * 4 + 3] > 120;
    // Garde-fou : si le remplissage s'est inversé (océans pleins), on inverse le test.
    const inverted = !isLand(15, 22) && isLand(-150, -10);
    for (let lat = -58; lat <= 80; lat += 1.9) {
      const step = 1.9 / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
      for (let lon = -180; lon < 180; lon += step) if (isLand(lon, lat) !== inverted) this.dots.push([lon, lat]);
    }
  }

  resize() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    const s = this.canvas.clientWidth;
    this.canvas.width = this.canvas.height = s * this.dpr;
    this.size = s * this.dpr;
    this.ctx = this.canvas.getContext("2d");
  }

  draw(progress: number, now: number) {
    const ctx = this.ctx;
    if (!this.dots.length || !ctx) return;
    const S = this.size, cx = S / 2, cy = S / 2, R = S * 0.43, dpr = this.dpr, k = clamp(progress, 0, 1);

    if (!this.dragFrom) { this.drag[0] *= 0.94; this.drag[1] *= 0.94; }
    const targetLon = 17.44 + (50 - 17.44) * (1 - k) + this.drag[0] + Math.sin(now / 4000) * 3;
    const targetLat = clamp(-14.69 - 30 * (1 - k) + this.drag[1], -60, 60);
    this.rot[0] += (targetLon - this.rot[0]) * 0.08;
    this.rot[1] += (targetLat - this.rot[1]) * 0.08;
    const proj = geoOrthographic().scale(R).translate([cx, cy]).rotate(this.rot).clipAngle(90);
    const center: LonLat = [-this.rot[0], -this.rot[1]];

    ctx.clearRect(0, 0, S, S);
    const grd = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    grd.addColorStop(0, "#111A38");
    grd.addColorStop(1, "#090E1D");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.lineWidth = dpr;
    ctx.strokeStyle = "#1C2647";
    ctx.stroke();
    ctx.beginPath();
    geoPath(proj, ctx)(this.graticule);
    ctx.strokeStyle = "rgba(42,53,96,.35)";
    ctx.lineWidth = 0.6 * dpr;
    ctx.stroke();

    const ds = 1.7 * dpr;
    for (const p of this.dots) {
      const dist = geoDistance(p, center);
      if (dist > HALF_PI) continue;
      const xy = proj(p)!;
      ctx.fillStyle = `rgba(124,135,173,${(0.18 + Math.cos(dist) * 0.62).toFixed(2)})`;
      ctx.fillRect(xy[0] - ds / 2, xy[1] - ds / 2, ds, ds);
    }

    // Arc Dakar → Montréal, surélevé au milieu, tracé selon la progression.
    const drawn = 1 - k;
    if (drawn > 0.001) {
      ctx.beginPath();
      let started = false, last: LonLat | null = null;
      const N = 80;
      for (let i = 0; i <= N * drawn; i++) {
        const t = i / N, p = this.arc(t), lift = 0.2 * Math.sin(Math.PI * t), xy = proj(p)!;
        const visible = geoDistance(p, center) < HALF_PI + 0.35 * Math.sin(Math.PI * t);
        const X = cx + (xy[0] - cx) * (1 + lift), Y = cy + (xy[1] - cy) * (1 + lift);
        if (visible) { if (started) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); started = true; last = [X, Y]; }
        else started = false;
      }
      ctx.strokeStyle = COLORS.mint;
      ctx.lineWidth = 2 * dpr;
      ctx.shadowColor = COLORS.mint;
      ctx.shadowBlur = 12 * dpr;
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (last) {
        ctx.beginPath();
        ctx.arc(last[0], last[1], 4.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.mint;
        ctx.fill();
      }
    }

    const pulse = (now % 1800) / 1800, font = monoFont();
    ([[DAKAR, COLORS.amber, "DKR"], [MONTREAL, COLORS.pink, "YUL"]] as const).forEach(([pt, color, label]) => {
      if (geoDistance(pt, center) > HALF_PI) return;
      const [x, y] = proj(pt)!;
      ctx.beginPath();
      ctx.arc(x, y, (5 + pulse * 14) * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1 - pulse;
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.font = `600 ${11 * dpr}px ${font}`;
      ctx.fillText(label, x + 10 * dpr, y - 8 * dpr);
    });
  }

  dispose() {
    this.cleanups.forEach((fn) => fn());
  }
}
