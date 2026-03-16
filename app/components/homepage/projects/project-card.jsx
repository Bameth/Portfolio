"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Github,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { resolveAsset, getPreviewImage } from "@/utils/cloudinary";

// ─── Status config ───────────────────────────────────────────
const STATUS_CONFIG = {
  Déployé: {
    label: "Live",
    dot: "#16f2b3",
    pill: "rgba(22,242,179,0.1)",
    text: "#16f2b3",
    border: "rgba(22,242,179,0.25)",
  },
  Développement: {
    label: "En cours",
    dot: "#60a5fa",
    pill: "rgba(96,165,250,0.1)",
    text: "#60a5fa",
    border: "rgba(96,165,250,0.25)",
  },
  Terminé: {
    label: "Terminé",
    dot: "#a78bfa",
    pill: "rgba(167,139,250,0.1)",
    text: "#a78bfa",
    border: "rgba(167,139,250,0.25)",
  },
};
function getStatus(s) {
  return (
    STATUS_CONFIG[s] ?? {
      label: s,
      dot: "#94a3b8",
      pill: "rgba(148,163,184,0.1)",
      text: "#94a3b8",
      border: "rgba(148,163,184,0.25)",
    }
  );
}

// ─── SmartMedia ──────────────────────────────────────────────
// Handles both images and GIFs-as-video with:
// • Intersection Observer → only loads when visible (saves bandwidth)
// • Skeleton shimmer while loading
// • Smooth fade-in on load
// • GIFs served as MP4/WebM via Cloudinary (10× smaller)

function SmartMedia({
  src,
  alt,
  objectFit = "cover",
  preset = "full",
  eager = false,
}) {
  const [visible, setVisible] = useState(eager);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const wrapRef = useRef(null);

  // Step 1 — only start loading when the element scrolls into view
  useEffect(() => {
    if (eager || !wrapRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }, // pre-load 200px before it enters the viewport
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [eager]);

  // Step 2 — resolve the optimised Cloudinary asset
  const asset = resolveAsset(src, preset);

  // Step 3 — preload image in JS before showing (avoids layout flicker)
  useEffect(() => {
    if (!visible || asset.type !== "image" || !asset.url) return;
    setLoaded(false);
    setError(false);
    const img = new window.Image();
    img.src = asset.url;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [visible, asset.url, asset.type]);

  const shimmer = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg,#0d1224 25%,#1a2a50 50%,#0d1224 75%)",
    backgroundSize: "200% 100%",
    animation: "lazy-shimmer 1.6s infinite",
  };
  const fill = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit,
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#060918",
      }}
    >
      {/* Shimmer — shown while not yet loaded */}
      {(!visible || (!loaded && !error && asset.type === "image")) && (
        <div style={shimmer} />
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            ...fill,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#060918",
          }}
        >
          <span style={{ color: "#1e3a5f", fontSize: "2rem" }}>⚠</span>
        </div>
      )}

      {/* Image */}
      {visible && asset.type === "image" && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.url}
          alt={alt ?? ""}
          style={{
            ...fill,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      )}

      {/* GIF → Video (MP4 + WebM fallback, muted, looping, autoplay) */}
      {visible && asset.type === "video" && (
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
          style={{
            ...fill,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <source src={asset.webm} type="video/webm" />
          <source src={asset.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

// ─── ProjectCard ─────────────────────────────────────────────
function ProjectCard({ project, index, featured = false }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const statusCfg = getStatus(project.status);
  const num = String(index + 1).padStart(2, "0");
  const previewSrc = getPreviewImage(project.images);
  const maxTools = featured ? 6 : 4;

  const open = useCallback(() => {
    setImgIdx(0);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);
  const close = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = "";
  }, []);
  const prev = useCallback(
    (e) => {
      e?.stopPropagation();
      setImgIdx((i) => (i - 1 + project.images.length) % project.images.length);
    },
    [project.images.length],
  );
  const next = useCallback(
    (e) => {
      e?.stopPropagation();
      setImgIdx((i) => (i + 1) % project.images.length);
    },
    [project.images.length],
  );

  useEffect(() => {
    if (!modalOpen) return;
    const h = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modalOpen, close, prev, next]);

  return (
    <>
      {/* ── CARD ── */}
      <div
        className={`pc-card group relative flex flex-col bg-gradient-to-br from-[#0d1224] to-[#0a0d37] border border-[#1b2c68]/60 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[#16f2b3]/30 hover:shadow-2xl hover:shadow-[#16f2b3]/5 ${featured ? "md:col-span-2" : ""}`}
        style={{ "--i": index }}
      >
        {/* Top accent */}
        <div className="flex flex-shrink-0">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600" />
          <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent" />
        </div>

        {/* Terminal header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1b2c68]/40 flex-shrink-0">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="ml-auto text-[10px] font-black text-slate-600 tracking-widest">
            {num}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: statusCfg.pill,
              color: statusCfg.text,
              borderColor: statusCfg.border,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: statusCfg.dot }}
            />
            {statusCfg.label}
          </span>
        </div>

        {/* Card preview — IntersectionObserver lazy, never a GIF */}
        <div
          className="relative cursor-pointer flex-shrink-0 overflow-hidden"
          style={{ aspectRatio: "16/9" }}
          onClick={open}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && open()}
        >
          {previewSrc ? (
            <SmartMedia
              src={previewSrc}
              alt={project.name}
              objectFit="cover"
              preset="card"
            />
          ) : (
            <div className="absolute inset-0 bg-[#080b1e] flex items-center justify-center">
              <span className="text-slate-700 text-5xl font-black">{num}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d37]/95 via-[#0a0d37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16f2b3] text-black text-xs font-bold rounded-lg">
              <Eye size={12} /> Voir la galerie
            </span>
            {project.images.length > 1 && (
              <span className="inline-flex items-center px-2.5 py-1.5 bg-black/60 text-white/70 text-[10px] font-bold rounded-lg border border-white/10">
                {project.images.length} photos
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2 tracking-tight">
            {project.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {project.tools.slice(0, maxTools).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#1b2c68]/50 text-slate-400 border border-[#1b2c68]/60 group-hover:border-[#16f2b3]/20 group-hover:text-[#16f2b3]/70 transition-colors duration-300"
              >
                {t}
              </span>
            ))}
            {project.tools.length > maxTools && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                +{project.tools.length - maxTools}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mt-auto pt-1">
            {project.role}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#1b2c68]/40">
            <button
              onClick={open}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1b2c68]/50 hover:bg-[#16f2b3]/10 border border-[#1b2c68]/60 hover:border-[#16f2b3]/30 text-slate-400 hover:text-[#16f2b3] rounded-lg text-xs font-semibold transition-all duration-200"
            >
              <Eye size={13} /> Galerie
            </button>
            <div className="flex gap-2">
              {project.code && (
                <a
                  href={project.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1b2c68]/40 hover:bg-slate-700/50 border border-[#1b2c68]/60 hover:border-slate-500/60 text-slate-400 hover:text-white transition-all duration-200"
                  aria-label="Code"
                >
                  <Github size={14} />
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#16f2b3]/10 hover:bg-[#16f2b3]/20 border border-[#16f2b3]/25 hover:border-[#16f2b3]/50 text-[#16f2b3] transition-all duration-200"
                  aria-label="Démo"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div
          className="pm-backdrop"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div className="pm-shell" onClick={(e) => e.stopPropagation()}>
            {/* LEFT — gallery */}
            <div className="pm-gallery">
              <div className="pm-viewer">
                {/* eager=true in modal: load immediately when opened */}
                <SmartMedia
                  key={imgIdx}
                  src={project.images[imgIdx]}
                  alt={`${project.name} ${imgIdx + 1}`}
                  objectFit="contain"
                  preset="modal"
                  eager
                />
                {project.images.length > 1 && (
                  <>
                    <button
                      className="pm-nav pm-nav-l"
                      onClick={prev}
                      aria-label="Précédent"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="pm-nav pm-nav-r"
                      onClick={next}
                      aria-label="Suivant"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="pm-pips">
                      {project.images.map((_, i) => (
                        <button
                          key={i}
                          className={`pm-pip ${i === imgIdx ? "pm-pip-on" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setImgIdx(i);
                          }}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>
                    <span className="pm-counter">
                      {imgIdx + 1} / {project.images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnail strip — lazy (eager=false) */}
              {project.images.length > 1 && (
                <div className="pm-thumbs">
                  {project.images.map((src, i) => (
                    <button
                      key={i}
                      className={`pm-thumb ${i === imgIdx ? "pm-thumb-on" : ""}`}
                      onClick={() => setImgIdx(i)}
                      aria-label={`Image ${i + 1}`}
                    >
                      <SmartMedia
                        src={src}
                        alt=""
                        objectFit="cover"
                        preset="thumb"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — info panel */}
            <div className="pm-info">
              <div className="pm-info-head">
                <div className="min-w-0 flex-1">
                  <p className="pm-eyebrow">Projet {num}</p>
                  <h2 className="pm-title">{project.name}</h2>
                </div>
                <button
                  className="pm-close"
                  onClick={close}
                  aria-label="Fermer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="pm-info-body">
                <div className="flex flex-wrap gap-2 mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
                    style={{
                      background: statusCfg.pill,
                      color: statusCfg.text,
                      borderColor: statusCfg.border,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: statusCfg.dot }}
                    />
                    {statusCfg.label}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#1b2c68]/60 bg-[#1b2c68]/20 text-slate-400 text-xs font-medium">
                    {project.role}
                  </span>
                </div>

                <p className="pm-desc">{project.description}</p>
                <div className="pm-sep" />

                <div className="pm-sec">
                  <p className="pm-sec-label">Stack technique</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#1b2c68]/40 text-slate-400 border border-[#1b2c68]/50 hover:border-[#16f2b3]/30 hover:text-[#16f2b3]/80 transition-colors duration-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {(project.code || project.demo) && (
                  <>
                    <div className="pm-sep" />
                    <div className="pm-sec">
                      <p className="pm-sec-label">Liens</p>
                      <div className="flex flex-col gap-2">
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pm-lbtn pm-lbtn-green"
                          >
                            <ExternalLink size={14} />
                            <span>Voir le site en ligne</span>
                            <span className="ml-auto opacity-40 text-[10px]">
                              ↗
                            </span>
                          </a>
                        )}
                        {project.code && (
                          <a
                            href={project.code}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pm-lbtn pm-lbtn-ghost"
                          >
                            <Github size={14} />
                            <span>Voir le code source</span>
                            <span className="ml-auto opacity-40 text-[10px]">
                              ↗
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pc-card {
          opacity: 0;
          transform: translateY(16px);
          animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)
            calc(var(--i, 0) * 80ms) forwards;
        }
        @keyframes cardIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 4, 14, 0.94);
          backdrop-filter: blur(18px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: bkIn 0.22s ease;
        }
        @keyframes bkIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .pm-shell {
          display: flex;
          width: 100%;
          max-width: 1080px;
          height: min(88vh, 660px);
          background: #080c1e;
          border: 1px solid rgba(27, 44, 104, 0.65);
          border-radius: 22px;
          overflow: hidden;
          box-shadow:
            0 40px 120px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(22, 242, 179, 0.05);
          animation: shellIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes shellIn {
          from {
            opacity: 0;
            transform: scale(0.93) translateY(22px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .pm-gallery {
          flex: 1.35;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(27, 44, 104, 0.5);
          min-width: 0;
        }
        .pm-viewer {
          position: relative;
          flex: 1;
          min-height: 0;
          background: #040710;
        }

        .pm-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          transition: all 0.2s;
          z-index: 2;
        }
        .pm-nav:hover {
          background: rgba(22, 242, 179, 0.85);
          color: #000;
          border-color: transparent;
          transform: translateY(-50%) scale(1.08);
        }
        .pm-nav-l {
          left: 12px;
        }
        .pm-nav-r {
          right: 12px;
        }

        .pm-pips {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          align-items: center;
          z-index: 2;
        }
        .pm-pip {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }
        .pm-pip:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .pm-pip-on {
          width: 18px;
          border-radius: 3px;
          background: #16f2b3;
        }

        .pm-counter {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.65);
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 2;
        }

        .pm-thumbs {
          display: flex;
          gap: 6px;
          padding: 10px 12px;
          overflow-x: auto;
          background: #060918;
          border-top: 1px solid rgba(27, 44, 104, 0.4);
          flex-shrink: 0;
          scrollbar-width: thin;
          scrollbar-color: rgba(22, 242, 179, 0.12) transparent;
        }
        .pm-thumb {
          position: relative;
          flex-shrink: 0;
          width: 60px;
          height: 42px;
          border-radius: 7px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          background: #0d1224;
          transition:
            border-color 0.2s,
            transform 0.15s;
        }
        .pm-thumb:hover {
          transform: scale(1.06);
          border-color: rgba(22, 242, 179, 0.3);
        }
        .pm-thumb-on {
          border-color: #16f2b3 !important;
        }

        .pm-info {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #080c1e;
        }
        .pm-info-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 22px 18px 18px;
          border-bottom: 1px solid rgba(27, 44, 104, 0.5);
          flex-shrink: 0;
        }
        .pm-eyebrow {
          font-size: 10px;
          font-weight: 800;
          color: rgba(22, 242, 179, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-bottom: 5px;
        }
        .pm-title {
          font-size: 14px;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1.35;
          letter-spacing: -0.02em;
        }
        .pm-close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.2s;
        }
        .pm-close:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
          transform: rotate(90deg);
        }

        .pm-info-body {
          flex: 1;
          overflow-y: auto;
          padding: 18px;
          scrollbar-width: thin;
          scrollbar-color: rgba(27, 44, 104, 0.4) transparent;
        }
        .pm-desc {
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.75;
        }
        .pm-sep {
          height: 1px;
          background: rgba(27, 44, 104, 0.5);
          margin: 16px 0;
        }
        .pm-sec {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pm-sec-label {
          font-size: 10px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.18);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .pm-lbtn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 13px;
          border-radius: 11px;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .pm-lbtn-green {
          background: rgba(22, 242, 179, 0.07);
          border: 1px solid rgba(22, 242, 179, 0.18);
          color: #16f2b3;
        }
        .pm-lbtn-green:hover {
          background: rgba(22, 242, 179, 0.14);
          border-color: rgba(22, 242, 179, 0.38);
          transform: translateX(2px);
        }
        .pm-lbtn-ghost {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }
        .pm-lbtn-ghost:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          transform: translateX(2px);
        }

        @keyframes lazy-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .pm-shell {
            flex-direction: column;
            height: 92vh;
            border-radius: 18px;
            max-width: 100%;
          }
          .pm-gallery {
            flex: none;
            height: 44%;
            border-right: none;
            border-bottom: 1px solid rgba(27, 44, 104, 0.5);
          }
          .pm-info {
            width: 100%;
            flex: 1;
            min-height: 0;
          }
        }
      `}</style>
    </>
  );
}

export default ProjectCard;
