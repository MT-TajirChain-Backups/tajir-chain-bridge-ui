import TajirWalletLogo from "src/assets/logo/tajir-wallet.png";

/** Reown WalletGuide explorer IDs (64-char hex). */
export const METAMASK_WALLET_ID = "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96";
export const TRUST_WALLET_ID = "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0";
export const COINBASE_WALLET_ID = "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa";
/** WalletGuide "My Wallet" (mywallet.io) — not a product we want in the modal. */
export const MY_WALLET_ID = "26a582067b4f960e9104768704ec6fa642970450acefa04c782dbbccc575b3b8";

/** AppKit custom wallet id — Tajir is not listed in WalletGuide yet. */
export const TAJIR_WALLET_ID = "tajir-wallet";

export type TajirCustomWallet = {
  app_store: string;
  homepage: string;
  id: string;
  image_url: string;
  mobile_link: string;
  name: string;
  play_store: string;
  rdns?: string;
};

export const getTajirCustomWallet = (rdns?: string): TajirCustomWallet => ({
  app_store: "https://apps.apple.com/us/app/tajir-wallet/id6749449673",
  homepage: "https://www.tajirwallet.io/",
  id: TAJIR_WALLET_ID,
  image_url:
    typeof TajirWalletLogo === "string"
      ? TajirWalletLogo
      : `${window.location.origin}/tajir-wallet.png`,
  mobile_link: "https://www.tajirwallet.io/",
  name: "Tajir Wallet",
  play_store: "https://play.google.com/store/apps/details?id=com.tajir.wallet.app",
  ...(rdns ? { rdns } : {}),
});

export const isTajirWalletName = (value?: string): boolean => /tajir/i.test(value?.trim() || "");

/**
 * Own-property check: is this exact EIP-1193 object Tajir's injected provider?
 * Does not unwrap `.provider`, so a WalletConnect session for another wallet is
 * never mistaken for Tajir just because the extension is installed.
 */
export const isTajirEip1193Provider = (provider: unknown): boolean => {
  if (typeof provider !== "object" || provider === null) {
    return false;
  }
  if ("isTajirWallet" in provider && provider.isTajirWallet === true) {
    return true;
  }
  return "_tajirwallet" in provider && Boolean(provider._tajirwallet);
};

const MAX_PROVIDER_UNWRAP_DEPTH = 3;

export const isTajirInjectedProvider = (provider: unknown, depth = 0): boolean => {
  if (isTajirEip1193Provider(provider)) {
    return true;
  }
  if (depth >= MAX_PROVIDER_UNWRAP_DEPTH || typeof provider !== "object" || provider === null) {
    return false;
  }
  // Ethers Web3Provider wraps the EIP-1193 provider.
  return "provider" in provider && isTajirInjectedProvider(provider.provider, depth + 1);
};
