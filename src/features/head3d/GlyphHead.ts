import type * as THREE_NS from "three";
import { CODE_SAMPLE } from "@/content/terminal";
import { FEATURES } from "@/config/features";
import { clamp, isCoarsePointer, prefersReducedMotion } from "@/lib/env";
import { cancelReveal } from "@/lib/effects/titles";
import { pointer } from "@/lib/pointer";
import { RAW, type Theme } from "@/lib/theme";
import { monoFont } from "@/lib/text";
import type { Lang } from "@/types/content";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

type Three = typeof THREE_NS;

export interface GlyphHeadElements {
  canvas: HTMLCanvasElement;
  photo: HTMLImageElement;
  scan: HTMLElement;
  label: HTMLElement;
}

export interface GlyphHeadOptions {
  modelUrl: string;
  fallbackUrl: string;
  getTheme: () => Theme;
  getLang: () => Lang;
}

/** Cibles à l'écran du texte « construit » par les glyphes au défilement. */
interface Construction {
  els: { el: HTMLElement; top: number; height: number }[];
  ref: HTMLElement;
  ox: number;
  oy: number;
  width: number;
  height: number;
  lineHeight: number;
  viewportWidth: number;
}

interface Scene {
  THREE: Three;
  renderer: THREE_NS.WebGLRenderer;
  camera: THREE_NS.PerspectiveCamera;
  scene: THREE_NS.Scene;
  pivot: THREE_NS.Group;
  geometry: THREE_NS.BufferGeometry;
  uniforms: Record<string, THREE_NS.IUniform>;
  count: number;
  demo: boolean;
  W: number;
  H: number;
}

const ATLAS_COLS = 16, ATLAS_ROWS = 8, CELL = 64;

/**
 * Portrait du héros : la tête 3D (GLB) rendue en glyphes de code, en fondu avec la photo.
 * Au défilement, les glyphes quittent le cadre et construisent le titre de la section suivante.
 */
export class GlyphHead {
  private s: Scene | null = null;
  private loading = false;
  private disposed = false;
  private readonly reduce = prefersReducedMotion();
  private readonly coarse = isCoarsePointer();

  // Rotation de la tête et progression de l'impression.
  private yaw = 0;
  private pitch = 0;
  private buildStart: number | null = null;
  private drag: { x: number; y: number; moved: boolean } | null = null;
  private lastTick = 0;

  // Fondu photo ⇄ 3D : 0 = glyphes, 1 = photo.
  private photoReady = false;
  private photoMix = 0;
  private photoTarget = 0;
  private autoSwitched = false;
  private hovering = false;
  private switchAt = 0;
  private failAt = 0;
  private lastHeadTick = 0;

  // Gyroscope (mobile).
  private gyroYaw: number | null = null;
  private gyroPitch = 0;
  private gyroBase: number | null = null;
  private askGyro: (() => void) | null = null;

  // Dislocation au défilement.
  private burst = 0;
  private burstSmooth: number | null = null;
  private overlay: { canvas: HTMLCanvasElement; renderer: THREE_NS.WebGLRenderer; w: number; h: number } | null = null;
  private overlayOn = false;
  private anchorTop = 0;
  private construction: Construction | null = null;
  private constructionDone = false;
  private lastLabel = "";
  private readonly cleanups: (() => void)[] = [];

  constructor(private readonly el: GlyphHeadElements, private readonly opts: GlyphHeadOptions) {
    this.initPhoto();
    this.initGyro();
    this.load();
  }

  // ─────────────────────────── Chargement ───────────────────────────

  private initPhoto() {
    const { photo } = this.el;
    if (photo.complete && photo.naturalWidth) this.photoReady = true;
    else photo.addEventListener("load", () => (this.photoReady = true), { once: true });
    const box = photo.parentElement;
    if (!box || this.coarse) return;
    const enter = () => { this.autoSwitched = true; this.photoTarget = 0; this.hovering = true; };
    const leave = () => { this.hovering = false; this.photoTarget = 1; };
    box.addEventListener("mouseenter", enter);
    box.addEventListener("mouseleave", leave);
    this.cleanups.push(() => { box.removeEventListener("mouseenter", enter); box.removeEventListener("mouseleave", leave); });
  }

  /** Android : direct ; iOS 13+ : après autorisation, qui exige un geste de l'utilisateur. */
  private initGyro() {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      this.gyroBase ??= e.beta;
      this.gyroYaw = clamp(e.gamma / 30, -1, 1);
      this.gyroPitch = clamp((e.beta - this.gyroBase) / 25, -1, 1);
    };
    this.cleanups.push(() => removeEventListener("deviceorientation", onTilt));
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (DOE?.requestPermission) {
      let asked = false;
      this.askGyro = () => {
        if (asked) return;
        asked = true;
        DOE.requestPermission!().then((st) => { if (st === "granted") addEventListener("deviceorientation", onTilt); }).catch(() => {});
      };
      addEventListener("click", this.askGyro, { once: true });
      addEventListener("touchend", this.askGyro, { once: true });
    } else addEventListener("deviceorientation", onTilt);
  }

  private async load() {
    if (this.loading) return;
    this.loading = true;
    try {
      const [THREE, { GLTFLoader }, { MeshSurfaceSampler }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/math/MeshSurfaceSampler.js"),
      ]);
      const loader = new GLTFLoader();
      const get = (url: string) => loader.loadAsync(url);
      let demo = false;
      const gltf = await get(this.opts.modelUrl).catch(() => { demo = true; return get(this.opts.fallbackUrl); });
      if (!this.disposed) this.build(THREE, MeshSurfaceSampler, gltf.scene, demo);
    } catch (e) {
      console.warn("[head3d]", e);
    }
  }

  private build(THREE: Three, Sampler: typeof import("three/examples/jsm/math/MeshSurfaceSampler.js").MeshSurfaceSampler, root: THREE_NS.Object3D, demo: boolean) {
    root.updateMatrixWorld(true);
    let best: THREE_NS.Mesh | null = null;
    root.traverse((o) => {
      const m = o as THREE_NS.Mesh;
      if (m.isMesh && (!best || m.geometry.attributes.position.count > best.geometry.attributes.position.count)) best = m;
    });
    const source = best as THREE_NS.Mesh | null;
    if (!source) return;

    // Géométrie normalisée : centrée, hauteur 2.
    let geo = source.geometry.clone();
    geo.applyMatrix4(source.matrixWorld);
    if (geo.index) geo = geo.toNonIndexed();
    if (!geo.attributes.normal) geo.computeVertexNormals();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!, center = new THREE.Vector3();
    bb.getCenter(center);
    const scale = 2 / (bb.max.y - bb.min.y);
    geo.translate(-center.x, -center.y, -center.z);
    geo.scale(scale, scale, scale);
    const sampler = new Sampler(new THREE.Mesh(geo)).build();

    // Luminance de la texture (si présente), pour moduler la teinte des glyphes.
    let texData: Uint8ClampedArray | null = null;
    const map = (source.material as THREE_NS.MeshStandardMaterial | undefined)?.map;
    if (map?.image && geo.attributes.uv) {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const x = c.getContext("2d", { willReadFrequently: true })!;
        x.drawImage(map.image as CanvasImageSource, 0, 0, 256, 256);
        texData = x.getImageData(0, 0, 256, 256).data;
      } catch { /* texture non lisible (CORS) : teinte uniforme */ }
    }

    // Atlas des caractères du code source.
    const chars = [...new Set(CODE_SAMPLE.replace(/\s/g, "").split(""))].slice(0, ATLAS_COLS * ATLAS_ROWS);
    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = ATLAS_COLS * CELL;
    atlasCanvas.height = ATLAS_ROWS * CELL;
    const ax = atlasCanvas.getContext("2d")!;
    ax.fillStyle = "#fff";
    ax.font = `600 ${CELL * 0.78}px ${monoFont()}`;
    ax.textAlign = "center";
    ax.textBaseline = "middle";
    chars.forEach((c, i) => ax.fillText(c, ((i % ATLAS_COLS) + 0.5) * CELL, (Math.floor(i / ATLAS_COLS) + 0.54) * CELL));
    const atlas = new THREE.CanvasTexture(atlasCanvas);
    atlas.minFilter = THREE.LinearMipmapLinearFilter;
    atlas.generateMipmaps = true;

    // Échantillonnage de la surface.
    const N = innerWidth < 700 ? 9000 : 14000;
    const pos = new Float32Array(N * 3), nor = new Float32Array(N * 3), ch = new Float32Array(N), tint = new Float32Array(N);
    const lum = new Float32Array(N), rnd = new Float32Array(N), tgt = new Float32Array(N * 2);
    const p = new THREE.Vector3(), n = new THREE.Vector3(), col = new THREE.Color(), uv = new THREE.Vector2();
    for (let i = 0; i < N; i++) {
      sampler.sample(p, n, col, uv);
      pos.set([p.x, p.y, p.z], i * 3);
      nor.set([n.x, n.y, n.z], i * 3);
      ch[i] = Math.floor(Math.random() * chars.length);
      const r = Math.random();
      tint[i] = r < 0.05 ? 1 : r < 0.08 ? 2 : 0;
      rnd[i] = Math.random();
      let l = 0.5;
      if (texData && map) {
        const tx = clamp(Math.floor(uv.x * 256), 0, 255), ty = clamp(Math.floor((map.flipY === false ? uv.y : 1 - uv.y) * 256), 0, 255);
        const q = (ty * 256 + tx) * 4;
        l = (texData[q] * 0.3 + texData[q + 1] * 0.59 + texData[q + 2] * 0.11) / 255;
      }
      lum[i] = l;
    }
    const sorted = [...lum].sort((a, b) => a - b), lo = sorted[Math.floor(N * 0.03)], hi = sorted[Math.floor(N * 0.97)];
    for (let i = 0; i < N; i++) lum[i] = clamp((lum[i] - lo) / Math.max(0.01, hi - lo), 0, 1);
    for (let i = 0; i < N * 2; i++) tgt[i] = Math.random();

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("aCh", new THREE.BufferAttribute(ch, 1));
    g.setAttribute("aTi", new THREE.BufferAttribute(tint, 1));
    g.setAttribute("aLu", new THREE.BufferAttribute(lum, 1));
    g.setAttribute("aRn", new THREE.BufferAttribute(rnd, 1));
    g.setAttribute("aTg", new THREE.BufferAttribute(tgt, 2));

    const palette = RAW[this.opts.getTheme()];
    const uniforms: Record<string, THREE_NS.IUniform> = {
      uAtlas: { value: atlas }, uScale: { value: 400 }, uSize: { value: 0.042 }, uBuild: { value: -1.2 },
      uBase: { value: new THREE.Color(palette.base) }, uMint: { value: new THREE.Color(palette.mint) },
      uPink: { value: new THREE.Color(palette.pink) }, uDim: { value: new THREE.Color(palette.dim) },
      uTex: { value: texData ? 1 : 0 }, uTime: { value: 0 }, uBurst: { value: 0 }, uMode: { value: 0 }, uGo: { value: 0 },
      uRect: { value: new THREE.Vector4(0, 0, 1, 1) }, uBox: { value: new THREE.Vector4(0, 0, 1, 1) },
      uT: { value: 0.268 }, uTS: { value: 6 }, uFade: { value: 2 },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER });
    const pivot = new THREE.Group();
    pivot.add(new THREE.Points(g, material));
    const scene = new THREE.Scene();
    scene.add(pivot);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 4.6);
    const renderer = new THREE.WebGLRenderer({ canvas: this.el.canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0, 0);

    this.s = { THREE, renderer, camera, scene, pivot, geometry: g, uniforms, count: N, demo, W: 0, H: 0 };
    this.themeApplied = null;
    this.yaw = this.reduce ? 0 : 2.6;
    this.resize();
    this.bindCanvas();
    this.print();
  }

  private bindCanvas() {
    const cv = this.el.canvas;
    const down = (e: PointerEvent) => {
      this.drag = { x: e.clientX, y: e.clientY, moved: false };
      try { cv.setPointerCapture(e.pointerId); } catch { /* déjà capturé */ }
    };
    const move = (e: PointerEvent) => {
      const d = this.drag;
      if (d && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) d.moved = true;
    };
    const up = () => {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      if (!d.moved) this.toggle();
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.style.cursor = "pointer";
    this.cleanups.push(() => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
    });
  }

  // ─────────────────────────── API publique ───────────────────────────

  /** Relance l'impression en glyphes (animation d'entrée). */
  print() {
    const s = this.s;
    if (!s) return;
    if (this.reduce || !FEATURES.headPrint) { s.uniforms.uBuild.value = 1.3; return; }
    this.buildStart = performance.now();
    s.uniforms.uBuild.value = -1.1;
    this.yaw = 1.6;
  }

  /** Bascule photo ⇄ glyphes (clic ou toucher). */
  toggle() {
    this.autoSwitched = true;
    this.photoTarget = this.photoTarget > 0.5 ? 0 : 1;
    this.askGyro?.();
  }

  resize() {
    const s = this.s;
    if (!s) return;
    const W = this.el.canvas.clientWidth, H = this.el.canvas.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    s.renderer.setPixelRatio(dpr);
    s.renderer.setSize(W, H, false);
    s.camera.aspect = W / H;
    s.camera.updateProjectionMatrix();
    s.uniforms.uScale.value = (H * dpr) / (2 * Math.tan((s.camera.fov * Math.PI) / 360));
    s.W = W;
    s.H = H;
  }

  tick(now: number) {
    this.tickScene(now);
    this.tickPhoto(now);
  }

  dispose() {
    this.disposed = true;
    this.cleanups.forEach((fn) => fn());
    this.restoreConstruction();
    this.overlay?.renderer.dispose();
    this.overlay?.canvas.remove();
    this.s?.renderer.dispose();
    this.s = null;
  }

  // ─────────────────────────── Rendu 3D ───────────────────────────

  private themeApplied: Theme | null = null;

  private tickScene(now: number) {
    const s = this.s;
    if (!s) return;
    const cv = this.el.canvas, r = cv.getBoundingClientRect(), U = s.uniforms;
    const raw = !FEATURES.headExplode || this.reduce ? 0 : clamp((40 - r.top) / (innerHeight * 0.85), 0, 1);
    if (!raw && !((this.burstSmooth ?? 0) > 0.002) && (r.bottom < 0 || r.top > innerHeight)) {
      if (this.overlayOn) this.overlayOff();
      return;
    }
    if (Math.abs(cv.clientWidth - s.W) > 1 || Math.abs(cv.clientHeight - s.H) > 1) this.resize();
    const dt = Math.min(64, now - (this.lastTick || now));
    this.lastTick = now;
    U.uTime.value = now / 1000;
    U.uBurst.value = 0;
    this.burstSmooth = this.burstSmooth == null || this.reduce ? raw : this.burstSmooth + (raw - this.burstSmooth) * (1 - Math.exp(-dt / 110));
    if (Math.abs(raw - this.burstSmooth) < 0.002) this.burstSmooth = raw;
    this.dislocate(r, this.burstSmooth);

    if (this.buildStart != null) {
      const p = Math.min(1, (now - this.buildStart) / 2800), e = 1 - Math.pow(1 - p, 2.2);
      U.uBuild.value = -1.1 + e * 2.3;
      if (p >= 1) this.buildStart = null;
    }
    const building = this.buildStart != null;

    if (!this.drag) {
      let ty = 0, tp = 0;
      if (building) ty = (1 - (U.uBuild.value + 1.1) / 2.3) * 1.6;
      else if (this.coarse && this.gyroYaw != null && FEATURES.headFollowsCursor) { ty = this.gyroYaw * 0.75; tp = this.gyroPitch * 0.22; }
      else if (!this.coarse && FEATURES.headFollowsCursor) {
        ty = Math.tanh((pointer.x - (r.left + r.width / 2)) / Math.max(260, innerWidth * 0.3)) * 0.75;
        tp = Math.tanh((pointer.y - (r.top + r.height * 0.4)) / 500) * 0.22;
      } else ty = Math.sin(now / 3200) * 0.6;
      if (this.reduce) { ty = 0; tp = 0; }
      let dy = ty - this.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      const k = 1 - Math.exp(-dt / (building ? 300 : 420));
      this.yaw += dy * k;
      this.pitch += (tp - this.pitch) * k;
    }
    s.pivot.rotation.set(this.pitch, this.yaw, 0);

    const theme = this.opts.getTheme();
    if (this.themeApplied !== theme) {
      this.themeApplied = theme;
      const c = RAW[theme];
      (U.uBase.value as THREE_NS.Color).set(c.base);
      (U.uMint.value as THREE_NS.Color).set(c.mint);
      (U.uPink.value as THREE_NS.Color).set(c.pink);
      (U.uDim.value as THREE_NS.Color).set(c.dim);
    }

    if (this.overlayOn && this.overlay) {
      s.camera.setViewOffset(s.W, s.H, -r.left, -this.anchorTop, innerWidth, innerHeight);
      this.overlay.renderer.render(s.scene, s.camera);
      s.camera.clearViewOffset();
    } else if (r.bottom > 0) s.renderer.render(s.scene, s.camera);

    this.updateLabel(building);
  }

  private updateLabel(building: boolean) {
    const s = this.s!, en = this.opts.getLang() === "en";
    const deg = Math.round((((this.yaw * 57.2958) % 360) + 540) % 360 - 180);
    const file = s.demo ? "demo.glb" : "ameth.glb";
    const progress = Math.round(((s.uniforms.uBuild.value + 1.1) / 2.3) * 100);
    const label = this.photoMix > 0.5
      ? "ameth.jpg · photo"
      : `${file} · ${building ? (en ? "printing " : "impression ") + progress + "%" : s.count.toLocaleString("fr-FR") + (en ? " glyphs" : " glyphes") + " · θ " + deg + "°"}`;
    if (label !== this.lastLabel) {
      this.lastLabel = label;
      this.el.label.textContent = label;
    }
  }

  // ─────────────────────── Fondu photo ⇄ glyphes ───────────────────────

  private tickPhoto(now: number) {
    const { photo, canvas, scan } = this.el;
    const r = photo.parentElement!.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const dt = Math.min(64, now - (this.lastHeadTick || now));
    this.lastHeadTick = now;

    // Passage automatique à la photo ~2 s après la fin de l'impression (ou si la 3D ne charge pas).
    if (!this.autoSwitched && this.s && this.buildStart == null && this.photoReady) {
      this.switchAt ||= now + 2200;
      if (now > this.switchAt) { this.autoSwitched = true; if (!this.hovering) this.photoTarget = 1; }
    }
    if (!this.s && this.photoReady && !this.autoSwitched) {
      this.failAt ||= now + 4000;
      if (now > this.failAt) { this.autoSwitched = true; this.photoTarget = 1; }
    }

    const k = this.reduce ? 1 : 1 - Math.exp(-dt / 260);
    this.photoMix += (this.photoTarget - this.photoMix) * k;
    if (Math.abs(this.photoTarget - this.photoMix) < 0.002) this.photoMix = this.photoTarget;
    if (this.burst > 0.001 && this.photoTarget) { this.photoTarget = 0; this.photoMix = 0; this.autoSwitched = true; }
    const p = this.burst > 0.001 ? 0 : Math.max(0, this.photoMix);

    // Balayage : photo au-dessus de la ligne, glyphes en dessous.
    const e = p * p * (3 - 2 * p), y = -8 + e * 116, soft = 6, mid = p > 0.001 && p < 0.999;
    const photoMask = mid ? `linear-gradient(to bottom,#000 ${(y - soft).toFixed(1)}%,transparent ${(y + soft).toFixed(1)}%)` : "none";
    const codeMask = mid ? `linear-gradient(to bottom,transparent ${(y - soft).toFixed(1)}%,#000 ${(y + soft).toFixed(1)}%)` : "none";
    photo.style.opacity = p <= 0.001 ? "0" : "1";
    photo.style.maskImage = photo.style.webkitMaskImage = photoMask;
    canvas.style.maskImage = canvas.style.webkitMaskImage = codeMask;
    canvas.style.opacity = p >= 0.999 ? "0" : "1";
    scan.style.opacity = p > 0.01 && p < 0.99 && !this.reduce ? "1" : "0";
    scan.style.top = clamp(y, 0, 100).toFixed(1) + "%";
  }

  // ─────────────── Dislocation : les glyphes construisent le texte ───────────────

  private dislocate(r: DOMRect, b: number) {
    const s = this.s!, U = s.uniforms;
    this.burst = b;
    if (b >= 0.999 && this.constructionDone) return;
    if (b < 0.999) this.constructionDone = false;
    const enabled = FEATURES.headExplode && !this.reduce;
    if (!enabled) this.restoreConstruction();
    if (b <= 0.001) {
      if (this.overlayOn) this.overlayOff();
      if (enabled) this.runConstruction(0, 1, true);
      return;
    }
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (!this.overlay) {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
      document.body.appendChild(canvas);
      const renderer = new s.THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setClearColor(0, 0);
      this.overlay = { canvas, renderer, w: 0, h: 0 };
    }
    const ov = this.overlay;
    if (ov.w !== innerWidth || ov.h !== innerHeight) {
      ov.w = innerWidth;
      ov.h = innerHeight;
      ov.renderer.setPixelRatio(dpr);
      ov.renderer.setSize(innerWidth, innerHeight, false);
    }
    this.overlayOn = true;
    ov.canvas.style.display = "block";
    this.el.canvas.style.visibility = "hidden";
    this.anchorTop = r.top < 40 ? 40 - (40 - r.top) * 0.55 : r.top;
    (U.uBox.value as THREE_NS.Vector4).set(r.left, this.anchorTop, s.W, s.H);
    U.uT.value = Math.tan((s.camera.fov * Math.PI) / 360);
    this.runConstruction(b, dpr, false);
    if (b >= 0.999) { this.overlayOff(); this.burst = 1; this.constructionDone = true; }
  }

  private overlayOff() {
    const U = this.s!.uniforms;
    this.overlayOn = false;
    this.burst = 0;
    if (this.overlay) { this.overlay.renderer.clear(); this.overlay.canvas.style.display = "none"; }
    this.el.canvas.style.visibility = "";
    U.uMode.value = 0;
    U.uGo.value = 0;
    U.uFade.value = 2;
    U.uBurst.value = 0;
  }

  /** Répartit les cibles des glyphes sur les lignes de texte situées sous le portrait. */
  private setupConstruction(): boolean {
    const s = this.s!;
    const frame = this.el.photo.parentElement!.getBoundingClientRect(), limit = frame.top + frame.height * 0.5;
    const els = [...document.querySelectorAll<HTMLElement>("[data-construct]")]
      .filter((e) => e.offsetParent && e.getBoundingClientRect().top > limit);
    if (!els.length) return false;
    els.forEach(cancelReveal);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, lh = 0;
    const lines: DOMRect[] = [];
    els.forEach((e) => {
      const b = e.getBoundingClientRect();
      x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom);
      const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        if (!n.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const q of range.getClientRects()) if (q.width > 2 && q.height > 2) { lines.push(q); lh += q.height; }
      }
    });
    if (!lines.length) return false;
    const W = x1 - x0, H = y1 - y0, attr = s.geometry.attributes.aTg as THREE_NS.BufferAttribute, arr = attr.array as Float32Array;
    const cum: number[] = [];
    let total = 0;
    lines.forEach((q) => { total += q.width; cum.push(total); });
    for (let i = 0; i < attr.count; i++) {
      const v = Math.random() * total;
      let lo = 0, hi = cum.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < v) lo = m + 1; else hi = m; }
      const q = lines[lo];
      arr[i * 2] = (q.left + Math.random() * q.width - x0) / W;
      arr[i * 2 + 1] = (q.top + q.height * (0.5 + (Math.random() - 0.5) * 0.45) - y0) / H;
    }
    attr.needsUpdate = true;
    const r0 = els[0].getBoundingClientRect();
    this.construction = {
      els: els.map((e) => { const b = e.getBoundingClientRect(); return { el: e, top: b.top - y0, height: b.height }; }),
      ref: els[0], ox: x0 - r0.left, oy: y0 - r0.top, width: W, height: H, lineHeight: lh / lines.length, viewportWidth: innerWidth,
    };
    return true;
  }

  private runConstruction(b: number, dpr: number, idle: boolean) {
    const U = this.s!.uniforms;
    if (!this.construction || this.construction.viewportWidth !== innerWidth) {
      this.restoreConstruction();
      if (!this.setupConstruction()) return;
    }
    const C = this.construction!, r0 = C.ref.getBoundingClientRect();
    const go = clamp((b - 0.1) / 0.8, 0, 1), front = idle ? -1 : (go - 0.36) / 0.6;
    // Le texte réel apparaît derrière le front des glyphes ; au-delà, il reste estompé.
    C.els.forEach((o) => {
      const l = clamp((front * C.height - o.top) / Math.max(1, o.height), 0, 1), pct = (l * 100).toFixed(2);
      o.el.style.maskImage = o.el.style.webkitMaskImage = l >= 1 ? "" : `linear-gradient(to bottom,#000 ${pct}%,rgba(0,0,0,.13) ${pct}%)`;
    });
    if (idle) return;
    U.uMode.value = 2;
    U.uGo.value = go;
    (U.uRect.value as THREE_NS.Vector4).set(r0.left + C.ox, r0.top + C.oy, C.width, C.height);
    U.uTS.value = Math.max(4, C.lineHeight * 0.62) * dpr;
    U.uBurst.value = Math.min(b, 0.1) * 2.4;
    U.uFade.value = go >= 1 ? -1 : 2;
  }

  private restoreConstruction() {
    this.construction?.els.forEach((o) => { o.el.style.maskImage = o.el.style.webkitMaskImage = ""; });
    this.construction = null;
  }
}
