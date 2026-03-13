/*
  # Add Market Data Cache Table
  
  This table caches market data from Alpha Vantage to reduce API calls
  and improve performance.
*/

-- Create market_data_cache table
CREATE TABLE IF NOT EXISTS market_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_data_cache_symbol ON market_data_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_asset_type ON market_data_cache(asset_type);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_timestamp ON market_data_cache(timestamp DESC);

-- Create unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_data_cache_unique 
ON market_data_cache(symbol, asset_type);

-- Enable Row Level Security
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_data_cache
CREATE POLICY "Anyone can view market data cache"
  ON market_data_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage market data cache"
  ON market_data_cache FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);