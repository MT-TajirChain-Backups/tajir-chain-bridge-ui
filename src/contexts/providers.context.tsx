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
 * Also: do not feature Trust's WalletConnect explorer id when the Trust
 * extension is installed — that dual-path causes the same decline message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const networks: [any, ...any[]] = [ethereumMainnet, ethereumNetwork, zkEvmNetwork];

const METAMASK_WALLET_ID = "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96";
const COINBASE_WALLET_ID = "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa";

createAppKit({
  adapters: [new Ethers5Adapter()],
  allowUnsupportedChain: true,
  allWallets: "SHOW",
  defaultNetwork: ethereumMainnet,
  enableReconnect: true,
  featuredWalletIds: [METAMASK_WALLET_ID, COINBASE_WALLET_ID],
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
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

/** Drop stale WalletConnect / AppKit keys that leave proposals "still active". */
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
    if (
      key.startsWith("wc@2:") ||
      key.startsWith("@w3m") ||
      key.startsWith("@appkit") ||
      key.startsWith("W3M") ||
      lower.includes("walletconnect")
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
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
  const isWalletConnect = Boolean(
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

  const connectProvider = useCallback(async (): Promise<void> => {
    if (isOpeningModalRef.current) {
      return;
    }
    isOpeningModalRef.current = true;
    try {
      // Trust extension often accepts while AppKit still holds a WC proposal from a
      // previous attempt ("Connection declined / previous request is still active").
      // Always tear down AppKit/WC state before opening a fresh connect modal.
      try {
        await disconnect();
      } catch {
        // ignore — still attempt a fresh open
      }
      clearStaleWalletConnectStorage();
      setConnectedProvider({ status: "pending" });
      await open();
    } finally {
      isOpeningModalRef.current = false;
    }
  }, [disconnect, open]);

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

  // After connect: prompt add/switch for both bridge networks (MetaMask WC +
  // injected). Stay on login until done, then land on L1 when possible.
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
      for (const chain of env.chains) {
        try {
          await ensureChainInWallet(chain, session.provider);
          try {
            await syncAppKitChain(chain.chainId);
          } catch {
            // AppKit sync is best-effort
          }
        } catch (error) {
          if (!isMetaMaskUserRejectedRequestError(error)) {
            // Continue setup for remaining chains
          }
        }
      }

      // Land on L1 (Sepolia) when possible so the bridge home state is consistent.
      const l1 = env.chains[0];
      if (l1) {
        try {
          await ensureChainInWallet(l1, session.provider);
          await syncAppKitChain(l1.chainId);
        } catch {
          // ignore — user may stay on another chain
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
