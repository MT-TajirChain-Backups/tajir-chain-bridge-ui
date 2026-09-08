import { FC, MouseEvent } from "react";

import { CardRedesign } from "../card/card.view.redesign";
import XMarkIcon from "src/assets/icons/xmark.svg?react";
import { Chain } from "src/domain";
import { useListRedesignStyles } from "src/views/shared/chain-list/chain-list.styles";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

type ChainListProps = {
  chains: Chain[];
  onClick: (chain: Chain) => void;
  onClose: () => void;
};

export const ChainListRedesign: FC<ChainListProps> = ({ chains, onClick, onClose }) => {
  const classes = useListRedesignStyles();

  const onOutsideClick = (event: MouseEvent) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    onClose();
  };

  return (
    <Portal>
      <div className={classes.background} onMouseDown={onOutsideClick}>
        <CardRedesign className={classes.card}>
          <div className={classes.header}>
            <Typography className={classes.title} type="h2">
              Select chain
            </Typography>
            <button className={classes.closeButton} onClick={onClose} type="button">
              <XMarkIcon className={classes.closeButtonIcon} />
            </button>
          </div>
          <div className={classes.list}>
            {chains.map((chain) => (
              <button
                className={classes.button}
                key={chain.key}
                onClick={() => onClick(chain)}
                type="button"
              >
                <chain.Icon className={classes.icon} />
                <Typography className={classes.buttonLabel} type="body1">
                  {chain.name}
                </Typography>
              </button>
            ))}
          </div>
        </CardRedesign>
      </div>
    </Portal>
  );
};
