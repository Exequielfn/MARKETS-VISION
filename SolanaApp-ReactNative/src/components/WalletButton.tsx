import { Wallet, CreditCard, RefreshCw, Smartphone } from "lucide-react";
import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { walletManager } from "../lib/wallet";

export function WalletButton() {
  const {
    connected,
    publicKey,
    connecting,
    connect,
    disconnect,
    balance,
    network,
  } = useWallet();
  const [requestingAirdrop, setRequestingAirdrop] = useState(false);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  const handleClick = async () => {
    if (connected) {
      await disconnect();
    } else {
      try {
        await connect();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleMobileConnect = async () => {
    try {
      const msg = await walletManager.connectMobile();
      if (!isMobile) {
        alert(msg);
      }
    } catch (error: any) {
      console.error("Error conectando con Phantom app:", error);
      alert(error.message || "No se pudo abrir la app Phantom");
    }
  };

  const handleRequestAirdrop = async () => {
    if (!connected || !publicKey) return;

    try {
      setRequestingAirdrop(true);
      const signature = await walletManager.requestAirdrop(publicKey);
      alert(`Airdrop exitoso! Signature: ${signature.slice(0, 8)}...`);
      // Actualizar el balance después del airdrop
      await walletManager.updateBalance(publicKey);
    } catch (error: any) {
      console.error("Error al solicitar airdrop:", error);
      alert(`Error al solicitar airdrop: ${error.message}`);
    } finally {
      setRequestingAirdrop(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col items-end">
      {!connected && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleClick}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4" />
            {connecting ? "Conectando..." : "Phantom Wallet"}
          </button>

          {isMobile && (
            <button
              onClick={handleMobileConnect}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 dark:hover:from-purple-700 dark:hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Smartphone className="w-4 h-4" />
              App Phantom
            </button>
          )}
        </div>
      )}

      {/* QR deshabilitado: solo conexión por extensión Phantom y app Phantom */}

      {connected ? (
        <button
          onClick={handleClick}
          disabled={connecting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-5 h-5" />
          {shortenAddress(publicKey!)}
        </button>
      ) : null}

      {connected && publicKey && (
        <div className="mt-2 flex flex-col items-end">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <CreditCard className="w-4 h-4" />
            <span>
              {balance !== null ? `${balance.toFixed(4)} SOL` : "Cargando..."}
            </span>
          </div>

          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
              Red: {network}
            </span>
            <button
              onClick={handleRequestAirdrop}
              disabled={requestingAirdrop || network !== "devnet"}
              className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              {requestingAirdrop ? "Solicitando..." : "Airdrop"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
