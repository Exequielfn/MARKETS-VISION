import { useEffect, useState } from "react";

interface AnalysisResponse {
  symbol: string;
  sentiment: "bullish" | "bearish" | "neutral";
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
      trend: "uptrend" | "downtrend";
      strength: "strong" | "moderate";
    };
  };
  reasoning: string;
  timeframe: string;
  timestamp: string;
  chartData: { date: string; price: number; volume: number }[];
  error?: string;
}

export function useCryptoAnalysis(symbol: string) {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setError("Symbol is required");
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-crypto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ symbol, market: "USD" }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((res: AnalysisResponse) => {
        if (res.error) throw new Error(res.error);
        setData(res);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(
          e.message.includes("API limit")
            ? "API rate limit reached. Please try again later."
            : e.message.includes("Invalid symbol")
              ? "Invalid cryptocurrency symbol."
              : "Failed to fetch analysis",
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [symbol]);

  return { data, loading, error };
}
