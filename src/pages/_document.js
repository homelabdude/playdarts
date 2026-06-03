import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Track your darts game easily with playdarts.app online score keeper. Supports 501 301 and Cricket modes for up to 4 players."
        />
      </Head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(_){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
