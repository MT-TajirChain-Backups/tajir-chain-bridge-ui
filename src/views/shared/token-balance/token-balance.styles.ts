import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenBalanceStyles = createUseStyles((theme: Theme) => ({
  loader: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(0.25),
  },
}));

export const useTokenBalanceRedesignStyles = createUseStyles((theme: Theme) => ({
  "@keyframes balanceFadeIn": {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  "@keyframes balancePulse": {
    "0%": {
      opacity: 0.35,
    },
    "100%": {
      opacity: 0.35,
    },
    "50%": {
      opacity: 0.7,
    },
  },
  balanceValue: {
    animation: "$balanceFadeIn 220ms ease",
    textAlign: "right",
    whiteSpace: "nowrap",
  },
  loader: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(0.25),
    justifyContent: "flex-end",
    minHeight: 20,
    width: "100%",
  },
  skeleton: {
    animation: "$balancePulse 1.1s ease-in-out infinite",
    background: "rgba(10, 11, 13, 0.1)",
    borderRadius: 6,
    height: 12,
    width: "72%",
  },
  tokenBalance: {
    [theme.breakpoints.downM]: {
      flexShrink: 0,
      maxWidth: "100%",
    },
  },
}));
