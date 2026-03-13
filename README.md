# Markets Vision

AI-Powered Market Data Voice Assistant. Consult market data from Alpha Vantage and get spoken AI analysis powered by Gemini.

## Features

- **Voice Assistant**: Integrated Text-to-Speech that reads market analysis results.
- **AI Analysis**: Deep insights powered by Gemini 1.5 Pro.
- **Market Data**: Real-time and historical data from Alpha Vantage.
- **Modern UI**: Clean, glassmorphic design with dark mode support.
- 📊 **Dual Asset Support**: Analyze both stocks (AAPL, TSLA, MSFT) and cryptocurrencies (BTC, ETH, SOL)
- 📈 **Technical Indicators**:
  - RSI (14) - Relative Strength Index
  - EMA (13, 25, 50) - Exponential Moving Averages
  - Market sentiment analysis (Bullish/Bearish/Neutral)
- 📉 **Interactive Charts**: Visual 30-day price history with trend indicators
- 💼 **Wallet Integration**: Connect Solana Phantom wallet to track analysis history
- 🌙 **Dark Mode**: Full dark mode support
- 📱 **Responsive Design**: Works seamlessly on all devices

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: Google Gemini 2.0 Flash
- **Data Provider**: Alpha Vantage API
- **Blockchain**: Solana Network
- **Database**: Supabase PostgreSQL

## Prerequisites

- Node.js 18+ and npm
- Phantom Wallet browser extension
- Supabase account
- Alpha Vantage API key (free tier)
- Google Gemini API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create or update `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   VITE_ALPHAVANTAGE_API_KEY=your-alpha-vantage-key
   VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Set up Supabase**

   The database migrations are already created. They will be automatically applied when you deploy the edge function.

5. **Deploy Supabase Edge Function**

   The edge function is already deployed through the Supabase MCP integration. If you need to redeploy:
   - The function is located at `supabase/functions/analyze-crypto/index.ts`
   - It automatically handles both stock and crypto analysis
   - API keys are configured as environment secrets

## Development

1. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Preview production build**
   ```bash
  npm run preview
  ```

## Vercel Deployment

- Environment variables (Project Settings → Environment Variables):
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the client.
  - `ALPHAVANTAGE_API_KEY` for market data.
  - Optional: `VITE_GEMINI_API_KEY` for AI reasoning on the client.
  - Optional (server-side only): `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for storing analysis history.
- API route: `/api/analyze-crypto` is provided via a Node serverless function in `api/analyze-crypto.js`.
- Static assets:
  - Favicon and manifest should live under `public/` (`public/vite.svg`, `public/manifest.json`).
- Production requests:
  - The frontend uses `/api/analyze-crypto` by default in production, or `VITE_API_URL` if set.
- If Preview Deployments are protected on Vercel, unauthenticated asset fetches (e.g., `/manifest.json`) may return `401`. Disable protection or open the deployment while authenticated.

## Deploying to Solana Network

### Prerequisites for Solana Deployment

1. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Configure Solana Network**
   ```bash
   # For Devnet (testing)
   solana config set --url https://api.devnet.solana.com

   # For Mainnet (production)
   solana config set --url https://api.mainnet-beta.solana.com
   ```

3. **Create/Import Wallet**
   ```bash
   # Create new wallet
   solana-keygen new --outfile ~/my-wallet.json

   # Or import existing wallet
   solana-keygen recover --outfile ~/my-wallet.json
   ```

4. **Get SOL for deployment (Devnet only)**
   ```bash
   solana airdrop 2
   ```

### Deployment Steps

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy Frontend**

   You can deploy the `dist` folder to any static hosting service:

   - **Vercel**
     ```bash
     npm install -g vercel
     vercel --prod
     ```

   - **Netlify**
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

   - **GitHub Pages**
     ```bash
     npm install -g gh-pages
     gh-pages -d dist
     ```

3. **Configure Environment Variables in Production**

   Make sure to add all environment variables to your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALPHAVANTAGE_API_KEY`
   - `VITE_GEMINI_API_URL`
   - `VITE_GEMINI_API_KEY`

4. **Update Wallet Configuration**

   Ensure your app is configured to connect to the correct Solana network:
   - For testing: Use Devnet
   - For production: Use Mainnet-beta

## Testing the Application

### Manual Testing Checklist

1. **Wallet Connection**
   - [ ] Click "Connect Wallet" button
   - [ ] Phantom wallet popup appears
   - [ ] Wallet connects successfully
   - [ ] Wallet address displays in header
   - [ ] Disconnect works properly

2. **Stock Analysis**
   - [ ] Enter stock symbol (e.g., AAPL, TSLA, MSFT)
   - [ ] Click "Analyze" button
   - [ ] Loading state appears
   - [ ] Analysis results display with:
     - [ ] Price chart (30-day history)
     - [ ] Current price and target price
     - [ ] Sentiment (Bullish/Bearish/Neutral)
     - [ ] RSI (14) indicator
     - [ ] EMA (13, 25, 50) indicators
     - [ ] AI reasoning (150 characters max)
   - [ ] Data saves to database

3. **Crypto Analysis**
   - [ ] Enter crypto symbol (e.g., BTC, ETH, SOL)
   - [ ] Click "Analyze" button
   - [ ] Loading state appears
   - [ ] Analysis results display correctly
   - [ ] Chart shows crypto price history
   - [ ] All indicators calculate properly

4. **User Stats (Wallet Connected)**
   - [ ] Stats panel appears after connecting wallet
   - [ ] Shows "Total Analyses"
   - [ ] Shows "Successful" count
   - [ ] Shows "Accuracy" percentage

5. **Recent Analyses**
   - [ ] Displays last 6 analyses from all users
   - [ ] Each card shows correct information
   - [ ] Time elapsed updates correctly

6. **Dark Mode**
   - [ ] Click dark mode toggle
   - [ ] All components switch to dark theme
   - [ ] Charts remain readable
   - [ ] Text contrast is appropriate
   - [ ] Preference persists on refresh

7. **Responsive Design**
   - [ ] Test on mobile viewport
   - [ ] Test on tablet viewport
   - [ ] Test on desktop viewport
   - [ ] All elements remain accessible
   - [ ] Charts scale appropriately

### Testing Symbols

**Stocks to Test:**
- AAPL (Apple)
- MSFT (Microsoft)
- TSLA (Tesla)
- GOOGL (Google)
- AMZN (Amazon)

**Cryptocurrencies to Test:**
- BTC (Bitcoin)
- ETH (Ethereum)
- SOL (Solana)
- DOGE (Dogecoin)
- XRP (Ripple)

### Error Scenarios

Test these error cases:
- [ ] Invalid symbol (should show error message)
- [ ] Empty symbol input (button should be disabled)
- [ ] API rate limit reached (should show appropriate error)
- [ ] Network disconnection
- [ ] Wallet rejection of connection

## API Limits & Considerations

- **Alpha Vantage Free Tier**: 25 requests per day, 5 API requests per minute
- **Gemini API**: Check your quota limits in Google AI Studio
- **Supabase**: Check your project limits (1GB database, 2GB bandwidth on free tier)

## Important Notes

- **Response Length**: AI responses are automatically limited to 150 characters
- **Chart Data**: Shows last 30 days of daily closing prices
- **Technical Indicators**: Calculated from real historical market data
- **Demo Purpose**: This is for educational purposes only. Always do your own research before trading.
- **Wallet Security**: Never share your private keys. The app only requests public wallet address.

## Troubleshooting

### Common Issues

1. **"Invalid symbol" error**
   - Verify symbol is correct (stocks: AAPL, crypto: BTC)
   - Check if symbol is supported by Alpha Vantage

2. **"API limit reached"**
   - Alpha Vantage free tier: wait 24 hours or upgrade plan
   - Check your API key is valid

3. **Wallet won't connect**
   - Install Phantom wallet extension
   - Ensure wallet is unlocked
   - Refresh the page and try again

4. **No data showing**
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Check Supabase connection

## Contributing

This is a demonstration project. Feel free to fork and modify for your own use.

## License

MIT License - See LICENSE file for details

## Disclaimer

This application is for educational and informational purposes only. It should not be considered financial advice. Always conduct your own research and consult with financial professionals before making investment decisions.
