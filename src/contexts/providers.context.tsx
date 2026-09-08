import { Web3Provider } from "@ethersproject/providers";
import { defineChain } from "@reown/appkit/networks";
import { createAppKit, useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
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
  useState,
} from "react";

import { AsyncTask, Chain, ConnectedProvider } from "src/domain";
import { getChecksumAddress } from "src/utils/addresses";
import {
  isAsyncTaskDataAvailable,
  isMetaMaskResourceUnavailableError,
  isMetaMaskUnknownChainError,
  isMetaMaskUserRejectedRequestError,
} from "src/utils/types";


// AppKit Initialization
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID ? String(import.meta.env.VITE_REOWN_PROJECT_ID) : "YOUR_PROJECT_ID";

const ethereumNetwork = defineChain({
  blockExplorers: { default: { name: 'Etherscan', url: String(import.meta.env.VITE_ETHEREUM_EXPLORER_URL) } },
  caipNetworkId: `eip155:${Number(import.meta.env.VITE_ETHEREUM_CHAIN_ID)}`,
  chainNamespace: 'eip155',
  id: Number(import.meta.env.VITE_ETHEREUM_CHAIN_ID),
  name: 'Ethereum',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: [String(import.meta.env.VITE_ETHEREUM_RPC_URL)] } },
});

const mainnetNetwork = defineChain({
  blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
  caipNetworkId: 'eip155:1',
  chainNamespace: 'eip155',
  id: 1,
  name: 'Ethereum Mainnet',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const networks: [any, ...any[]] = [mainnetNetwork, ethereumNetwork];

const TRUST_WALLET_ID = "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0";
const COINBASE_WALLET_ID = "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa";

createAppKit({
  adapters: [new Ethers5Adapter()],
  allowUnsupportedChain: true,
  allWallets: "HIDE", // Hides the "All Wallets" button
  featuredWalletIds: [TRUST_WALLET_ID, COINBASE_WALLET_ID],
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  metadata: {
    description: "Bridge ETH and tokens to Tajir Chain",
    icons: [`${window.location.origin}/logo192.png`, `${window.location.origin}/logo512.png`],
    name: "Tajir Chain Bridge",
    url: window.location.origin,
  },
  networks,
  projectId,
});



type ProvidersContext ={
  addNetwork: (chain: Chain) => Promise<void>;
  changeNetwork: (chain: Chain) => Promise<void>;
  connectProvider: () => Promise<void>;
  connectedProvider: AsyncTask<ConnectedProvider, string>;
}

const providersContextNotReadyErrorMsg = "The providers context is not yet ready";

const providersContext = createContext<ProvidersContext>({
  addNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  changeNetwork: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
  connectedProvider: { status: "pending" },
  connectProvider: () => Promise.reject(new Error(providersContextNotReadyErrorMsg)),
});

const ProvidersProvider: FC<PropsWithChildren> = (props) => {
  const { close, open } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const { chainId } = useAppKitNetwork();

  const [connectedProvider, setConnectedProvider] = useState<AsyncTask<ConnectedProvider, string>>({
    status: "pending",
  });

  const IS_SWITCHING_NETWORK_DELAY = 1000;

  // React to AppKit state changes and map to existing context state
  useEffect(() => {
    if (status === "connecting" || status === "reconnecting") {
      setConnectedProvider({ status: "pending" });
    } else if (isConnected && walletProvider && address) {
      try {
        const web3Provider = new Web3Provider(walletProvider, "any");
        setConnectedProvider({
          data: {
            account: getChecksumAddress(address),
            chainId: chainId ? Number(chainId) : Number(import.meta.env.VITE_ETHEREUM_CHAIN_ID),
            provider: web3Provider,
          },
          status: "successful",
        });
        
        // Ensure the AppKit modal closes after a successful connection
        try {
          void close();
        } catch (e) {
          // ignore
        }
      } catch (error) {
        setConnectedProvider({
          error: "An error occurred parsing the provider",
          status: "failed",
        });
      }
    } else if (status === "disconnected") {
      setConnectedProvider({ error: "Disconnected", status: "failed" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId, isConnected, status, walletProvider]);

  const connectProvider = useCallback(
    async (): Promise<void> => {
      await open();
    },
    [open]
  );

  const switchNetwork = (chain: Chain, providerWeb3: Web3Provider): Promise<void> => {
    if (!providerWeb3.provider.request) {
      return Promise.reject(
        new Error("No request method is available from the provider to switch the Ethereum chain")
      );
    }
    return providerWeb3.provider
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexValue(chain.chainId) }],
      })
      .then(async () => {
        const { chainId: newChainId } = await providerWeb3.getNetwork();

        if (newChainId !== chain.chainId) {
          throw "wrong-network";
        }
      })
      .catch((error) => {
        if (!isMetaMaskResourceUnavailableError(error)) {
          throw error;
        }
      });
  };

  const addNetwork = useCallback(
    (chain: Chain): Promise<void> => {
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
         return Promise.reject(new Error("No provider is available"));
      }
      const provider = connectedProvider.data.provider;
      const { request } = provider.provider;
      if (!request) {
        return Promise.reject(
          new Error("No request method is available from the provider to add an Ethereum chain")
        );
      }

      return request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexValue(chain.chainId) }],
      })
        .then(() => {
          throw "already-added";
        })
        .catch(async (error) => {
          if (isMetaMaskUnknownChainError(error)) {
            return request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  blockExplorerUrls: [chain.explorerUrl],
                  chainId: hexValue(chain.chainId),
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  // NOT chain.provider.connection.url — that is the URL THIS APP
                  // uses, which may be an Origin-gated proxy path that returns 403
                  // for a wallet. This value is saved permanently in the user's
                  // wallet, so it must be the public endpoint.
                  rpcUrls: [chain.walletRpcUrl],
                },
              ],
            }).then(async () => {
              const { chainId: newChainId } = await provider.getNetwork();
              if (newChainId !== chain.chainId) {
                throw "wrong-network";
              }
            });
          }
          throw error;
        })
        .catch((error) => {
          if (!isMetaMaskResourceUnavailableError(error)) {
            throw error;
          }
        })
        .finally(() => {
          setTimeout(() => {
             // Delay added to prevent race conditions during UI updates
          }, IS_SWITCHING_NETWORK_DELAY);
        });
    },
    [connectedProvider]
  );

  const changeNetwork = useCallback(
    (chain: Chain) => {
      if (
        isAsyncTaskDataAvailable(connectedProvider)
      ) {
        return switchNetwork(chain, connectedProvider.data.provider).catch((error) => {
          // If the user explicitly rejected the switch request, don't spam them with an add request
          if (isMetaMaskUserRejectedRequestError(error)) {
            throw error;
          }
          // Trust Wallet and WalletConnect often throw generic or incorrect error codes (like -32002) 
          // when a chain is missing, instead of the standard 4902. 
          // Safely fallback to addNetwork for any non-rejection error!
          return addNetwork(chain).catch((addError) => {
            throw addError;
          });
        });
      } else {
        return Promise.reject(new Error(providersContextNotReadyErrorMsg));
      }
    },
    [addNetwork, connectedProvider]
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
