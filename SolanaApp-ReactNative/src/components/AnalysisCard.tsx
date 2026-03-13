import { TrendingUp, TrendingDown, Minus, Clock, Target } from "lucide-react";
import { Analysis } from "../lib/supabase";

interface AnalysisCardProps {
  analysis: Analysis;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const getIcon = () => {
    switch (analysis.prediction_type) {
      case "bullish":
        return <TrendingUp className="w-6 h-6 text-emerald-500" />;
      case "bearish":
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <Minus className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeColor = () => {
    switch (analysis.prediction_type) {
      case "bullish":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20";
      case "bearish":
        return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getTimeElapsed = () => {
    const now = new Date();
    const created = new Date(analysis.created_at);
    const diff = now.getTime() - created.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {analysis.symbol}
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getTypeColor()} mt-1`}
            >
              {analysis.prediction_type.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Confidence
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.confidence_score}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Current Price
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(analysis.current_price)}
          </div>
        </div>
        {analysis.target_price && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Target
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPrice(analysis.target_price)}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          {analysis.timeframe} • {getTimeElapsed()}
        </div>
        <div
          className={`px-3 py-1 rounded-lg font-medium ${
            analysis.status === "active"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : analysis.status === "completed"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {analysis.status}
        </div>
      </div>
    </div>
  );
}
