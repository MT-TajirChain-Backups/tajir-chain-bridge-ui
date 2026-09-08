import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useConfirmationModalStyles = createUseStyles((theme: Theme) => ({
  actions: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    width: "100%",
  },
  background: {
    alignItems: "center",
    backdropFilter: "blur(10px)",
    background: "rgba(8, 17, 50, 0.55)",
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    left: 0,
    padding: theme.spacing(2.5),
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1000,
    [theme.breakpoints.upSm]: {
      padding: theme.spacing(4),
    },
  },
  cancelButton: {
    "&:hover": {
      color: theme.palette.black,
    },
    background: "transparent",
    border: 0,
    color: theme.palette.grey.dark,
    cursor: "pointer",
    fontSize: 15,
    padding: theme.spacing(1),
    transition: theme.hoverTransition,
  },
  card: {
    "@media (min-width: 1024px)": {
      maxWidth: 560,
      padding: `${theme.spacing(5)}px ${theme.spacing(5.5)}px`,
    },
    background: theme.palette.white.mainRedesign,
    border: "1px solid rgba(65, 201, 171, 0.2)",
    borderRadius: 24,
    boxShadow:
      "0 24px 48px rgba(8, 17, 50, 0.2), 0 10px 20px rgba(8, 17, 50, 0.08), 0 0 0 1px rgba(255,255,255,0.4) inset",
    display: "flex",
    flexDirection: "column",
    maxWidth: 460,
    overflow: "hidden",
    padding: theme.spacing(4),
    width: "100%",
    [theme.breakpoints.downM]: {
      borderRadius: 20,
      maxWidth: 400,
      padding: theme.spacing(3.25),
    },
    [theme.breakpoints.upSm]: {
      maxWidth: 520,
      padding: `${theme.spacing(4.5)}px ${theme.spacing(5)}px`,
    },
  },
  confirmButton: {
    "&:active": {
      backgroundColor: "#E0B82F",
      boxShadow: "0 3px 10px rgba(224, 184, 47, 0.35)",
      transform: "translateY(0)",
    },
    "&:hover": {
      backgroundColor: "#F0C645",
      boxShadow: "0 10px 22px rgba(243, 205, 82, 0.48)",
      transform: "translateY(-1px)",
    },
    backgroundColor: "#F3CD52",
    border: "none",
    borderRadius: 14,
    boxShadow: "0 6px 16px rgba(243, 205, 82, 0.35)",
    color: theme.palette.black,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.01em",
    minHeight: 48,
    padding: `${theme.spacing(1.5)}px ${theme.spacing(3)}px`,
    transition: "background-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
    width: "100%",
    [theme.breakpoints.upSm]: {
      fontSize: 17,
      minHeight: 50,
    },
  },
  textContainer: {
    "& p": {
      color: theme.palette.grey.veryDark,
      lineHeight: "24px",
      margin: 0,
    },
    margin: `${theme.spacing(2.5)}px 0 ${theme.spacing(3.25)}px`,
    [theme.breakpoints.upSm]: {
      margin: `${theme.spacing(3)}px 0 ${theme.spacing(3.5)}px`,
    },
  },
  title: {
    color: theme.palette.black,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: "28px",
    textAlign: "center",
    [theme.breakpoints.downM]: {
      fontSize: 20,
      lineHeight: "26px",
    },
    [theme.breakpoints.upSm]: {
      fontSize: 24,
      lineHeight: "30px",
    },
  },
}));
