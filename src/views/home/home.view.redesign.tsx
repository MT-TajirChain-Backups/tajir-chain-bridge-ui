import { useWalletInfo } from "@reown/appkit/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


import { NetworkBoxRedesign } from "../shared/network-box/network-box.view.redesign";
import { BridgeFormRedesign } from "./components/bridge-form/bridge-form.view.redesign";
import { HeaderRedesign } from "./components/header/header.view.redesign";
import { getIsDepositWarningDismissed, setIsDepositWarningDismissed } from "src/adapters/storage";
import WalletConnectIcon from "src/assets/icons/walletconnect.svg?react";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData, ModalState } from "src/domain";
import { routes } from "src/routes";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { resolveConnectedWalletIcon } from "src/utils/wallet-info";
import { DepositWarningModal } from "src/views/home/components/deposit-warning-modal/deposit-warning-modal.view";
import { useHomeRedesignStyles } from "src/views/home/home.styles";
import { Typography } from "src/views/shared/typography/typography.view";

export const HomeRedesign = (): JSX.Element => {
 const classes = useHomeRedesignStyles();
 const navigate = useNavigate();
 const env = useEnvContext();
 const { formData, setFormData } = useFormContext();
 const { connectedProvider } = useProvidersContext();
 const { walletInfo } = useWalletInfo();
 const connectedWalletIcon = resolveConnectedWalletIcon(
  walletInfo,
  connectedProvider.status === "successful" ? connectedProvider.data.provider : undefined
 );
 const [depositWarningModal, setDepositWarningModal] = useState<ModalState<FormData>>({
  status: "closed",
 });
 const [isBridgeFormLoaded, setIsBridgeFormLoaded] = useState(false);

 const onSubmitForm = (formData: FormData, hideDepositWarning?: boolean) => {
  if (hideDepositWarning) {
   setIsDepositWarningDismissed(hideDepositWarning);
  }
  setFormData(formData);
  navigate(routes.bridgeConfirmation.path);
 };

 const onCheckShowDepositWarningAndSubmitForm = (formData: FormData) => {
  const isDepositWarningDismissed = getIsDepositWarningDismissed();

  if (
   env &&
   env.isDepositWarningEnabled &&
   !isDepositWarningDismissed &&
   formData.from.key === "ethereum"
  ) {
   setDepositWarningModal({
    data: formData,
    status: "open",
   });
  } else {
   onSubmitForm(formData);
  }
 };

 const onResetForm = () => {
  setFormData(undefined);
 };

 return (
  <div className={classes.contentWrapper}>
   <HeaderRedesign />
   {connectedProvider.status === "successful" && (
    <>
     <div className={classes.ethereumAddress}>
      {connectedWalletIcon ? (
       <img
        alt={connectedWalletIcon.alt}
        className={classes.metaMaskIcon}
        src={connectedWalletIcon.src}
       />
      ) : (
       <WalletConnectIcon className={classes.metaMaskIcon} />
      )}
      <Typography type="body1">
       {getPartiallyHiddenEthereumAddress(connectedProvider.data.account)}
      </Typography>
     </div>
     <div className={classes.networkBoxWrapper}>

      <BridgeFormRedesign
       account={connectedProvider.data.account}
       formData={formData}
       onLoaded={setIsBridgeFormLoaded}
       onResetForm={onResetForm}
       onSubmit={onCheckShowDepositWarningAndSubmitForm}
      />
      {isBridgeFormLoaded && (
       <>
        <NetworkBoxRedesign />
        <Typography className={classes.exploreText} type="body2">
         Can&apos;t find your chain?{" "}
         <a
          className={classes.exploreLink}
          href="https://ui.agglayer.dev/"
          rel="noopener noreferrer"
          target="_blank"
         >
          Explore more
         </a>
        </Typography>
       </>
      )}
     </div>
     {depositWarningModal.status === "open" && (
      <DepositWarningModal
       formData={depositWarningModal.data}
       onAccept={onSubmitForm}
       onCancel={() => setDepositWarningModal({ status: "closed" })}
      />
     )}
    </>
   )}
  </div>
 );
};
