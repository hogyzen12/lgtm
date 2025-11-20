import React, { useEffect, useState, useRef } from "react";
import HelioPayModal, { type HelioPayMethod } from "../components/HelioPayModal";

/** ------------------------------------------------------------------
 * ModelViewer wrapper (fixes TS2339 without .d.ts or peer deps)
 * ------------------------------------------------------------------ */
const ModelViewer: React.FC<any> = (props) =>
  React.createElement("model-viewer" as any, props);

// --- Config ---
const MODELS = {
  plastic: { name: "Plastic", usd: 42, originalUsd: 69 },
  aluminium: { name: "Aluminium", usd: 69, originalUsd: 99 },
} as const;

// Media assets per model
type MediaItem =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "video"; src: string; alt: string }
  | { id: string; type: "model"; src: string; alt: string; poster?: string };

const MEDIA: Record<keyof typeof MODELS | "bundle", MediaItem[]> = {
  plastic: [
    { id: "p1", type: "video", src: "/media/plastic/reveal.mp4", alt: "Plastic reveal" },
    { id: "p2", type: "video", src: "/media/plastic/spin.mp4", alt: "Plastic 360° spin" },
    { id: "p3", type: "model", src: "/media/plastic/unit.glb", alt: "Interactive 3D model", poster: "/media/plastic/frontplastic.webp" },
    { id: "p4", type: "image", src: "/media/plastic/frontplastic.webp", alt: "Plastic front view" },
    { id: "p5", type: "image", src: "/media/plastic/rightplastic.webp", alt: "Plastic side view" },
    { id: "p6", type: "image", src: "/media/plastic/usbplastic.webp", alt: "Plastic USB-C port" },
  ],
  aluminium: [
    { id: "a1", type: "video", src: "/media/aluminium/reveal.mp4", alt: "Aluminium reveal" },
    { id: "a2", type: "model", src: "/media/aluminium/unit.glb", alt: "Interactive 3D model", poster: "/media/aluminium/usbalu.webp" },
    { id: "a3", type: "image", src: "/media/aluminium/usbalu.webp", alt: "Aluminium USB-C port" },
  ],
  bundle: [
    { id: "b1", type: "image", src: "/media/bundle/bundle_1.webp", alt: "Bundle - both models" },
    { id: "b2", type: "image", src: "/media/bundle/bundle_2.webp", alt: "Bundle - side by side" },
  ],
};

// --- Real SOL Price from Jupiter ---
function useSolPrice() {
  const [solPrice, setSolPrice] = useState(147); // Default fallback price
  
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112'
        );
        const data = await response.json();
        const solData = data['So11111111111111111111111111111111111111112'];
        if (solData && solData.usdPrice) {
          setSolPrice(Number(solData.usdPrice.toFixed(2)));
        }
      } catch (error) {
        console.error('Failed to fetch SOL price:', error);
        // Keep using the current price on error
      }
    };

    // Fetch immediately
    fetchPrice();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return solPrice;
}

// --- UI atoms ---
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-500/30">
    {children}
  </span>
);

function Navbar() {
  const tickerText = "UNRUGGABLE - THE HARDWARE WALLET ENGINEERED FOR SOLANA - LIMITED EDITION INITIAL RUN - POWERED BY SOLANA - SHIPPING Q2 2026 - PRE ORDER NOW";
  
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-white/10 bg-black/50">
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-animate {
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-animate:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo Left - Responsive */}
        <a href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
          <img src="/unruggable_mobile.svg" alt="Unruggable" className="h-5 sm:hidden" />
          <img src="/logo.svg" alt="Unruggable" className="hidden sm:block h-6" />
        </a>
        
        {/* Scrolling Ticker Center */}
        <div className="flex-1 overflow-hidden relative min-w-0">
          <div className="flex ticker-animate whitespace-nowrap">
            <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">{tickerText}</span>
            <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">{tickerText}</span>
          </div>
        </div>
        
        {/* Solana Logo Right - Responsive */}
        <div className="flex items-center flex-shrink-0">
          <img src="/solana_mobile.svg" alt="Powered by Solana" className="h-5 sm:hidden" />
          <img src="/solanaLogo.svg" alt="Powered by Solana" className="hidden sm:block h-6" />
        </div>
      </div>
    </header>
  );
}

/* =================== Static Solana-style border card (no animation) =================== */
function SolanaStaticRing({
  children,
  className = "rounded-3xl",
  padding = 24,
  thickness = 2,
  halo = true,
  variant = "solana",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: number;
  thickness?: number;
  halo?: boolean;
  variant?: "solana" | "aluminum";
}) {
  const ring = `${thickness}px`;
  
  const gradients = {
    solana: {
      ring: "conic-gradient(from 0deg,#9945FF 0%,#8752F3 12%,#5497D5 24%,#43B4CA 36%,#39D0D8 50%,#2CE3A2 64%,#94F7C5 78%,#9945FF 100%)",
      halo: "conic-gradient(from 0deg, rgba(153,69,255,.8), rgba(135,82,243,.7), rgba(84,151,213,.6), rgba(67,180,202,.6), rgba(57,208,216,.6), rgba(44,227,162,.6), rgba(148,247,197,.6), rgba(153,69,255,.8))"
    },
    aluminum: {
      ring: "conic-gradient(from 0deg, #a8a8a8 0%, #d4d4d4 12%, #e5e5e5 24%, #f5f5f5 36%, #ffffff 50%, #f5f5f5 64%, #d4d4d4 78%, #a8a8a8 100%)",
      halo: "conic-gradient(from 0deg, rgba(168,168,168,.6), rgba(212,212,212,.5), rgba(229,229,229,.4), rgba(245,245,245,.4), rgba(255,255,255,.5), rgba(245,245,245,.4), rgba(212,212,212,.5), rgba(168,168,168,.6))"
    }
  };

  const currentGradient = gradients[variant];
  
  return (
    <div className={`relative ${className}`}>
      <style>{`
        .ssr-base { position:absolute; inset:0; border-radius:inherit; border:1px solid rgba(255,255,255,0.10); pointer-events:none; }
        .ssr-ring-${variant} {
          position:absolute; inset:0; border-radius:inherit; padding:${ring};
          background: ${currentGradient.ring};
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none;
        }
        .ssr-halo-${variant} {
          position:absolute; inset:-12px; border-radius:inherit; padding:${ring};
          background: ${currentGradient.halo};
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; filter: blur(18px); opacity:.22; pointer-events:none;
        }
      `}</style>
      <div className="ssr-base" aria-hidden />
      <div className={`ssr-ring-${variant}`} aria-hidden />
      {halo && <div className={`ssr-halo-${variant}`} aria-hidden />}
      <div className="relative rounded-[inherit] bg-white/5 border border-white/10 backdrop-blur" style={{ padding }}>
        {children}
      </div>
    </div>
  );
}

/* =================== Media Carousel =================== */
function MediaCarousel({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
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
    const io = new IntersectionObserver((entries) => setIsVisible(entries[0]?.isIntersecting ?? true), { threshold: 0.2 });
    io.observe(stageRef.current);
    return () => io.disconnect();
  }, []);

  // Video ended handler - transition to next when video completes
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || active.type !== "video") return;
    
    const handleEnded = () => {
      if (!userPaused) next();
    };
    
    vid.addEventListener('ended', handleEnded);
    return () => vid.removeEventListener('ended', handleEnded);
  }, [active, userPaused, index]);

  // Auto-advance for non-video items
  useEffect(() => {
    if (isReducedMotion || items.length <= 1) return;
    if (!isVisible || isDragging) return;
    if (active.type === "video") return; // Videos handle their own transition via 'ended' event

    const delay = active.type === "model" ? 16000 : 6000;
    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [index, items, isReducedMotion, isDragging, isVisible, active]);

  // Video playback control - autoplay unless user paused
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const shouldPlay = isVisible && !isDragging && !userPaused;
    if (shouldPlay) void vid.play().catch(() => {});
    else vid.pause();
  }, [active, isVisible, isDragging, userPaused]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { setTouchStartX(e.touches[0].clientX); setIsDragging(true); };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX != null) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > 40) prev();
      if (dx < -40) next();
    }
    setTouchStartX(null); setIsDragging(false);
  };

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);

  const showPlayButton = active.type === "video";
  const isVideoPlaying = showPlayButton && !(userPaused || isDragging || !isVisible);

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800/60 p-3 shadow-2xl">
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: "4 / 5" }}
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
            playsInline
            onClick={() => setUserPaused((p) => !p)}
          />
        )}
        {active.type === "model" && (
          <ModelViewer
            src={active.src}
            poster={(active as any).poster}
            camera-controls
            {...(isVisible && !isDragging ? { "auto-rotate": "" } : {})}
            shadow-intensity={0.8}
            exposure={0.9}
            ar
            style={{ width: "100%", height: "100%", background: "transparent", display: "block" }}
          />
        )}

        {showPlayButton && (
          <button
            onClick={() => setUserPaused((p) => !p)}
            className="absolute left-4 bottom-4 rounded-full bg-black/60 px-3 py-2 text-white text-sm backdrop-blur border border-white/10 pointer-events-auto"
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
        {items.map((it, i) => {
          // Get thumbnail for each media type
          const getThumbnail = () => {
            if (it.type === "image") {
              return <img loading="lazy" src={it.src} alt="" className="h-full w-full object-cover" />;
            }
            if (it.type === "video") {
              // Use first frame or a representative image
              return (
                <div className="relative h-full w-full">
                  <video src={it.src} className="h-full w-full object-cover" muted />
                  <div className="absolute inset-0 bg-black/40 grid place-items-center">
                    <span className="text-xs text-white/90 font-medium">▶ Video</span>
                  </div>
                </div>
              );
            }
            if (it.type === "model" && (it as any).poster) {
              return (
                <div className="relative h-full w-full">
                  <img loading="lazy" src={(it as any).poster} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 grid place-items-center">
                    <span className="text-xs text-white/90 font-medium">3D Model</span>
                  </div>
                </div>
              );
            }
            return <div className="h-full w-full grid place-items-center bg-black/60"><span className="text-xs text-white/90">3D</span></div>;
          };

          return (
            <button
              key={it.id}
              onClick={() => { setIndex(i); setUserPaused(false); }}
              className={`aspect-[4/3] overflow-hidden rounded-xl ring-1 ${i === index ? "ring-zinc-400" : "ring-white/10"}`}
              title={it.alt}
            >
              {getThumbnail()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ======================= Cart system (with bundle SKU) ======================= */
type Sku = "plastic" | "aluminium" | "bundle";

const SHIPPING_FEE = 10;
const FREE_SHIPPING_DEVICE_COUNT = 3;

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

// Calculate total device count (bundles count as 2 devices)
function getTotalDeviceCount(items: CartItem[]): number {
  return items.reduce((total, item) => {
    if (item.sku === "bundle") {
      return total + (item.qty * 2); // Bundle = 2 devices
    }
    return total + item.qty; // Individual device = 1 device
  }, 0);
}

// Calculate shipping fee based on cart contents
function calculateShipping(items: CartItem[]): number {
  const deviceCount = getTotalDeviceCount(items);
  
  // Free shipping for 3+ devices
  if (deviceCount >= FREE_SHIPPING_DEVICE_COUNT) return 0;
  
  return SHIPPING_FEE;
}

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
      return { ...c, [sku]: { sku, name: SKU_NAMES[sku], unitUsd: SKU_PRICES[sku], qty: nextQty } };
    });

  const setQty = (sku: Sku, qty: number) =>
    setCart((c) => {
      if (qty <= 0) {
        const { [sku]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [sku]: { sku, name: SKU_NAMES[sku], unitUsd: SKU_PRICES[sku], qty } };
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
  const shipping = calculateShipping(items);
  const total = usdSubtotal + shipping;
  const deviceCount = getTotalDeviceCount(items);

  return { cart, setCart, add, setQty, remove, clear, items, count, usdSubtotal, shipping, total, deviceCount };
}

/* =================== Showcase / Selectors =================== */
function ModelShowcase({ model }: { model: keyof typeof MODELS | "bundle" }) {
  const items = MEDIA[model] ?? [];
  return (
    <div className="relative">
      <MediaCarousel items={items} />
    </div>
  );
}

/* ===================== Compact Media Carousel for Cards ===================== */
function CompactMediaCarousel({ modelKey }: { modelKey: keyof typeof MODELS | "bundle" }) {
  const media = MEDIA[modelKey];
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = media[currentIndex];
  const hasMultiple = media.length > 1;

  const goNext = () => setCurrentIndex((currentIndex + 1) % media.length);
  const goPrev = () => setCurrentIndex((currentIndex - 1 + media.length) % media.length);

  useEffect(() => {
    if (current.type === "video" && videoRef.current) {
      videoRef.current.play();
    }
  }, [currentIndex, current.type]);

  const handleVideoEnd = () => {
    if (hasMultiple) goNext();
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-zinc-900">
      {current.type === "image" && (
        <img src={current.src} alt={current.alt} className="w-full h-full object-cover" />
      )}
      {current.type === "video" && (
        <video
          ref={videoRef}
          src={current.src}
          className="w-full h-full object-cover cursor-pointer"
          playsInline
          muted
          onEnded={handleVideoEnd}
          onClick={handleVideoClick}
        />
      )}
      {current.type === "model" && (
        <ModelViewer
          src={current.src}
          alt={current.alt}
          auto-rotate=""
          camera-controls=""
          poster={(current as any).poster}
          shadow-intensity="0.8"
          exposure="0.9"
          style={{ width: "100%", height: "100%", background: "transparent", display: "block" }}
        />
      )}

      {hasMultiple && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition z-10"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition z-10"
            aria-label="Next"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  i === currentIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ========================= Buy Box ========================= */
function BuyBox({
  model,
  setModel,
  solPrice,
  cartTotal,
  onAddSku,
  onOpenCart,
}: {
  model: keyof typeof MODELS | "bundle";
  setModel: (m: keyof typeof MODELS | "bundle") => void;
  solPrice: number;
  cartTotal: number;
  onAddSku: (sku: Sku, qty: number) => void;
  onOpenCart: () => void;
}) {
  const [plasticQty, setPlasticQty] = useState(1);
  const [aluminiumQty, setAluminiumQty] = useState(1);
  const [bundleQty, setBundleQty] = useState(1);

  return (
    <div id="buy">
      <div className="mb-4 hidden sm:block">
        <Badge>Pre-Order</Badge>
      </div>
      <h1 className="hidden sm:block text-3xl md:text-4xl font-semibold tracking-tight text-white mb-1.5">
        Unruggable {model === "aluminium" ? "A1" : model === "plastic" ? "S1" : "Bundle"}
      </h1>
      <p className="hidden sm:block text-zinc-300 mb-6">Choose model → set quantity → add to basket.</p>

      {/* Model Cards */}
      <div className="grid gap-4 mb-6">
        {/* Aluminium Model Card */}
        <button
          onClick={() => setModel("aluminium")}
          className={`text-left transition-all ${model === "aluminium" ? "ring-2 ring-zinc-400 rounded-3xl" : "rounded-3xl"}`}
        >
        <SolanaStaticRing className="rounded-3xl" thickness={2} variant="aluminum">
            <div className="grid sm:grid-cols-2 gap-4">
            {/* Image - Desktop: static image, Mobile: carousel */}
            <div className="hidden sm:block aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <img src="/media/aluminium/usbalu.webp" alt="Aluminium Model" className="w-full h-full object-cover" />
            </div>
            <div className="sm:hidden">
              <CompactMediaCarousel modelKey="aluminium" />
            </div>

            {/* Info and Controls */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Aluminium</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-zinc-400">${MODELS.aluminium.usd}</span>
                  <span className="text-lg text-zinc-500 line-through">${MODELS.aluminium.originalUsd}</span>
                  <span className="rounded-full bg-zinc-400/20 px-2 py-0.5 text-xs font-semibold text-zinc-300">Save ${MODELS.aluminium.originalUsd - MODELS.aluminium.usd}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">≈ {(MODELS.aluminium.usd / solPrice).toFixed(3)} SOL · {MODELS.aluminium.usd} USDC</p>
              </div>

              {/* Quantity and Add */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 p-2">
                    <button aria-label="Decrease" onClick={() => setAluminiumQty(Math.max(1, aluminiumQty - 1))} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5">−</button>
                    <span className="w-8 text-center">{aluminiumQty}</span>
                    <button aria-label="Increase" onClick={() => setAluminiumQty(aluminiumQty + 1)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5">+</button>
                  </div>
                  <button
                    onClick={() => onAddSku("aluminium", aluminiumQty)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white px-4 py-2.5 font-medium shadow-lg shadow-zinc-600/25"
                  >
                    Add to Basket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SolanaStaticRing>
        </button>

        {/* Plastic Model Card */}
        <button
          onClick={() => setModel("plastic")}
          className={`text-left transition-all ${model === "plastic" ? "ring-2 ring-zinc-400 rounded-3xl" : "rounded-3xl"}`}
        >
        <SolanaStaticRing className="rounded-3xl" thickness={2} variant="solana">
            <div className="grid sm:grid-cols-2 gap-4">
            {/* Image - Desktop: static image, Mobile: carousel */}
            <div className="hidden sm:block aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <img src="/media/plastic/frontplastic.webp" alt="Plastic Model" className="w-full h-full object-cover" />
            </div>
            <div className="sm:hidden">
              <CompactMediaCarousel modelKey="plastic" />
            </div>

            {/* Info and Controls */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Plastic (S1)</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-zinc-400">${MODELS.plastic.usd}</span>
                  <span className="text-lg text-zinc-500 line-through">${MODELS.plastic.originalUsd}</span>
                  <span className="rounded-full bg-zinc-400/20 px-2 py-0.5 text-xs font-semibold text-zinc-300">Save ${MODELS.plastic.originalUsd - MODELS.plastic.usd}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">≈ {(MODELS.plastic.usd / solPrice).toFixed(3)} SOL · {MODELS.plastic.usd} USDC</p>
              </div>

              {/* Quantity and Add */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 p-2">
                    <button aria-label="Decrease" onClick={() => setPlasticQty(Math.max(1, plasticQty - 1))} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5">−</button>
                    <span className="w-8 text-center">{plasticQty}</span>
                    <button aria-label="Increase" onClick={() => setPlasticQty(plasticQty + 1)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5">+</button>
                  </div>
                  <button
                    onClick={() => onAddSku("plastic", plasticQty)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white px-4 py-2.5 font-medium shadow-lg shadow-zinc-600/25"
                  >
                    Add to Basket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SolanaStaticRing>
        </button>

        {/* Bundle Model Card */}
        <button
          onClick={() => setModel("bundle")}
          className={`text-left transition-all ${model === "bundle" ? "ring-2 ring-amber-400" : ""}`}
        >
          <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Image - Desktop: static image, Mobile: carousel */}
              <div className="hidden sm:block aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-amber-400/30">
                <img src="/media/bundle/bundle_1.webp" alt="Bundle" className="w-full h-full object-cover" />
              </div>
              <div className="sm:hidden">
                <CompactMediaCarousel modelKey="bundle" />
              </div>

              {/* Info and Controls */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Bundle</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-amber-300">$99</span>
                    <span className="text-lg text-zinc-500 line-through">$168</span>
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-200">Save $69</span>
                  </div>
                  <p className="text-sm text-amber-200/70 mb-3">1× Aluminium A1 + 1× Plastic P0</p>
                </div>

                {/* Quantity and Add */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 rounded-xl border border-amber-400/30 p-2">
                      <button aria-label="Decrease" onClick={(e) => { e.stopPropagation(); setBundleQty(Math.max(1, bundleQty - 1)); }} className="h-8 w-8 grid place-items-center rounded-lg bg-amber-400/10">−</button>
                      <span className="w-8 text-center">{bundleQty}</span>
                      <button aria-label="Increase" onClick={(e) => { e.stopPropagation(); setBundleQty(bundleQty + 1); }} className="h-8 w-8 grid place-items-center rounded-lg bg-amber-400/10">+</button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddSku("bundle", bundleQty); }}
                      className="flex-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 font-semibold shadow"
                    >
                      Add to Basket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Checkout Button */}
      <style>{`
        @keyframes gradient-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .checkout-button {
          background: rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }
        .checkout-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(153,69,255,0.8),
            rgba(84,151,213,0.8),
            rgba(67,180,202,0.8),
            rgba(57,208,216,0.8),
            rgba(44,227,162,0.8),
            transparent
          );
          transition: left 0.6s ease-out;
        }
        .checkout-button:hover::before {
          left: 100%;
        }
        .checkout-button:hover {
          background: linear-gradient(
            270deg,
            #9945FF,
            #8752F3,
            #5497D5,
            #43B4CA,
            #39D0D8,
            #2CE3A2,
            #94F7C5
          );
          background-size: 400% 400%;
          animation: gradient-wave 2s ease infinite;
          border-color: rgba(153,69,255,0.5);
        }
      `}</style>
      <button
        onClick={onOpenCart}
        className="checkout-button w-full rounded-2xl text-white px-4 py-3 font-medium border border-white/15 mb-4 transition-all duration-300"
      >
        <div className="relative z-10">
          <div className="font-semibold">Go to Checkout{cartTotal > 0 ? ` • $${cartTotal}` : ''}</div>
          <div className="text-xs text-white/90">Powered by Solana</div>
        </div>
      </button>

      <p className="text-xs text-zinc-400 text-center">
        Expected to ship by Q2 2026 · Customs & duties paid by you.
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
  const imageSrc = item.sku === "plastic" 
    ? "/media/plastic/frontplastic.webp" 
    : item.sku === "aluminium" 
    ? "/media/aluminium/usbalu.webp" 
    : "/media/bundle/bundle_1.webp";
  
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl overflow-hidden ring-1 ring-white/10 flex-shrink-0">
          <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
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
  total,
  deviceCount,
  shipping,
  onOpen,
}: {
  count: number;
  total: number;
  deviceCount: number;
  shipping: number;
  onOpen: () => void;
}) {
  const devicesNeeded = FREE_SHIPPING_DEVICE_COUNT - deviceCount;
  const hasShipping = shipping > 0;

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
            <div className="h-9 w-9 rounded-xl bg-white/10 p-2">
              <img src="/cart.svg" alt="Cart" className="w-full h-full brightness-0 invert" />
            </div>
            <div className="text-left">
              <p className="text-sm text-zinc-400">Basket • {count} item{count !== 1 ? "s" : ""}</p>
              <p className="text-lg font-semibold text-white">${total}</p>
              {hasShipping && devicesNeeded > 0 ? (
                <p className="text-xs text-amber-400 mt-0.5">$10 shipping • Add {devicesNeeded} more device{devicesNeeded !== 1 ? 's' : ''} for free shipping</p>
              ) : shipping === 0 && deviceCount > 0 ? (
                <p className="text-xs text-zinc-400 mt-0.5">Free shipping included!</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 px-4 py-2 text-sm text-white">Review & Checkout</div>
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
  shipping,
  deviceCount,
  solPrice,
  onInc,
  onDec,
  onRemove,
  onClear,
  onOpenHelio,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  usdSubtotal: number;
  shipping: number;
  deviceCount: number;
  solPrice: number;
  onInc: (s: Sku) => void;
  onDec: (s: Sku) => void;
  onRemove: (s: Sku) => void;
  onClear: () => void;
  onOpenHelio: (t: HelioPayMethod) => void;
}) {
  const total = usdSubtotal + shipping;
  const devicesNeeded = FREE_SHIPPING_DEVICE_COUNT - deviceCount;
  const showFreeShippingMessage = shipping > 0 && devicesNeeded > 0;

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
      {/* sheet with static Solana ring */}
      <div className="relative mx-auto max-w-2xl px-3 pb-3">
        <SolanaStaticRing className="rounded-t-3xl rounded-b-3xl md:rounded-3xl" padding={16} thickness={2} variant="aluminum">
          <div className="p-2 md:p-2">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-white/15 mb-3" />
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Your Basket</h3>
              <div className="flex items-center gap-3">
                <button onClick={onClear} className="text-xs text-zinc-300 hover:text-white">Clear</button>
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

            {/* Free Shipping Incentive */}
            {showFreeShippingMessage && (
              <div className="mt-4 rounded-2xl border border-zinc-400/30 bg-zinc-500/10 p-3">
                <div className="text-sm text-zinc-300 font-medium">
                  Add {devicesNeeded} more device{devicesNeeded !== 1 ? 's' : ''} for free shipping!
                </div>
                <div className="text-xs text-zinc-200/70 mt-1">
                  Free shipping on 3+ devices (bundles count as 2)
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="mt-4 rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Subtotal</span>
                <span className="text-white font-medium">${usdSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-zinc-300">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-zinc-400 font-medium">FREE</span>
                ) : (
                  <span className="text-white font-medium">${shipping}</span>
                )}
              </div>
              {shipping === 0 && (
                <div className="text-xs text-zinc-300 mt-1">Free shipping on {deviceCount} devices!</div>
              )}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-semibold">${total}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1 text-zinc-400">
                <span>≈</span>
                <span>{(total / solPrice).toFixed(3)} SOL · pays in USDC or SOL</span>
              </div>
            </div>

            {/* Pay actions -> open Helio */}
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => onOpenHelio("crypto")}
                disabled={items.length === 0}
                className="rounded-2xl bg-gradient-to-r from-zinc-600 to-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:from-zinc-500 hover:to-zinc-600 text-white px-4 py-3 font-medium shadow-lg shadow-zinc-600/25"
              >
                Buy with SOL / USDC
                <div className="text-xs text-zinc-100/90">via Helio</div>
              </button>
              <button
                onClick={() => onOpenHelio("fiat")}
                disabled={items.length === 0}
                className="rounded-2xl bg-white disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-3 font-medium"
              >
                Card / Apple Pay
                <div className="text-xs text-black/70">via Helio</div>
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Expected to ship by Q2 2026 · Customs & duties paid by you.
            </p>
          </div>
        </SolanaStaticRing>
      </div>
    </div>
  );
}

/* ===================== Inline Info Dock (6 buttons) ===================== */
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
                          ? "bg-gradient-to-r from-zinc-600 to-zinc-700 text-white border-zinc-500/60"
                          : "bg-zinc-950/70 text-zinc-200 border-white/10 hover:bg-zinc-900/80"}`}
              aria-pressed={openKey === b.id}
            >
            {b.label}
          </button>
        ))}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${openKey ? "mt-4 max-h-[32rem]" : "max-h-0"}`}
        aria-live="polite"
      >
        {openKey && (
          <SolanaStaticRing className="rounded-3xl" padding={20} thickness={2}>
            {openKey === "faq" && <DockFAQ />}
            {openKey === "about" && <DockAbout />}
            {openKey === "shipping" && <DockShipping />}
            {openKey === "specs" && <DockSpecs />}
            {openKey === "partners" && <DockPartners />}
            {openKey === "support" && <DockSupport />}
          </SolanaStaticRing>
        )}
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
      <Row q="When does shipping start?" a="Expected to ship by Q2 2026. Small bootstrapped team; assembled in the UK."/>
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
        <li>Expected to ship by Q2 2026.</li>
        <li>Customs & import duties paid by you.</li>
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
        <li>Models: Plastic ($69 → $42), Aluminium ($99 → $69)</li>
        <li>Connection: USB-C for universal compatibility</li>
        <li>Compatible with iOS, macOS, Windows, Linux, Android</li>
        <li>Open-source hardware & firmware</li>
        <li>Tamper-evident enclosure, audit-ready</li>
        <li>Solana-first; companion app open-source</li>
      </ul>
      <p className="text-[11px] text-zinc-500">Full spec sheet coming with the dev kits.</p>
    </div>
  );
}
function DockPartners() {
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
        <a href="#" className="text-3xl" aria-label="Discord">🗨️</a>
        <a href="mailto:support@example.com" className="text-3xl" aria-label="Email">✉️</a>
      </div>
    </div>
  );
}

/* ========================= Section (post-purchase) ========================= */
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

/* ================================== Page ================================== */
export default function PreorderPage() {
  const [model, setModel] = useState<keyof typeof MODELS | "bundle">("aluminium");
  const [stage, setStage] = useState<"buy" | "ship" | "summary">("buy");
  const solPrice = useSolPrice();

  const { items, count, usdSubtotal, shipping, total, deviceCount, add, setQty: setCartQty, remove, clear } = useLocalStorageCart();

  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
  const [purchasedTotal, setPurchasedTotal] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState<null | DockKey>(null);

  // Helio modal state
  const [helioOpen, setHelioOpen] = useState(false);
  const [helioMethod, setHelioMethod] = useState<HelioPayMethod>("crypto");

  const handleAddSku = (sku: Sku, q: number) => add(sku, q);

  // Advance flow when Helio reports success (optimistic; rely on webhooks for truth)
  const simulatePayment = (_type: "crypto" | "fiat") => {
    const totalUnits = items.reduce((n, it) => n + it.qty * (it.sku === "bundle" ? 2 : 1), 0);
    if (totalUnits === 0) return;
    setPurchasedItems(items);
    setPurchasedTotal(usdSubtotal);
    clear();
    setStage("ship");
  };

  const shippingSubmit = () => setStage("summary");

  const handleHelioSuccess = (_payment: unknown) => {
    simulatePayment(helioMethod);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* 1) Above-the-fold */}
      {stage === "buy" && (
        <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900/40 via-black to-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="hidden lg:block lg:col-span-6">
                <ModelShowcase model={model} />
              </div>

              <div className="lg:col-span-6">
                <BuyBox
                  model={model}
                  setModel={setModel}
                  solPrice={solPrice}
                  cartTotal={usdSubtotal}
                  onAddSku={handleAddSku}
                  onOpenCart={() => setCartOpen(true)}
                />
                <InlineInfoDock openKey={dockOpen} setOpenKey={setDockOpen} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating checkout bar */}
      {stage === "buy" && count > 0 && (
        <CheckoutBar 
          count={count} 
          total={total} 
          deviceCount={deviceCount}
          shipping={shipping}
          onOpen={() => setCartOpen(true)} 
        />
      )}

      {/* MiniCart sheet (opens Helio) */}
      <MiniCartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        usdSubtotal={usdSubtotal}
        shipping={shipping}
        deviceCount={deviceCount}
        solPrice={solPrice}
        onInc={(s) => setCartQty(s, (items.find((i) => i.sku === s)?.qty ?? 0) + 1)}
        onDec={(s) => setCartQty(s, Math.max(0, (items.find((i) => i.sku === s)?.qty ?? 0) - 1))}
        onRemove={remove}
        onClear={clear}
        onOpenHelio={(m) => {
          setHelioMethod(m);
          setHelioOpen(true);
          setCartOpen(false);
        }}
      />
      <HelioPayModal
        open={helioOpen}
        onClose={() => setHelioOpen(false)}
        method={helioMethod}
        amountUsd={total} // 🔥 dynamic - includes shipping (free for bundles/$100+)
        lines={
          shipping > 0
            ? [
                ...items.map(i => ({ sku: i.sku, name: i.name, qty: i.qty, unitUsd: i.unitUsd })),
                { sku: 'shipping' as Sku, name: 'Shipping', qty: 1, unitUsd: shipping }
              ]
            : items.map(i => ({ sku: i.sku, name: i.name, qty: i.qty, unitUsd: i.unitUsd }))
        }
        onSuccess={handleHelioSuccess}
        paylinkId="6913f286a438059a7e340339" // 🔒 ensure Dynamic Pricing is enabled on this link
      />

      {/* 2) After payment */}
      {stage === "ship" && (
        <Section id="shipping" eyebrow="Next step" title="Shipping details">
          <SolanaStaticRing>
            <div className="text-sm text-zinc-300">
              Success! Add your address details (placeholder).
            </div>
            <div className="mt-4">
              <button onClick={shippingSubmit} className="rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white px-5 py-2.5">
                Continue
              </button>
            </div>
          </SolanaStaticRing>
        </Section>
      )}

      {stage === "summary" && (
        <Section id="summary" eyebrow="All set" title="Thanks for your preorder!">
          <SolanaStaticRing>
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
          </SolanaStaticRing>
        </Section>
      )}

      {/* Footer */}
      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <img src="/unruggable_mobile.svg" alt="Unruggable" className="h-5 sm:hidden" />
            <img src="/logo.svg" alt="Unruggable" className="hidden sm:block h-6" />
            <span className="text-sm">© {new Date().getFullYear()} Unruggable Engineering LTD</span>
          </div>
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
