// utils/cloudinary.js

const CLOUD = "dxjumiu7d";
const IMG_BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const VIDEO_BASE = `https://res.cloudinary.com/${CLOUD}/video/upload`;

// ─── Helpers ────────────────────────────────────────────────

/** Extract the raw public_id from any Cloudinary URL or bare filename */
function extractPublicId(src) {
  if (!src) return src;
  const marker = "/upload/";
  if (src.includes(marker)) {
    const after = src.split(marker)[1];
    // strip optional version segment  v1234567890/
    return after.replace(/^v\d+\//, "");
  }
  return src; // already a bare public_id like "listeclient_wvhjmk.jpg"
}

/** True if this asset is a GIF (by extension in the public_id) */
export function isGif(src) {
  if (!src) return false;
  return src.toLowerCase().endsWith(".gif");
}

/** True if the src comes from our Cloudinary account */
export function isCloudinary(src) {
  return typeof src === "string" && src.includes("cloudinary.com");
}

// ─── Image URL (photos / stills) ────────────────────────────

/**
 * Returns an optimised Cloudinary image URL.
 *
 * Presets
 *   card  → 800 w, auto format+quality, crop fill  (card preview)
 *   modal → 1400 w, auto format+quality             (modal large view)
 *   thumb → 160 w,  auto format+quality, crop fill  (thumbnail strip)
 *   full  → original size, auto format+quality
 */
export function cloudinaryUrl(src, preset = "full") {
  if (!src || isGif(src)) return null; // GIFs handled by cloudinaryVideoUrl
  const id = extractPublicId(src);

  const t =
    {
      card: "f_auto,q_auto,w_800,c_fill",
      modal: "f_auto,q_auto,w_1400",
      thumb: "f_auto,q_auto,w_160,c_fill",
      full: "f_auto,q_auto",
    }[preset] ?? "f_auto,q_auto";

  return `${IMG_BASE}/${t}/${id}`;
}

// ─── Video URL (GIFs → MP4 / WebM) ──────────────────────────

/**
 * Returns an optimised Cloudinary video URL for a GIF asset.
 * Cloudinary converts GIFs to MP4/WebM on the fly — ~10× smaller.
 *
 * format: "mp4" | "webm"  (default mp4 for broad support)
 *
 * Presets (width only — videos keep their native aspect ratio)
 *   card  → 800 w
 *   modal → 1200 w
 *   thumb → 160 w
 *   full  → original
 */
export function cloudinaryVideoUrl(src, preset = "full", format = "mp4") {
  if (!src) return null;
  const id = extractPublicId(src);
  // Replace .gif extension with target format
  const idNoExt = id.replace(/\.gif$/i, "");

  const w =
    { card: "w_800", modal: "w_1200", thumb: "w_160", full: "" }[preset] ?? "";
  const transforms = ["f_auto", "q_auto", w].filter(Boolean).join(",");

  return `${VIDEO_BASE}/${transforms}/${idNoExt}.${format}`;
}

// ─── Smart picker ────────────────────────────────────────────

/**
 * Returns { type: "image"|"video", url } for any asset.
 * Picks the right function and preset automatically.
 */
export function resolveAsset(src, preset = "full") {
  if (!src) return { type: "image", url: null };
  if (isGif(src)) {
    return {
      type: "video",
      mp4: cloudinaryVideoUrl(src, preset, "mp4"),
      webm: cloudinaryVideoUrl(src, preset, "webm"),
    };
  }
  return { type: "image", url: cloudinaryUrl(src, preset) };
}

// ─── Preview helper ──────────────────────────────────────────

/**
 * Best static preview image for a card (never a GIF).
 * Works whether images are full URLs or bare public_ids.
 */
export function getPreviewImage(images) {
  if (!images?.length) return null;
  return images.find((s) => !isGif(s)) ?? null;
}
