let ctx: AudioContext | null = null;

/** Petit clic de clavier synthétisé (aucun fichier audio à charger). */
export function keyClick(kind: "key" | "enter") {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    const t = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain(), enter = kind === "enter";
    osc.type = "square";
    osc.frequency.value = enter ? 210 : 1500 + Math.random() * 600;
    gain.gain.setValueAtTime(enter ? 0.045 : 0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (enter ? 0.1 : 0.03));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch {
    // Audio indisponible (navigateur restrictif) : on ignore.
  }
}
