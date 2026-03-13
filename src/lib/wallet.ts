// Solana wallet connection utilities
// Note: This is a simplified implementation for demo purposes
// In production, use @solana/wallet-adapter packages

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SOLANA_NETWORK = "devnet";
const SOLANA_RPC_URL = "https://api.devnet.solana.com";

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
  balance: number | null;
  network: string;
  isPhantomMobile: boolean;
}

export class WalletManager {
  private listeners: ((state: WalletState) => void)[] = [];
  private connection: Connection;
  private state: WalletState = {
    connected: false,
    publicKey: null,
    connecting: false,
    balance: null,
    network: SOLANA_NETWORK,
    isPhantomMobile: false,
  };

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL);

    this.state.isPhantomMobile = this.isMobileDevice();
  }

  private isMobileDevice(): boolean {
    return (
      typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  subscribe(callback: (state: WalletState) => void) {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async connect() {
    this.state.connecting = true;
    this.notify();

    try {
      // mobile or browser connection
      if (this.state.isPhantomMobile) {
        return await this.connectMobile();
      } else {
        return await this.connectBrowser();
      }
    } catch (error) {
      this.state.connecting = false;
      this.notify();
      throw error;
    }
  }

  private async connectBrowser() {
    // Check for Phantom wallet in browser (restrict to Phantom only)
    const provider = (window as any).phantom?.solana ?? (window as any).solana;

     if (!provider || provider.isPhantom !== true) {
      throw new Error('Phantom wallet not found. Please install Phantom extension.');
    }

    const response = await provider.connect();
    const publicKey = response.publicKey.toString();

    this.state = {
      ...this.state,
      connected: true,
      publicKey,
      connecting: false,
    };

    // Actualizar el balance
    await this.updateBalance(publicKey);

    this.notify();

    // Store in localStorage
    localStorage.setItem('walletAddress', publicKey);

    return publicKey;
  }

  async connectMobile() {
    // Crear un deeplink para la app de Phantom
    const encodedUrl = encodeURIComponent(window.location.href);
    const url = `https://phantom.app/ul/v1/connect?app_url=${encodedUrl}&redirect_link=${encodedUrl}`;

    // Abrir el deeplink
    window.location.href = url;

    this.state = {
      ...this.state,
      connecting: true,
    };

    this.notify();

    return 'Please open Phantom app to connect your wallet.';
  }

  async disconnect() {
    try {
      const provider = (window as any).phantom?.solana ?? (window as any).solana;
      if (provider) {
        await provider.disconnect();
      }

      this.state = {
        connected: false,
        publicKey: null,
        connecting: false,
        balance: null,
        network: SOLANA_NETWORK,
        isPhantomMobile: this.isMobileDevice(),
      };

      this.notify();
      localStorage.removeItem('walletAddress');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  async autoConnect() {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      try {
        await this.connect();
      } catch (error) {
        console.error('Auto-connect failed:', error);
        localStorage.removeItem('walletAddress');
      }
    }
  }

  getState() {
    return this.state;
  }

  async updateBalance(publicKey: string | PublicKey): Promise<number> {
    try {
      const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const balance = await this.connection.getBalance(pubKey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      this.state = {
        ...this.state,
        balance: solBalance
      };

      this.notify();
      return solBalance;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  async sendSol(recipient: string, amount: number): Promise<string> {
    try {
      if (!this.state.connected || !this.state.publicKey) {
        throw new Error('Wallet not connected');
      }

      const provider = (window as any).phantom?.solana ?? (window as any).solana;
      if (!provider || provider.isPhantom !== true) {
        throw new Error('Phantom wallet not found');
      }

      const senderPubKey = new PublicKey(this.state.publicKey);
      const recipientPubKey = new PublicKey(recipient);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipientPubKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      transaction.feePayer = senderPubKey;
      transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;

      const signedTransaction = await provider.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());

      await this.connection.confirmTransaction(signature);

      // balance before transaction update
      await this.updateBalance(this.state.publicKey);

      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      throw error;
    }
  }

  async requestAirdrop(publicKey: string | PublicKey): Promise<string> {
    try {
      const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const signature = await this.connection.requestAirdrop(pubKey, LAMPORTS_PER_SOL);
      await this.connection.confirmTransaction(signature);

      // balance after airdrop update
      await this.updateBalance(pubKey.toString());

      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw error;
    }
  }
}

export const walletManager = new WalletManager();
