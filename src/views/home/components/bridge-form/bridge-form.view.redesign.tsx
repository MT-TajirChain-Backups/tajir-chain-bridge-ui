import { BigNumber } from "ethers";
import { FC, useCallback, useEffect, useState } from "react";

import { AmountInputRedesign } from "../amount-input/amount-input.view.redesign";
import { TokenSelectorRedesign } from "../token-selector/token-selector.view.redesign";
import { addCustomToken, getChainCustomTokens, removeCustomToken } from "src/adapters/storage";
import CaretDown from "src/assets/icons/caret-down.svg?react";
import { getGasToken } from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, Chain, FormData, Token } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { getDisplaySymbol, isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { useBridgeFormRedesignStyles } from "src/views/home/components/bridge-form/bridge-form.styles";
import { Button } from "src/views/shared/button/button.view";
import { CardRedesign } from "src/views/shared/card/card.view.redesign";
import { ChainListRedesign } from "src/views/shared/chain-list/chain-list.view.redesign";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { TokenBalanceRedesign } from "src/views/shared/token-balance/token-balances.view.redesign";
import { Typography } from "src/views/shared/typography/typography.view";

type BridgeFormProps = {
  account: string;
  formData?: FormData;
  onLoaded?: (loaded: boolean) => void;
  onResetForm: () => void;
  onSubmit: (formData: FormData) => void;
};

type SelectedChains = {
  from: Chain;
  to: Chain;
};

export const BridgeFormRedesign: FC<BridgeFormProps> = ({
  account,
  formData,
  onLoaded,
  onResetForm,
  onSubmit,
}) => {
  const classes = useBridgeFormRedesignStyles();
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { getErc20TokenBalance, tokens: defaultTokens } = useTokensContext();
  const { changeNetwork, connectedProvider } = useProvidersContext();
  const [balanceFrom, setBalanceFrom] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [balanceTo, setBalanceTo] = useState<AsyncTask<BigNumber, string>>({ status: "pending" });
  const [inputError, setInputError] = useState<string>();
  const [selectedChains, setSelectedChains] = useState<SelectedChains>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [chains, setChains] = useState<Chain[]>();
  const [tokens, setTokens] = useState<Token[]>();
  const [activeTokenSelector, setActiveTokenSelector] = useState<"from" | "to" | null>(null);
  const [tokensSide, setTokensSide] = useState<"from" | "to">("from");

  const onAmountInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    setAmount(amount);
    setInputError(error);
  };

  const getFromBalance = () => {
    if (balanceFrom && isAsyncTaskDataAvailable(balanceFrom)) {
      return balanceFrom.data;
    }
    return BigNumber.from(0);
  };

  const onChainButtonClick = (chain: Chain) => {
    setChains(undefined);
    setAmount(undefined);

    // Same path as the header NetworkSelector: switch the wallet first.
    // selectedChains syncs from connectedProvider when the switch succeeds.
    changeNetwork(chain).catch((error) => {
      callIfMounted(() => {
        if (isMetaMaskUserRejectedRequestError(error) === false) {
          notifyError(error);
        }
      });
    });
  };

  const onTokenDropdownClick = (side: "from" | "to") => {
    if (tokensSide !== side) {
      setTokensSide(side);
    }
    setActiveTokenSelector(side);
  };

  const onSelectToken = (token: Token) => {
    setToken(token);
    setActiveTokenSelector(null);
    setAmount(undefined);
  };

  const onCloseTokenSelector = () => {
    setActiveTokenSelector(null);
  };

  const onAddToken = (token: Token) => {
    if (tokens) {
      // We don't want to store the balance of the user in the local storage
      const { address, chainId, decimals, logoURI, name, symbol, wrappedToken } = token;

      addCustomToken({ address, chainId, decimals, logoURI, name, symbol, wrappedToken });
      setTokens([token, ...tokens]);
    }
  };

  const onRemoveToken = (tokenToRemove: Token) => {
    if (tokens) {
      removeCustomToken(tokenToRemove);
      setTokens(
        tokens.filter(
          (token) =>
            !(token.address === tokenToRemove.address && token.chainId === tokenToRemove.chainId)
        )
      );
      if (selectedChains && tokenToRemove.address === token?.address) {
        setToken(getGasToken(selectedChains.from));
      }
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChains && token && amount) {
      onSubmit({
        amount: amount,
        from: selectedChains.from,
        to: selectedChains.to,
        token: token,
      });
    }
  };

  const getTokenBalance = useCallback(
    (token: Token, chain: Chain): Promise<BigNumber> => {
      if (isTokenEther(token, chain)) {
        return chain.provider.getBalance(account);
      } else {
        return getErc20TokenBalance({
          accountAddress: account,
          chain: chain,
          tokenAddress: selectTokenAddress(token, chain),
        });
      }
    },
    [account, getErc20TokenBalance]
  );

  useEffect(() => {
    // Load all the tokens for the selected chain without their balance
    if (selectedChains && defaultTokens) {
      const activeChain = tokensSide === "from" ? selectedChains.from : selectedChains.to;
      const chainTokens = [...defaultTokens, ...getChainCustomTokens(activeChain)];

      setTokens(
        chainTokens.map((token) => ({
          ...token,
          balance: {
            status: "pending",
          },
        }))
      );
    }
  }, [defaultTokens, selectedChains, tokensSide]);

  useEffect(() => {
    // Load the balances of all the tokens for the active chain together
    const areTokensPending = tokens?.some((tkn) => tkn.balance?.status === "pending");

    if (selectedChains && tokens && areTokensPending) {
      const activeChain = tokensSide === "from" ? selectedChains.from : selectedChains.to;
      const tokensSnapshot = tokens;

      setTokens(tokensSnapshot.map((token) => ({ ...token, balance: { status: "loading" } })));

      void Promise.all(
        tokensSnapshot.map((token) =>
          getTokenBalance(token, activeChain)
            .then(
              (balance): Token => ({
                ...token,
                balance: {
                  data: balance,
                  status: "successful",
                },
              })
            )
            .catch(
              (): Token => ({
                ...token,
                balance: {
                  error: "Couldn't retrieve token balance",
                  status: "failed",
                },
              })
            )
        )
      ).then((updatedTokens) => {
        callIfMounted(() => {
          setTokens(updatedTokens);
        });
      });
    }
  }, [callIfMounted, getTokenBalance, selectedChains, tokens, tokensSide]);

  useEffect(() => {
    // Load the balance of the selected token in both networks
    if (selectedChains && token) {
      setBalanceFrom({ status: "loading" });
      setBalanceTo({ status: "loading" });

      getTokenBalance(token, selectedChains.from)
        .then((balance) =>
          callIfMounted(() => {
            setBalanceFrom({ data: balance, status: "successful" });
          })
        )
        .catch(() => {
          callIfMounted(() => {
            setBalanceFrom({ error: "Couldn't retrieve token balance", status: "failed" });
          });
        });
      getTokenBalance(token, selectedChains.to)
        .then((balance) =>
          callIfMounted(() => {
            setBalanceTo({ data: balance, status: "successful" });
          })
        )
        .catch(() => {
          callIfMounted(() => {
            setBalanceTo({ error: "Couldn't retrieve token balance", status: "failed" });
          });
        });
    }
  }, [callIfMounted, getTokenBalance, selectedChains, token]);

  useEffect(() => {
    // Load the default values after the network is changed
    if (env && connectedProvider.status === "successful" && formData === undefined) {
      let from = env.chains.find((chain) => chain.chainId === connectedProvider.data.chainId);
      let to = env.chains.find((chain) => chain.chainId !== connectedProvider.data.chainId);

      if (!from) {
        from = env.chains[0];
        to = env.chains.find((chain) => chain.chainId !== from?.chainId) || env.chains[1];
      }

      if (from && to) {
        setSelectedChains({ from, to });
        setToken(getGasToken(from.key === "ethereum" ? to : from));
      }
      setAmount(undefined);
    }
    // This prevents the form from being reset when coming back from BridgeConfirmation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedProvider, env]);

  useEffect(() => {
    // Load default form values

    if (formData) {
      setSelectedChains({ from: formData.from, to: formData.to });
      setToken(formData.token);
      setAmount(formData.amount);
      onResetForm();
    }
  }, [formData, onResetForm]);

  const isLoaded = !!(env && selectedChains && tokens && token);

  useEffect(() => {
    onLoaded?.(isLoaded);
  }, [isLoaded, onLoaded]);

  if (!isLoaded) {
    return (
      <div className={classes.spinner}>
        <Spinner />
      </div>
    );
  }

  const fromSymbol = getDisplaySymbol(token, selectedChains.from.key);
  const toSymbol = getDisplaySymbol(token, selectedChains.to.key);
  const fromBalance = getFromBalance();
  return (
    <form className={classes.form} onSubmit={onFormSubmit}>
      <CardRedesign className={classes.card}>
        <div className={classes.headerRow}>
          <Typography type="body2">From</Typography>
          <div className={classes.topActionsRow}>
            <div className={classes.topQuickActions}>
              <button
                className={classes.topQuickActionButton}
                disabled={fromBalance.eq(0)}
                onClick={() => {
                  if (!fromBalance.eq(0)) {
                    const nextAmount = fromBalance.mul(25).div(100);
                    setAmount(nextAmount);
                    setInputError(undefined);
                  }
                }}
                type="button"
              >
                <Typography className={classes.topQuickActionText} type="body2">
                  25%
                </Typography>
              </button>
              <button
                className={classes.topQuickActionButton}
                disabled={fromBalance.eq(0)}
                onClick={() => {
                  if (!fromBalance.eq(0)) {
                    const nextAmount = fromBalance.mul(50).div(100);
                    setAmount(nextAmount);
                    setInputError(undefined);
                  }
                }}
                type="button"
              >
                <Typography className={classes.topQuickActionText} type="body2">
                  50%
                </Typography>
              </button>
              <button
                className={classes.topQuickActionButton}
                disabled={fromBalance.eq(0)}
                onClick={() => {
                  if (!fromBalance.eq(0)) {
                    setAmount(fromBalance);
                    setInputError(undefined);
                  }
                }}
                type="button"
              >
                <Typography className={classes.topQuickActionText} type="body2">
                  Max
                </Typography>
              </button>
            </div>
            <Typography className={classes.balanceLabel} type="body2">
              Balance
            </Typography>
          </div>
        </div>
        <div className={classes.mainRow}>
          <button
            className={classes.fromChain}
            onClick={() => setChains(env.chains)}
            type="button"
          >
            <selectedChains.from.Icon />
            <Typography className={classes.selectedChainName} type="body1">
              {selectedChains.from.name}
            </Typography>
            <CaretDown />
          </button>
          <TokenBalanceRedesign
            chainId={selectedChains.from.key}
            spinnerSize={14}
            token={{ ...token, balance: balanceFrom }}
            typographyProps={{ type: "body1" }}
          />
        </div>
        <div className={classes.inputRow}>
          <button className={classes.tokenSelector} onClick={() => onTokenDropdownClick("from")} type="button">
            <Typography className={classes.tokenSelectorSymbol} type="h2">
              {fromSymbol}
            </Typography>
            <CaretDown />
          </button>
          <AmountInputRedesign
            balance={fromBalance}
            onChange={onAmountInputChange}
            token={token}
            value={amount}
          />
        </div>

        <div className={classes.headerRow}>
          <Typography type="body2">To</Typography>
          <Typography className={classes.balanceLabel} type="body2">Balance</Typography>
        </div>
        <div className={classes.mainRow}>
          <div className={classes.toChain}>
            <selectedChains.to.Icon />
            <Typography className={classes.selectedChainName} type="body1">
              {selectedChains.to.name}
            </Typography>
          </div>
          <TokenBalanceRedesign
            chainId={selectedChains.to.key}
            spinnerSize={14}
            token={{ ...token, balance: balanceTo }}
            typographyProps={{ type: "body1" }}
          />
        </div>
        <div className={`${classes.inputRow} ${classes.inputRowLast}`}>
          <button className={classes.tokenSelector} onClick={() => onTokenDropdownClick("to")} type="button">
            <Typography className={classes.tokenSelectorSymbol} type="h2">
              {toSymbol}
            </Typography>
            <CaretDown />
          </button>
          <AmountInputRedesign
            balance={fromBalance}
            onChange={onAmountInputChange}
            readOnly
            token={token}
            value={amount}
          />
        </div>
      </CardRedesign>
      <div className={classes.button}>
        <Button disabled={!amount || amount.isZero() || inputError !== undefined} type="submit">
          Continue
        </Button>
        {amount && inputError && <ErrorMessage error={inputError} />}
      </div>
      {chains && (
        <ChainListRedesign
          chains={chains}
          onClick={onChainButtonClick}
          onClose={() => setChains(undefined)}
        />
      )}
      {activeTokenSelector !== null && (
        <TokenSelectorRedesign
          account={account}
          chains={
            activeTokenSelector === "from"
              ? selectedChains
              : { from: selectedChains.to, to: selectedChains.from }
          }
          onAddToken={onAddToken}
          onClose={onCloseTokenSelector}
          onRemoveToken={onRemoveToken}
          onSelectToken={onSelectToken}
          tokens={tokens}
        />
      )}
    </form>
  );
};
