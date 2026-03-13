import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your_supabase")) {
  console.warn(
    "⚠️ Supabase not configured. Please update .env file with your Supabase credentials.",
  );
  console.warn("Get your credentials from: https://app.supabase.com");
}

// Create a dummy client if credentials are missing to prevent app crash
const dummyUrl = supabaseUrl || "https://placeholder.supabase.co";
const dummyKey = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(dummyUrl, dummyKey);

export interface Analysis {
  id: string;
  user_wallet: string;
  symbol: string;
  prediction_type: "bullish" | "bearish" | "neutral";
  confidence_score: number;
  analysis: any;
  target_price?: number;
  current_price: number;
  timeframe: "1h" | "24h" | "7d" | "30d" | "1d";
  status: "active" | "completed" | "expired";
  created_at: string;
  expires_at: string;
}

export type Prediction = Analysis;

export interface AnalysisHistory {
  id: string;
  symbol: string;
  grok_response: any;
  sentiment: string;
  key_metrics: any;
  created_at: string;
}

export interface UserProfile {
  wallet_address: string;
  username?: string;
  total_predictions: number;
  successful_predictions: number;
  accuracy_rate: number;
  created_at: string;
  last_active: string;
}
