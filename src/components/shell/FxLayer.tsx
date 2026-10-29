"use client";

import { useEffect } from "react";
import { burst } from "@/lib/effects/fx";

/** Calque des effets éphémères (particules au clic, contours de layout). */
export function FxLayer() {
  useEffect(() => {
    addEventListener("pointerdown", burst);
    return () => removeEventListener("pointerdown", burst);
  }, []);

  return (
    <div
      data-fx=""
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 285, pointerEvents: "none", overflow: "hidden" }}
    />
  );
}
