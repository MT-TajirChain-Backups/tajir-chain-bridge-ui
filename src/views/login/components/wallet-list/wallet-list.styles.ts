import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useWalletListStyles = createUseStyles((theme: Theme) => ({
  wallet: {
    "&:hover": {
      background: "#e2e5ee",
    },
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    padding: [theme.spacing(3), theme.spacing(4)],
    transition: theme.hoverTransition,
  },
  walletIcon: {
    marginRight: theme.spacing(2),
  },
  walletInfo: {
    flex: 1,
  },
  walletList: {
    listStyle: "none",
    margin: 0,
    paddingLeft: 0,
  },
  walletName: {
    marginBottom: theme.spacing(1),
  },
}));
export const useWalletListRedesignStyles = createUseStyles((theme: Theme) => ({
  button: {
    "&:disabled": {
      backgroundColor: "#E8D4A0",
      border: "1px solid #E8D4A0",
      cursor: "inherit",
      opacity: 0.7,
    },
    alignItems: "center",
    appearance: "none",
    backgroundColor: "#F3CD52",
    border: "1px solid #F3CD52",
    borderRadius: 8,
    color: theme.palette.white,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    padding: [theme.spacing(1.5), theme.spacing(2.5)],
    width: "100%",
    [theme.breakpoints.downM]: {
      fontSize: 14,
    },
    
  },
  
  buttonTextDesktop: {
    display: "inline",
    [theme.breakpoints.downM]: {
      display: "none",
    },
  },
  buttonTextMobile: {
    display: "none",
    [theme.breakpoints.downM]: {
      display: "inline",
    },
  },
  buttonWalletTitle: {
    alignItems: "center",
    display: "flex",
    [theme.breakpoints.downM]: {
      gap: theme.spacing(0.1),
    },
  },

  card: {
    display: "flex",
    flexDirection: "column",
    margin: [0, "auto", theme.spacing(3)],
  },
  cardBox: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
  },
    iconStack: {
    alignItems: "center",
    display: "flex",
    marginRight: theme.spacing(1.5),
    [theme.breakpoints.downM]: {
      marginRight: theme.spacing(1),
    },
  },
  smallTitle: {
    color: "#78798d",
    fontSize: 12,
    fontWeight: 400,
  },
  stackedIcon: {
    "&:first-child": {
      marginLeft: 0,
      zIndex: 1,
    },
    "&:nth-child(2)": {
      zIndex: 2,
    },
    "&:nth-child(3)": {
      transform: "scale(0.85)",
      zIndex: 3,
    },
    borderRadius: "50%",
    height: 32,
    marginLeft: -16,
    objectFit: "contain",
    width: 32,
    [theme.breakpoints.downM]: {
      height: 24,
      marginLeft: -12,
      width: 24,
    },
  },
  wallet: {
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    transition: theme.hoverTransition,
  },
  walletInfo: {
    flex: 1,
  },
  walletList: {
    listStyle: "none",
    margin: 0,
    paddingLeft: 0,
  },

  walletName: {
    color: theme.palette.white,
    marginLeft: theme.spacing(1),
    [theme.breakpoints.downM]: {
      fontSize: 12,
      marginLeft: theme.spacing(0.5),
    },
  },
}));
