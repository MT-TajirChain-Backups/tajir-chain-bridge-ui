import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useSnackbarStyles = createUseStyles((theme: Theme) => ({
  closeButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    marginLeft: theme.spacing(2.5),
    padding: theme.spacing(0.75),
    transition: theme.hoverTransition,
  },
  closeIcon: {
    "& rect": {
      fill: theme.palette.grey.dark,
    },
    alignItems: "center",
    display: "flex",
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  message: {
    color: theme.palette.black,
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "20px",
    margin: [0, theme.spacing(1.5)],
    whiteSpace: "pre-wrap",
  },
  messageIcon: {
    height: 24,
    width: 24,
  },
  reportButton: {
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.main,
    border: 0,
    borderRadius: 12,
    color: theme.palette.white.main,
    cursor: "pointer",
    fontWeight: 600,
    padding: `${theme.spacing(0.5)}px ${theme.spacing(2)}px`,
    transition: theme.hoverTransition,
  },
  root: {
    bottom: theme.spacing(2),
    left: 0,
    position: "fixed",
    right: 0,
    width: "100%",
    zIndex: 9999,
  },
  wrapper: {
    alignItems: "center",
    background: theme.palette.white.mainRedesign,
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    margin: "0 auto",
    maxWidth: "400px",
    padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px`,
    width: "90%",
  },
  wrapperError: {
    boxShadow: `0 8px 32px ${theme.palette.error.light}, 0 0 0 1px rgba(232, 67, 13, 0.15)`,
  },
  wrapperSuccess: {
    boxShadow: `0 8px 32px rgba(65, 201, 171, 0.25), 0 0 0 1px rgba(65, 201, 171, 0.2)`,
  },
}));
