import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ACCESS_CODE = "UNRUGGABLE";

const platforms = [
  {
    name: 'macOS',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
      </svg>
    ),
    status: 'available',
    downloadUrl: 'https://github.com/hogyzen12/unruggable-app/releases/download/1.0.10/unruggable.dmg',
    description: 'Compatible with macOS 10.15 and later',
    version: 'v1.0.10'
  },
  {
    name: 'Windows',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.351"/>
      </svg>
    ),
    status: 'available',
    downloadUrl: 'https://github.com/hogyzen12/unruggable-app/releases/download/1.0.10/unruggable-app-windows.zip',
    description: '.exe installer and portable version',
    version: 'v1.0.10',
    badge: 'Early Alpha'
  },
  {
    name: 'Linux',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 01-.088.069c-.044.061-.06.113-.065.188 0 .08-.018.162-.044.28-.048.199-.108.438-.133.718-.016.08-.01.156-.023.239-.01.065-.021.4-.34.5-.227.07-.543-.024-.688-.322-.123-.256-.069-.58-.069-.532-.01-.446.027-.645.152-.906.135-.316.149-.66.257-.978a.983.983 0 01.041-.36c.013-.03.011-.071.03-.094.026-.03.061-.059.087-.088a.45.45 0 00.026-.055c.063-.155.135-.296.218-.432.08-.129.168-.257.275-.355.107-.096.223-.184.354-.24.13-.055.27-.08.418-.08z"/>
      </svg>
    ),
    status: 'available',
    downloadUrl: 'https://github.com/hogyzen12/unruggable-app/releases/download/1.0.10/unruggable-linux.zip',
    description: 'Ubuntu 24 LTS',
    version: 'v1.0.10',
    badge: 'Early Alpha'
  },
  {
    name: 'iOS',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.12 0C6.562.002 6.017.21 5.59.58 5.18.943 4.94 1.452 4.92 2V22c.02.548.26 1.057.67 1.42.427.37.972.578 1.53.58h9.36c.558-.002 1.103-.21 1.53-.58.41-.363.65-.872.67-1.42V2c-.02-.548-.26-1.057-.67-1.42C17.603.21 17.058.002 16.5 0H7.12zm.88 2h8v18H8V2z"/>
      </svg>
    ),
    status: 'coming-soon',
    downloadUrl: '#',
    description: 'TestFlight Alpha Testing',
    version: 'Coming Soon'
  },
  {
    name: 'Android',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.523 15.3414c-.4878 0-.8823-.4007-.8823-.8955 0-.4947.3945-.8954.8823-.8954.4878 0 .8823.4007.8823.8954 0 .4948-.3945.8955-.8823.8955m-11.046 0c-.4878 0-.8823-.4007-.8823-.8955 0-.4947.3945-.8954.8823-.8954.4878 0 .8823.4007.8823.8954 0 .4948-.3945.8955-.8823.8955m11.405-6.02l1.997-3.505c.105-.19.042-.43-.14-.536-.18-.107-.423-.047-.53.14l-2.017 3.546C15.79 8.644 14.51 8.147 13.124 8.147c-1.386 0-2.666.497-4.068.818L7.04 5.42c-.107-.188-.35-.248-.53-.14-.182.105-.245.345-.14.535L8.368 9.32C5.508 10.665 3.5 13.78 3.5 17.5h17c0-3.72-2.008-6.835-4.868-8.18z"/>
      </svg>
    ),
    status: 'available',
    downloadUrl: 'https://github.com/hogyzen12/unruggable-app/releases/download/1.0.10/unruggable-universal.apk',
    description: 'APK Sideloading - Enable Unknown Sources',
    version: 'v1.0.10'
  },
  {
    name: 'Google Play',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
      </svg>
    ),
    status: 'coming-soon',
    downloadUrl: '#',
    description: 'Google Play Internal Testing',
    version: 'Coming Soon'
  }
]

const faqs = [
  {
    question: "How to Install?",
    answer: "macOS: Double-click the downloaded .dmg file and drag Unruggable into your Applications folder.\n\nWindows: Extract the .zip file to a folder of your choice, then run the .exe file inside to launch Unruggable.\n\nLinux: Extract the .zip file and run the AppImage file. Designed for Ubuntu 24 LTS.\n\nAndroid: First, enable 'Install from Unknown Sources' in your device settings (Settings > Security > Unknown Sources). Then download the APK file and tap it to install."
  },
  {
    question: "Is the alpha version safe to use?",
    answer: "The alpha version is still experimental, so ensure access to wallets is backed up. We recommend importing a wallet from elsewhere for stress free testing."
  },
  {
    question: "How often are alpha builds updated?",
    answer: "We release new builds frequently, following a feedback/user based development cycle. New feature = new build."
  },
  {
    question: "What platforms will be supported?",
    answer: "We currently support macOS, Windows (experimental), Linux (Ubuntu 24 LTS - experimental), and Android via APK sideloading. Google Play Store distribution and iOS TestFlight are coming soon. Each platform will enter alpha testing as development progresses."
  },
  {
    question: "How do I report bugs or provide feedback?",
    answer: "Thank you for providing feedback. We're a 3 person team with one dev, so please bear with us, but we do read every message. Let us know on X or github as shown at the bottom of this page."
  },
  {
    question: "wen hardware?",
    answer: "We're currently working on some dev units, and hoping to be able to move to production before the end of 2025."
  }
]

export default function AlphaPage() {
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const storedAccess = localStorage.getItem('unruggable-alpha-access');
    if (storedAccess === ACCESS_CODE) {
      setHasAccess(true);
    }
  }, []);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.toUpperCase() === ACCESS_CODE) {
      localStorage.setItem('unruggable-alpha-access', ACCESS_CODE);
      setHasAccess(true);
      setError("");
    } else {
      setError("Invalid access code. Please contact the team for access.");
    }
  };

  const handleDownload = (platform: typeof platforms[0]) => {
    if (platform.status === 'available') {
      setDownloadStarted(true)
      window.open(platform.downloadUrl, '_blank')
      setTimeout(() => setDownloadStarted(false), 3000)
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Unruggable" className="h-12 mx-auto" />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Alpha Access Required</h1>
            <p className="text-zinc-400">This page is only accessible to invited alpha testers.</p>
          </div>

          <form onSubmit={handleCodeSubmit} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <label htmlFor="access-code" className="block text-sm font-medium text-zinc-300 mb-2">
              Enter Access Code
            </label>
            <input
              id="access-code"
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="XXXXXXXX"
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 mb-4"
            />
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl font-medium transition-colors"
            >
              Submit Code
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Don't have access?{' '}
              <Link to="/preorder" className="text-zinc-300 hover:text-white transition-colors">
                Pre-order the hardware instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
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
              <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">UNRUGGABLE ALPHA - CLOSED TESTING - INVITE ONLY - HARDWARE PRE-ORDERS LIVE</span>
              <span className="text-xs font-medium text-zinc-300 px-4 sm:px-8">UNRUGGABLE ALPHA - CLOSED TESTING - INVITE ONLY - HARDWARE PRE-ORDERS LIVE</span>
            </div>
          </div>
          
          {/* Solana Logo Right */}
          <div className="flex items-center flex-shrink-0">
            <img src="/solana_mobile.svg" alt="Powered by Solana" className="h-5 sm:hidden" />
            <img src="/solanaLogo.svg" alt="Powered by Solana" className="hidden sm:block h-6" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-block mb-6">
            <img 
              src="https://cdn.jsdelivr.net/gh/hogyzen12/solana-mobile@main/assets/icons/icon.png" 
              alt="Unruggable Icon"
              className="w-20 h-20 rounded-2xl"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Unruggable Alpha
          </h1>
          
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Hot wallet UX. Cold wallet security. Now available in Alpha.
          </p>

          <div className="flex items-center justify-center mb-8">
            <div className="bg-zinc-500/20 border border-zinc-400/30 rounded-full px-4 py-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-zinc-200">Closed Alpha • Invite Only</span>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleDownload(platform)}
                disabled={platform.status !== 'available'}
                className={`
                  relative p-6 rounded-2xl border transition-all duration-300 text-left
                  ${platform.status === 'available' 
                    ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer transform hover:scale-[1.02]' 
                    : 'bg-zinc-900/50 border-zinc-800 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {platform.status === 'available' && (
                  <div className={`absolute -top-2 -right-2 text-white text-xs px-2 py-1 rounded-full ${
                    platform.badge ? 'bg-zinc-500' : 'bg-green-500'
                  }`}>
                    {platform.badge || 'Ready'}
                  </div>
                )}
                
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4
                  ${platform.status === 'available' ? 'bg-zinc-800 text-white' : 'bg-zinc-800/50 text-zinc-500'}
                `}>
                  {platform.icon}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{platform.name}</h3>
                <p className="text-sm text-zinc-400 mb-3">{platform.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    platform.status === 'available' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30'
                  }`}>
                    {platform.version}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-zinc-900/50 transition-colors"
                  >
                    <h3 className="font-semibold pr-4">{faq.question}</h3>
                    <svg 
                      className={`w-6 h-6 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-zinc-800 pt-4">
                        <p className="text-zinc-400 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Release Notes */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Latest Release Notes</h2>
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-mono text-green-400">v1.0.10 - Alpha</span>
                <span className="text-sm text-zinc-500">Released 11/17/2025</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">New Features & Improvements</h4>
                  <ul className="text-zinc-300 space-y-1 ml-4">
                    <li>• Across the board update with feature completions.</li>
                    <li>• Updated UI/UX across all platforms.</li>
                    <li>• Enhanced stability - marked as &quot;relatively stable&quot;.</li>
                    <li>• Continued improvements to Windows and Linux experimental builds.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-400 mb-2">Bug Fixes</h4>
                  <ul className="text-zinc-300 space-y-1 ml-4">
                    <li>• Resolved reported bugs across all platforms.</li>
                    <li>• General stability and performance improvements.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Contact + Feedback</h2>
            <p className="text-zinc-400 mb-8">
              Experiencing issues with the alpha build? Let the Dev know directly on X.
            </p>
            
            <div className="flex justify-center gap-6">
              <a 
                href="https://x.com/bill_papas_12" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-700 rounded-xl hover:border-zinc-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                @ the Dev
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500">
          <p>&copy; 2025 Unruggable Engineering. All rights reserved.</p>
        </div>
      </footer>

      {/* Download Confirmation */}
      {downloadStarted && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in">
          Download started! Check your downloads folder.
        </div>
      )}
    </div>
  )
}