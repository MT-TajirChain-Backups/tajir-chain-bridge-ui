import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "react-jss";
import { BrowserRouter } from "react-router-dom";
import "normalize.css/normalize.css";

import { theme } from "src/styles/theme";
import { App } from "src/views/app.view";

// Suppress all console output — comment these lines out to re-enable for debugging
// eslint-disable-next-line no-console, @typescript-eslint/no-empty-function
// console.log = function () {};
// console.warn = function () {};
// console.error = function () {};

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root container doesn't exist");
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
