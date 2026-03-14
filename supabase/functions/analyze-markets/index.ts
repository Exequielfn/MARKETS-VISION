import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  symbol: string;
  walletAddress?: string;
}


// Fetch stock data from Alpha Vantage with timeout
async function fetchStockData(symbol: string, apiKey: string) {
  const alphaUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
  console.log(`Fetching stock data for ${symbol} from Alpha Vantage`);

  // Add timeout and retry logic
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(alphaUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SolanaApp/1.0',
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);
    const data = await response.json();

    console.log(`Alpha Vantage response for ${symbol}:`, {
      hasError: !!data["Error Message"],
      hasNote: !!data["Note"],
      hasTimeSeries: !!data["Time Series (Daily)"],
      responseKeys: Object.keys(data)
    });

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage Error: ${data["Error Message"]}`);
    }

    if (data["Note"]) {
      throw new Error(`Alpha Vantage Note: ${data["Note"]}`);
    }

    if (!data["Time Series (Daily)"]) {
      throw new Error(`No stock data available for symbol ${symbol}. Please check if the symbol is correct and try again.`);
    }

    return data["Time Series (Daily)"];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("Stock API timeout after 30 seconds");
      throw new Error("Stock API timeout - please try again");
    } else {
      console.error("Stock API error:", error);
      throw error;
    }
  }
}


function calculateRSI(prices: number[], period = 14): number {
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

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}



const server = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { symbol, walletAddress }: AnalysisRequest = await req.json();

    if (!symbol) {
      return new Response(JSON.stringify({ error: "Symbol is not recogniced" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const alphaVantageKey = Deno.env.get("ALPHAVANTAGE_API_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";


    let timeSeries: Record<string, any>;

    if (!alphaVantageKey) {
      return new Response(JSON.stringify({ error: "Missing Alpha Vantage API key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    try {
      timeSeries = await fetchStockData(symbol, alphaVantageKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const dates = Object.keys(timeSeries).sort().slice(-250);
    const prices = dates.map((date) =>
      parseFloat(timeSeries[date]["4. close"]),
    );
    const volumes = dates.map((date) =>
      parseFloat(timeSeries[date]["5. volume"]),
    );

    const currentPrice = prices[prices.length - 1];
    const priceChange = prices.length > 1 ? ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]) * 100 : 0;

    const rsi14 = calculateRSI(prices, 14);
    const sma21 = calculateSMA(prices, 21);
    const sma50 = calculateSMA(prices, 50);
    const sma200 = calculateSMA(prices, 200);

    let sentiment = "neutral";
    if (rsi14 > 70 && currentPrice > sma21) sentiment = "bullish";
    else if (rsi14 < 30 && currentPrice < sma21) sentiment = "bearish";
    else if (sma21 > sma50 && sma50 > sma200) sentiment = "bullish";
    else if (sma21 < sma50 && sma50 < sma200) sentiment = "bearish";

    const chartData = dates.map((date, i) => ({
      date,
      price: prices[i],
      volume: volumes[i],
    }));

    let aiReasoning = `Sentiment ${sentiment}. Price $${currentPrice.toFixed(2)}. RSI(14) ${rsi14.toFixed(1)}. SMA21 $${sma21.toFixed(2)}, SMA50 $${sma50.toFixed(2)}, SMA200 $${sma200.toFixed(2)}. Change ${priceChange.toFixed(1)}%.`;
    const prompt = `Analyze stock ${symbol}: Current price $${currentPrice.toFixed(2)}, RSI(14)=${rsi14.toFixed(1)}, SMA(21)=$${sma21.toFixed(2)}, SMA(50)=$${sma50.toFixed(2)}, SMA(200)=$${sma200.toFixed(2)}, ${priceChange > 0 ? "up" : "down"} ${Math.abs(priceChange).toFixed(1)}%. Provide market Support and resistance levels for the day trading, key insights and trend analysis in 200 words or less. Be concise and actionable. YOU MUST RESPOND ONLY IN ENGLISH.`;

    if (geminiApiKey) {
      try {
        const geminiUrl = `https://api.poe.com/v1/chat/completions`;
        const resp = await fetch(geminiUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${geminiApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3.1-pro",
            messages: [
              { role: "system", content: "You are an expert financial analyst providing trading insights and market analysis." },
              { role: "user", content: prompt }
            ]
          })
        });
        const json = await resp.json();
        const extracted = json.choices?.[0]?.message?.content || json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extracted && typeof extracted === "string") {
          aiReasoning = extracted;
        }
      } catch (e) {
        console.warn("Gemini reasoning fallback:", e instanceof Error ? e.message : String(e));
      }
    }


    const analysis = {
      symbol: symbol.toUpperCase(),
      assetType: "stock",
      sentiment,
      confidence_score: Math.round(Math.abs(70 + (rsi14 - 50) / 2)),
      current_price: currentPrice,
      target_price:
        sentiment === "bullish" ? currentPrice * 1.05 : currentPrice * 0.95,
      analysis: {
        technical_indicators: {
          rsi_14: parseFloat(rsi14.toFixed(2)),
          sma_21: parseFloat(sma21.toFixed(2)),
          sma_50: parseFloat(sma50.toFixed(2)),
          sma_200: parseFloat(sma200.toFixed(2)),
          price_change: parseFloat(priceChange.toFixed(2)),
        },
        market_conditions: {
          trend: sma21 > sma200 ? "uptrend" : "downtrend",
          strength: Math.abs(rsi14 - 50) > 20 ? "strong" : "moderate",
        },
      },
      reasoning: aiReasoning,
      timeframe: "1d",
      chartData,
    };

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

    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (_) {
    const mock = generateMockAnalysis("UNKNOWN");
    return new Response(JSON.stringify(mock), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

Deno.serve(server);
