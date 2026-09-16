import { FC } from "react";

import CaretRightIcon from "src/assets/icons/caret-right.svg?react";
import { WalletName } from "src/domain";
import { WalletIcon } from "src/views/login/components/wallet-icon/wallet-icon.view";
import { useWalletListStyles } from "src/views/login/components/wallet-list/wallet-list.styles";
import { Typography } from "src/views/shared/typography/typography.view";

type WalletListProps = {
  onSelectWallet: () => void;
};

export const WalletList: FC<WalletListProps> = ({ onSelectWallet }) => {
  const classes = useWalletListStyles();

  return (
    <ul className={classes.walletList}>
      <li
        className={classes.wallet}
        onClick={() => onSelectWallet()}
        role="button"
      >
        <WalletIcon className={classes.walletIcon} size="sm" walletName={WalletName.WALLET_CONNECT} />
        <div className={classes.walletInfo}>
          <Typography className={classes.walletName} type="body1">
            Connect Wallet
          </Typography>
          <Typography type="body2">Connect using web wallet</Typography>
        </div>
        <CaretRightIcon />
      </li>
    </ul>
  );
};
