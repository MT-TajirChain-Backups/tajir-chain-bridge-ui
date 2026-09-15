import TajirWalletLogo from "src/assets/logo/tajir-wallet.png";
import {
  TAJIR_WALLET_ID,
  isTajirInjectedProvider,
  isTajirWalletName,
} from "src/constants/wallets";

type ConnectedWalletInfo = {
  icon?: string;
  id?: string;
  name?: string;
  rdns?: string;
};

const isTajirWalletInfo = (
  walletInfo: ConnectedWalletInfo | undefined,
  provider?: unknown
): boolean => {
  const name = walletInfo?.name?.trim() || "";
  const id = walletInfo?.id?.trim() || "";
  const rdns = walletInfo?.rdns?.trim() || "";
  const icon = walletInfo?.icon?.trim() || "";

  if (id === TAJIR_WALLET_ID) {
    return true;
  }
  if (isTajirWalletName(name) || isTajirWalletName(id) || isTajirWalletName(rdns)) {
    return true;
  }
  if (/tajir/i.test(icon)) {
    return true;
  }
  if (isTajirInjectedProvider(provider)) {
    return true;
  }
  return false;
};

/**
 * Resolve the icon shown next to the connected address.
 * Tajir's injected/WC peer often ships a generic wallet icon (or none) — always
 * use our branded asset when the session is Tajir.
 */
export const resolveConnectedWalletIcon = (
  walletInfo: ConnectedWalletInfo | undefined,
  provider?: unknown
): { alt: string; src: string } | undefined => {
  const name = walletInfo?.name?.trim() || "";

  if (isTajirWalletInfo(walletInfo, provider)) {
    return { alt: name || "Tajir Wallet", src: TajirWalletLogo };
  }

  if (walletInfo?.icon) {
    return { alt: name || "Wallet", src: walletInfo.icon };
  }

  return undefined;
};
