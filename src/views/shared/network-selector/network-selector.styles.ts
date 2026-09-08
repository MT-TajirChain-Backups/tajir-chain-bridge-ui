import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useNetworkSelectorStyles = createUseStyles((theme: Theme) => ({
  networkButton: {
    "&:hover": {
      backgroundColor: theme.palette.grey.main,
    },
    alignItems: "center",
    background: theme.palette.white,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "space-between",
    maxWidth: 200,
    padding: theme.spacing(1.25),
    transition: theme.hoverTransition,
  },
  networkButtonText: {
    display: "none",
    fontSize: "14px !important",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
}));
export const useNetworkSelectorRedesignStyles = createUseStyles((theme: Theme) => ({
  networkButton: {
    "&:hover:not(:disabled)": {
      backgroundColor: theme.palette.grey.main,
      boxShadow: "none !important",
      transform: "none !important",
    },
    alignItems: "center",
    background: theme.palette.white,
    border: "1px solid rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    boxShadow: "none !important",
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "space-between",
    maxWidth: 200,
    padding: theme.spacing(1.25),
    transform: "none !important",
    transition: "background 160ms ease",
  },
  networkButtonText: {
    display: "none",
    fontSize: "14px !important",
    fontWeight: "400 !important",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
}));
