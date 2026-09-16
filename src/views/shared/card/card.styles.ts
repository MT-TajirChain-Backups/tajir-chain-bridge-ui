/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    background: theme.palette.white,
    borderRadius: 16,
    overflow: "hidden",
  },
}));

export const useCardRedesignStyles = createUseStyles((theme: Theme) => ({
  card: {
    background: theme.palette.white,
    borderRadius: "24px",
    boxShadow: "0px 4px 8px 4px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    padding: theme.spacing(3.5),
    [theme.breakpoints.downM]: {
      padding: theme.spacing(2),
    },
  },
}));
