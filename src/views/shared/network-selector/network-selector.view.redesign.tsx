import { FC, useEffect, useState } from "react";

import { ChainListRedesign } from "../chain-list/chain-list.view.redesign";
import CaretDown from "src/assets/icons/caret-down.svg?react";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { Chain } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { useNetworkSelectorRedesignStyles } from "src/views/shared/network-selector/network-selector.styles";
import { Typography } from "src/views/shared/typography/typography.view";

export const NetworkSelectorRedesign: FC = () => {
  const classes = useNetworkSelectorRedesignStyles();
  const env = useEnvContext();
  const { changeNetwork, connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const callIfMounted = useCallIfMounted();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState<Chain>();

  useEffect(() => {
    if (env && connectedProvider.status === "successful") {
      let selectedChain = env.chains.find(
        (chain) => chain.chainId === connectedProvider.data.chainId
      );
      if (!selectedChain) {
        selectedChain = env.chains[0];
      }
      setSelectedChain(selectedChain);
    }
  }, [connectedProvider, env]);

  if (!env || !selectedChain) {
    return null;
  }

  return (
    <>
      <button
        className={classes.networkButton}
        onClick={() => setIsOpen(true)}
        title={selectedChain.name}
        type="button"
      >
        <selectedChain.Icon />
        <Typography className={classes.networkButtonText} type="body1">
          {selectedChain.name}
        </Typography>
        <CaretDown />
      </button>
      {isOpen && (
        <ChainListRedesign
          chains={env.chains}
          onClick={(chain) => {
            changeNetwork(chain).catch((error) => {
              callIfMounted(() => {
                if (isMetaMaskUserRejectedRequestError(error) === false) {
                  notifyError(error);
                }
              });
            });
            setIsOpen(false);
          }}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
};
