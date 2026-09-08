import { FC } from "react";

import { TokenSelectorHeaderRedesign } from "../token-selector-header/token-selector-header.view.redesign";
import { isChainCustomToken } from "src/adapters/storage";
import DeleteIcon from "src/assets/icons/delete.svg?react";
import { Chain, Token } from "src/domain";
import { useTokenInfoRedesignStyles } from "src/views/home/components/token-info/token-info.styles";
import { TokenInfoTable } from "src/views/home/components/token-info-table/token-info-table.view";
import { Typography } from "src/views/shared/typography/typography.view";

type TokenInfoProps = {
  chain: Chain;
  onClose: () => void;
  onNavigateToTokenList: () => void;
  onRemoveToken: (token: Token) => void;
  token: Token;
};

export const TokenInfoRedesign: FC<TokenInfoProps> = ({
  chain,
  onClose,
  onNavigateToTokenList,
  onRemoveToken,
  token,
}) => {
  const classes = useTokenInfoRedesignStyles();

  const isImportedCustomToken = isChainCustomToken(token, chain);

  return (
    <div className={classes.tokenInfo}>
      <TokenSelectorHeaderRedesign
        onClose={onClose}
        onGoBack={onNavigateToTokenList}
        title={token.name === "ETH" ? "Native Token" : token.name}
      />
      <Typography className={classes.tokenSymbol} type="body2">
        {token.symbol}
      </Typography>
      <TokenInfoTable className={classes.tokenInfoTable} redesign token={token} />
      {isImportedCustomToken && (
        <button
          className={classes.removeTokenButton}
          onClick={() => onRemoveToken(token)}
          type="button"
        >
          <DeleteIcon />
          <Typography type="body1">Remove custom token</Typography>
        </button>
      )}
    </div>
  );
};
