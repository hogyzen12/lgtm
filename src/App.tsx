import React, { useEffect, useMemo, useState } from "react";

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
    // GLB (interactive 3D)
    { id: "p3", type: "model", src: "/media/plastic/unit.glb",   alt: "Interactive 3D model", poster: "/media/plastic/hero-1.jpg" },
  ],
  aluminium: [
    { id: "a1", type: "image", src: "/media/aluminium/hero-1.jpg", alt: "Aluminium – front" },
    { id: "a2", type: "video", src: "/media/aluminium/spin.mp4",   alt: "Aluminium 360°" },
    { id: "a3", type: "image", src: "/media/aluminium/detail-cnc.jpg", alt: "CNC detail" },
  ],
};

const INVENTORY_TOTAL = 4200; // single shared pool

function useMockSolPrice() {
  // Replace with lightweight quote: fetch your endpoint.
  const [solPrice, setSolPrice] = useState(200); // USD per SOL (mock)
  useEffect(() => {
    const id = setInterval(() => {
      setSolPrice((p) => Math.max(5, +(p + (Math.random() - 0.5) * 0.6).toFixed(2)));
    }, 4000);
    return () => clearInterval(id);
  }, []);
  return solPrice;
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30">
    {children}
  </span>
);

function Progress({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
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
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#about" className="text-zinc-300 hover:text-white">About</a>
          <a href="#faq" className="text-zinc-300 hover:text-white">FAQ</a>
          <a href="#support" className="text-zinc-300 hover:text-white">Support</a>
        </nav>
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
  const [userPaused, setUserPaused] = useState(false); // only for videos
  const [isVisible, setIsVisible] = useState(true);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const next = () => setIndex((i) => (i + 1) % items.length);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  // Respect reduced motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setIsReducedMotion(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const active = items[index];

  // Observe visibility to auto-pause when carousel is off-screen
  useEffect(() => {
    if (!stageRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setIsVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0.2 }
    );
    io.observe(stageRef.current);
    return () => io.disconnect();
  }, []);

  // Auto-advance with per-item dwell; pause on hover/drag/offscreen; respect userPaused for videos
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

  // Control video playback to save battery
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const shouldPlay = isVisible && !isHover && !isDragging && !userPaused;
    if (shouldPlay) {
      vid.play().catch(() => {/* ignore autoplay errors */});
    } else {
      vid.pause();
    }
  }, [active, isVisible, isHover, isDragging, userPaused]);

  // Touch + mouse drag handling
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
            // Only rotate while visible and not interacting
            {...(isVisible && !isHover && !isDragging ? { "auto-rotate": "" } : {})}
            shadow-intensity={0.8}
            exposure={0.9}
            ar
            style={{ width: "100%", height: "100%", background: "transparent", display: "block" }}
          />
        )}

        {/* Play/Pause overlay for videos */}
        {showPlayButton && (
          <button
            onClick={() => setUserPaused((p) => !p)}
            className="absolute left-4 bottom-4 rounded-full bg-black/60 px-3 py-2 text-white text-sm backdrop-blur border border-white/10"
          >
            {isVideoPlaying ? "❚❚ Pause" : "▶ Play"}
          </button>
        )}

        {/* Nav controls */}
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

      {/* Thumbnails */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => {
              setIndex(i);
              setUserPaused(false); // reset manual pause when switching slides
            }}
            className={`aspect-[4/3] overflow-hidden rounded-xl ring-1 ${i === index ? "ring-blue-500" : "ring-white/10"}`}
            title={it.alt}
          >
            {it.type === "image" && (
              <img loading="lazy" src={it.src} alt="" className="h-full w-full object-cover" />
            )}
            {it.type === "video" && (
              <div className="h-full w-full grid place-items-center bg-black/60">
                <span className="text-xs text-white/80">360°</span>
              </div>
            )}
            {it.type === "model" && (
              <div className="h-full w-full grid place-items-center bg-black/60">
                <span className="text-xs text-white/90">3D</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
/* ================================================================ */

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

function BuyBox({
  model, setModel, qty, setQty, solPrice, remaining, onPay,
}: {
  model: keyof typeof MODELS;
  setModel: (m: keyof typeof MODELS) => void;
  qty: number;
  setQty: (n: number) => void;
  solPrice: number;
  remaining: number;
  onPay: (type: "crypto" | "fiat") => void;
}) {
  const usd = MODELS[model].usd;
  const sol = usd / solPrice;
  return (
    <div id="buy" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl">
      <div className="mb-2"><Badge>Pre-Order</Badge></div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">Unruggable Unit ONE</h1>
      <p className="text-zinc-300 mb-6">Choose model → set quantity → pay. That’s it.</p>

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
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 grid place-items-center rounded-xl bg-white/5">−</button>
          <span className="w-10 text-center">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="h-9 w-9 grid place-items-center rounded-xl bg-white/5">+</button>
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

      {/* Payment buttons */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <button onClick={() => onPay("crypto")} className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 font-medium shadow-lg shadow-blue-600/25">
          Buy with SOL / USDC
          <div className="text-xs text-blue-100/90">via HelioPay · token selectable</div>
        </button>
        <button onClick={() => onPay("fiat")} className="rounded-2xl bg-white text-black px-4 py-3 font-medium">
          Card / Apple Pay
          <div className="text-xs text-black/70">via Coinflow</div>
        </button>
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

function SuccessForm({ model, qty, usdTotal, onSubmit }: { model: keyof typeof MODELS; qty: number; usdTotal: number; onSubmit: (form: any) => void; }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", address: "", city: "", region: "", zip: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold text-white">Success! Complete shipping</h2>
      <p className="text-sm text-zinc-400 mt-1">
        Ships in 2026. Customs/duties paid by you. Non-UK shipping paid by you. You can edit your address until production begins.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="Full name" value={form.name} onChange={(e)=>set("name",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="Email" value={form.email} onChange={(e)=>set("email",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="Phone (optional)" value={form.phone} onChange={(e)=>set("phone",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="Country" value={form.country} onChange={(e)=>set("country",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3 md:col-span-2" placeholder="Address" value={form.address} onChange={(e)=>set("address",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="City" value={form.city} onChange={(e)=>set("city",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="State/Region" value={form.region} onChange={(e)=>set("region",e.target.value)} />
        <input className="rounded-xl bg-black/50 border border-white/10 p-3" placeholder="ZIP" value={form.zip} onChange={(e)=>set("zip",e.target.value)} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-zinc-400">Order: {MODELS[model].name} × {qty} — ${usdTotal}</div>
        <button onClick={() => onSubmit(form)} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5">Submit</button>
      </div>
    </div>
  );
}

function OrderSummary({ model, qty, usdTotal }: { model: keyof typeof MODELS; qty: number; usdTotal: number; }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold text-white">Order summary</h2>
      <div className="mt-4 rounded-2xl border border-white/10 p-4">
        <div className="flex items-center justify-between text-sm">
          <div>Model(s)</div><div>{MODELS[model].name}</div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <div>Quantity</div><div>{qty}</div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <div>Amount</div><div>${usdTotal}</div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <div>Status</div><div className="text-emerald-400">Awaiting Production</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="rounded-xl bg-white/10 px-4 py-2 border border-white/15">Edit address</button>
        <button className="rounded-xl bg-white/10 px-4 py-2 border border-white/15">Follow updates</button>
        <button className="rounded-xl bg-blue-600 px-4 py-2">Claim soulbound NFT (optional)</button>
      </div>
    </div>
  );
}

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

export default function PreorderPage() {
  const [model, setModel] = useState<keyof typeof MODELS>("plastic");
  const [qty, setQty] = useState(1);
  const [remaining, setRemaining] = useState(INVENTORY_TOTAL);
  const [stage, setStage] = useState<"buy" | "ship" | "summary">("buy");
  const solPrice = useMockSolPrice();

  const usdTotal = useMemo(() => MODELS[model].usd * qty, [model, qty]);

  const simulatePayment = (_type: "crypto" | "fiat") => {
    setRemaining((r) => Math.max(0, r - qty));
    setStage("ship");
  };

  const shippingSubmit = () => setStage("summary");

  const FloatingCheckout = () => (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[28rem] z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Total</p>
            <p className="text-2xl font-semibold text-white">${usdTotal}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => simulatePayment("crypto")} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm font-medium">SOL / USDC</button>
            <button onClick={() => simulatePayment("fiat")} className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium">Card</button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
          <span>Qty: {qty}</span>
          <span>•</span>
          <span>{MODELS[model].name}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* 1) Above-the-fold */}
      {stage === "buy" && (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950/20 via-black to-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <ModelShowcase model={model} onSwitch={setModel} />
              </div>
              <div className="lg:col-span-6">
                <BuyBox
                  model={model}
                  setModel={setModel}
                  qty={qty}
                  setQty={setQty}
                  solPrice={solPrice}
                  remaining={remaining}
                  onPay={simulatePayment}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {stage === "buy" && <FloatingCheckout />}

      {/* 2) After payment */}
      {stage === "ship" && (
        <Section id="shipping" eyebrow="Next step" title="Shipping details">
          <SuccessForm model={model} qty={qty} usdTotal={usdTotal} onSubmit={shippingSubmit} />
        </Section>
      )}

      {stage === "summary" && (
        <Section id="summary" eyebrow="All set" title="Thanks for your preorder!">
          <OrderSummary model={model} qty={qty} usdTotal={usdTotal} />
        </Section>
      )}

      {/* 3) Below-the-fold */}
      <Section id="about" eyebrow="About" title="What is Unruggable?">
        <div className="max-w-3xl text-zinc-300 leading-relaxed">
          <p>Unruggable is a minimal, tamper-evident hardware wallet built by a small bootstrapped team in the UK. Our mission is to make Solana self-custody trustless, transparent, and accessible to everyone.</p>
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 p-5">
            <h4 className="text-white font-medium">When does shipping start?</h4>
            <p className="mt-2 text-sm text-zinc-400">Shipping begins in 2026 (targeting Q2). We’re a small, bootstrapped team, and all units are assembled in the UK. We’ll post regular progress updates.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h4 className="text-white font-medium">Do I have to pay customs?</h4>
            <p className="mt-2 text-sm text-zinc-400">Yes, all customs and import duties are paid by the customer. You’ll receive instructions to the email provided at checkout.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h4 className="text-white font-medium">How many units are available?</h4>
            <p className="mt-2 text-sm text-zinc-400">There are 4,200 total units available across both models in our first production wave. There’s no fixed cap per model.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h4 className="text-white font-medium">Is Unruggable open-source?</h4>
            <p className="mt-2 text-sm text-zinc-400">Yes. Hardware, firmware, and companion app are fully open-source for transparency and trust.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h4 className="text-white font-medium">Do you have customer support?</h4>
            <p className="mt-2 text-sm text-zinc-400">Yes, ticket-based support in Discord, available to verified buyers.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h4 className="text-white font-medium">Why are prices $42 and $69?</h4>
            <p className="mt-2 text-sm text-zinc-400">We want self-custody to be accessible and, let’s be honest—memes.</p>
          </div>
        </div>
      </Section>

      <Section id="support" eyebrow="Support" title="We’re here to help">
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
          <a className="rounded-xl border border-white/15 px-4 py-2 hover:border-white/25" href="#">Open Discord</a>
          <a className="rounded-xl border border-white/15 px-4 py-2 hover:border-white/25" href="#">Email support</a>
        </div>
      </Section>

      {/* 4) Legal footer */}
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
