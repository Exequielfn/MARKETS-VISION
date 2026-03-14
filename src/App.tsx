import { WalletButton } from "./components/WalletButton";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { RecentAnalyses } from "./components/RecentPredictions";
import { UserStats } from "./components/UserStats";
import { NotificationBanner } from "./components/NotificationBanner";
import { DarkModeToggle } from "./components/DarkModeToggle";
import MarketsLogo from "./Markets_Logo_New.png";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
      <NotificationBanner />

      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
              <button 
                onClick={() => window.location.reload()} 
                className="transition-transform hover:scale-105 active:scale-95 duration-200 focus:outline-none"
                title="Reload Page"
              >
                <img src={MarketsLogo} alt="Markets Vision" className="h-10 sm:h-12 w-auto" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Markets Vision
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Market Data Voice Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <DarkModeToggle />
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Consult Markets with AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get instant market insights spoke aloud. Powered by Gemini and Alpha Vantage.
          </p>
        </div>

        <UserStats />

        <AnalysisPanel />

        <RecentAnalyses />

        <footer className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built for Confidence • Powered by Gemini AI • Alpha Vantage Data
          </p>
          <p className="text-xs mt-2">
            This is a analysis platform. Always do your own research before
            trading.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
