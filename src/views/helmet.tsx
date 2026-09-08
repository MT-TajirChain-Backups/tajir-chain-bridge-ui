import { Helmet, HelmetProvider } from "react-helmet-async";
import { useEnvContext } from "../contexts/env.context";

const DEFAULT_TITLE = "Tajir Chain Bridge — Bridge ETH & Tokens to Tajir Chain";
const DEFAULT_DESCRIPTION =
  "Tajir Chain Bridge lets you securely transfer ETH and tokens between Ethereum and Tajir Chain. Connect your wallet and bridge assets quickly.";
const DEFAULT_FAVICON = "/favicon.ico";

export const AppHead = () => {
  const env = useEnvContext();
  const title = env?.networkName
    ? `${env.networkName} Bridge — Bridge ETH & Tokens`
    : DEFAULT_TITLE;
  const faviconPath = env?.faviconPath || DEFAULT_FAVICON;
  const ogImage = `${window.location.origin}/og-image.png`;

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta content={DEFAULT_DESCRIPTION} name="description" />
        <meta content="index, follow, max-image-preview:large" name="robots" />
        <meta content="#000000" name="theme-color" />
        <title>{title}</title>
        <link href={faviconPath} rel="icon" sizes="any" />
        <link href="/favicon-48x48.png" rel="icon" sizes="48x48" type="image/png" />
        <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
        <link href="/favicon-192x192.png" rel="icon" sizes="192x192" type="image/png" />
        <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <link href="/manifest.json" rel="manifest" />
        <meta content="website" property="og:type" />
        <meta content={window.location.origin + "/"} property="og:url" />
        <meta content="Tajir Chain Bridge" property="og:site_name" />
        <meta content={title} property="og:title" />
        <meta content={DEFAULT_DESCRIPTION} property="og:description" />
        <meta content={ogImage} property="og:image" />
        <meta content="Tajir Chain Bridge" property="og:image:alt" />
        <meta content="image/png" property="og:image:type" />
        <meta content="1200" property="og:image:width" />
        <meta content="630" property="og:image:height" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={title} name="twitter:title" />
        <meta content={DEFAULT_DESCRIPTION} name="twitter:description" />
        <meta content={ogImage} name="twitter:image" />
      </Helmet>
    </HelmetProvider>
  );
};
