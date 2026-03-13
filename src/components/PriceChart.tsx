interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
  symbol: string;
}

export function PriceChart({ data, symbol }: PriceChartProps) {
  if (!data || data.length === 0) return null;

  const prices = data.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice;

  const getY = (price: number) => {
    const normalized = (maxPrice - price) / priceRange;
    return normalized * 200;
  };

  const pathData = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = getY(point.price);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const currentPrice = prices[prices.length - 1];
  const startPrice = prices[0];
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol} Price Chart (30 Days)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daily closing prices
          </p>
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            30-day change
          </div>
        </div>
      </div>

      <div className="relative w-full h-[200px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <svg
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          <path d={`${pathData} L 100 200 L 0 200 Z`} fill="url(#gradient)" />

          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {data.map((point, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = getY(point.price);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.8"
                fill={isPositive ? "#10b981" : "#ef4444"}
                className="opacity-60 hover:opacity-100 transition-opacity"
              />
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-2 text-xs text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
          ${minPrice.toFixed(2)}
        </div>
        <div className="absolute top-2 left-2 text-xs text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
          ${maxPrice.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
