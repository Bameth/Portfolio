"use client";

import { useEffect, useState } from "react";

const format = (timeZone: string) =>
  new Date().toLocaleTimeString("fr-FR", { timeZone, hour: "2-digit", minute: "2-digit" });

/** Heure locale d'un fuseau, rafraîchie chaque seconde. Vide au rendu serveur. */
export function useClock(timeZone: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(format(timeZone));
    const id = setInterval(() => setTime(format(timeZone)), 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}
