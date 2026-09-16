import { BigNumber } from "ethers";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { HeaderRedesign } from "../shared/header/header.view.redesign";
import { BridgeCardRedesign } from "./components/bridge-card/bridge-card.view.redesign";
import { isCancelRequestError } from "src/adapters/bridge-api";
import { parseError } from "src/adapters/error";
import { AUTO_REFRESH_RATE, PAGE_SIZE } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { useUIContext } from "src/contexts/ui.context";
import { AsyncTask, Bridge, PendingBridge } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { useIntersection } from "src/hooks/use-intersection";
import { RollupManager__factory } from "src/types/contracts/rollup-manager";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { useActivityRedesignStyles } from "src/views/activity/activity.styles";
import { Card } from "src/views/shared/card/card.view";
import { PageLoader } from "src/views/shared/page-loader/page-loader.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const ActivityRedesign: FC = () => {
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const { claim, fetchBridges, getPendingBridges } = useBridgeContext();
  const { connectedProvider } = useProvidersContext();
  const { notifyError } = useErrorContext();
  const { openSnackbar } = useUIContext();
  const { tokens } = useTokensContext();
  const [lastVerifiedBatch, setLastVerifiedBatch] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [apiBridges, setApiBridges] = useState<AsyncTask<Bridge[], undefined, true>>({
    status: "pending",
  });
  const [pendingBridges, setPendingBridges] = useState<AsyncTask<PendingBridge[], undefined>>({
    status: "pending",
  });
  const [displayAll, setDisplayAll] = useState(true);
  // currentOffset tracks the true number of items fetched from the API (before client-side
  // filtering). This is used as the next page offset and for the button visibility check.
  const [currentOffset, setCurrentOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [wrongNetworkBridges, setWrongNetworkBridges] = useState<string[]>([]);
  const [finalisingBridges, setFinalisingBridges] = useState<string[]>([]);
  const classes = useActivityRedesignStyles();

  const fetchBridgesAbortController = useRef<AbortController | null>(null);
  const pollAbortController = useRef<AbortController | null>(null);
  const currentOffsetRef = useRef(currentOffset);
  const apiBridgesRef = useRef(apiBridges);

  const headerBorderObserved = useRef<HTMLDivElement>(null);
  const headerBorderTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentOffsetRef.current = currentOffset;
  }, [currentOffset]);

  useEffect(() => {
    apiBridgesRef.current = apiBridges;
  }, [apiBridges]);

  useIntersection({
    className: classes.stickyContentBorder,
    observed: headerBorderObserved,
    target: headerBorderTarget,
  });

  const onDisplayAll = () => setDisplayAll(true);
  const onDisplayPending = () => setDisplayAll(false);

  const onClaim = (bridge: Bridge) => {
    if (bridge.status === "on-hold") {
      setFinalisingBridges((prev) => [...prev, bridge.id]);
      claim({
        bridge,
      })
        .then(() => {
          openSnackbar({
            text: "Transaction successfully submitted.",
            type: "success-msg",
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            if (isMetaMaskUserRejectedRequestError(error) === false) {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setWrongNetworkBridges([...wrongNetworkBridges, bridge.id]);
                } else {
                  notifyError(error);
                }
              });
            }
          });
        })
        .finally(() => {
          setFinalisingBridges((prev) => prev.filter((id) => id !== bridge.id));
          if (isAsyncTaskDataAvailable<Bridge[], undefined, true>(apiBridges)) {
            getPendingBridges(apiBridges.data)
              .then((data) => {
                callIfMounted(() => {
                  setPendingBridges({ data, status: "successful" });
                });
              })
              .catch((error) => {
                callIfMounted(() => {
                  notifyError(error);
                });
              });
          }
        });
    }
  };

  const processFetchBridgesSuccess = useCallback(
    (bridges: Bridge[], fetchedCount: number, total: number) => {
      // On initial load or auto-refresh: replace the whole list and reset offset
      setCurrentOffset(fetchedCount);
      setApiBridges({ data: bridges, status: "successful" });
      setTotal(total);
      getPendingBridges(bridges)
        .then((data) => {
          callIfMounted(() => {
            setPendingBridges({ data, status: "successful" });
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            notifyError(error);
          });
        });
    },
    [callIfMounted, getPendingBridges, notifyError]
  );

  const processFetchBridgesAppend = useCallback(
    (newBridges: Bridge[], fetchedCount: number, total: number) => {
      // On "Load More": append new bridges to existing list and advance offset
      setCurrentOffset((prev) => prev + fetchedCount);
      setApiBridges((prev) =>
        isAsyncTaskDataAvailable<Bridge[], undefined, true>(prev)
          ? { data: [...prev.data, ...newBridges], status: "successful" }
          : { data: newBridges, status: "successful" }
      );
      setTotal(total);
      getPendingBridges()
        .then((data) => {
          callIfMounted(() => {
            setPendingBridges({ data, status: "successful" });
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            notifyError(error);
          });
        });
    },
    [callIfMounted, getPendingBridges, notifyError]
  );

  const processFetchBridgesError = useCallback(
    (error: unknown) => {
      callIfMounted(() => {
        if (!isCancelRequestError(error)) {
          setApiBridges({
            error: undefined,
            status: "failed",
          });
          notifyError(error);
        }
      });
    },
    [callIfMounted, notifyError]
  );

  const onLoadNextPage = useCallback(() => {
    if (
      env &&
      isAsyncTaskDataAvailable(connectedProvider) &&
      apiBridges.status === "successful" &&
      currentOffset < total
    ) {
      setApiBridges({ data: apiBridges.data, status: "loading-more-items" });

      // A new page requested by the user cancels any other fetch in progress
      if (fetchBridgesAbortController.current) {
        fetchBridgesAbortController.current.abort();
      }

      fetchBridgesAbortController.current = new AbortController();

      fetchBridges({
        abortSignal: fetchBridgesAbortController.current.signal,
        env,
        ethereumAddress: connectedProvider.data.account,
        limit: PAGE_SIZE,
        offset: currentOffset,
        type: "load",
      })
        .then(({ bridges, fetchedCount, total }) => {
          callIfMounted(() => {
            processFetchBridgesAppend(bridges, fetchedCount, total);
          });
        })
        .catch(processFetchBridgesError);
    }
  }, [
    env,
    connectedProvider,
    apiBridges,
    currentOffset,
    total,
    fetchBridges,
    processFetchBridgesAppend,
    processFetchBridgesError,
    callIfMounted,
  ]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if scrolled to the bottom (with a 5px threshold for safety)
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 5) {
      if (apiBridges.status !== "loading-more-items" && currentOffset < total) {
        onLoadNextPage();
      }
    }
  }, [apiBridges.status, currentOffset, total, onLoadNextPage]);

  useEffect(() => {
    // Show pending txs immediately (skips cleanup) so a just-submitted bridge
    // appears before the Bridge API has indexed it.
    if (env && connectedProvider.status === "successful") {
      getPendingBridges()
        .then((data) => {
          callIfMounted(() => {
            setPendingBridges({ data, status: "successful" });
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            notifyError(error);
          });
        });
    }
  }, [env, connectedProvider, getPendingBridges, callIfMounted, notifyError]);

  useEffect(() => {
    // Initial API load
    if (env && connectedProvider.status === "successful" && tokens) {
      if (fetchBridgesAbortController.current) {
        fetchBridgesAbortController.current.abort();
      }
      fetchBridgesAbortController.current = new AbortController();
      fetchBridges({
        abortSignal: fetchBridgesAbortController.current.signal,
        env,
        ethereumAddress: connectedProvider.data.account,
        limit: PAGE_SIZE,
        offset: 0,
        type: "load",
      })
        .then(({ bridges, fetchedCount, total }) => {
          callIfMounted(() => {
            processFetchBridgesSuccess(bridges, fetchedCount, total);
          });
        })
        .catch(processFetchBridgesError);
    }
    return () => {
      if (fetchBridgesAbortController.current) {
        fetchBridgesAbortController.current.abort();
      }
    };
  }, [
    connectedProvider,
    env,
    tokens,
    callIfMounted,
    fetchBridges,
    processFetchBridgesError,
    processFetchBridgesSuccess,
  ]);

  useEffect(() => {
    // Polling bridges — do not depend on apiBridges status, otherwise setting
    // "reloading" retriggers cleanup and aborts the refresh that just started.
    if (env && connectedProvider.status === "successful") {
      const refreshBridges = () => {
        const prev = apiBridgesRef.current;

        if (isAsyncTaskDataAvailable<Bridge[], undefined, true>(prev)) {
          setApiBridges({ data: prev.data, status: "reloading" });
        } else if (prev.status === "failed") {
          setApiBridges({ status: "loading" });
        } else {
          // Still on initial load — wait for the first fetch to finish
          return;
        }

        if (pollAbortController.current) {
          pollAbortController.current.abort();
        }

        pollAbortController.current = new AbortController();
        fetchBridges({
          abortSignal: pollAbortController.current.signal,
          env,
          ethereumAddress: connectedProvider.data.account,
          quantity: Math.max(currentOffsetRef.current, PAGE_SIZE),
          type: "reload",
        })
          .then(({ bridges, fetchedCount, total }) => {
            callIfMounted(() => {
              processFetchBridgesSuccess(bridges, fetchedCount, total);
            });
          })
          .catch(processFetchBridgesError);
      };

      const intervalId = setInterval(refreshBridges, AUTO_REFRESH_RATE);

      return () => {
        clearInterval(intervalId);
        if (pollAbortController.current) {
          pollAbortController.current.abort();
        }
      };
    }
  }, [
    connectedProvider,
    env,
    fetchBridges,
    processFetchBridgesError,
    processFetchBridgesSuccess,
    callIfMounted,
  ]);

  useEffect(() => {
    if (env) {
      const ethereum = env.chains[0];
      const rollupManagerContract = RollupManager__factory.connect(
        ethereum.rollupManagerAddress,
        ethereum.provider
      );
      const refreshLastVerifiedBatch = async () => {
        setLastVerifiedBatch((currentLastVerifiedBatch) =>
          isAsyncTaskDataAvailable(currentLastVerifiedBatch)
            ? { data: currentLastVerifiedBatch.data, status: "reloading" }
            : { status: "loading" }
        );
        try {
          const id = await rollupManagerContract.rollupAddressToID(
            env.chains[0].poeContractAddress
          );
          const newLastVerifiedBatch = await rollupManagerContract.getLastVerifiedBatch(id);
          setLastVerifiedBatch({
            data: newLastVerifiedBatch,
            status: "successful",
          });
        } catch {
          setLastVerifiedBatch({
            error: "An error occurred getting the last verified batch",
            status: "failed",
          });
        }
      };
      void refreshLastVerifiedBatch();
      const intervalId = setInterval(() => void refreshLastVerifiedBatch(), AUTO_REFRESH_RATE);
      return () => clearInterval(intervalId);
    }
  }, [env]);

  useEffect(() => {
    setWrongNetworkBridges([]);
  }, [connectedProvider]);

  const mergeBridges = (apiBridges: Bridge[], pendingBridges: PendingBridge[]) => {
    return [
      ...pendingBridges.filter(
        (pendingBridge) =>
          apiBridges.find(
            (apiBridge) => pendingBridge.depositTxHash === apiBridge.depositTxHash
          ) === undefined
      ),
      ...apiBridges.reduce(
        (acc: Bridge[], curr: Bridge) => [
          ...acc,
          pendingBridges.find(
            (pendingBridge) => pendingBridge.depositTxHash === curr.depositTxHash
          ) || curr,
        ],
        []
      ),
    ];
  };

  const EmptyMessage = () => (
    <Card className={classes.emptyMessage}>
      {displayAll
        ? "Bridge activity will be shown here"
        : "There are no pending bridges at the moment"}
    </Card>
  );

  const Tabs = ({ all, hasMore, pending }: { all: number; hasMore: boolean; pending: number; }) => (
    <div className={classes.filterBoxes}>
      <div
        className={`${classes.filterBox} ${displayAll ? classes.filterBoxSelected : ""}`}
        onClick={onDisplayAll}
      >
        <Typography className={classes.filterBoxLabel} type="body1">
          All
        </Typography>
        <Typography
          className={`${classes.filterNumberBox} ${displayAll ? classes.filterNumberBoxSelected : ""
            }`}
          type="body2"
        >
          {all}{hasMore ? "+" : ""}
        </Typography>
      </div>
      <div
        className={`${classes.filterBox} ${!displayAll ? classes.filterBoxSelected : ""}`}
        onClick={onDisplayPending}
      >
        <Typography className={classes.filterBoxLabel} type="body1">
          Pending
        </Typography>
        <Typography
          className={`${classes.filterNumberBox} ${!displayAll ? classes.filterNumberBoxSelected : ""
            }`}
          type="body2"
        >
          {pending}
        </Typography>
      </div>
    </div>
  );

  const loader = (
    <div className={`${classes.contentWrapper} ${classes.loaderWrapper}`}>
      <HeaderRedesign backTo={{ routeKey: "home" }} title="Activity" />
      <div className={classes.wrapper}>
        {" "}
        <Tabs all={0} hasMore={false} pending={0} />
        <div
          className={`${classes.contentWrapperBody} ${classes.loaderBox}`}
        >
          <PageLoader />
        </div>
      </div>
    </div>
  );

  if (!env || !tokens || !isAsyncTaskDataAvailable(pendingBridges)) {
    return loader;
  }

  switch (apiBridges.status) {
    case "pending":
    case "loading": {
      return loader;
    }
    case "failed": {
      return (
        <div className={classes.contentWrapper}>
          <HeaderRedesign backTo={{ routeKey: "home" }} title="Activity" />

          <Tabs all={0} hasMore={false} pending={0} />
          <EmptyMessage />
        </div>
      );
    }
    case "successful":
    case "loading-more-items":
    case "reloading": {
      const allBridges = mergeBridges(apiBridges.data, pendingBridges.data);
      const filteredList = displayAll
        ? allBridges
        : allBridges.filter((b) => b.status !== "completed");

      return (
        <div>
          <div ref={headerBorderObserved}></div>
          <div className={classes.stickyContent} ref={headerBorderTarget}>
            <div className={classes.contentWrapper}>
              <HeaderRedesign backTo={{ routeKey: "home" }} title="Activity" />
              <div className={classes.wrapper}>
                <Tabs 
                  all={allBridges.length} 
                  hasMore={currentOffset < total}
                  pending={allBridges.filter((b) => b.status !== "completed").length} 
                />

                <div
                  className={`${classes.contentWrapperBody}`}
                >
                  {filteredList.length ? (
                    <div className={classes.scrollArea} onScroll={handleScroll}>
                      {filteredList.map((bridge) =>
                        bridge.status === "pending" ? (
                          <div
                            className={classes.bridgeCardwrapper}
                            key={bridge.depositTxHash || bridge.claimTxHash}
                          >
                            <BridgeCardRedesign
                              bridge={bridge}
                              env={env}
                              isFinaliseDisabled={true}
                              lastVerifiedBatch={lastVerifiedBatch}
                              networkError={false}
                              showFiatAmount={
                                env !== undefined && env.fiatExchangeRates.areEnabled
                              }
                            />
                          </div>
                        ) : (
                          <div className={classes.bridgeCardwrapper} key={bridge.id}>
                            <BridgeCardRedesign
                              bridge={bridge}
                              env={env}
                              isFinaliseDisabled={finalisingBridges.includes(bridge.id)}
                              lastVerifiedBatch={lastVerifiedBatch}
                              networkError={wrongNetworkBridges.includes(bridge.id)}
                              onClaim={() => onClaim(bridge)}
                              showFiatAmount={
                                env !== undefined && env.fiatExchangeRates.areEnabled
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyMessage />
                  )}
                  {currentOffset < total && apiBridges.status === "loading-more-items" && (
                    <div className={classes.loadMoreWrapper}>
                      <div style={{ padding: "10px", textAlign: "center", width: "100%" }}>
                        <Typography type="body2">Loading...</Typography>
                      </div>
                    </div>
                  )}
                </div>
              </div>{" "}
            </div>{" "}
          </div>
        </div>
      );
    }
  }
};
