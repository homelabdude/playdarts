import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Help.module.css";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - Playdarts.app</title>
        <meta
          name="description"
          content="Terms of Service for Playdarts.app - spoiler: we don't care about your data"
        />
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Terms of Service</h1>

          <p>
            Welcome to the most boring legal page you&apos;ll read today. But
            don&apos;t worry, it&apos;s short.
          </p>

          <h2>The Short Version</h2>
          <p>
            I have <strong>zero interest in anyone&apos;s data</strong>. Like,
            seriously. None. Nada. Zilch. I don&apos;t track jack unless my monitoring reports that you are up to something naughty.
          </p>

          <h2>What This App Does (and Doesn&apos;t Do)</h2>
          <ul className={styles.list}>
            <li>
              <strong>Runs entirely on your device:</strong> Once the page
              loads, everything happens in your browser. The app is basically a
              fancy calculator that knows darts rules.
            </li>
            <li>
              <strong>Session/Cookie Storage:</strong> The only thing stored in
              your browser is your game data itself (player names, scores, that
              sort of thing). No tracking cookies, no analytics cookies, no
              creepy &quot;we know what you had for breakfast&quot; cookies.
            </li>
            <li>
              <strong>No server-side shenanigans:</strong> I don&apos;t have a
              database. I don&apos;t have your email. I don&apos;t even know
              you exist until you report a bug.
            </li>
          </ul>

          <h2>The CDN Disclaimer</h2>
          <p>
            Here&apos;s the catch: This site uses a CDN (Content Delivery
            Network) to load faster. CDNs <em>might</em> collect some basic
            info (like IP addresses, browser type, etc.) because that&apos;s
            what CDNs do.
          </p>
          <p>
            <strong>My advice?</strong> Everyone should use ad blockers and DNS
            blacklists anyway. The internet is a wild place. Protect yourself.
            I recommend tools like uBlock Origin, Pi-hole, or NextDNS. You know
            the drill.
          </p>

          <h2>Your Responsibilities</h2>
          <ul className={styles.list}>
            <li>
              Use this app to enjoy darts with friends, not to take over the
              world.
            </li>
          </ul>

          <h2>Liability</h2>
          <p>
            This app is provided &quot;as is&quot; without any warranties. If
            your darts game ends in a heated argument because someone
            claims the score is wrong, that&apos;s on you, not me. Double-check
            your arithmetic.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            I might update this page if I feel like it, or if someone convinces
            me I need to. You probably won&apos;t notice because, let&apos;s be
            honest, who reads these things twice?
          </p>

          <h2>Questions?</h2>
          <p>
            If you have questions, concerns, or just want to tell me how much
            you love/hate this app, check out the links below.
          </p>

          <div className={styles.linkGroup}>
            <Link href="/how-to-use" className={styles.link}>
              📘 How to Use
            </Link>
            <Link
              href="https://github.com/homelabdude/playdarts/issues"
              className={styles.link}
            >
              🐛 Checkout on GitHub
            </Link>
            <Link href="/" className={styles.link}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
