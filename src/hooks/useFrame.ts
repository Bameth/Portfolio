"use client";

import { useEffect, useRef } from "react";
import { onFrame, type FrameCallback } from "@/lib/ticker";

/** Exécute `fn` à chaque image via la boucle partagée. `fn` peut changer sans réabonnement. */
export function useFrame(fn: FrameCallback, enabled = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => (enabled ? onFrame((now) => ref.current(now)) : undefined), [enabled]);
}
