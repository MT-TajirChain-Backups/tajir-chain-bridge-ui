import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenInfoStyles = createUseStyles((theme: Theme) => ({
  removeTokenButton: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    backgroundColor: theme.palette.grey.light,
    border: "none",
    borderRadius: 9,
    color: theme.palette.black,
    cursor: "pointer",
    display: "flex",
    fontSize: "20px",
    gap: theme.spacing(2),
    justifyContent: "center",
    lineHeight: "24px",
    padding: theme.spacing(1.5),
    transition: theme.hoverTransition,
  },
  tokenInfo: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  tokenInfoTable: {
    flex: 1,
    marginTop: theme.spacing(2),
  },
}));

export const useTokenInfoRedesignStyles = createUseStyles((theme: Theme) => ({
  removeTokenButton: {
    "& path": {
      fill: "#C24747",
    },
    "&:hover, &:hover:not(:disabled)": {
      backgroundColor: "rgba(220, 80, 80, 0.12)",
      boxShadow: "none !important",
      transform: "none !important",
    },
    alignItems: "center",
    backgroundColor: "rgba(220, 80, 80, 0.08)",
    border: "1px solid rgba(220, 80, 80, 0.18)",
    borderRadius: 14,
    boxShadow: "none !important",
    color: "#C24747",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
    fontWeight: 600,
    gap: theme.spacing(1.25),
    justifyContent: "center",
    marginTop: theme.spacing(2),
    padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px`,
    transform: "none !important",
    transition: "background 160ms ease, border-color 160ms ease",
    width: "100%",
    [theme.breakpoints.downM]: {
      borderRadius: 12,
      marginTop: theme.spacing(1.5),
      padding: `${theme.spacing(1.25)}px ${theme.spacing(1.5)}px`,
    },
  },
  tokenInfo: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
    width: "100%",
  },
  tokenInfoTable: {
    flexShrink: 0,
    marginTop: theme.spacing(0.5),
  },
  tokenSymbol: {
    color: theme.palette.grey.dark,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.02em",
    marginBottom: theme.spacing(1.5),
    marginTop: -theme.spacing(1.5),
    textAlign: "center",
    textTransform: "uppercase",
    [theme.breakpoints.downM]: {
      fontSize: 12,
      marginBottom: theme.spacing(1),
      marginTop: -theme.spacing(0.75),
    },
  },
}));
