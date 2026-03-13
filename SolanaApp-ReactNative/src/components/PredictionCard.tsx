import { TrendingUp, TrendingDown, Minus, Clock, Target } from "lucide-react";
import { Prediction } from "../lib/supabase";

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getIcon = () => {
    switch (prediction.prediction_type) {
      case "bullish":
        return <TrendingUp className="w-6 h-6 text-emerald-500" />;
      case "bearish":
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <Minus className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeColor = () => {
    switch (prediction.prediction_type) {
      case "bullish":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "bearish":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
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

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(prediction.expires_at);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h remaining` : "Expired";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {prediction.symbol}
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getTypeColor()} mt-1`}
            >
              {prediction.prediction_type.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Confidence
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {prediction.confidence_score}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Current Price
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(prediction.current_price)}
          </div>
        </div>
        {prediction.target_price && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Target Price
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPrice(prediction.target_price)}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          {prediction.timeframe} • {getTimeRemaining()}
        </div>
        <div
          className={`px-3 py-1 rounded-lg font-medium ${
            prediction.status === "active"
              ? "bg-blue-100 text-blue-700"
              : prediction.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {prediction.status}
        </div>
      </div>
    </div>
  );
}
