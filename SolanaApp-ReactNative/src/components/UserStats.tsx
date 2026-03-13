import { useEffect, useState } from "react";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { supabase, UserProfile } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";

export function UserStats() {
  const { connected, publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [connected, publicKey]);

  const loadProfile = async () => {
    if (!publicKey) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("wallet_address", publicKey)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  if (!connected || !profile) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 dark:from-blue-600 dark:via-purple-700 dark:to-pink-600 rounded-2xl p-8 shadow-xl text-white transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5" />
            <div className="text-sm opacity-90">Total Analyses</div>
          </div>
          <div className="text-3xl font-bold">{profile.total_predictions}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5" />
            <div className="text-sm opacity-90">Successful</div>
          </div>
          <div className="text-3xl font-bold">
            {profile.successful_predictions}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5" />
            <div className="text-sm opacity-90">Accuracy</div>
          </div>
          <div className="text-3xl font-bold">
            {profile.accuracy_rate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
