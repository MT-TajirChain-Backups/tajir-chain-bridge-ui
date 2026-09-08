import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeFormStyles = createUseStyles((theme: Theme) => ({
  arrowDownIcon: {
    backgroundColor: theme.palette.grey.main,
    borderRadius: "50%",
    display: "flex",
    [theme.breakpoints.upSm]: {
      height: 40,
      padding: theme.spacing(0.5),
      width: 40,
    },
  },
  arrowRow: {
    display: "flex",
    justifyContent: "center",
    margin: [theme.spacing(1), 0],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(2), 0],
    },
  },
  button: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    margin: [theme.spacing(5), "auto"],
  },
  card: {
    padding: [theme.spacing(2), theme.spacing(3)],
  },
  form: {
    margin: "auto",
    maxWidth: theme.maxWidth,
  },
  fromChain: {
    "&:hover": {
      backgroundColor: theme.palette.grey.light,
    },
    alignItems: "center",
    background: "none",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(0.75),
    marginBottom: -theme.spacing(0.75),
    marginLeft: -theme.spacing(1.25),
    marginTop: theme.spacing(0.5),
    padding: [theme.spacing(0.75), theme.spacing(1.25)],
    transition: theme.hoverTransition,
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.25),
    },
  },
  icons: {
    height: 20,
    width: 20,
    [theme.breakpoints.upSm]: {
      height: 24,
      width: 24,
    },
  },
  leftBox: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  middleRow: {
    borderTop: `1px solid ${theme.palette.grey.light}`,
    marginTop: theme.spacing(0),
    padding: [theme.spacing(2), 0, 0],
  },
  rightBox: {
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(0.5),
  },
  spinner: {
    margin: "auto",
    marginTop: theme.spacing(7),
  },
  toChain: {
    alignItems: "center",
    background: "none",
    border: "none",
    borderRadius: 8,
    display: "flex",
    gap: theme.spacing(0.75),
    marginBottom: -theme.spacing(0.75),
    marginLeft: -theme.spacing(1.25),
    marginTop: theme.spacing(0.5),
    padding: [theme.spacing(0.75), theme.spacing(1.25)],
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.25),
    },

  },
  tokenSelector: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    padding: [theme.spacing(1), theme.spacing(1.25)],
    transition: theme.hoverTransition,
    [theme.breakpoints.upSm]: {
      backgroundColor: theme.palette.grey.light,
      gap: theme.spacing(2),
      padding: [theme.spacing(1.5), theme.spacing(2)],
    },
  },
}));

export const useBridgeFormRedesignStyles = createUseStyles((theme: Theme) => ({
  balanceLabel: {
    color: "#666666",
  },
  button: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    margin: [theme.spacing(3), "auto"],
    [theme.breakpoints.downM]: {
      margin: [theme.spacing(1.5), "auto"],
    },
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    maxWidth: theme.maxWidth,
    [theme.breakpoints.downM]: {
      padding: theme.spacing(1.5),
    }
  },
  form: {
    margin: "auto",
    width: "100%",
  },
  fromChain: {
    "&:hover:not(:disabled)": {
      background: "#E8ECEE",
      boxShadow: "none !important",
      transform: "none !important",
    },
    alignItems: "center",
    background: "#F3F6F7",
    border: "1px solid rgba(10, 11, 13, 0.04)",
    borderRadius: 16,
    boxShadow: "none !important",
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(0.75),
    marginBottom: -theme.spacing(0.75),
    marginTop: theme.spacing(0.5),
    padding: [theme.spacing(0.75), theme.spacing(1.25)],
    transform: "none !important",
    transition: "background 160ms ease",
    [theme.breakpoints.downM]: {
      gap: theme.spacing(0.5),
      maxWidth: "125px",
      padding: `${theme.spacing(0.5)}px ${theme.spacing(0.75)}px`,
    },
  },
  headerRow: {
    alignItems: "flex-end",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(0.5),
    width: "100%",
  },
  icons: {
    height: 20,
    width: 20,
    [theme.breakpoints.upSm]: {
      height: 24,
      width: 24,
    },
  },
  inputRow: {
    alignItems: "center",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(1),
  },
  inputRowLast: {
    borderBottom: "none",
    paddingBottom: 0,
  },
  mainRow: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(1),
    width: "100%",
  },
  selectedChainName: {
    fontWeight: "400 !important",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  spinner: {
    margin: "auto",
    marginTop: theme.spacing(7),
  },
  toChain: {
    alignItems: "center",
    background: "#F3F6F7",
    border: "1px solid rgba(10, 11, 13, 0.04)",
    borderRadius: 16,
    display: "flex",
    gap: theme.spacing(0.75),
    marginBottom: -theme.spacing(0.75),
    marginTop: theme.spacing(0.5),
    padding: [theme.spacing(0.75), theme.spacing(1.25)],
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.25),
    },
    [theme.breakpoints.downM]: {
      gap: theme.spacing(0.5),
      maxWidth: "125px",
      padding: `${theme.spacing(0.5)}px ${theme.spacing(0.75)}px`,
    },
  },
  tokenSelector: {
    alignItems: "center",
    border: "1px solid rgba(0, 0, 0, 0.07)",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    margin: 0,
    marginTop: theme.spacing(1.5),
    maxWidth: "100%",
    overflow: "hidden",
    padding: [theme.spacing(1), theme.spacing(1)],
    textOverflow: "ellipsis",
    transition: theme.hoverTransition,
    [theme.breakpoints.upSm]: {
      backgroundColor: theme.palette.white,
      gap: theme.spacing(2),
      whiteSpace: "nowrap",
    },
  },
  tokenSelectorSymbol: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  topActionsRow: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(0.25),
    [theme.breakpoints.downM]: {
      flexShrink: 0,
      gap: theme.spacing(0.5),
    },
  },
  topQuickActionButton: {
    "&:disabled": {
      cursor: "default",
      opacity: 0.4,
    },
    "&:not(:disabled)": {
      cursor: "pointer",
    },
    background: "#F7F7F7",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: 999,
    color: theme.palette.black,
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1.5)}px`,
    [theme.breakpoints.downM]: {
      padding: `${theme.spacing(0.25)}px ${theme.spacing(0.75)}px`,
    },

  },
  topQuickActions: {
    display: "flex",
    gap: theme.spacing(1),
    [theme.breakpoints.downM]: {
      gap: theme.spacing(0.5),
    },
  },
  topQuickActionText: {
    color: "#222222",
    fontWeight: 500,
    [theme.breakpoints.downM]: {
      fontSize: "11px",
    },
  },
}));
