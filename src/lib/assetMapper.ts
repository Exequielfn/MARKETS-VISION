/**
 * Maps common spoken names to their corresponding stock or cryptocurrency ticker symbols.
 */
export const assetMap: Record<string, string> = {
  // Cryptos
  "bitcoin": "BTC",
  "ethereum": "ETH",
  "solana": "SOL",
  "cardano": "ADA",
  "ripple": "XRP",
  "dogecoin": "DOGE",
  "polkadot": "DOT",
  "polygon": "MATIC",
  "chainlink": "LINK",
  "litecoin": "LTC",

  // Stocks
  "apple": "AAPL",
  "microsoft": "MSFT",
  "google": "GOOGL",
  "alphabet": "GOOGL",
  "amazon": "AMZN",
  "tesla": "TSLA",
  "meta": "META",
  "facebook": "META",
  "nvidia": "NVDA",
  "netflix": "NFLX",
  "paypal": "PYPL",
  "disney": "DIS",
  "spotify": "SPOT",
  "uber": "UBER",
  "airbnb": "ABNB",
  "coinbase": "COIN",
  "salesforce": "CRM",
  "amd": "AMD",
  "intel": "INTC",
};

/**
 * Attempts to extract a valid ticker symbol from spoken text.
 * It checks the dictionary first, and if not found, tries to extract acronyms.
 */
export function extractSymbolFromTranscript(transcript: string): string | null {
  const normalized = transcript.toLowerCase().trim();
  
  // 1. Check exact match in map
  for (const [name, ticker] of Object.entries(assetMap)) {
    if (normalized.includes(name)) {
      return ticker;
    }
  }

  // 2. Try to extract acronyms (e.g., user says "A A P L" or "analyze AAPL")
  // Match sequences of letters that look like a ticker (usually 2-5 uppercase letters)
  const words = normalized.split(/\s+/);
  
  // Handle spelled out letters "A A P L" -> "AAPL"
  const spelledOutMatch = normalized.match(/(?:[a-z]\s+){1,4}[a-z]/);
  if (spelledOutMatch) {
      return spelledOutMatch[0].replace(/\s+/g, "").toUpperCase();
  }

  // Handle direct mentions like "analyze AAPL"
  const potentialTickers = words.filter(w => w.length >= 2 && w.length <= 5 && /^[a-z]+$/.test(w));
  // Skip common verbs/words
  const ignoreWords = ["analyze", "check", "price", "of", "the", "stock", "crypto", "coin", "for", "look", "at", "show", "me"];
  
  for(const pt of potentialTickers) {
      if(!ignoreWords.includes(pt)) {
          return pt.toUpperCase();
      }
  }

  return null;
}
