import { FC } from "react";

import ArrowRight from "src/assets/icons/arrow-right.svg?react";
import MetaMaskLogo from "src/assets/logo/metamask.png";
import TajirWalletLogo from "src/assets/logo/tajir-wallet.png";
import WalletConnectLogo from "src/assets/logo/wallet-connect.png";
// import { useEnvContext } from "src/contexts/env.context";
import { useWalletListRedesignStyles } from "src/views/login/components/wallet-list/wallet-list.styles";
import { CardRedesign } from "src/views/shared/card/card.view.redesign";
import { Typography } from "src/views/shared/typography/typography.view";

type WalletListProps = {
  onSelectWallet: () => void;
};

export const WalletListRedesign: FC<WalletListProps> = ({ onSelectWallet }) => {
  const classes = useWalletListRedesignStyles();

  return (
    <CardRedesign>
      <div className={classes.cardBox}>
        <Typography type="h1">Connect a wallet</Typography>
        <div className={classes.smallTitle}>Connect with {import.meta.env.VITE_POLYGON_ZK_EVM_NETWORK_NAME ? String(import.meta.env.VITE_POLYGON_ZK_EVM_NETWORK_NAME) : 'TajirChain'} environment</div>

        <ul className={classes.walletList}>
          <li
            className={classes.wallet}
            onClick={() => onSelectWallet()}
            role="button"
          >
            <div className={classes.walletInfo}>
              <button className={classes.button}>
                <div className={classes.buttonWalletTitle}>
                  <div className={classes.iconStack}>
                    <img alt="WalletConnect" className={classes.stackedIcon} src={WalletConnectLogo} />
                    <img alt="MetaMask" className={classes.stackedIcon} src={MetaMaskLogo} />
                    <img alt="Tajir Wallet" className={classes.stackedIcon} src={TajirWalletLogo} />
                  </div>
                  <span className={classes.buttonTextDesktop}>Connect using web wallet</span>
                  <span className={classes.buttonTextMobile}>Connect web wallet</span>
                </div>
                <ArrowRight />
              </button>
            </div>
          </li>
        </ul>{" "}
      </div>
    </CardRedesign>
  );
};
