/*
  # Update Predictions Schema for Stock Market Analysis

  1. Changes
    - Add support for '1d' timeframe value in predictions table
    - Update grok_response column name context (used for both Grok and Gemini responses)
    - Schema remains backward compatible with existing data
    
  2. Notes
    - No data migration needed as '1d' is being added to existing enum
    - Column names remain unchanged for backward compatibility
    - Existing data continues to work without modifications
*/

-- Add '1d' to timeframe if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'predictions_timeframe_check'
  ) THEN
    -- If constraint doesn't exist, create it
    ALTER TABLE predictions 
    ADD CONSTRAINT predictions_timeframe_check 
    CHECK (timeframe IN ('1h', '24h', '7d', '30d', '1d'));
  ELSE
    -- If it exists, drop and recreate with new values
    ALTER TABLE predictions DROP CONSTRAINT predictions_timeframe_check;
    ALTER TABLE predictions 
    ADD CONSTRAINT predictions_timeframe_check 
    CHECK (timeframe IN ('1h', '24h', '7d', '30d', '1d'));
  END IF;
END $$;
