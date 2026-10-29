"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

interface Block {
  label: string;
  color: string;
  top: string;
  height: string;
  lines: { width: string; color: string }[];
}

const LINE_COLORS = ["var(--mint)", "var(--pink)", "var(--amber)", "var(--violet)", "var(--l3)", "var(--l3)", "var(--l3)"];

/** Miniature de la page façon VS Code, avec la zone visible et le clic pour naviguer. */
export function Minimap() {
  const { folded } = usePortfolio();
  const { lang } = usePreferences();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const view = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const H = document.documentElement.scrollHeight;
      setBlocks(SECTIONS.flatMap((s, k) => {
        const el = document.getElementById(s.id);
        if (!el) return [];
        const r = el.getBoundingClientRect(), n = Math.max(3, Math.round((r.height / H) * 120));
        return [{
          label: s.file,
          color: tone(s.tone),
          top: ((r.top + scrollY) / H) * 100 + "%",
          height: (r.height / H) * 100 + "%",
          lines: Array.from({ length: n }, (_, i) => ({ width: 20 + ((i * 37 + k * 13) % 70) + "%", color: LINE_COLORS[(i * 7 + k) % LINE_COLORS.length] })),
        }];
      }));
    };
    const id = setTimeout(measure, 400);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => { clearTimeout(id); ro.disconnect(); };
  }, [folded, lang]);

  useFrame(() => {
    const v = view.current;
    if (!v) return;
    const H = document.documentElement.scrollHeight, h = innerHeight - 70;
    v.style.top = (scrollY / H) * h + "px";
    v.style.height = Math.max(16, (innerHeight / H) * h) + "px";
  });

  const jump = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    scrollTo({ top: ((e.clientY - r.top) / r.height) * document.documentElement.scrollHeight - innerHeight / 2, behavior: "smooth" });
  };

  return (
    <aside className="fixed top-header right-0 bottom-status z-60 hidden w-[84px] border-l border-l1 bg-p1 desk:block" onClick={jump} aria-hidden="true">
      {blocks.map((b) => (
        <div key={b.label} className="absolute inset-x-2.5 flex flex-col gap-[3px] overflow-hidden pt-1.5" style={{ top: b.top, height: b.height }}>
          <span className="font-mono text-[8px]" style={{ color: b.color }}>{b.label}</span>
          {b.lines.map((l, i) => <span key={i} className="block h-0.5 flex-none rounded-[1px]" style={{ width: l.width, background: l.color }} />)}
        </div>
      ))}
      <div ref={view} className="pointer-events-none absolute inset-x-0 top-0 h-10 border-y border-mint/40 bg-mint/[.08]" />
    </aside>
  );
}
