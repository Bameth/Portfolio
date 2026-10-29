"use client";

import { useRef, useState } from "react";
import { PROJECTS } from "@/content/projects";
import { LAYERS, ROUTES, TECH } from "@/content/stack";
import { useFrame } from "@/hooks/useFrame";
import { EASE } from "@/lib/env";
import { pad2 } from "@/lib/text";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

const STEP_MS = 560, HOLD_MS = 1600;

/** Schéma des couches, relié par un fil sur lequel circule un paquet de requête. */
export function StackPipeline() {
  const { selectProject, goTo } = usePortfolio();
  const { t, pick, lang, theme } = usePreferences();
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const wire = useRef<SVGPolylineElement>(null);
  const docker = useRef<HTMLDivElement>(null);
  const packet = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLSpanElement>(null);
  const project = useRef<HTMLSpanElement>(null);
  const route = useRef({ index: 0, step: 0, t0: 0, phase: "move" as "move" | "hold" });
  const langRef = useRef(lang);
  langRef.current = lang;

  useFrame((now) => {
    const pipe = root.current;
    if (!pipe) return;
    const pr = pipe.getBoundingClientRect();
    if (pr.bottom < 0 || pr.top > innerHeight) return;
    const nodes = [...pipe.querySelectorAll<HTMLElement>("[data-node]")], layers = [...pipe.querySelectorAll<HTMLElement>("[data-layer]")];
    if (nodes.length < LAYERS.length) return;
    const pts = nodes.map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - pr.left, r.top + r.height / 2 - pr.top]; });
    wire.current?.setAttribute("points", pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" "));

    // Cadre « docker-compose » autour de l'API et des données.
    const [api, data] = [layers[2].getBoundingClientRect(), layers[3].getBoundingClientRect()], m = 10;
    if (docker.current) {
      const l = Math.min(api.left, data.left) - pr.left - m, top = Math.min(api.top, data.top) - pr.top - m;
      Object.assign(docker.current.style, {
        left: l + "px", top: top + "px",
        width: Math.max(api.right, data.right) - pr.left + m - l + "px", height: Math.max(api.bottom, data.bottom) - pr.top + m - top + "px",
      });
    }

    const st = route.current, R = ROUTES[st.index];
    const show = (r: typeof R) => {
      if (log.current) log.current.textContent = "→ " + r.request;
      if (project.current) project.current.textContent = r.project;
    };
    if (!st.t0) { st.t0 = now; show(R); }
    let pos: number[];
    if (st.phase === "move") {
      const k = Math.min(1, (now - st.t0) / STEP_MS), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const a = pts[R.path[st.step]], b = pts[R.path[st.step + 1]];
      pos = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
      if (k >= 1) {
        const bi = R.path[st.step + 1], color = getComputedStyle(layers[bi]).getPropertyValue("--layer").trim();
        nodes[bi].animate([{ transform: "scale(1)", background: color }, { transform: "scale(1.9)", background: color, offset: 0.3 }, { transform: "scale(1)" }], { duration: 650, easing: "ease-out" });
        layers[bi].animate([{ borderColor: color }, { borderColor: "var(--l2)" }], { duration: 800, easing: "ease-out" });
        const name = R.hits[st.step + 1], tech = name ? layers[bi].querySelector<HTMLElement>(`[data-tech="${name}"]`) : null;
        if (tech) {
          const c = TECH[name] ? "#" + TECH[name].color : color;
          tech.animate([{ background: c + "26", borderColor: c }, { background: "transparent", borderColor: "transparent" }], { duration: 1100, easing: "ease-out" });
          tech.firstElementChild?.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)", offset: 0.25 }, { transform: "scale(1)" }], { duration: 600, easing: EASE });
        }
        st.step++;
        st.t0 = now;
        if (st.step >= R.path.length - 1) {
          st.phase = "hold";
          if (log.current) log.current.textContent = "← " + R.response[langRef.current] + "  ·  " + R.latency;
        }
      }
    } else {
      pos = pts[R.path[R.path.length - 1]];
      if (now - st.t0 > HOLD_MS) {
        st.index = (st.index + 1) % ROUTES.length;
        st.step = 0;
        st.phase = "move";
        st.t0 = now;
        show(ROUTES[st.index]);
      }
    }
    if (packet.current) packet.current.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
  });

  const openProject = (file: string) => {
    const k = PROJECTS.findIndex((p) => p.file === file);
    if (k >= 0) { selectProject(k); goTo("travaux"); }
  };

  return (
    <>
      <div ref={root} className="relative">
        <svg className="pointer-events-none absolute top-0 left-0 z-0 size-full overflow-visible" aria-hidden="true">
          <polyline ref={wire} points="0,0" fill="none" stroke="var(--d2)" strokeWidth="1.5" strokeDasharray="6 6" />
        </svg>
        <div ref={docker} className="pointer-events-none absolute top-0 left-0 z-0 size-0 rounded-[10px] border border-dashed border-l3">
          <span className="absolute right-2.5 -bottom-[9px] bg-bg px-2 font-mono text-[10px] text-d1">docker-compose.yml</span>
        </div>
        <div className="relative z-[1] grid grid-cols-1 gap-3.5 pl-[18px] desk:grid-cols-5 desk:gap-[18px] desk:pt-4 desk:pl-0">
          {LAYERS.map((layer, i) => (
            <div
              key={i}
              data-layer=""
              onMouseEnter={() => setHoveredLayer(i)}
              onMouseLeave={() => setHoveredLayer(null)}
              style={{ "--layer": tone(layer.tone) } as React.CSSProperties}
              className={`@container relative z-[1] flex min-w-0 flex-col gap-3.5 rounded-md border border-l2 bg-p1 p-[18px] transition-transform duration-700 ease-out-expo desk:p-[clamp(12px,1.2vw,18px)] ${hoveredLayer === i ? "-translate-y-1" : ""}`}
            >
              <span data-node="" className="absolute top-5 -left-[25px] size-3 rounded-full border-2 border-(--layer) bg-bg desk:-top-[7px] desk:left-[calc(50%-6px)]" />
              <div className="font-mono text-[11px] text-d1"><span className="text-(--layer)">{pad2(i + 1)}</span> · {pick(layer.label)}</div>
              <div className="flex min-w-0 flex-row flex-wrap gap-x-[22px] gap-y-3 desk:flex-col desk:flex-nowrap">
                {layer.items.map((item) => (
                  <TechItem
                    key={item.name}
                    name={item.name}
                    note={pick(item.note)}
                    light={theme === "light"}
                    active={hovered === item.name}
                    onHover={setHovered}
                    onOpen={openProject}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div ref={packet} className="pointer-events-none absolute top-0 left-0 z-[3] -mt-1.5 -ml-1.5 size-3 rounded-[2px] bg-mint shadow-[0_0_0_5px_rgba(22,242,179,.16),0_0_28px_var(--mint)]" />
      </div>
      <div className="mt-[22px] flex flex-wrap justify-between gap-x-6 gap-y-2.5 rounded border border-l2 bg-p2 px-4 py-3.5 font-mono text-xs">
        <span ref={log} className="whitespace-pre-wrap text-t1" />
        <span ref={project} className="text-d1" />
      </div>
      <span className="sr-only">{t("Requêtes simulées traversant la stack", "Simulated requests flowing through the stack")}</span>
    </>
  );
}

interface TechItemProps {
  name: string;
  note: string;
  light: boolean;
  active: boolean;
  onHover: (name: string | null) => void;
  onOpen: (file: string) => void;
}

/** Une technologie : logo Simple Icons (ou monogramme), nom, et projets qui l'utilisent au survol. */
function TechItem({ name, note, light, active, onHover, onOpen }: Readonly<TechItemProps>) {
  const tech = TECH[name] ?? { icon: "", color: "7C87AD", projects: [] };
  const color = "#" + tech.color;
  const [logoFailed, setLogoFailed] = useState(false);
  const logoColor = light && tech.color === "FFFFFF" ? "111111" : tech.color;
  const showFiles = active && tech.projects.length > 0;

  return (
    <div
      data-tech={name}
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      onClick={() => tech.projects[0] && onOpen(tech.projects[0])}
      style={{ borderColor: active ? color : "transparent", background: active ? color + "14" : "transparent" }}
      className="-m-[7px] flex min-w-0 cursor-pointer items-center gap-[clamp(8px,6cqi,12px)] rounded-md border p-[7px] transition-[border-color,background] duration-[250ms]"
    >
      <span
        className="relative flex size-[clamp(30px,22cqi,40px)] flex-none items-center justify-center rounded-[7px] border border-l2 bg-bg font-mono text-[13px] font-semibold"
        style={{ color }}
      >
        {tech.mono ?? name.slice(0, 1)}
        {tech.icon && !logoFailed && (
          <img
            src={`https://cdn.simpleicons.org/${tech.icon}/${logoColor}`}
            alt=""
            loading="lazy"
            onError={() => setLogoFailed(true)}
            className="absolute top-1/2 left-1/2 size-1/2 -translate-1/2 bg-bg object-contain"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[clamp(15px,11cqi,23px)] leading-[1.05] [overflow-wrap:break-word] text-balance [font-variation-settings:'wdth'_78,'wght'_700]">{name}</span>
        <span className="min-w-0 font-mono text-[10px] leading-[1.45] [overflow-wrap:anywhere] whitespace-pre-line" style={{ color: showFiles ? color : "var(--d1)" }}>
          {showFiles ? tech.projects.map((f) => "↳ " + f).join("\n") : note}
        </span>
      </span>
    </div>
  );
}
