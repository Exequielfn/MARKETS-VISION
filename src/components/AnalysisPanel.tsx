import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, Mic } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";
import { PriceChart } from "./PriceChart";
import { speak, subscribeToVoiceState, stopSpeech } from "../lib/voice";
import { WaveVisualizer } from "./WaveVisualizer";
import { extractSymbolFromTranscript } from "../lib/assetMapper";

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
      sma_21: number;
      sma_50: number;
      sma_200: number;
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
  const [symbol, setSymbol] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { connected, publicKey } = useWallet();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = subscribeToVoiceState(setIsSpeaking);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleListen = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Heard:", transcript);
      const discoveredSymbol = extractSymbolFromTranscript(transcript);
      
      if (discoveredSymbol) {
        setSymbol(discoveredSymbol);
        handleAnalyze(discoveredSymbol);
      } else {
        alert(`Could not recognize a valid stock or cryptocurrency from: "${transcript}"`);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'aborted') {
         alert("Microphone error. Please ensure permissions are granted.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleAnalyze = async (overrideSymbol: string = symbol) => {
    if (!overrideSymbol.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-crypto", {
        body: { symbol: overrideSymbol.toUpperCase(), walletAddress: publicKey },
      });

      if (error) {
        throw new Error(error.message || "Error in analysis. Please try again.");
      }

      if (!data) {
        throw new Error("Empty response from Supabase server.");
      }

      const analysisResult = data as AnalysisResult;
      setResult(analysisResult);
      
      // Trigger voice response
      const voiceText = `Analysis for ${analysisResult.symbol} is ready. The sentiment is ${analysisResult.sentiment} with ${analysisResult.confidence_score} percent confidence. ${analysisResult.reasoning}`;
      speak(voiceText);

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

      let errorMessage = "Error in analysis. Please try again.";
      const msg = (error as Error).message || "";

      if (msg.includes("Missing API configuration")) {
        errorMessage = "Missing configuration. Please check the setup to configure environment variables.";
      } else if (msg.includes("API call frequency limit") || msg.includes("API limit") || msg.includes("rate limit")) {
        errorMessage = "API limit reached. Please try again in a minute.";
      } else if (msg.includes("Invalid") || msg.includes("No data available") || msg.includes("not supported")) {
        errorMessage = `Symbol \"${overrideSymbol}\" not found or not supported. Try "Apple" or "Bitcoin".`;
      } else if (msg.includes("Missing Alpha Vantage API key")) {
        errorMessage = "Missing Alpha Vantage API key. Please configure ALPHAVANTAGE_API_KEY.";
      } else if (msg.includes("Network") || msg.includes("fetch")) {
        errorMessage = "Connection error. Please check your internet connection.";
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
      <div className="flex flex-col items-center gap-6 mb-10 text-center">
        <WaveVisualizer isSpeaking={isSpeaking || isListening} />
        
        <div className="space-y-4 w-full max-w-md">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isListening 
              ? "Listening... Speak a stock or crypto name (e.g. 'Apple', 'Bitcoin')" 
              : "AI is ready to analyze the market. Click below to speak."}
          </p>
          
          <button
            onClick={isSpeaking ? stopSpeech : handleListen}
            disabled={loading}
            className={`group relative flex items-center justify-center gap-4 w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-500 shadow-xl hover:shadow-2xl overflow-hidden ${
              isSpeaking || isListening
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Consulting Markets...</span>
              </>
            ) : isSpeaking ? (
              <>
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <span>Stop Assistant</span>
              </>
            ) : isListening ? (
              <>
                <Mic className="h-6 w-6 animate-pulse" />
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <span>Listening... (Click to Cancel)</span>
              </>
            ) : (
              <>
                <Mic className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Speak to Markets Assistant</span>
              </>
            )}
          </button>
        </div>
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
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">SMA (21)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${result.analysis.technical_indicators.sma_21.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">SMA (50)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${result.analysis.technical_indicators.sma_50.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">SMA (200)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${result.analysis.technical_indicators.sma_200.toFixed(2)}</div>
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

