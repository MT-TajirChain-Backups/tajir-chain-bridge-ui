import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useActivityStyles = createUseStyles((theme: Theme) => ({
  bridgeCardwrapper: {
    "&:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  contentWrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: [0, theme.spacing(2)],
  },
  emptyMessage: {
    alignSelf: "center",
    maxWidth: theme.maxWidth,
    padding: [50, theme.spacing(2)],
    textAlign: "center",
    width: "100%",
    [theme.breakpoints.upSm]: {
      padding: 100,
    },
  },
  filterBox: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing(2),
    },
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
    transition: theme.hoverTransition,
  },
  filterBoxes: {
    display: "flex",
    margin: [theme.spacing(5), "auto", theme.spacing(2)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },
  filterBoxLabel: {
    padding: [theme.spacing(0), theme.spacing(1)],
  },
  filterBoxSelected: {
    backgroundColor: theme.palette.white,
    color: theme.palette.grey.dark,
  },
  filterNumberBox: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.main,
    borderRadius: 6,
    display: "flex",
    padding: [theme.spacing(0.25), theme.spacing(1)],
  },
  filterNumberBoxSelected: {
    backgroundColor: theme.palette.grey.light,
  },
  loadMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },
  stickyContent: {
    background: theme.palette.grey.light,
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  stickyContentBorder: {
    borderBottom: `${theme.palette.grey.main} 1px solid`,
  },
}));

export const useActivityRedesignStyles = createUseStyles((theme: Theme) => ({
  bridgeCardwrapper: {
    "&:not(:last-child)": {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.downM]: {
        marginBottom: theme.spacing(0.5),
      },
    },
    marginInline: theme.spacing(2),
    [theme.breakpoints.downM]: {
      marginInline: 0,
      padding: `${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(0.5)}px`,
    },
  },

  contentWrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: [0, theme.spacing(5)],
    [theme.breakpoints.downM]: {
      padding: [0, theme.spacing(3)],
    },
  },

  contentWrapperBody: {
    backgroundColor: theme.palette.white,
    borderRadius: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: `${theme.spacing(2)}px 0 ${theme.spacing(3)}px`,
    [theme.breakpoints.upSm]: {
      maxHeight: 600,
      overflow: "hidden",
      padding: theme.spacing(2),
      position: "relative",
    },
  },



  emptyMessage: {
    alignSelf: "center",
    borderTopLeftRadius: 0,
    padding: [100, theme.spacing(2)],
    textAlign: "center",
    [theme.breakpoints.upSm]: {
      padding: "100px ",
    },
  },

  filterBox: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.main,
    borderRadius: 24,
    cursor: "pointer",
    display: "flex",
    padding: [[theme.spacing(1), theme.spacing(2)]],
    transition: theme.hoverTransition,
  },

  filterBoxes: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(5),
    maxWidth: theme.maxWidth,
    width: "100%",
  },

  filterBoxLabel: {
    padding: [theme.spacing(0), theme.spacing(1)],
  },

  filterBoxSelected: {
    backgroundColor: theme.palette.white,
    color: theme.palette.grey.dark,
  },

  filterNumberBox: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    border: `${theme.palette.primary.light} 2px solid`,
    borderRadius: 6,
    display: "flex",
    padding: [theme.spacing(0.25), theme.spacing(1)],
  },

  filterNumberBoxSelected: {
    backgroundColor: theme.palette.white,
  },
  loaderBox: {
    padding: [theme.spacing(22), theme.spacing(1)],
  },
  loaderWrapper: {
    flex: 0,
  },
  loadMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },

  scrollArea: {
    [theme.breakpoints.upSm]: {
      "&::-webkit-scrollbar": {
        display: "none",
      },
      flex: 1,
      maskImage: "linear-gradient(to bottom, black 80%, transparent)",
      overflowY: "auto",
      padding: `${theme.spacing(2)}px 0 ${theme.spacing(5)}px`,
      scrollbarWidth: "none",
      WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent)",
    },
  },

  stickyContent: {
    position: "sticky",
    top: 0,
    zIndex: 1,
  },

  stickyContentBorder: {
    borderBottom: `${theme.palette.grey.main} 1px solid`,
  },

  wrapper: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    marginBottom: theme.spacing(3),
    width: "60%",
    [theme.breakpoints.downM]: {
      width: "100%",
    },
  },
}));
