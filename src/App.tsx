import React, { useEffect, useState } from "react";

/** ------------------------------------------------------------------
 * ModelViewer wrapper (fixes TS2339 without .d.ts or peer deps)
 * ------------------------------------------------------------------ */
const ModelViewer: React.FC<any> = (props) =>
  React.createElement("model-viewer" as any, props);

// --- Config (adjust freely) ---
const MODELS = {
  plastic: { name: "Plastic", usd: 42 },
  aluminium: { name: "Aluminium", usd: 69 },
};

// Media assets per model
type MediaItem =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "video"; src: string; alt: string }
  | { id: string; type: "model"; src: string; alt: string; poster?: string };

const MEDIA: Record<keyof typeof MODELS, MediaItem[]> = {
  plastic: [
    { id: "p1", type: "video", src: "/media/plastic/reveal.mp4", alt: "Plastic – front" },
    { id: "p2", type: "video", src: "/media/plastic/spin.mp4",   alt: "Plastic 360°" },
    { id: "p3", type: "model", src: "/media/plastic/unit.glb",   alt: "Interactive 3D model", poster: "/media/plastic/hero-1.jpg" },
  ],
  aluminium: [
    { id: "a1", type: "image", src: "/media/aluminium/hero-1.jpg", alt: "Aluminium – front" },
    { id: "a2", type: "video", src: "/media/aluminium/spin.mp4",   alt: "Aluminium 360°" },
    { id: "a3", type: "image", src: "/media/aluminium/detail-cnc.jpg", alt: "CNC detail" },
  ],
};

const INVENTORY_TOTAL = 4200; // shared pool of physical units (bundle counts as 2)

/* ===================== Prices / Utils ===================== */
function useMockSolPrice() {
  const [solPrice, setSolPrice] = useState(200); // USD per SOL (mock)
  useEffect(() => {
    const id = setInterval(() => {
      setSolPrice((p) => Math.max(5, +(p + (Math.random() - 0.5) * 0.6).toFixed(2)));
    }, 4000);
    return () => clearInterval(id);
  }, []);
  return solPrice;
}

/* ======================= UI atoms ======================== */
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30">
    {children}
  </span>
);

function Progress({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-blue-600 transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-white/10 bg-black/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center"><span className="text-lg">🐸</span></div>
          <span className="font-semibold text-white">unruggable</span>
        </div>
        <a href="#buy" className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm font-medium shadow-lg shadow-blue-600/25">Pre-Order</a>
      </div>
    </header>
  );
}

/* =================== Polished Media Carousel =================== */
function MediaCarousel({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const next = () => setIndex((i) => (i + 1) % items.length);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setIsReducedMotion(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const active = items[index];

  useEffect(() => {
    if (!stageRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setIsVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0.2 }
    );
    io.observe(stageRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (isReducedMotion || items.length <= 1) return;
    if (!isVisible) return;
    if (isHover || isDragging) return;
    if (active.type === "video" && userPaused) return;

    const DELAY_IMAGE = 6000;
    const DELAY_VIDEO = 14000;
    const DELAY_MODEL = 16000;

    const delay =
      active.type === "video" ? DELAY_VIDEO :
      active.type === "model" ? DELAY_MODEL :
      DELAY_IMAGE;

    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [index, items, isReducedMotion, isHover, isDragging, isVisible, userPaused, active]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const shouldPlay = isVisible && !isHover && !isDragging && !userPaused;
    if (shouldPlay) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [active, isVisible, isHover, isDragging, userPaused]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX != null) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > 40) prev();
      if (dx < -40) next();
    }
    setTouchStartX(null);
    setIsDragging(false);
  };
  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);

  const showPlayButton = active.type === "video";
  const isVideoPlaying = showPlayButton && !(userPaused || isHover || isDragging || !isVisible);

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 to-blue-900/40 p-3 shadow-2xl">
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: "4 / 5" }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active.type === "image" && (
          <img loading="lazy" src={active.src} alt={active.alt} className="h-full w-full object-cover" />
        )}

        {active.type === "video" && (
          <video
            ref={videoRef}
            preload="metadata"
            src={active.src}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        {active.type === "model" && (
          <ModelViewer
            src={active.src}
            poster={(active as any).poster}
            camera-controls
            {...(isVisible && !isHover && !isDragging ? { "auto-rotate": "" } : {})}
            shadow-intensity={0.8}
            exposure={0.9}
            ar
            style={{ width: "100%", height: "100%", background: "transparent", display: "block" }}
          />
        )}

        {showPlayButton && (
          <button
            onClick={() => setUserPaused((p) => !p)}
            className="absolute left-4 bottom-4 rounded-full bg-black/60 px-3 py-2 text-white text-sm backdrop-blur border border-white/10"
          >
            {isVideoPlaying ? "❚❚ Pause" : "▶ Play"}
          </button>
        )}

        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/50 px-3 py-2 text-white"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/50 px-3 py-2 text-white"
          >
            ›
          </button>
        </>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => {
              setIndex(i);
              setUserPaused(false);
            }}
            className={`aspect-[4/3] overflow-hidden rounded-xl ring-1 ${i === index ? "ring-blue-500" : "ring-white/10"}`}
            title={it.alt}
          >
            {it.type === "image" && <img loading="lazy" src={it.src} alt="" className="h-full w-full object-cover" />}
            {it.type === "video" && <div className="h-full w-full grid place-items-center bg-black/60"><span className="text-xs text-white/80">360°</span></div>}
            {it.type === "model" && <div className="h-full w-full grid place-items-center bg-black/60"><span className="text-xs text-white/90">3D</span></div>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ======================= Cart system (incl. bundle) ======================= */
type Sku = "plastic" | "aluminium" | "bundle";

const SKU_NAMES: Record<Sku, string> = {
  plastic: "Plastic",
  aluminium: "Aluminium",
  bundle: "Bundle (Aluminium + Plastic)",
};
const SKU_PRICES: Record<Sku, number> = {
  plastic: 42,
  aluminium: 69,
  bundle: 99,
};

type CartItem = { sku: Sku; name: string; unitUsd: number; qty: number };
type Cart = { [k in Sku]?: CartItem };

const emptyCart: Cart = {};

function useLocalStorageCart(key = "unruggable:cart") {
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Cart) : emptyCart;
    } catch {
      return emptyCart;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, key]);

  const add = (sku: Sku, qty = 1) =>
    setCart((c) => {
      const base = c[sku];
      const nextQty = Math.max(1, (base?.qty ?? 0) + qty);
      return {
        ...c,
        [sku]: { sku, name: SKU_NAMES[sku], unitUsd: SKU_PRICES[sku], qty: nextQty },
      };
    });

  const setQty = (sku: Sku, qty: number) =>
    setCart((c) => {
      if (qty <= 0) {
        const { [sku]: _, ...rest } = c;
        return rest;
      }
      return {
        ...c,
        [sku]: { sku, name: SKU_NAMES[sku], unitUsd: SKU_PRICES[sku], qty },
      };
    });

  const remove = (sku: Sku) =>
    setCart((c) => {
      const { [sku]: _, ...rest } = c;
      return rest;
    });

  const clear = () => setCart({});

  const items = Object.values(cart).filter(Boolean) as CartItem[];
  const count = items.reduce((n, it) => n + it.qty, 0);
  const usdSubtotal = items.reduce((n, it) => n + it.qty * it.unitUsd, 0);

  return { cart, setCart, add, setQty, remove, clear, items, count, usdSubtotal };
}

/* =================== Showcase / Selectors =================== */
function ModelShowcase({ model, onSwitch }: { model: keyof typeof MODELS; onSwitch: (m: keyof typeof MODELS) => void }) {
  const items = MEDIA[model] ?? [];
  return (
    <div className="relative">
      <MediaCarousel items={items} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[{ id: "plastic", label: "Plastic" }, { id: "aluminium", label: "Aluminium" }].map((m) => (
          <button
            key={m.id}
            onClick={() => onSwitch(m.id as keyof typeof MODELS)}
            className={`rounded-xl px-3 py-2 text-sm border ${model === (m.id as keyof typeof MODELS) ? "border-blue-500/60 bg-blue-500/10 text-blue-200" : "border-white/10 text-zinc-300 hover:border-white/20"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================= Buy Box ========================= */
function BuyBox({
  model, setModel, qty, setQty, solPrice, remaining, onAddSku, onPayFromCart,
}: {
  model: keyof typeof MODELS;
  setModel: (m: keyof typeof MODELS) => void;
  qty: number;
  setQty: (n: number) => void;
  solPrice: number;
  remaining: number;
  onAddSku: (sku: Sku, qty: number) => void;
  onPayFromCart: (type: "crypto" | "fiat") => void;
}) {
  const usd = MODELS[model].usd;
  const sol = usd / solPrice;

  const save = 42 + 69 - 99; // 12

  return (
    <div id="buy" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl">
      <div className="mb-2"><Badge>Pre-Order</Badge></div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">Unruggable Unit ONE</h1>
      <p className="text-zinc-300 mb-6">Choose model → set quantity → add to basket.</p>

      {/* Model selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.entries(MODELS) as [keyof typeof MODELS, (typeof MODELS)[keyof typeof MODELS]][]).map(([id, m]) => (
          <button
            key={id}
            onClick={() => setModel(id)}
            className={`rounded-xl border px-3 py-2 text-sm ${model === id ? "border-blue-500/60 bg-blue-500/10 text-blue-200" : "border-white/10 text-zinc-300 hover:border-white/20"}`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-2">
          <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 grid place-items-center rounded-xl bg-white/5">−</button>
          <span className="w-10 text-center" aria-live="polite">{qty}</span>
          <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)} className="h-9 w-9 grid place-items-center rounded-xl bg-white/5">+</button>
        </div>
        <p className="text-xs text-zinc-400">Buy multiples in one go.</p>
      </div>

      {/* Pricing row */}
      <div className="rounded-2xl border border-white/10 p-4 mb-4">
        <div className="flex items-baseline justify-between">
          <div className="text-zinc-300">Price (per unit)</div>
          <div className="text-2xl font-semibold">${usd}</div>
        </div>
        <div className="mt-2 text-sm text-zinc-400">
          ≈ {sol.toFixed(3)} SOL · {usd} USDC
          <span className="ml-2 text-xs">(SOL updates live)</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <button
          onClick={() => onAddSku(model as Sku, qty)}
          className="sm:col-span-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 font-medium shadow-lg shadow-blue-600/25"
        >
          Add to Basket
          <div className="text-xs text-blue-100/90">Plastic/Aluminium supported</div>
        </button>
        <button
          onClick={() => onPayFromCart("crypto")}
          className="rounded-2xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 font-medium border border-white/15"
        >
          Go to Checkout
          <div className="text-xs text-white/70">SOL/USDC or Card</div>
        </button>
      </div>

      {/* 🔥 Bundle Upsell */}
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 mb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-white font-medium">Bundle: 1× Aluminium + 1× Plastic</div>
            <div className="text-xs text-amber-200/90 mt-1">Save ${save} vs buying separately · Only <span className="font-semibold">$99</span></div>
          </div>
          <button
            onClick={() => onAddSku("bundle", 1)}
            className="rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-3 py-2 text-sm font-semibold shadow"
          >
            Add Bundle — $99
          </button>
        </div>
      </div>

      {/* Inventory */}
      <div className="text-sm text-zinc-300 mb-2">{INVENTORY_TOTAL} total · {remaining} remaining</div>
      <Progress value={((INVENTORY_TOTAL - remaining) / INVENTORY_TOTAL) * 100} />

      {/* Shipping note */}
      <p className="mt-4 text-xs text-zinc-400">
        Ships in Q2 2026 · Customs & duties paid by you · Non-UK shipping paid by you.
      </p>
    </div>
  );
}

/* ======================= Checkout UI ======================= */
function MiniCartRow({
  item,
  onInc,
  onDec,
  onRemove,
}: {
  item: CartItem;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  const icon = item.sku === "plastic" ? "🧵" : item.sku === "aluminium" ? "🛠️" : "🎁";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
          <span className="text-sm">{icon}</span>
        </div>
        <div>
          <div className="text-sm text-white">{item.name}</div>
          <div className="text-xs text-zinc-400">${item.unitUsd} each</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1">
          <button aria-label="Decrease" onClick={onDec} className="h-7 w-7 grid place-items-center rounded-lg bg-white/5">−</button>
          <span className="w-6 text-center select-none">{item.qty}</span>
          <button aria-label="Increase" onClick={onInc} className="h-7 w-7 grid place-items-center rounded-lg bg-white/5">+</button>
        </div>
        <button aria-label={`Remove ${item.name}`} onClick={onRemove} className="text-xs text-zinc-400 hover:text-red-300">Remove</button>
      </div>
    </div>
  );
}

function CheckoutBar({
  count,
  usdSubtotal,
  onOpen,
}: {
  count: number;
  usdSubtotal: number;
  onOpen: () => void;
}) {
  return (
    <div
      className="fixed inset-x-4 md:left-auto md:w-[32rem] bottom-4 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        onClick={onOpen}
        className="w-full rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur p-4 shadow-2xl transition hover:bg-zinc-900/80"
        aria-label="Open basket"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 grid place-items-center"><span>🧺</span></div>
            <div className="text-left">
              <p className="text-sm text-zinc-400">Basket • {count} item{count !== 1 ? "s" : ""}</p>
              <p className="text-lg font-semibold text-white">${usdSubtotal}</p>
            </div>
          </div>
          <div className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">Review & Checkout</div>
        </div>
      </button>
    </div>
  );
}

function MiniCartSheet({
  open,
  onClose,
  items,
  usdSubtotal,
  solPrice,
  onInc,
  onDec,
  onRemove,
  onClear,
  onPay,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  usdSubtotal: number;
  solPrice: number;
  onInc: (s: Sku) => void;
  onDec: (s: Sku) => void;
  onRemove: (s: Sku) => void;
  onClear: () => void;
  onPay: (t: "crypto" | "fiat") => void;
}) {
  const solTotal = usdSubtotal / solPrice;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <button
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-label="Close basket"
      />
      {/* sheet */}
      <div className="relative mx-auto max-w-2xl rounded-t-3xl border border-white/10 bg-zinc-950 p-5">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-white/15 mb-3" />
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Your Basket</h3>
          <div className="flex items-center gap-3">
            <button onClick={onClear} className="text-xs text-zinc-400 hover:text-zinc-200">Clear</button>
            <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1 text-sm">Close</button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-6 text-center text-zinc-400">Your basket is empty.</div>
          ) : (
            items.map((it) => (
              <MiniCartRow
                key={it.sku}
                item={it}
                onInc={() => onInc(it.sku)}
                onDec={() => onDec(it.sku)}
                onRemove={() => onRemove(it.sku)}
              />
            ))
          )}
        </div>

        {/* Totals */}
        <div className="mt-4 rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">Subtotal</span>
            <span className="text-white font-medium">${usdSubtotal}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1 text-zinc-400">
            <span>≈</span>
            <span>{solTotal.toFixed(3)} SOL · pays in USDC or SOL</span>
          </div>
        </div>

        {/* Pay actions */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => onPay("crypto")}
            disabled={items.length === 0}
            className="rounded-2xl bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 text-white px-4 py-3 font-medium shadow-lg shadow-blue-600/25"
          >
            Buy with SOL / USDC
            <div className="text-xs text-blue-100/90">via HelioPay · token selectable</div>
          </button>
          <button
            onClick={() => onPay("fiat")}
            disabled={items.length === 0}
            className="rounded-2xl bg-white disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-3 font-medium"
          >
            Card / Apple Pay
            <div className="text-xs text-black/70">via Coinflow</div>
          </button>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Ships in Q2 2026 · Customs & duties paid by you · Non-UK shipping paid by you.
        </p>
      </div>
    </div>
  );
}

/* ===================== Inline Info Buttons (now 6) ===================== */
type DockKey = "faq" | "about" | "shipping" | "specs" | "partners" | "support";

function InlineInfoDock({
  openKey,
  setOpenKey,
}: {
  openKey: DockKey | null;
  setOpenKey: (k: DockKey | null) => void;
}) {
  const toggle = (k: DockKey) => setOpenKey(openKey === k ? null : k);

  return (
    <div className="mt-6">
      {/* Compact 3x2 buttons, confined to the right column */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {([
          { id: "faq", label: "FAQ" },
          { id: "about", label: "About" },
          { id: "shipping", label: "Shipping" },
          { id: "specs", label: "Specs" },
          { id: "partners", label: "Partners" },
          { id: "support", label: "Support" },
        ] as {id: DockKey; label: string}[]).map((b) => (
          <button
            key={b.id}
            onClick={() => toggle(b.id)}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition
                        ${openKey === b.id
                          ? "bg-blue-600 text-white border-blue-500/60"
                          : "bg-zinc-950/70 text-zinc-200 border-white/10 hover:bg-zinc-900/80"}`}
            aria-pressed={openKey === b.id}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Expandable panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ${openKey ? "mt-4 max-h-[32rem]" : "max-h-0"}`}
        aria-live="polite"
      >
        <div className="rounded-3xl border border-white/10 bg-zinc-950/85 backdrop-blur p-5">
          {openKey === "faq" && <DockFAQ />}
          {openKey === "about" && <DockAbout />}
          {openKey === "shipping" && <DockShipping />}
          {openKey === "specs" && <DockSpecs />}
          {openKey === "partners" && <DockPartners />}
          {openKey === "support" && <DockSupport />}
        </div>
      </div>
    </div>
  );
}

/* Dock Content blocks */
function DockFAQ() {
  const Row = ({ q, a }: { q: string; a: string }) => (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="text-sm text-white">{q}</div>
      <div className="mt-1 text-xs text-zinc-400">{a}</div>
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">Common questions</div>
      <Row q="When does shipping start?" a="Targeting Q2 2026. Small bootstrapped team; assembled in the UK."/>
      <Row q="Do I have to pay customs?" a="Yes—customer pays customs/import duties. Instructions arrive by email."/>
      <Row q="How many units are available?" a="4,200 total across both models; no fixed cap per model."/>
      <Row q="Is Unruggable open-source?" a="Yes—hardware, firmware, and app are fully open-source."/>
    </div>
  );
}
function DockAbout() {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">What is Unruggable?</div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        A minimal, tamper-evident hardware wallet built to make Solana self-custody
        trustless, transparent, and accessible. Small bootstrapped team in the UK.
      </p>
    </div>
  );
}
function DockShipping() {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">Shipping & duties</div>
      <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-5">
        <li>Ships in 2026 (target Q2).</li>
        <li>Customs & import duties paid by you.</li>
        <li>Non-UK shipping paid by you.</li>
        <li>Address editable until production begins.</li>
      </ul>
    </div>
  );
}
function DockSpecs() {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">Specs (snapshot)</div>
      <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-5">
        <li>Models: Plastic ($42), Aluminium ($69)</li>
        <li>Open-source hardware & firmware</li>
        <li>Tamper-evident enclosure, audit-ready</li>
        <li>Solana-first; companion app open-source</li>
      </ul>
      <p className="text-[11px] text-zinc-500">Full spec sheet coming with the dev kits.</p>
    </div>
  );
}
function DockPartners() {
  // simple placeholder grid; swap with logo <img>s when you have assets
  const partners = [
    "HELIUS","PHASE LABS","RADIANTS","RAPOSA","ADRASTEA","GOJIRA",
    "The Library","SAGADAO","Solana Foundation","SolBlaze","SENTINEL","MetaDAO",
    "STACHE NODE","Hatiad3","sphere",
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Badge>Partners</Badge><span className="text-sm font-medium text-white">Validator Partners</span></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {partners.map(p => (
          <div key={p} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-zinc-200">
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
function DockSupport() {
  return (
    <div className="space-y-3 text-center">
      <div className="flex items-center justify-center gap-2"><Badge>Support</Badge></div>
      <div className="text-2xl font-semibold text-white">We’re here to help</div>
      <div className="flex items-center justify-center gap-6 pt-1">
        <a href="#" className="text-3xl">🗨️</a>
        <a href="mailto:support@example.com" className="text-3xl">✉️</a>
      </div>
    </div>
  );
}

/* ========================= Section (for post-purchase) ========================= */
function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode; }) {
  return (
    <section id={id} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 flex items-center gap-3">
        <Badge>{eyebrow}</Badge>
      </div>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-6">{title}</h2>
      {children}
    </section>
  );
}

/* ======================= Page (wired) ======================= */
export default function PreorderPage() {
  const [model, setModel] = useState<keyof typeof MODELS>("plastic");
  const [qty, setQty] = useState(1);
  const [remaining, setRemaining] = useState(INVENTORY_TOTAL);
  const [stage, setStage] = useState<"buy" | "ship" | "summary">("buy");
  const solPrice = useMockSolPrice();

  const { items, count, usdSubtotal, add, setQty: setCartQty, remove, clear } = useLocalStorageCart();

  // snapshot after "payment"
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
  const [purchasedTotal, setPurchasedTotal] = useState(0);

  // minicart sheet state
  const [cartOpen, setCartOpen] = useState(false);

  // info dock state (under BuyBox)
  const [dockOpen, setDockOpen] = useState<null | DockKey>(null);

  const handleAddSku = (sku: Sku, q: number) => add(sku, q);

  // payment uses CART and decrements inventory by units (bundle = 2)
  const simulatePayment = (_type: "crypto" | "fiat") => {
    const totalUnits = items.reduce((n, it) => n + it.qty * (it.sku === "bundle" ? 2 : 1), 0);
    if (totalUnits === 0) return;

    setRemaining((r) => Math.max(0, r - totalUnits));
    setPurchasedItems(items);
    setPurchasedTotal(usdSubtotal);
    clear();
    setStage("ship");
  };

  const shippingSubmit = () => setStage("summary");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* 1) Above-the-fold */}
      {stage === "buy" && (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950/20 via-black to-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <ModelShowcase model={model} onSwitch={setModel} />
              </div>

              {/* Right column: BuyBox + compact info buttons underneath */}
              <div className="lg:col-span-6">
                <BuyBox
                  model={model}
                  setModel={setModel}
                  qty={qty}
                  setQty={setQty}
                  solPrice={solPrice}
                  remaining={remaining}
                  onAddSku={handleAddSku}
                  onPayFromCart={() => setCartOpen(true)}
                />
                <InlineInfoDock openKey={dockOpen} setOpenKey={setDockOpen} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating checkout bar */}
      {stage === "buy" && count > 0 && (
        <CheckoutBar count={count} usdSubtotal={usdSubtotal} onOpen={() => setCartOpen(true)} />
      )}

      {/* MiniCart sheet */}
      <MiniCartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        usdSubtotal={usdSubtotal}
        solPrice={solPrice}
        onInc={(s) => setCartQty(s, (items.find(i => i.sku === s)?.qty ?? 0) + 1)}
        onDec={(s) => setCartQty(s, (items.find(i => i.sku === s)?.qty ?? 0) - 1)}
        onRemove={(s) => remove(s)}
        onClear={() => clear()}
        onPay={(t) => { setCartOpen(false); simulatePayment(t); }}
      />

      {/* 2) After payment */}
      {stage === "ship" && (
        <Section id="shipping" eyebrow="Next step" title="Shipping details">
          {/* Pick first item just for a small recap line; shipping form itself is unchanged */}
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Success! Complete shipping</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Ships in 2026. Customs/duties paid by you. Non-UK shipping paid by you. You can edit your address until production begins.
            </p>
            {/* Minimal shipping form placeholder — use your existing form here if preferred */}
          </div>
          <div className="mt-6">
            <button onClick={shippingSubmit} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5">
              Continue
            </button>
          </div>
        </Section>
      )}

      {stage === "summary" && (
        <Section id="summary" eyebrow="All set" title="Thanks for your preorder!">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold text-white">Order summary</h2>
            <div className="mt-4 rounded-2xl border border-white/10 p-4 grid gap-2">
              {purchasedItems.map((it) => (
                <div key={it.sku} className="flex items-center justify-between text-sm">
                  <div>{it.name} × {it.qty}</div>
                  <div>${(it.qty * it.unitUsd).toFixed(2)}</div>
                </div>
              ))}
              <div className="h-px bg-white/10 my-1" />
              <div className="flex items-center justify-between text-sm">
                <div>Amount</div><div className="font-medium">${purchasedTotal.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <div>Status</div><div className="text-emerald-400">Awaiting Production</div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Footer only */}
      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-zinc-400"><span className="text-xl">🐸</span><span>© {new Date().getFullYear()} Unruggable</span></div>
          <div className="flex items-center gap-6 text-sm text-zinc-400 justify-start md:justify-end">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Refund policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
