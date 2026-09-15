import { Web3Provider } from "@ethersproject/providers";
import { defineChain, mainnet as ethereumMainnet } from "@reown/appkit/networks";
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import {
  ApiController,
  ConnectionController,
  ConnectorController,
  OptionsController,
  SnackController,
} from "@reown/appkit-controllers";
import { hexValue } from "ethers/lib/utils";
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  COINBASE_WALLET_ID,
  METAMASK_WALLET_ID,
  MY_WALLET_ID,
  TAJIR_WALLET_ID,
  TRUST_WALLET_ID,
  getTajirCustomWallet,
  isTajirEip1193Provider,
  isTajirInjectedProvider,
  isTajirWalletName,
} from "src/constants/wallets";
import { useEnvContext } from "src/contexts/env.context";
import { AsyncTask, Chain, ConnectedProvider } from "src/domain";
import { getChecksumAddress } from "src/utils/addresses";
import {
  isAsyncTaskDataAvailable,
  isMetaMaskUserRejectedRequestError,
} from "src/utils/types";

// AppKit Initialization
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID
  ? String(import.meta.env.VITE_REOWN_PROJECT_ID)
  : "YOUR_PROJECT_ID";

const PUBLIC_SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const PUBLIC_TAJIR_TESTNET_RPC = "https://rpc.testnet.tajirchain.com";

/**
 * WalletConnect / AppKit namespaces are used by external wallets. Same-origin
 * Origin-gated proxies (…/l1rpc) and localhost URLs work for this page but
 * break wallet RPC / session settle. Prefer an explicit wallet RPC, else a
 * public fallback when the configured URL is unsafe for wallets.
 */
const resolveWalletRpc = (configured: string, publicFallback?: string): string => {
  const raw = configured.trim();
  if (!raw || raw.includes("__VITE_")) {
    return publicFallback || raw;
  }
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(raw, base);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isSameOrigin =
      typeof window !== "undefined" && url.origin === window.location.origin;
    const isProxyPath = /\/l[12]rpc\/?$/i.test(url.pathname);
    if ((isLocal || isSameOrigin || isProxyPath) && publicFallback) {
      return publicFallback;
    }
  } catch {
    // keep configured
  }
  return raw;
};

const ethereumChainId = Number(import.meta.env.VITE_ETHEREUM_CHAIN_ID);
const zkEvmChainId = Number(import.meta.env.VITE_POLYGON_ZK_EVM_CHAIN_ID);

const ethereumWalletRpc = resolveWalletRpc(
  String(
    import.meta.env.VITE_ETHEREUM_WALLET_RPC_URL || import.meta.env.VITE_ETHEREUM_RPC_URL || ""
  ),
  ethereumChainId === 11155111 ? PUBLIC_SEPOLIA_RPC : undefined
);
const zkEvmWalletRpc = resolveWalletRpc(
  String(
    import.meta.env.VITE_POLYGON_ZK_EVM_WALLET_RPC_URL ||
      import.meta.env.VITE_POLYGON_ZK_EVM_RPC_URL ||
      ""
  ),
  zkEvmChainId === 7733 ? PUBLIC_TAJIR_TESTNET_RPC : undefined
);

const ethereumNetwork = defineChain({
  blockExplorers: {
    default: { name: "Etherscan", url: String(import.meta.env.VITE_ETHEREUM_EXPLORER_URL) },
  },
  caipNetworkId: `eip155:${ethereumChainId}`,
  chainNamespace: "eip155",
  id: ethereumChainId,
  name: ethereumChainId === 11155111 ? "Sepolia" : "Ethereum",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: { default: { http: [ethereumWalletRpc] } },
});

const zkEvmNetwork = defineChain({
  blockExplorers: {
    default: {
      name: "Explorer",
      url: String(import.meta.env.VITE_POLYGON_ZK_EVM_EXPLORER_URL),
    },
  },
  caipNetworkId: `eip155:${zkEvmChainId}`,
  chainNamespace: "eip155",
  id: zkEvmChainId,
  name: String(
    import.meta.env.VITE_POLYGON_ZK_EVM_NETWORK_NAME ||
      import.meta.env.VITE_NETWORK_NAME ||
      "Tajir Chain"
  ),
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: String(import.meta.env.VITE_NETWORK_SYMBOL || "ETH"),
  },
  rpcUrls: {
    default: {
      http: [zkEvmWalletRpc],
    },
  },
});

/**
 * Trust Wallet does NOT ship Sepolia or Tajir by default — both are custom
 * networks. Connecting with defaultNetwork=Sepolia makes Trust fail the session
 * ("Connection declined / previous request is still active") because it cannot
 * switch to an unknown chain during connect.
 *
 * Ethereum mainnet IS built into Trust, so we:
 * 1) Connect against mainnet (required WC chain = 1)
 * 2) After connect, prompt wallet_addEthereumChain for Sepolia + Tajir
 *
 * Important WalletConnect detail: do NOT list Sepolia/Tajir in
 * universalProviderConfigOverride.chains. If they are in the WC session
 * proposal, MetaMask/Trust often "approve" them without an Add Network UI,
 * then wallet_switchEthereumChain silently succeeds and add looks like
 * "already added". Keep only eip155:1 in the WC session; add custom chains
 * via EIP-3085 after connect.
 *
 * Trust is featured so it always shows, extension or not. AppKit replaces the
 * featured (WalletConnect) Trust entry with the injected EIP-6963 one when the
 * extension is installed — WalletUtil dedupes them by rdns, so only one row
 * renders and the click goes down the injected path. The "Connection declined /
 * previous request is still active" decline comes from a leftover WC proposal,
 * so connectProvider aborts via resetWcConnection + disconnect before open().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const networks: [any, ...any[]] = [ethereumMainnet, ethereumNetwork, zkEvmNetwork];

createAppKit({
  adapters: [new Ethers5Adapter()],
  allowUnsupportedChain: true,
  allWallets: "HIDE",
  customWallets: [],
  defaultNetwork: ethereumMainnet,
  // Drop the unnamed generic "Browser Wallet" row. Real extensions still show
  // through EIP-6963 (MetaMask, Trust, Tajir all announce themselves).
  enableInjected: false,
  enableReconnect: true,
  excludeWalletIds: [MY_WALLET_ID],
  featuredWalletIds: [METAMASK_WALLET_ID, TRUST_WALLET_ID, COINBASE_WALLET_ID],
  features: {
    analytics: true,
    // Default list: MetaMask, Tajir, Trust, Base, Coinbase, WalletConnect.
    connectorTypeOrder: ["injected", "featured", "external", "custom", "walletConnect"],
    email: false,
    socials: [],
  },
  // Explorer list is MetaMask / Trust / Coinbase. Tajir is allowed via our
  // custom id so the installed EIP-6963 connector is not filtered out.
  includeWalletIds: [METAMASK_WALLET_ID, TRUST_WALLET_ID, COINBASE_WALLET_ID, TAJIR_WALLET_ID],
  metadata: {
    description: "Bridge ETH and tokens to Tajir Chain",
    icons: [`${window.location.origin}/logo192.png`, `${window.location.origin}/logo512.png`],
    name: "Tajir Chain Bridge",
    url: window.location.origin,
  },
  networks,
  projectId,
  universalProviderConfigOverride: {
    // Only Ethereum in the WC session proposal so custom chains are NOT
    // pre-approved. Sepolia/Tajir are added afterward via wallet_addEthereumChain
    // (shows MetaMask Add Network UI). Still keep rpcMap entries for after add.
    chains: {
      eip155: ["eip155:1"],
    },
    defaultChain: "eip155:1",
    rpcMap: {
      "eip155:1": "https://ethereum.publicnode.com",
      [`eip155:${ethereumChainId}`]: ethereumWalletRpc,
      [`eip155:${zkEvmChainId}`]: zkEvmWalletRpc,
    },
  },
});

const isTajirConnector = (connector: {
  info?: { name?: string; rdns?: string };
  name?: string;
  provider?: unknown;
}): boolean =>
  isTajirWalletName(connector.name) ||
  isTajirWalletName(connector.info?.name) ||
  isTajirWalletName(connector.info?.rdns) ||
  isTajirInjectedProvider(connector.provider);

/**
 * AppKit hides announced wallets whose explorer id is not in includeWalletIds.
 * Tajir is not in WalletGuide, so tag the installed connector with our custom
 * id. Then drop the featured fallback so only one row remains (with "installed").
 */
const allowInstalledTajirConnector = (): boolean => {
  let found = false;
  const tajirLogo = getTajirCustomWallet().image_url;
  ConnectorController.state.connectors.forEach((connector) => {
    if (!isTajirConnector(connector)) {
      return;
    }
    found = true;
    if (connector.explorerId !== TAJIR_WALLET_ID) {
      connector.explorerId = TAJIR_WALLET_ID;
    }
    if (!connector.imageUrl) {
      connector.imageUrl = tajirLogo;
    }
  });
  return found;
};

const sameWalletIds = (
  left: Array<{ id?: string }> | undefined,
  right: Array<{ id?: string }>
): boolean => {
  const from = left ?? [];
  return from.length === right.length && from.every((wallet, index) => wallet.id === right[index]?.id);
};

/**
 * Default connect-modal order (same wallets/logos, groups only):
 * MetaMask, Tajir Wallet, Trust Wallet, Base, Coinbase, WalletConnect.
 * Tajir is spliced into featured when the extension is not installed.
 * When it is installed, only the EIP-6963 row is shown (installed tag).
 */
const syncConnectModalOrder = (): void => {
  const tajirInstalled = allowInstalledTajirConnector();
  const explorer = ApiController.state.allFeatured;
  const metamask = explorer.find((wallet) => wallet.id === METAMASK_WALLET_ID);
  const trust = explorer.find((wallet) => wallet.id === TRUST_WALLET_ID);
  const coinbase = explorer.find((wallet) => wallet.id === COINBASE_WALLET_ID);

  const nextFeatured = [metamask, tajirInstalled ? undefined : getTajirCustomWallet(), trust].filter(
    (wallet): wallet is NonNullable<typeof wallet> => Boolean(wallet)
  );

  if (!sameWalletIds(ApiController.state.featured, nextFeatured)) {
    ApiController.state.featured = nextFeatured;
  }

  const nextCustom = coinbase ? [coinbase] : [];
  if (!sameWalletIds(OptionsController.state.customWallets, nextCustom)) {
    OptionsController.setCustomWallets(nextCustom);
  }
};

syncConnectModalOrder();
ConnectorController.subscribeKey("connectors", () => {
  syncConnectModalOrder();
});
ApiController.subscribeKey("allFeatured", () => {
  syncConnectModalOrder();
});

if (typeof window !== "undefined") {
  window.addEventListener("eip6963:announceProvider", (event: Event) => {
    if (!("detail" in event)) {
      return;
    }
    const detail = event.detail;
    if (typeof detail !== "object" || detail === null) {
      return;
    }
    const info = "info" in detail ? detail.info : undefined;
    const infoName =
      typeof info === "object" && info !== null && "name" in info && typeof info.name === "string"
        ? info.name
        : undefined;
    const infoRdns =
      typeof info === "object" && info !== null && "rdns" in info && typeof info.rdns === "string"
        ? info.rdns
        : undefined;
    const nestedProvider = "provider" in detail ? detail.provider : undefined;
    if (
      isTajirWalletName(infoName) ||
      isTajirWalletName(infoRdns) ||
      isTajirInjectedProvider(nestedProvider)
    ) {
      syncConnectModalOrder();
    }
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

/** Drop stale WalletConnect pairing keys that leave proposals "still active".
 * Do not wipe @appkit / @w3m caches here — that races AppKit's IndexedDB and
 * causes "IDBDatabase: The database connection is closing" on first wallet click.
 */
const clearStaleWalletConnectStorage = (): void => {
  if (typeof localStorage === "undefined") {
    return;
  }
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) {
      continue;
    }
    const lower = key.toLowerCase();
    if (key.startsWith("wc@2:") || lower.includes("walletconnect")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const settleMs = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const errorMessageOf = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === "object" && value !== null && "message" in value) {
    const message = value.message;
    return typeof message === "string" ? message : "";
  }
  return "";
};

/** WalletConnect Core surfaces this when IndexedDB was closed mid-handshake. */
const isIndexedDbClosingError = (value: unknown): boolean => {
  const lower = errorMessageOf(value).toLowerCase();
  return (
    lower.includes("database connection is closing") ||
    (lower.includes("idbdatabase") && lower.includes("closing"))
  );
};

/**
 * True only when AppKit still holds an in-flight WC URI / pairing.
 * Always tearing down WC races IndexedDB after enabling an extension without refresh.
 */
const hasPendingWalletConnectProposal = (): boolean => {
  const { status, wcError, wcUri } = ConnectionController.state;
  return Boolean(wcUri) || wcError === true || status === "connecting";
};

const recoverWalletConnectIndexedDb = (): void => {
  try {
    SnackController.hide();
  } catch {
    // ignore
  }
  try {
    ConnectionController.resetWcConnection();
    ConnectionController.resetUri();
  } catch {
    // ignore
  }
  clearStaleWalletConnectStorage();
};

type ProvidersContext = {
  addNetwork: (chain: Chain) => Promise<void>;
  changeNetwork: (chain: Chain) => Promise<void>;
  connectProvider: () => Promise<void>;
  connectedProvider: AsyncTask<ConnectedProvider, string>;
};

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  addNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  connectedProvider: { status: "pending" },
  connectProvider: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
});

const IS_SWITCHING_NETWORK_DELAY = 1500;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

type Eip1193RequestArgs = {
  method: string;
  params?: unknown[];
};

type Eip1193RequestFn = (args: Eip1193RequestArgs, chainId?: string) => unknown;

const isEip1193RequestFn = (value: unknown): value is Eip1193RequestFn =>
  typeof value === "function";

/**
 * WalletConnect UniversalProvider.request is a prototype method. Destructuring
 * it (`const { request } = provider`) drops `this` and crashes with:
 * "Cannot read properties of undefined (reading 'validateChain')".
 * Always invoke as a method on the provider object.
 *
 * UniversalProvider also accepts an optional CAIP chain as the 2nd arg so the
 * request is validated against a chain that exists in the WC session (eip155:1).
 */
const getEip1193Request = (providerWeb3: Web3Provider) => {
  const providerUnknown: unknown = providerWeb3.provider;
  if (!isRecord(providerUnknown)) {
    throw new Error("Wallet provider cannot add or switch networks");
  }

  const maybeRequest = providerUnknown.request;
  if (!isEip1193RequestFn(maybeRequest)) {
    throw new Error("Wallet provider cannot add or switch networks");
  }

  const eip1193 = providerUnknown;
  const requestFn = maybeRequest;
  /**
   * Tajir is a MetaMask fork and speaks EIP-1193 directly. Pinning its requests
   * to eip155:1 (the only chain in the WC session) makes add/switch a silent
   * no-op, so the wallet never leaves Ethereum. Treat it as injected — other
   * wallets keep their existing WalletConnect behaviour.
   */
  const isWalletConnect =
    !isTajirEip1193Provider(eip1193) &&
    Boolean(
      eip1193.isWalletConnect === true ||
        eip1193.session !== undefined ||
        eip1193.client !== undefined
    );

  const request = (args: Eip1193RequestArgs): Promise<unknown> => {
    if (isWalletConnect) {
      return Promise.resolve(requestFn.call(eip1193, args, "eip155:1"));
    }
    return Promise.resolve(requestFn.call(eip1193, args));
  };

  return { isWalletConnect, request };
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (isRecord(error) && "message" in error) {
    return String(error.message);
  }
  return String(error);
};

/** Trust (and some WC wallets) reject add/switch methods in the session. */
const isWalletConnectMethodUnsupported = (error: unknown): boolean => {
  const message = getErrorMessage(error);
  return /Missing or invalid\.\s*request\(\)\s*method|method is not available|does not exist\/is not available|wallet_addEthereumChain|wallet_switchEthereumChain/i.test(
    message
  );
};

const manualAddNetworkError = (chain: Chain): Error =>
  new Error(
    `Your mobile wallet did not accept an Add Network request over WalletConnect. ` +
      `Add "${chain.name}" manually — Chain ID ${chain.chainId}, RPC ${chain.walletRpcUrl} — then reconnect.`
  );

const ProvidersProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { close, open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address, isConnected, status } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { chainId, switchNetwork: switchAppKitNetwork } = useAppKitNetwork();

  const [connectedProvider, setConnectedProvider] = useState<AsyncTask<ConnectedProvider, string>>({
    status: "pending",
  });

  // Wallets (esp. MetaMask) can emit a spurious disconnect while switching chains.
  // Ignore AppKit "disconnected" briefly so PrivateRoute does not bounce to /login.
  const isSwitchingNetworkRef = useRef(false);
  const switchingNetworkTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  // Prevent overlapping WalletConnect proposals ("previous request is still active").
  const isOpeningModalRef = useRef(false);
  const walletProviderWaitRef = useRef<ReturnType<typeof setTimeout>>();
  const networkEnsureAttemptedRef = useRef(false);
  // User rejected all Add Network prompts — don't auto-retry from AppKit "connected".
  const networkSetupRejectedRef = useRef(false);

  const getAppKitNetwork = useCallback((id: number) => {
    if (id === ethereumChainId) {
      return ethereumNetwork;
    }
    if (id === zkEvmChainId) {
      return zkEvmNetwork;
    }
    if (id === 1) {
      return ethereumMainnet;
    }
    return undefined;
  }, []);

  const beginNetworkSwitch = useCallback(() => {
    isSwitchingNetworkRef.current = true;
    if (switchingNetworkTimeoutRef.current) {
      clearTimeout(switchingNetworkTimeoutRef.current);
    }
  }, []);

  const endNetworkSwitch = useCallback(() => {
    if (switchingNetworkTimeoutRef.current) {
      clearTimeout(switchingNetworkTimeoutRef.current);
    }
    switchingNetworkTimeoutRef.current = setTimeout(() => {
      isSwitchingNetworkRef.current = false;
    }, IS_SWITCHING_NETWORK_DELAY);
  }, []);

  useEffect(() => {
    return () => {
      if (switchingNetworkTimeoutRef.current) {
        clearTimeout(switchingNetworkTimeoutRef.current);
      }
      if (walletProviderWaitRef.current) {
        clearTimeout(walletProviderWaitRef.current);
      }
    };
  }, []);

  // React to AppKit state changes and map to existing context state
  useEffect(() => {
    if (walletProviderWaitRef.current) {
      clearTimeout(walletProviderWaitRef.current);
      walletProviderWaitRef.current = undefined;
    }

    if (status === "connecting" || status === "reconnecting") {
      // Keep the session during reconnect blips (common during network switches)
      setConnectedProvider((current) =>
        current.status === "successful" || current.status === "reloading"
          ? { data: current.data, status: "reloading" }
          : { status: "pending" }
      );
    } else if (isConnected && address && walletProvider) {
      if (networkSetupRejectedRef.current) {
        return;
      }
      try {
        const web3Provider = new Web3Provider(walletProvider, "any");
        const nextData = {
          account: getChecksumAddress(address),
          chainId: chainId ? Number(chainId) : Number(import.meta.env.VITE_ETHEREUM_CHAIN_ID),
          provider: web3Provider,
        };
        setConnectedProvider((current) => {
          // Already connected / mid network-setup — only refresh account/chain data.
          if (current.status === "successful" || current.status === "reloading") {
            return { data: nextData, status: current.status };
          }
          // First session: close the wallet modal and stay on login while we prompt
          // Trust/MetaMask to add Sepolia + Tajir (not present by default).
          try {
            void close();
          } catch {
            // ignore
          }
          return { data: nextData, status: "reloading" };
        });
      } catch (error) {
        setConnectedProvider({
          error: "An error occurred parsing the provider",
          status: "failed",
        });
      }
    } else if (isConnected && address && !walletProvider) {
      // Trust / WC can report connected before AppKit exposes walletProvider.
      // Stay pending briefly instead of treating it as a failed/declined connect.
      setConnectedProvider((current) =>
        current.status === "successful" || current.status === "reloading"
          ? current
          : { status: "pending" }
      );
      walletProviderWaitRef.current = setTimeout(() => {
        setConnectedProvider((current) => {
          if (current.status === "successful" || current.status === "reloading") {
            return current;
          }
          return {
            error:
              "Wallet connected but the provider is not ready yet. Close any open wallet request and try again.",
            status: "failed",
          };
        });
      }, 8000);
    } else if (status === "disconnected") {
      if (isSwitchingNetworkRef.current) {
        return;
      }
      setConnectedProvider({ error: "Disconnected", status: "failed" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId, isConnected, status, walletProvider]);

  // Hide / recover from WalletConnect IndexedDB "connection is closing" toasts
  // (common after enabling an extension without refreshing the page).
  useEffect(() => {
    const hideIndexedDbSnack = (message: string) => {
      if (!isIndexedDbClosingError(message)) {
        return;
      }
      recoverWalletConnectIndexedDb();
    };

    const unsubMessage = SnackController.subscribeKey("message", (message) => {
      if (SnackController.state.open) {
        hideIndexedDbSnack(message);
      }
    });
    const unsubOpen = SnackController.subscribeKey("open", (open) => {
      if (open) {
        hideIndexedDbSnack(SnackController.state.message);
      }
    });

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isIndexedDbClosingError(event.reason)) {
        return;
      }
      event.preventDefault();
      recoverWalletConnectIndexedDb();
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      unsubMessage();
      unsubOpen();
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  const connectProvider = useCallback(async (): Promise<void> => {
    if (isOpeningModalRef.current) {
      return;
    }
    isOpeningModalRef.current = true;
    try {
      networkSetupRejectedRef.current = false;

      try {
        await close();
      } catch {
        // ignore
      }

      // Only abort WC when a proposal is actually pending. Always calling
      // disconnect() / resetWcConnection() closes WalletConnect's IndexedDB
      // while AppKit still holds the handle → red "database connection is
      // closing" toast after enabling an extension without a page refresh.
      // Trust "previous request is still active" still gets cleaned when wcUri
      // / connecting / wcError is set.
      if (hasPendingWalletConnectProposal()) {
        try {
          ConnectionController.resetWcConnection();
          ConnectionController.resetUri();
        } catch {
          // ignore
        }
        try {
          await disconnect();
        } catch {
          // ignore — still attempt a fresh open
        }
        await settleMs(400);
        clearStaleWalletConnectStorage();
        await settleMs(200);
      }

      setConnectedProvider({ status: "pending" });
      await open();
    } catch (error) {
      if (isIndexedDbClosingError(error)) {
        recoverWalletConnectIndexedDb();
        await settleMs(300);
        try {
          await open();
        } catch {
          window.location.reload();
        }
        return;
      }
      throw error;
    } finally {
      isOpeningModalRef.current = false;
    }
  }, [close, disconnect, open]);

  const syncAppKitChain = useCallback(
    async (chainId: number): Promise<void> => {
      const appKitNetwork = getAppKitNetwork(chainId);
      if (!appKitNetwork) {
        return;
      }
      beginNetworkSwitch();
      try {
        await switchAppKitNetwork(appKitNetwork);
      } finally {
        endNetworkSwitch();
      }
    },
    [beginNetworkSwitch, endNetworkSwitch, getAppKitNetwork, switchAppKitNetwork]
  );

  /**
   * Ensure a chain exists in the wallet and is active.
   * WalletConnect: add-first (session only has eip155:1, so MetaMask can prompt).
   * Injected: switch → add if missing → switch + verify.
   */
  const ensureChainInWallet = useCallback(
    async (chain: Chain, providerWeb3: Web3Provider): Promise<void> => {
      const { isWalletConnect, request } = getEip1193Request(providerWeb3);

      const switchToChain = () =>
        request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexValue(chain.chainId) }],
        });

      const addChain = () =>
        request({
          method: "wallet_addEthereumChain",
          params: [
            {
              blockExplorerUrls: [chain.explorerUrl],
              chainId: hexValue(chain.chainId),
              chainName: chain.name,
              nativeCurrency: {
                decimals: chain.nativeCurrency.decimals,
                name: chain.nativeCurrency.name,
                symbol: chain.nativeCurrency.symbol,
              },
              rpcUrls: [chain.walletRpcUrl],
            },
          ],
        });

      const verifyActive = async () => {
        const { chainId: activeId } = await providerWeb3.getNetwork();
        if (activeId !== chain.chainId) {
          throw new Error(`Wallet did not switch to ${chain.name} (chain ${chain.chainId})`);
        }
      };

      beginNetworkSwitch();
      try {
        if (isWalletConnect) {
          // Always add first — WC switch is a silent no-op when the chain is
          // already listed in session namespaces (no MetaMask prompt).
          try {
            await addChain();
          } catch (addError) {
            if (isMetaMaskUserRejectedRequestError(addError)) {
              throw addError;
            }
            if (isWalletConnectMethodUnsupported(addError)) {
              try {
                await syncAppKitChain(chain.chainId);
              } catch {
                // ignore
              }
              throw manualAddNetworkError(chain);
            }
            // "already exists" / similar — continue to switch.
          }

          try {
            await switchToChain();
          } catch (switchError) {
            if (isMetaMaskUserRejectedRequestError(switchError)) {
              throw switchError;
            }
            if (isWalletConnectMethodUnsupported(switchError)) {
              try {
                await syncAppKitChain(chain.chainId);
              } catch {
                // ignore
              }
              throw manualAddNetworkError(chain);
            }
          }

          try {
            await syncAppKitChain(chain.chainId);
          } catch {
            // AppKit sync is best-effort after a successful wallet add/switch.
          }
          return;
        }

        try {
          await switchToChain();
          await verifyActive();
          return;
        } catch (switchError) {
          if (isMetaMaskUserRejectedRequestError(switchError)) {
            throw switchError;
          }
        }

        try {
          await addChain();
        } catch (addError) {
          if (isMetaMaskUserRejectedRequestError(addError)) {
            throw addError;
          }
          // Some wallets error when the chain already exists — still try switch.
        }

        await switchToChain();
        await verifyActive();
      } finally {
        endNetworkSwitch();
      }
    },
    [beginNetworkSwitch, endNetworkSwitch, syncAppKitChain]
  );

  const addNetwork = useCallback(
    async (chain: Chain): Promise<void> => {
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        return Promise.reject(new Error("No provider is available"));
      }
      await ensureChainInWallet(chain, connectedProvider.data.provider);
    },
    [connectedProvider, ensureChainInWallet]
  );

  // After connect: prompt add/switch for both bridge networks. Stay on login
  // until done. Require at least one network accepted — rejecting both stays
  // on login with an error instead of advancing to /home.
  useEffect(() => {
    if (connectedProvider.status === "failed") {
      networkEnsureAttemptedRef.current = false;
      return;
    }
    if (connectedProvider.status !== "reloading" || !env) {
      return;
    }
    if (networkEnsureAttemptedRef.current) {
      return;
    }
    networkEnsureAttemptedRef.current = true;

    const session = connectedProvider.data;

    void (async () => {
      let ensuredCount = 0;

      for (const chain of env.chains) {
        try {
          await ensureChainInWallet(chain, session.provider);
          try {
            await syncAppKitChain(chain.chainId);
          } catch {
            // AppKit sync is best-effort
          }
          ensuredCount += 1;
        } catch {
          // User rejected or wallet could not add/switch this chain — try the next.
        }
      }

      if (ensuredCount === 0) {
        networkSetupRejectedRef.current = true;
        setConnectedProvider({
          error:
            "Network setup was cancelled. Approve at least one Add Network request to continue.",
          status: "failed",
        });
        return;
      }

      // Land on L1 (Sepolia) when possible so the bridge home state is consistent.
      const l1 = env.chains[0];
      if (l1) {
        try {
          await ensureChainInWallet(l1, session.provider);
          await syncAppKitChain(l1.chainId);
        } catch {
          // ignore — user may stay on the network they approved
        }
      }

      let finalChainId = l1?.chainId ?? session.chainId;
      try {
        finalChainId = (await session.provider.getNetwork()).chainId;
      } catch {
        // keep last known / L1 target
      }

      setConnectedProvider({
        data: {
          account: session.account,
          chainId: finalChainId,
          provider: session.provider,
        },
        status: "successful",
      });
      networkSetupRejectedRef.current = false;
    })();
  }, [connectedProvider, ensureChainInWallet, env, syncAppKitChain]);

  const changeNetwork = useCallback(
    async (chain: Chain) => {
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        return Promise.reject(new Error(providersContextNotReadyErrorMsg));
      }

      const providerWeb3 = connectedProvider.data.provider;

      try {
        await ensureChainInWallet(chain, providerWeb3);
        try {
          await syncAppKitChain(chain.chainId);
        } catch {
          // AppKit sync is best-effort when the wallet switch already succeeded
        }

        // Wallets that do not emit a chain change leave AppKit on the chain it
        // connected with, so read the active chain from the wallet itself.
        let activeChainId = chain.chainId;
        try {
          activeChainId = (await providerWeb3.getNetwork()).chainId;
        } catch {
          // keep the requested chain
        }
        setConnectedProvider((current) => {
          if (current.status === "successful") {
            return { data: { ...current.data, chainId: activeChainId }, status: "successful" };
          }
          if (current.status === "reloading") {
            return { data: { ...current.data, chainId: activeChainId }, status: "reloading" };
          }
          return current;
        });
      } catch (error) {
        if (isMetaMaskUserRejectedRequestError(error)) {
          throw error;
        }
        const message =
          error instanceof Error
            ? error.message
            : `Failed to switch to ${chain.name}. Add the network in your wallet and try again.`;
        throw new Error(message);
      }
    },
    [connectedProvider, ensureChainInWallet, syncAppKitChain]
  );

  const value = useMemo(
    () => ({
      addNetwork,
      changeNetwork,
      connectedProvider,
      connectProvider,
    }),
    [connectedProvider, addNetwork, changeNetwork, connectProvider]
  );

  return <providersContext.Provider value={value} {...props} />;
};

const useProvidersContext = (): ProvidersContext => {
  return useContext(providersContext);
};

export { ProvidersProvider, useProvidersContext };
