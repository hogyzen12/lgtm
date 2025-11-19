import { Link } from 'react-router-dom'
import { useValidatorData } from '../hooks/useValidatorData'
import { useProgressiveTipData } from '../hooks/useProgressiveTipData'
import { useAnimatedCounter } from '../hooks/useAnimatedCounter'

export default function HomePage() {
  const { data: validatorData, loading: validatorLoading, error: validatorError } = useValidatorData(60000)
  const tipData = useProgressiveTipData()
  
  const animatedTVL = useAnimatedCounter(validatorData?.totalValueUSD || 0, 1500)
  const animatedStake = useAnimatedCounter(validatorData?.activatedStake || 0, 1500)
  const animatedTransactions = useAnimatedCounter(tipData.totalTransactions, 800)

  const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-black">
      {/* Subtle dark gradient background - BLACK/SILVER theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-800"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-zinc-700/20 via-transparent to-zinc-900"></div>
      
      {/* Subtle animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-conic from-zinc-600/20 via-zinc-800/10 to-zinc-600/20 animate-spin-ultra-slow opacity-40"></div>
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] bg-gradient-radial from-zinc-400/30 via-zinc-700/10 to-transparent rounded-full blur-3xl animate-morph-refined-1"></div>
        <div className="absolute bottom-[-8%] left-[5%] w-[250px] h-[250px] bg-gradient-radial from-zinc-500/20 via-zinc-600/15 to-transparent rounded-full blur-2xl animate-morph-refined-2"></div>
        <div className="absolute top-[10%] left-[20%] w-20 h-1 bg-gradient-to-r from-transparent via-zinc-400/60 to-transparent rotate-12 animate-drift-refined-1"></div>
        <div className="absolute top-[80%] right-[25%] w-16 h-1 bg-gradient-to-r from-transparent via-zinc-300/40 to-transparent rotate-45 animate-drift-refined-2"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Header - Matching Preorder Page Style */}
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
            {/* Logo Left */}
            <a href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
              <img src="/unruggable_mobile.svg" alt="Unruggable" className="h-5 sm:hidden" />
              <img src="/logo.svg" alt="Unruggable" className="hidden sm:block h-6" />
            </a>
            
            {/* Scrolling Ticker Center */}
            <div className="flex-1 overflow-hidden relative min-w-0">
              <div className="flex ticker-animate whitespace-nowrap">
                <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">UNRUGGABLE - THE HARDWARE WALLET ENGINEERED FOR SOLANA - LIMITED EDITION INITIAL RUN - POWERED BY SOLANA - SHIPPING Q2 2026 - PRE ORDER NOW</span>
                <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">UNRUGGABLE - THE HARDWARE WALLET ENGINEERED FOR SOLANA - LIMITED EDITION INITIAL RUN - POWERED BY SOLANA - SHIPPING Q2 2026 - PRE ORDER NOW</span>
              </div>
            </div>
            
            {/* Solana Logo Right */}
            <div className="flex items-center flex-shrink-0">
              <img src="/solana_mobile.svg" alt="Powered by Solana" className="h-5 sm:hidden" />
              <img src="/solanaLogo.svg" alt="Powered by Solana" className="hidden sm:block h-6" />
            </div>
          </div>
        </header>

        {/* Hero Section - Dual Videos */}
        <section className="px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto">
            {/* Video Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-12">
              {/* Aluminum Video */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-3xl opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-700"></div>
                <div className="relative">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-auto rounded-3xl shadow-2xl ring-1 ring-white/10 transition-all duration-500 group-hover:scale-[1.02]"
                  >
                    <source src="/media/aluminium/reveal.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              {/* Plastic Video */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800/50 to-cyan-700/50 rounded-3xl opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-700"></div>
                <div className="relative">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-auto rounded-3xl shadow-2xl ring-1 ring-white/10 transition-all duration-500 group-hover:scale-[1.02]"
                  >
                    <source src="/media/plastic/reveal.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>

            {/* Pre-Order Button */}
            <div className="text-center mb-16">
              <Link 
                to="/preorder"
                className="inline-block px-12 py-6 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Pre-Order Now
              </Link>
              <div className="mt-4">
                <div className="inline-flex items-center bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-2 space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-200">Pre-Orders Live • Limited Edition Initial Run • Shipping Q2 2026</span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  The Hardware Wallet Engineered for Solana
                </span>
              </h1>
              <p className="text-xl lg:text-2xl leading-relaxed text-zinc-300">
                Hot wallet UX. Cold wallet security.
              </p>
            </div>
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="px-6 lg:px-12 py-16 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 bg-clip-text text-transparent">
                {validatorData && !validatorLoading 
                  ? `Unruggable secures over $${Math.floor(validatorData.totalValueUSD / 1000000)}M in value`
                  : 'Unruggable secures over $10M in value'
                }
              </h2>
              <p className="text-lg text-white/60">
                Real-time insights into the Unruggable ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-zinc-400/30 hover:scale-105">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Total Value Secured</h3>
                  {validatorLoading ? (
                    <div className="text-3xl font-bold text-white/50 animate-pulse">Loading...</div>
                  ) : validatorError ? (
                    <div className="text-xl font-bold text-red-400">Error</div>
                  ) : validatorData ? (
                    <div className="text-3xl font-bold text-white">${formatNumber(animatedTVL, 0)}</div>
                  ) : (
                    <div className="text-3xl font-bold text-white">$0</div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-zinc-500/30 hover:scale-105">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Validator Staked</h3>
                  {validatorLoading ? (
                    <div className="text-3xl font-bold text-white/50 animate-pulse">Loading...</div>
                  ) : validatorError ? (
                    <div className="text-xl font-bold text-red-400">Error</div>
                  ) : validatorData ? (
                    <div className="text-3xl font-bold text-white">{formatNumber(animatedStake, 0)} SOL</div>
                  ) : (
                    <div className="text-3xl font-bold text-white">0 SOL</div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-zinc-400/30 hover:scale-105">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Total Transactions</h3>
                  {tipData.isLoading ? (
                    <div>
                      <div className="text-3xl font-bold text-white">{formatNumber(animatedTransactions, 0)}</div>
                      <div className="mt-2 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400 animate-pulse"></div>
                      </div>
                      <div className="text-xs text-white/50 mt-1">Loading...</div>
                    </div>
                  ) : tipData.error ? (
                    <div className="text-xl font-bold text-red-400">Error</div>
                  ) : (
                    <div className="text-3xl font-bold text-white">{formatNumber(animatedTransactions, 0)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations & Partners */}
        <section className="px-6 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 bg-clip-text text-transparent">
                Integrations & Partners
              </h2>
              <p className="text-lg text-zinc-400">
                Trusted by leading projects in the Solana ecosystem
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/helius.svg" alt="Helius" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/solana foundation.svg" alt="Solana Foundation" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/Meta dao.svg" alt="MetaDAO" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/Phase labs.svg" alt="Phase Labs" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/solblaze.svg" alt="SolBlaze" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/Gojira stake.svg" alt="Gojira Stake" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/saga dao.svg" alt="Saga DAO" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/Ha1iad3.svg" alt="Haliad3" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/adrastea.svg" alt="Adrastea" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/sentinel.svg" alt="Sentinel" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/sphere.svg" alt="Sphere" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/stache.svg" alt="Stache" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/Raposa Coffee.svg" alt="Raposa Coffee" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
              <div className="flex items-center justify-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all hover:scale-105">
                <img src="/integrations/the library.svg" alt="The Library" className="h-10 w-auto max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" style={{ filter: 'invert(1) brightness(0.9)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Order Now */}
        <section className="px-6 lg:px-12 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-600/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-300 via-emerald-200 to-white bg-clip-text text-transparent">
                  PRE-ORDERS NOW LIVE
                </h2>
                <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                  Limited edition initial run. Shipping Q2 2026.
                </p>
                
                <Link 
                  to="/preorder"
                  className="inline-block px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Pre-Order Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Advertisement Video */}
        <section className="px-6 lg:px-12 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))' }}
              >
                <source src="/advert_web.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500">
          <p>&copy; 2025 Unruggable Engineering. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin-ultra-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-ultra-slow {
          animation: spin-ultra-slow 60s linear infinite;
        }
        @keyframes morph-refined-1 {
          0%, 100% { transform: scale(1) rotate(0deg); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { transform: scale(1.1) rotate(180deg); border-radius: 40% 60% 70% 30% / 30% 70% 40% 60%; }
        }
        .animate-morph-refined-1 {
          animation: morph-refined-1 15s ease-in-out infinite;
        }
        @keyframes morph-refined-2 {
          0%, 100% { transform: scale(1) translateX(0px) translateY(0px); border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
          50% { transform: scale(1.05) translateX(15px) translateY(-10px); border-radius: 60% 40% 30% 70% / 40% 60% 30% 70%; }
        }
        .animate-morph-refined-2 {
          animation: morph-refined-2 20s ease-in-out infinite;
        }
        @keyframes drift-refined-1 {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(12deg); }
          50% { transform: translateX(20px) translateY(-15px) rotate(15deg); }
        }
        .animate-drift-refined-1 {
          animation: drift-refined-1 8s ease-in-out infinite;
        }
        @keyframes drift-refined-2 {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(45deg); }
          50% { transform: translateX(-15px) translateY(10px) rotate(42deg); }
        }
        .animate-drift-refined-2 {
          animation: drift-refined-2 12s ease-in-out infinite;
        }
        .bg-gradient-conic {
          background: conic-gradient(var(--tw-gradient-stops));
        }
        .bg-gradient-radial {
          background: radial-gradient(var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  )
}