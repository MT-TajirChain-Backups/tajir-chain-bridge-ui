import copy from "copy-to-clipboard";
import { useEffect, useMemo, useState } from "react";

import { CardRedesign } from "../card/card.view.redesign";
import { parseError } from "src/adapters/error";
import ArrowRightIconGreen from "src/assets/icons/arrow-right-green.svg?react";
import ArrowRight  from "src/assets/icons/arrow-right.svg?react";
import CopyIcon from "src/assets/icons/copy-outlined.svg?react";
import WarningIcon from "src/assets/icons/warning.svg?react";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useUIContext } from "src/contexts/ui.context";
import { Chain, Message } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { ExternalLink } from "src/views/shared/external-link/external-link.view";
import { useNetworkBoxRedesignStyles } from "src/views/shared/network-box/network-box.styles";
import { Typography } from "src/views/shared/typography/typography.view";
// import { Divider } from "src/views/divider/divider.view";

type ListValueObject = {
  icon: JSX.Element;
  onClick?: () => void;
};

export const NetworkBoxRedesign = () => {
  const classes = useNetworkBoxRedesignStyles();
  const env = useEnvContext();
  const { addNetwork, connectedProvider } = useProvidersContext();
  const [isAddNetworkButtonDisabled, setIsAddNetworkButtonDisabled] = useState(false);
  const { openSnackbar } = useUIContext();
  const callIfMounted = useCallIfMounted();
  const { notifyError } = useErrorContext();

  const ethereumChain = env?.chains[0];
  const polygonZkEVMChain = env?.chains[1];

  const isNumberArray = (val: unknown): val is number[] => Array.isArray(val) && val.every((item) => typeof item === "number");

  const [discoveredChainIds, setDiscoveredChainIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("discoveredChainIds");
    if (saved) {
      try { 
        const parsed: unknown = JSON.parse(saved); 
        if (isNumberArray(parsed)) {
          return parsed;
        }
      } catch (e) { 
        return []; 
      }
    }
    return [];
  });

  const [activeChainInBox, setActiveChainInBox] = useState<Chain | undefined>(polygonZkEVMChain);

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("discoveredChainIds", JSON.stringify(discoveredChainIds));
  }, [discoveredChainIds]);

  // 1. Session Memory: Track all chainIds encountered via connectedProvider
  useEffect(() => {
    if (isAsyncTaskDataAvailable(connectedProvider)) {
      const currentId = connectedProvider.data.chainId;
      setDiscoveredChainIds((prev) => (prev.includes(currentId) ? prev : [...prev, currentId]));
    }
  }, [connectedProvider]);

  // 2. Dynamic Switching: Show the "other" chain in the box
  useEffect(() => {
    if (isAsyncTaskDataAvailable(connectedProvider) && ethereumChain && polygonZkEVMChain) {
      const currentId = connectedProvider.data.chainId;
      if (currentId === ethereumChain.chainId) {
        setActiveChainInBox(polygonZkEVMChain);
      } else if (currentId === polygonZkEVMChain.chainId) {
        setActiveChainInBox(ethereumChain);
      }
    }
  }, [connectedProvider, ethereumChain, polygonZkEVMChain]);

  const isNetworkAlreadyAdded = useMemo(() => {
    const targetChain = activeChainInBox;
    if (!targetChain) {
      return false;
    }
    // Check if it's in our session memory
    return discoveredChainIds.includes(targetChain.chainId);
  }, [discoveredChainIds, activeChainInBox]);

  const isConnected = isAsyncTaskDataAvailable(connectedProvider);
  const isLoginNetworkSetup = connectedProvider.status === "reloading";

  const buttonText = useMemo(() => {
    if (!isConnected) {
      return "Connect Wallet First";
    }

    // During mobile login setup, allow Continue even if localStorage already
    // marked the chain — that flag does not unlock home by itself.
    if (isNetworkAlreadyAdded && isLoginNetworkSetup) {
      return "Continue to Bridge";
    }

    if (isNetworkAlreadyAdded) {
      return "Network Added";
    }
    const networkName = activeChainInBox?.name ?? "";
    return window.innerWidth < 788 ? `Add ${networkName}` : `Add ${networkName} To Wallet`;
  }, [isConnected, isNetworkAlreadyAdded, isLoginNetworkSetup, activeChainInBox]);

  // const name = env?.networkName;
  const symbol = env?.networkSymbol;

  const onCopyText = (text: string) => () => {
    const success = copy(text);

    if (success) {
      openSnackbar({ text: "Copied to clipboard!", type: "success-msg" });
    } else {
      openSnackbar({ text: "Failed to copy", type: "error-msg" });
    }
  };

  const getListValueObject = (label: string, value: string | URL): ListValueObject => {
    switch (label) {
      case "RPC URL":
      case "Chain ID":
      case "Currency symbol": {
        return {
          icon: <CopyIcon />,
          onClick: onCopyText(String(value)),
        };
      }
      case "Block explorer URL":
      case "Smart Contract":
      default: {
        return {
          icon: <ArrowRightIconGreen />,
          onClick: () => window.open(value, "_blank"),
        };
      }
    }
  };

  const successMsg: Message = useMemo(
    () => ({
      text: `${polygonZkEVMChain?.name ?? "Polygon"} network successfully added`,
      type: "success-msg",
    }),
    [polygonZkEVMChain?.name]
  );

  const alreadyAddedMsg: Message = useMemo(
    () => ({
      text: `${polygonZkEVMChain?.name ?? "Polygon"} network is already added`,
      type: "success-msg",
    }),
    [polygonZkEVMChain?.name]
  );

  const details = useMemo(
    () => [
      // Show the wallet-facing RPC (public), not the app's Origin-gated proxy.
      { icon: "", label: "RPC URL", value: polygonZkEVMChain?.walletRpcUrl },
      { label: "Chain ID", value: polygonZkEVMChain?.chainId },
      {
        label: "Currency symbol",
        value: symbol || polygonZkEVMChain?.nativeCurrency.symbol,
      },
      {
        label: "Block explorer URL",
        value: polygonZkEVMChain?.explorerUrl,
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        link: polygonZkEVMChain?.explorerUrl,
      },
      {
        label: `${ethereumChain?.name ?? "Ethereum"} Smart Contract`,
        link: ethereumChain
          ? `${ethereumChain.explorerUrl}/address/${ethereumChain.poeContractAddress}`
          : "",
        value: ethereumChain?.poeContractAddress ?? "",
      },
    ],
    [polygonZkEVMChain, ethereumChain, symbol]
  );

  const onAddNetwork = (): void => {
    if (!isConnected) {
      return;
    }

    setIsAddNetworkButtonDisabled(true);
    const targetChain = activeChainInBox;
    if (!targetChain) {
      setIsAddNetworkButtonDisabled(false);
      return;
    }
    addNetwork(targetChain)
      .then(() => {
        // Record as discovered
        setDiscoveredChainIds((prev) =>
          prev.includes(targetChain.chainId) ? prev : [...prev, targetChain.chainId]
        );
        callIfMounted(() => {
          openSnackbar(successMsg);
        });
      })
      .catch((error) => {
        callIfMounted(() => {
          void parseError(error).then((parsed) => {
            const message =
              error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : parsed;
            if (parsed === "wrong-network") {
              openSnackbar(successMsg);
            } else if (
              parsed === "already-added" ||
              /already (been )?added|chain.*(exists|present)/i.test(message)
            ) {
              setDiscoveredChainIds((prev) =>
                prev.includes(targetChain.chainId) ? prev : [...prev, targetChain.chainId]
              );
              openSnackbar(alreadyAddedMsg);
            } else if (isMetaMaskUserRejectedRequestError(error) === false) {
              notifyError(error instanceof Error ? error : new Error(message));
            }
          });
        });
      })
      .finally(() => {
        callIfMounted(() => {
          setIsAddNetworkButtonDisabled(false);
        });
      });
  };

  if (!env || !ethereumChain || !polygonZkEVMChain || !activeChainInBox) {
    return null;
  }

  return (
    <CardRedesign>
      <div className={classes.networkBox}>
        <div className={classes.connectWalletBox}>
          <div className={classes.titlesBox}>
            <div className={classes.largeTitle}>Add a network</div>
          </div>

          <a
            className={classes.buttonRounded}
            href="https://t.me/TajirChain"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className={classes.reportTitle}> Report an issue </div>
            <WarningIcon className={classes.reportIcon} />
          </a>
        </div>
        <button
          className={classes.button}
          disabled={
            isAddNetworkButtonDisabled ||
            !isConnected ||
            (isNetworkAlreadyAdded && !isLoginNetworkSetup)
          }
          onClick={onAddNetwork}
        >
          <div className={classes.buttonIconAndTitle}>{buttonText}</div>
          <div>
            <ArrowRight className={classes.buttonArrow} />
          </div>
        </button>
        {/* <Divider /> */}
        <div className={classes.list} style={{ display: "none" }}>
          {details.map(({ label, link, value }) => {
            const { icon, onClick } = getListValueObject(label, link ?? String(value) ?? "");
            return (
              <Typography key={label} type="body2">
                <div className={classes.listItem}>
                  <div className={classes.listItemLabel}> {label}:</div>
                  <div className={classes.listItemValue} onClick={onClick}>
                    {link ? <ExternalLink href={link}>{value}</ExternalLink> : value}
                    <div className={classes.listIcon}> {icon}</div>
                  </div>
                </div>
              </Typography>
            );
          })}
        </div>
      </div>
    </CardRedesign>
  );
};
