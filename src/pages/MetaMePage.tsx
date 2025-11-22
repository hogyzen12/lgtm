import React, { useState, useEffect } from "react";
import HelioPayModal, { type HelioPayMethod } from "../components/HelioPayModal";

// Fixed product details
const PLASTIC_MODEL = {
  name: "Plastic S1",
  displayPrice: 6.90, // Post-discount price shown to user
  originalPrice: 69, // Original sticker price
  helioPrice: 69, // Price passed to Helio (they apply discount code to get to $6.90)
  sku: "plastic" as const,
};

type Stage = "buy" | "ship" | "summary";

function useSolPrice() {
  const [solPrice, setSolPrice] = useState(147);
  
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
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return solPrice;
}

function Navbar() {
  const tickerText = "METAME EXCLUSIVE - UNRUGGABLE S1 PLASTIC - $5.99 - CRYPTO PAYMENT ONLY - SHIPPING Q2 2026";
  
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
        <a href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
          <img src="/unruggable_mobile.svg" alt="Unruggable" className="h-5 sm:hidden" />
          <img src="/logo.svg" alt="Unruggable" className="hidden sm:block h-6" />
        </a>
        
        <div className="flex-1 overflow-hidden relative min-w-0">
          <div className="flex ticker-animate whitespace-nowrap">
            <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">{tickerText}</span>
            <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">{tickerText}</span>
          </div>
        </div>
        
        <div className="flex items-center flex-shrink-0">
          <img src="/solana_mobile.svg" alt="Powered by Solana" className="h-5 sm:hidden" />
          <img src="/solanaLogo.svg" alt="Powered by Solana" className="hidden sm:block h-6" />
        </div>
      </div>
    </header>
  );
}

function SolanaStaticRing({
  children,
  className = "rounded-3xl",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <style>{`
        .ssr-base { position:absolute; inset:0; border-radius:inherit; border:1px solid rgba(255,255,255,0.10); pointer-events:none; }
        .ssr-ring-solana {
          position:absolute; inset:0; border-radius:inherit; padding:2px;
          background: conic-gradient(from 0deg,#9945FF 0%,#8752F3 12%,#5497D5 24%,#43B4CA 36%,#39D0D8 50%,#2CE3A2 64%,#94F7C5 78%,#9945FF 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none;
        }
        .ssr-halo-solana {
          position:absolute; inset:-12px; border-radius:inherit; padding:2px;
          background: conic-gradient(from 0deg, rgba(153,69,255,.8), rgba(135,82,243,.7), rgba(84,151,213,.6), rgba(67,180,202,.6), rgba(57,208,216,.6), rgba(44,227,162,.6), rgba(148,247,197,.6), rgba(153,69,255,.8));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; filter: blur(18px); opacity:.22; pointer-events:none;
        }
      `}</style>
      <div className="ssr-base" aria-hidden />
      <div className="ssr-ring-solana" aria-hidden />
      <div className="ssr-halo-solana" aria-hidden />
      <div className="relative rounded-[inherit] bg-white/5 border border-white/10 backdrop-blur p-6">
        {children}
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <div className="mb-3 text-sm font-medium uppercase tracking-wider text-purple-400">
            {eyebrow}
          </div>
        )}
        {title && (
          <h2 className="mb-8 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

export default function MetaMePage() {
  const [stage, setStage] = useState<Stage>("buy");
  const [helioOpen, setHelioOpen] = useState(false);
  const solPrice = useSolPrice();

  const handleHelioSuccess = (_payment: unknown) => {
    setStage("ship");
  };

  const shippingSubmit = () => setStage("summary");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Buy Stage */}
      {stage === "buy" && (
        <section className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 via-black to-black">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
            <div className="text-center mb-8">
              <span className="inline-flex items-center rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 ring-1 ring-inset ring-purple-500/30 mb-4">
                MetaMe Exclusive
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Unruggable S1 Plastic
              </h1>
              <p className="text-xl text-zinc-300">
                Limited edition hardware wallet for Solana
              </p>
            </div>

            <SolanaStaticRing>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Product Image */}
                <div className="aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10">
                  <img 
                    src="/media/plastic/frontplastic.webp" 
                    alt="Plastic S1" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    {PLASTIC_MODEL.name}
                  </h2>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-bold text-white">
                        ${PLASTIC_MODEL.displayPrice}
                      </span>
                      <span className="text-lg text-zinc-500 line-through ml-2">
                        ${PLASTIC_MODEL.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-purple-400/20 px-3 py-1 text-sm font-semibold text-purple-200">
                        Save ${(PLASTIC_MODEL.originalPrice - PLASTIC_MODEL.displayPrice).toFixed(2)} (90% OFF)
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      ≈ {(PLASTIC_MODEL.displayPrice / solPrice).toFixed(3)} SOL · {PLASTIC_MODEL.displayPrice} USDC
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 text-sm text-zinc-300">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      <span>Secure hardware wallet engineered for Solana</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      <span>Durable plastic construction</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      <span>Ships Q2 2026</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      <span>Crypto payment only (SOL/USDC)</span>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 rounded-xl p-4 mb-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Quantity:</span>
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Fixed quantity for this exclusive offer
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Subtotal</span>
                        <span className="text-white font-medium">${PLASTIC_MODEL.displayPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Shipping</span>
                        <span className="text-emerald-400 font-medium">FREE</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex items-center justify-between text-base">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-white font-bold">${PLASTIC_MODEL.displayPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setHelioOpen(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6 py-4 font-semibold text-lg shadow-lg shadow-purple-600/25 transition-all hover:shadow-xl hover:shadow-purple-500/40"
                  >
                    Pay with SOL / USDC
                  </button>
                  <p className="text-xs text-center text-zinc-500 mt-3">
                    Secure payment via Helio
                  </p>
                </div>
              </div>
            </SolanaStaticRing>
          </div>
        </section>
      )}

      {/* Helio Modal - Crypto Only */}
      <HelioPayModal
        open={helioOpen}
        onClose={() => setHelioOpen(false)}
        method="crypto"
        amountUsd={PLASTIC_MODEL.helioPrice}
        lines={[
          { 
            sku: PLASTIC_MODEL.sku, 
            name: PLASTIC_MODEL.name, 
            qty: 1, 
            unitUsd: PLASTIC_MODEL.helioPrice 
          }
        ]}
        onSuccess={handleHelioSuccess}
        paylinkId="69213b65f8afb27ba763e7aa"
      />

      {/* Shipping Stage */}
      {stage === "ship" && (
        <Section id="shipping" eyebrow="Next step" title="Shipping details">
          <SolanaStaticRing>
            <div className="text-sm text-zinc-300">
              Success! Add your shipping address details.
            </div>
            <div className="mt-4">
              <button 
                onClick={shippingSubmit} 
                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-5 py-2.5"
              >
                Continue
              </button>
            </div>
          </SolanaStaticRing>
        </Section>
      )}

      {/* Summary Stage */}
      {stage === "summary" && (
        <Section id="summary" eyebrow="All set" title="Thanks for your order!">
          <SolanaStaticRing>
            <h2 className="text-2xl font-semibold text-white mb-4">Order summary</h2>
            <div className="rounded-2xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>{PLASTIC_MODEL.name} × 1</div>
                <div>${PLASTIC_MODEL.displayPrice}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>Shipping</div>
                <div className="text-emerald-400">FREE</div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between text-sm">
                <div>Total Amount</div>
                <div className="font-medium">${PLASTIC_MODEL.displayPrice}</div>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <div>Status</div>
                <div className="text-emerald-400">Awaiting Production</div>
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