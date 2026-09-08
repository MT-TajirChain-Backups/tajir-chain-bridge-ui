import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenSelectorStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.white,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    padding: `0 ${theme.spacing(1)}px`,
    width: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    height: 515,
    maxWidth: 500,
    padding: theme.spacing(2),
    width: "100%",
  },
}));

export const useTokenSelectorRedesignStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    alignSelf: "center",
    backdropFilter: "blur(12px)",
    background: "rgba(8, 17, 50, 0.5)",
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    padding: `0 ${theme.spacing(2)}px`,
    width: "100%",
    [theme.breakpoints.downM]: {
      padding: `0 ${theme.spacing(1.5)}px`,
    },
  },
  card: {
    backgroundColor: theme.palette.white.mainRedesign,
    border: "1px solid rgba(65, 201, 171, 0.2)",
    borderRadius: 28,
    boxShadow:
      "0 28px 64px rgba(8, 17, 50, 0.22), 0 8px 20px rgba(8, 17, 50, 0.08)",
    display: "flex",
    flexDirection: "column",
    height: 600,
    maxHeight: "90vh",
    maxWidth: 560,
    minHeight: 0,
    overflow: "hidden",
    padding: theme.spacing(3.25),
    width: "100%",
    [theme.breakpoints.downM]: {
      borderRadius: 18,
      boxShadow:
        "0 18px 40px rgba(8, 17, 50, 0.2), 0 4px 12px rgba(8, 17, 50, 0.08)",
      height: "auto",
      maxHeight: "58dvh",
      maxWidth: 360,
      minHeight: 280,
      padding: theme.spacing(1.5),
    },
  },
}));
