import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateEMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

// Mock data generator for fallback analysis
function generateMockAnalysis(symbol) {
  const assetType = "stock";
  const basePrice = 150;
  const volatility = 0.02;

  const currentPrice =
    basePrice + (Math.random() - 0.5) * basePrice * volatility;
  const sentiment = ["bullish", "bearish", "neutral"][
    Math.floor(Math.random() * 3)
  ];
  const confidence = Math.floor(Math.random() * 30) + 60;

  const targetPrice =
    sentiment === "bullish"
      ? currentPrice * 1.05
      : sentiment === "bearish"
        ? currentPrice * 0.95
        : currentPrice;

  const rsi = Math.floor(Math.random() * 40) + 30;
  const ema13 = currentPrice * 0.99;
  const ema25 = currentPrice * 0.98;
  const ema50 = currentPrice * 0.97;

  const chartData = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const price = currentPrice + (Math.random() - 0.5) * currentPrice * 0.03;
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    chartData.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat(price.toFixed(2)),
      volume: volume,
    });
  }

  const reasoning = `Analysis for ${symbol}: Market shows ${sentiment} sentiment with moderate volatility. Technical indicators suggest ${rsi > 70 ? "overbought" : rsi < 30 ? "oversold" : "balanced"} conditions.`;

  console.log(`Generated analysis for ${symbol} with ${sentiment} sentiment`);

  return {
    symbol: symbol.toUpperCase(),
    assetType: assetType,
    sentiment,
    confidence_score: confidence,
    current_price: currentPrice,
    target_price: targetPrice,
    analysis: {
      technical_indicators: {
        rsi_14: rsi,
        ema_13: ema13,
        ema_25: ema25,
        ema_50: ema50,
        price_change: (Math.random() - 0.5) * 5,
      },
      market_conditions: {
        trend:
          sentiment === "bullish"
            ? "uptrend"
            : sentiment === "bearish"
              ? "downtrend"
              : "sideways",
        strength: "moderate",
      },
    },
    reasoning,
    timeframe: "24h",
    chartData,
    mock_data: true, // Flag to indicate this is mock data
  };
}

app.post("/api/analyze-crypto", async (req, res) => {
  try {
    const { symbol, walletAddress } = req.body;
    console.log(`\n📊 Analysis request for: ${symbol}`);

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const timeSeries = data["Time Series (Daily)"];
    if (!timeSeries || data["Error Message"] || data["Note"]) {
      return res.json(generateMockAnalysis(symbol));
    }
    const dates = Object.keys(timeSeries).sort().slice(-30);
    const prices = dates.map((d) => parseFloat(timeSeries[d]["4. close"]));
    const volumes = dates.map((d) => parseFloat(timeSeries[d]["5. volume"]));
    const assetType = "stock";
    const currentPrice = prices[prices.length - 1];
    const priceChange =
      prices.length > 1
        ? ((prices[prices.length - 1] - prices[prices.length - 2]) /
            prices[prices.length - 2]) *
          100
        : 0;

    const rsi14 = calculateRSI(prices, 14);
    const ema13 = calculateEMA(prices, 13);
    const ema25 = calculateEMA(prices, 25);
    const ema50 = calculateEMA(prices, 50);

    let sentiment = "neutral";
    let confidence = 60;

    if (rsi14 > 70 && currentPrice > ema13) {
      sentiment = "bullish";
      confidence = 75;
    } else if (rsi14 < 30 && currentPrice < ema13) {
      sentiment = "bearish";
      confidence = 75;
    } else if (ema13 > ema25 && ema25 > ema50) {
      sentiment = "bullish";
      confidence = 70;
    } else if (ema13 < ema25 && ema25 < ema50) {
      sentiment = "bearish";
      confidence = 70;
    }

    const targetPrice =
      sentiment === "bullish"
        ? currentPrice * 1.05
        : sentiment === "bearish"
          ? currentPrice * 0.95
          : currentPrice;

    const chartData = dates.map((date, i) => ({
      date,
      price: prices[i],
      volume: volumes[i],
    }));

    let reasoning = `Market shows ${sentiment} sentiment with RSI ${rsi14.toFixed(1)} and EMA(13) ${ema13.toFixed(2)} vs EMA(50) ${ema50.toFixed(2)}.`;
    if (GEMINI_API_KEY) {
      try {
        const prompt = `Analyze ${symbol}: Current price $${currentPrice.toFixed(2)}, RSI(14)=${rsi14.toFixed(1)}, EMA(13)=$${ema13.toFixed(2)}, EMA(25)=$${ema25.toFixed(2)}, EMA(50)=$${ema50.toFixed(2)}, ${priceChange > 0 ? "up" : "down"} ${Math.abs(priceChange).toFixed(1)}%. Provide market Support and resistance levels for the day trading, key insights and trend analysis in 200 words or less. Be concise and actionable.`;
        const geminiUrl = "https://api.poe.com/v1/chat/completions";
        const resp = await fetch(geminiUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "deepseek-v3.1-t",
            messages: [
              { role: "system", content: "You are an expert financial analyst providing trading insights and market analysis." },
              { role: "user", content: prompt }
            ]
          })
        });     

        const json = await resp.json();
        const extracted = json?.choices?.[0]?.message?.content || json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extracted && typeof extracted === "string") {
          reasoning = extracted;
        }

      } catch (err) {
        console.warn("Gemini reasoning fallback:", err?.message || err);
      }
    }

    const analysis = {
      symbol: symbol.toUpperCase(),
      assetType,
      sentiment,
      confidence_score: Math.round(Math.abs(70 + (rsi14 - 50) / 2)),
      current_price: currentPrice,
      target_price: targetPrice,
      analysis: {
        technical_indicators: {
          rsi_14: parseFloat(rsi14.toFixed(2)),
          ema_13: parseFloat(ema13.toFixed(2)),
          ema_25: parseFloat(ema25.toFixed(2)),
          ema_50: parseFloat(ema50.toFixed(2)),
          price_change: parseFloat(priceChange.toFixed(2)),
        },
        market_conditions: {
          trend: ema13 > ema50 ? "uptrend" : "downtrend",
          strength: Math.abs(rsi14 - 50) > 20 ? "strong" : "moderate",
        },
      },
      reasoning,
      timeframe: "1d",
      chartData,
    };

    // Store analysis in Supabase if configured
    if (supabase) {
      try {
        const { error: insertError } = await supabase
          .from("analysis_history")
          .insert({
            symbol: symbol.toUpperCase(),
            grok_response: analysis,
            sentiment: analysis.sentiment,
            key_metrics: analysis.analysis,
          });
        if (insertError) {
          console.error("Error storing analysis:", insertError);
        }

        // Optional: track wallet activity
        if (walletAddress) {
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("wallet_address")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from("user_profiles").insert({
              wallet_address: walletAddress,
              last_active: new Date().toISOString(),
            });
          } else {
            await supabase
              .from("user_profiles")
              .update({ last_active: new Date().toISOString() })
              .eq("wallet_address", walletAddress);
          }
        }
      } catch (storeErr) {
        console.warn(
          "Supabase storage warning:",
          storeErr?.message || storeErr,
        );
      }
    }

    console.log("Analysis completed successfully with real data");
    res.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    console.log("Falling back to mock data due to analysis error");
    res.json(generateMockAnalysis(req.body.symbol || "UNKNOWN"));
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
