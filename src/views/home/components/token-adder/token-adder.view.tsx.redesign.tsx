import { FC } from "react";
import { TokenSelectorHeaderRedesign } from "../token-selector-header/token-selector-header.view.redesign";
import WarningIcon from "src/assets/icons/warning.svg?react";
import { Token } from "src/domain";
import { useTokenAdderStyles } from "src/views/home/components/token-adder/token-adder.styles";
import { TokenInfoTable } from "src/views/home/components/token-info-table/token-info-table.view";
import { Typography } from "src/views/shared/typography/typography.view";

type TokenAdderProps = {
  onAddToken: (token: Token) => void;
  onClose: () => void;
  onNavigateToTokenList: () => void;
  token: Token;
};

export const TokenAdderRedesign: FC<TokenAdderProps> = ({
  onAddToken,
  onClose,
  onNavigateToTokenList,
  token,
}) => {
  const classes = useTokenAdderStyles();

  return (
    <div className={classes.tokenAdder}>
      <TokenSelectorHeaderRedesign
        onClose={onClose}
        onGoBack={onNavigateToTokenList}
        title="Add token"
      />
      <div className={classes.disclaimerBox}>
        <WarningIcon className={classes.disclaimerBoxWarningIcon} />
        <Typography className={classes.disclaimerBoxMessage} type="body1">
          Interact carefully with any new or suspicious token
        </Typography>
      </div>
      <TokenInfoTable className={classes.tokenInfoTable} redesign token={token} />
      <button className={classes.addTokenButton} onClick={() => onAddToken(token)}>
        Add {token.name}
      </button>
    </div>
  );
};
