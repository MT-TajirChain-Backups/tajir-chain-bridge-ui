import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useButtonStyles = createUseStyles((theme: Theme) => ({
  button: {
    "&:active&:not(:disabled)": {
      background: "#E6C043",
      boxShadow: "none !important",
      transform: "none !important",
    },
    "&:disabled": {
      background: "#E8D4A0",
      boxShadow: "none",
      color: "rgba(10, 11, 13, 0.55)",
      cursor: "default",
      opacity: 0.8,
    },
    "&:hover&:not(:disabled)": {
      background: "#E8C044",
      boxShadow: "none !important",
      transform: "none !important",
    },
    alignItems: "center",
    background: "#F3CD52",
    border: "none",
    borderRadius: 80,
    boxShadow: "none !important",
    color: theme.palette.black,
    cursor: "pointer",
    display: "flex",
    fontSize: "20px",
    justifyContent: "center",
    lineHeight: "24px",
    minWidth: "260px",
    padding: `${theme.spacing(2)}px ${theme.spacing(10)}px`,
    transform: "none !important",
    transition: "background 160ms ease",
    [theme.breakpoints.downM]: {
      fontSize: "16px",
      lineHeight: "20px",
      minWidth: "200px",
      padding: `${theme.spacing(1.5)}px ${theme.spacing(4)}px`,
    },
  },
  paddedSpinner: {
    paddingLeft: theme.spacing(1.5),
  },
}));
