import { useState, useEffect } from "react";
import { walletManager, WalletState } from "../lib/wallet";
import { PublicKey } from "@solana/web3.js";

// Definiendo una interfaz para el retorno del hook
export interface WalletHook extends WalletState {
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  updateBalance: (publicKey: string | PublicKey) => Promise<number>;
  sendSol: (recipient: string, amount: number) => Promise<string>;
  requestAirdrop: (publicKey: string | PublicKey) => Promise<string>;
}

export function useWallet(): WalletHook {
  const [walletState, setWalletState] = useState<WalletState>(
    walletManager.getState(),
  );

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setWalletState);
    walletManager.autoConnect();
    return unsubscribe;
  }, []);

  return {
    ...walletState,
    connect: () => walletManager.connect(),
    disconnect: () => walletManager.disconnect(),
    updateBalance: (publicKey) => walletManager.updateBalance(publicKey),
    sendSol: (recipient, amount) => walletManager.sendSol(recipient, amount),
    requestAirdrop: (publicKey) => walletManager.requestAirdrop(publicKey),
  };
}
