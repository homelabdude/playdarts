import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <title>Playdarts.app - Darts Score Tracker</title>
        <meta
          name="description"
          content="Track your darts game easily with playdarts.app online score tracker. Supports 301 and 501 modes for up to 4 players."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
