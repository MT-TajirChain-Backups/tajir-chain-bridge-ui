import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NetworkBoxRedesign } from "../shared/network-box/network-box.view.redesign";
import { WalletListRedesign } from "./components/wallet-list/wallet-list.view.redesign";
import { routerStateParser } from "src/adapters/browser";
import { getPolicyCheck, setPolicyCheck } from "src/adapters/storage";
import WarningIcon from "src/assets/icons/warning.svg?react";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { EthereumChainId, PolicyCheck } from "src/domain";
import { routes } from "src/routes";
import { getDeploymentName } from "src/utils/labels";
import { useLoginRedesignStyles } from "src/views/login/login.styles";
import { ConfirmationModal } from "src/views/shared/confirmation-modal/confirmation-modal.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { InfoBanner } from "src/views/shared/info-banner/info-banner.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const LoginRedesign: FC = () => {
  const classes = useLoginRedesignStyles();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state } = useLocation();
  const { connectedProvider, connectProvider } = useProvidersContext();
  const env = useEnvContext();

  const onConnectProvider = () => {
    setPolicyCheck();
    connectProvider().catch((error) => {
      console.error(error);
    });
    setShowPolicyModal(false);
  };

  const onCheckAndConnectProvider = () => {
    const checked = getPolicyCheck();
    if (checked === PolicyCheck.Checked) {
      void connectProvider();
    } else {
      setShowPolicyModal(true);
    }
  };

  useEffect(() => {
    if (connectedProvider.status === "successful") {
      const routerState = routerStateParser.safeParse(state);

      if (routerState.success) {
        navigate(routerState.data.redirectUrl, { replace: true });
      } else {
        navigate(routes.home.path, { replace: true });
      }
    }
  }, [connectedProvider, state, navigate]);

  if (!env) {
    return null;
  }

  const ethereumChain = env.chains[0];
  const deploymentName = getDeploymentName(ethereumChain);

  return (
    <div className={classes.login}>
      <div className={classes.contentWrapper}>
        <div className={classes.networkTopBox}>
        </div>

        <div className={classes.cardWrap}>
          <WalletListRedesign onSelectWallet={onCheckAndConnectProvider} />
          {connectedProvider.status === "failed" && connectedProvider.error !== "Disconnected" && (
            <ErrorMessage error={connectedProvider.error} />
          )}
        </div>
        <div className={classes.networkBoxWrapper}>
          <NetworkBoxRedesign />
        </div>
        {ethereumChain.chainId !== EthereumChainId.MAINNET && (
          <InfoBanner message={`Connect with ${import.meta.env.VITE_POLYGON_ZK_EVM_NETWORK_NAME ? String(import.meta.env.VITE_POLYGON_ZK_EVM_NETWORK_NAME) : 'TajirChain'} environment`} />
        )}
      </div>

      {showPolicyModal && (
        <ConfirmationModal
          message={
            <div className={classes.policyMessage}>
              <WarningIcon aria-hidden className={classes.policyMessageIcon} />
              <Typography className={classes.policyMessageText} type="body2">
                This version of the Tajir Bridge will require frequent maintenance and may be
                restarted if upgrades are needed.
              </Typography>
            </div>
          }
          onClose={() => setShowPolicyModal(false)}
          onConfirm={onConnectProvider}
          showCancelButton={false}
          title={`Welcome to the Tajir Bridge${deploymentName ? ` ${deploymentName}` : ""}`}
        />
      )}
    </div>
  );
};
