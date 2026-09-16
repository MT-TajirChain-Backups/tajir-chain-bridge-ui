import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeDetailsRedesignStyles = createUseStyles((theme: Theme) => ({
  alignRow: {
    alignItems: "center",
    color: theme.palette.grey.dark,
    display: "flex",
    fontWeight: 500,
    gap: theme.spacing(1),
    [theme.breakpoints.downM]: {
      color: theme.palette.grey.dark,
    },
  },
  alignRowValue: {
    color: theme.palette.grey.dark,
    [theme.breakpoints.upSm]: {
      padding: "4px 8px",
    },
  },
  amount: {
    [theme.breakpoints.downM]: {
      fontSize: 20,
    },
  },
  balance: {
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    display: "flex",
    gap: theme.spacing(1.5),
    justifyContent: "center",
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.downM]: {
      borderBottom: "none",
      paddingBottom: theme.spacing(1),
    },
  },
  card: {
    margin: `${theme.spacing(5)}px auto 0`,
    maxWidth: theme.maxWidth,
    width: "100%",
    [theme.breakpoints.downM]: {
      margin: `${theme.spacing(2.5)}px auto 0`,
    },
  },
  contentWrapper: {
    padding: `0 ${theme.spacing(5)}px`,
    [theme.breakpoints.downM]: {
      marginTop: theme.spacing(1.5),
      padding: `0 ${theme.spacing(2)}px`,
    },
  },
  dotCompleted: {
    backgroundColor: theme.palette.success.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotOnHold: {
    backgroundColor: theme.palette.error.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotProcessing: {
    backgroundColor: theme.palette.warning.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  explorerButton: {
    alignItems: "center",
    backgroundColor: theme.palette.primary.light,
    border: "none",
    borderRadius: 8,
    color: theme.palette.grey.veryDark,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    [theme.breakpoints.downM]: {
      "& svg": {
        height: 14,
        width: 14,
      },
      gap: theme.spacing(0.5),
      padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
    },
  },
  explorerTitle: {
    [theme.breakpoints.downM]: {
      color: `${theme.palette.grey.veryDark} !important`,
      fontSize: 12,
    },
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  finaliseRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "center",
    margin: `${theme.spacing(3)}px 0`,
    [theme.breakpoints.upSm]: {
      margin: `${theme.spacing(3)}px 0`,
    },
  },
  finaliseSpinner: {
    "& path": {
      fill: theme.palette.white,
    },
  },
  infoContainer: {},
  lastRow: {
    paddingBottom: 0,
  },
  mobileBreak: {
    display: "none",
    [theme.breakpoints.downM]: {
      display: "block",
    },
  },
  row: {
    "&:last-child": {
      borderBottom: "none",
    },
    alignItems: "center",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    display: "grid",
    gap: theme.spacing(1),
    gridTemplateColumns: "1fr auto",
    padding: `${theme.spacing(1.5)}px 0`,
    [theme.breakpoints.upSm]: {
      padding: `${theme.spacing(2)}px 0`,
    },
  },
  tokenIcon: {},
}));

export const useBridgeDetailsStyles = createUseStyles((theme: Theme) => ({
  alignRow: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
  balance: {
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.grey.light}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "center",
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  },
  card: {
    margin: `${theme.spacing(5)}px auto 0`,
    maxWidth: theme.maxWidth,
    padding: theme.spacing(3),
    width: "100%",
  },
  contentWrapper: {
    padding: `0 ${theme.spacing(2)}px`,
  },
  dotCompleted: {
    backgroundColor: theme.palette.success.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotOnHold: {
    backgroundColor: theme.palette.error.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotProcessing: {
    backgroundColor: theme.palette.warning.main,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  explorerButton: {
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
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  finaliseRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "center",
    margin: `${theme.spacing(3)}px 0`,
    [theme.breakpoints.upSm]: {
      margin: `${theme.spacing(6)}px 0`,
    },
  },
  finaliseSpinner: {
    "& path": {
      fill: theme.palette.white,
    },
  },
  lastRow: {
    paddingBottom: 0,
  },
  row: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    justifyContent: "space-between",
    padding: `${theme.spacing(2)}px 0`,
    [theme.breakpoints.upSm]: {
      alignItems: "center",
      flexDirection: "row",
      padding: `${theme.spacing(2.5)}px 0`,
    },
  },
  tokenIcon: {
    height: 48,
    margin: `${theme.spacing(1)}px 0 ${theme.spacing(2)}px`,
    width: 48,
  },
}));
