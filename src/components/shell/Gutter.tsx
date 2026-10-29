"use client";

import { useRef } from "react";
import { useFrame } from "@/hooks/useFrame";

const LINE = 24;

/** Numéros de ligne qui défilent avec la page. */
export function Gutter() {
  const nums = useRef<HTMLDivElement>(null);
  const base = useRef(-1);

  useFrame(() => {
    const el = nums.current;
    if (!el) return;
    const first = Math.floor(scrollY / LINE);
    if (first !== base.current) {
      base.current = first;
      const count = Math.ceil(innerHeight / LINE) + 2;
      el.textContent = Array.from({ length: count }, (_, i) => first + i + 1).join("\n");
    }
    el.style.transform = `translateY(${-(scrollY % LINE)}px)`;
  });

  return (
    <div className="fixed top-header bottom-status left-0 z-60 hidden w-14 overflow-hidden border-r border-l1 bg-bg mid:block" aria-hidden="true">
      <div ref={nums} className="pr-3.5 text-right font-mono text-[11px] leading-6 whitespace-pre text-d2" />
    </div>
  );
}
