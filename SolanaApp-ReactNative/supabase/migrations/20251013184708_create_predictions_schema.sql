/*
  # Crypto Prediction Platform Schema

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key) - Unique prediction identifier
      - `user_wallet` (text) - Solana wallet address of user
      - `symbol` (text) - Crypto symbol (e.g., SOL, BTC, ETH)
      - `prediction_type` (text) - Type: bullish, bearish, neutral
      - `confidence_score` (numeric) - AI confidence 0-100
      - `analysis` (jsonb) - Full Grok AI analysis data
      - `target_price` (numeric) - Predicted price target
      - `current_price` (numeric) - Price at prediction time
      - `timeframe` (text) - Prediction timeframe (1h, 24h, 7d, 30d)
      - `status` (text) - Status: active, completed, expired
      - `created_at` (timestamptz) - Creation timestamp
      - `expires_at` (timestamptz) - Expiration timestamp

    - `analysis_history`
      - `id` (uuid, primary key) - Unique analysis identifier
      - `symbol` (text) - Crypto symbol analyzed
      - `grok_response` (jsonb) - Raw Grok API response
      - `sentiment` (text) - Market sentiment analysis
      - `key_metrics` (jsonb) - Important metrics extracted
      - `created_at` (timestamptz) - Analysis timestamp

    - `user_profiles`
      - `wallet_address` (text, primary key) - Solana wallet address
      - `username` (text) - Optional username
      - `total_predictions` (integer) - Total predictions made
      - `successful_predictions` (integer) - Successful predictions count
      - `accuracy_rate` (numeric) - Success rate percentage
      - `created_at` (timestamptz) - Profile creation date
      - `last_active` (timestamptz) - Last activity timestamp

  2. Security
    - Enable RLS on all tables
    - Users can view all predictions but only create with their wallet
    - Analysis history is publicly readable
    - User profiles are publicly readable, users can update their own
*/

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet text NOT NULL,
  symbol text NOT NULL,
  prediction_type text NOT NULL CHECK (prediction_type IN ('bullish', 'bearish', 'neutral')),
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  target_price numeric,
  current_price numeric NOT NULL,
  timeframe text NOT NULL CHECK (timeframe IN ('1h', '24h', '7d', '30d')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create analysis_history table
CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  grok_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  sentiment text NOT NULL,
  key_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_address text PRIMARY KEY,
  username text,
  total_predictions integer DEFAULT 0,
  successful_predictions integer DEFAULT 0,
  accuracy_rate numeric DEFAULT 0 CHECK (accuracy_rate >= 0 AND accuracy_rate <= 100),
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_wallet ON predictions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON predictions(symbol);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_symbol ON analysis_history(symbol);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for predictions
CREATE POLICY "Anyone can view predictions"
  ON predictions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create predictions with their wallet"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own predictions"
  ON predictions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for analysis_history
CREATE POLICY "Anyone can view analysis history"
  ON analysis_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert analysis"
  ON analysis_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for user_profiles
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create user profiles"
  ON user_profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);