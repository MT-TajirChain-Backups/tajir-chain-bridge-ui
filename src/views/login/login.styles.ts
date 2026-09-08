import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useLoginStyles = createUseStyles((theme: Theme) => ({
  appName: {
    background: theme.palette.grey.main,
    borderRadius: 56,
    margin: "0px auto",
    marginBottom: theme.spacing(5),
    padding: [theme.spacing(1.25), theme.spacing(4)],
  },
  card: {
    display: "flex",
    flexDirection: "column",
    margin: [0, "auto", theme.spacing(3)],
  },
  cardHeader: {
    padding: [theme.spacing(3), theme.spacing(4), theme.spacing(2)],
  },
  cardHeaderCentered: {
    textAlign: "center",
  },
  cardWrap: {
    margin: [theme.spacing(3), 0],
    width: "100%",
  },
  contentWrapper: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    maxWidth: theme.maxWidth,
    width: "100%",
  },
  login: {
    display: "flex",
    flexDirection: "column",
    padding: [0, theme.spacing(2)],
  },
  logo: {
    height: 120,
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(8),
  },
  networkBoxWrapper: {
    margin: [0, "auto", theme.spacing(3)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },
  policyMessage: {
    alignItems: "center",
    background:
      "linear-gradient(135deg, rgba(65, 201, 171, 0.16) 0%, rgba(243, 205, 82, 0.12) 100%)",
    border: "1px solid rgba(65, 201, 171, 0.28)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    padding: [theme.spacing(2.5), theme.spacing(2)],
    textAlign: "center",
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.75),
      padding: [theme.spacing(3), theme.spacing(2.5)],
    },
  },
  policyMessageIcon: {
    display: "block",
    height: 32,
    width: 36,
  },
  policyMessageText: {
    color: theme.palette.grey.veryDark,
    fontSize: 14,
    lineHeight: "22px",
    textAlign: "center",
    [theme.breakpoints.upSm]: {
      fontSize: 15,
      lineHeight: "24px",
    },
  },
}));

export const useLoginRedesignStyles = createUseStyles((theme: Theme) => ({
  appName: {
    alignItems: "center",
    backgroundColor: theme.palette.primary.light,
    borderRadius: "8px",
    cursor: "default",
    display: "flex",
    fontSize: 14,
    gap: 8,
    justifyContent: "center",
    margin: theme.spacing(5),
    padding: "4px 8px",
    transition: "all 0.3s ease-in-out",
    [theme.breakpoints.downM]: {
      margin: theme.spacing(3),
    },
  },
  appNameIcon: {
    width: 16,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    margin: [0, "auto", theme.spacing(3)],
  },
  cardHeader: {
    padding: [theme.spacing(3), theme.spacing(4), theme.spacing(2)],
  },
  cardHeaderCentered: {
    textAlign: "center",
  },
  cardWrap: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    margin: [theme.spacing(3), 0],
    width: "100%",
  },
  contentWrapper: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    maxWidth: theme.maxWidth,
    width: "100%",
  },

  login: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "100vh",
    padding: [0, theme.spacing(2)],
  },
  logo: {
    height: 120,
    marginBottom: theme.spacing(4),
    [theme.breakpoints.downM]: {
      height: 80,
      marginBottom: theme.spacing(3),
    },
  },
  networkBoxWrapper: {
    margin: [0, "auto", theme.spacing(3)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },

  networkName: {
    fontSize: 48,
    [theme.breakpoints.downM]: {
      fontSize: 22,
    },
  },
  networkTopBox: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: theme.spacing(5),
  },
  policyMessage: {
    alignItems: "center",
    background:
      "linear-gradient(135deg, rgba(65, 201, 171, 0.16) 0%, rgba(243, 205, 82, 0.12) 100%)",
    border: "1px solid rgba(65, 201, 171, 0.28)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    padding: [theme.spacing(2.5), theme.spacing(2)],
    textAlign: "center",
    [theme.breakpoints.upSm]: {
      gap: theme.spacing(1.75),
      padding: [theme.spacing(3), theme.spacing(2.5)],
    },
  },
  policyMessageIcon: {
    display: "block",
    height: 32,
    width: 36,
  },
  policyMessageText: {
    color: theme.palette.grey.veryDark,
    fontSize: 14,
    lineHeight: "22px",
    textAlign: "center",
    [theme.breakpoints.upSm]: {
      fontSize: 15,
      lineHeight: "24px",
    },
  },
}));
