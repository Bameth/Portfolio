import { ImageResponse } from "next/og";

export const alt = "Ameth Ba, développeur full-stack entre Dakar et Montréal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage générée au build, dans les couleurs du site. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0D1224", color: "#D3D8E8", fontFamily: "monospace" }}>
        <div style={{ display: "flex", fontSize: 24, color: "#7C87AD" }}>{"// index.ts · portfolio · Dakar → Montréal"}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 168, fontWeight: 800, lineHeight: 0.9, letterSpacing: -4 }}>
            AMETH&nbsp;<span style={{ color: "#F626AF" }}>BA</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 40 }}>
            J&apos;écris du code qui part en&nbsp;<span style={{ color: "#16F2B3" }}>production.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 24, color: "#16F2B3" }}>
          <span>gogainde.sn</span><span style={{ color: "#3A4570" }}>·</span><span>sunuterrain.com</span>
        </div>
      </div>
    ),
    size,
  );
}
