import { useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";
import { PriceChart } from "./PriceChart";

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

interface AnalysisResult {
  symbol: string;
  sentiment: string;
  confidence_score: number;
  current_price: number;
  target_price: number;
  analysis: {
    technical_indicators: {
      rsi_14: number;
      ema_13: number;
      ema_25: number;
      ema_50: number;
      price_change: number;
    };
    market_conditions: {
      trend: string;
      strength: string;
    };
  };
  reasoning: string;
  timeframe: string;
  chartData?: ChartDataPoint[];
}

export function AnalysisPanel() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { connected, publicKey } = useWallet();

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-crypto", {
        body: { symbol: symbol.toUpperCase(), walletAddress: publicKey },
      });

      if (error) {
        throw new Error(error.message || "Error en el análisis. Por favor intenta nuevamente.");
      }

      if (!data) {
        throw new Error("Respuesta vacía del servidor de Supabase.");
      }

      setResult(data as AnalysisResult);

      if (connected && publicKey) {
        try {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          await supabase.from("predictions").insert({
            user_wallet: publicKey,
            symbol: data.symbol,
            prediction_type: data.sentiment,
            confidence_score: data.confidence_score,
            analysis: data.analysis,
            target_price: data.target_price,
            current_price: data.current_price,
            timeframe: data.timeframe,
            expires_at: expiresAt.toISOString(),
          });
        } catch (err) {
          console.warn("Supabase write failed (optional):", err);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);

      let errorMessage = "Error en el análisis. Por favor intenta nuevamente.";
      const msg = (error as Error).message || "";

      if (msg.includes("Missing API configuration")) {
        errorMessage = "Configuración faltante. Por favor revisa SETUP_GUIDE.md para configurar las variables de entorno.";
      } else if (msg.includes("API call frequency limit") || msg.includes("API limit") || msg.includes("rate limit")) {
        errorMessage = "Límite de API alcanzado. Por favor intenta nuevamente en un minuto.";
      } else if (msg.includes("Invalid") || msg.includes("No data available") || msg.includes("not supported")) {
        errorMessage = `Símbolo \"${symbol}\" no encontrado o no soportado. Prueba con AAPL, TSLA, MSFT, etc.`;
      } else if (msg.includes("Missing Alpha Vantage API key")) {
        errorMessage = "Clave API de Alpha Vantage faltante. Por favor configura ALPHAVANTAGE_API_KEY.";
      } else if (msg.includes("Network") || msg.includes("fetch")) {
        errorMessage = "Error de conexión. Por favor verifica tu conexión a internet.";
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Enter stock/crypto symbol (ex: AAPL, BTCUSD)"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 text-sm sm:text-base"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !symbol.trim()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Analyze
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-fadeIn">
          {result.chartData && <PriceChart data={result.chartData} symbol={result.symbol} />}

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sentiment</div>
              <div
                className={`text-2xl font-bold ${
                  result.sentiment === "bullish"
                    ? "text-emerald-600 dark:text-emerald-500"
                    : result.sentiment === "bearish"
                    ? "text-red-600 dark:text-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {result.sentiment.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Confidence</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{result.confidence_score}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-xl">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Current Price</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(result.current_price)}</div>
            </div>
            <div className="p-6 bg-purple-50 dark:bg-purple-950 rounded-xl">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">Target Price</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(result.target_price)}</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Technical Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">RSI (14)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{result.analysis.technical_indicators.rsi_14.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">EMA (13)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${result.analysis.technical_indicators.ema_13.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">EMA (25)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${result.analysis.technical_indicators.ema_25.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">EMA (50)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${result.analysis.technical_indicators.ema_50.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Market Conditions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trend</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{result.analysis.market_conditions.trend}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Strength</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{result.analysis.market_conditions.strength}</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-100 dark:border-blue-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Reasoning</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}

