import Head from "next/head";
import Link from "next/link";

export default function HowToUse() {
  return (
    <>
      <Head>
        <title>How to Use | Darts Score Tracker</title>
        <meta
          name="description"
          content="Learn how to use the Darts Score Tracker app. Mobile friendly, supports 301/501 games, hit detection, and more."
        />
      </Head>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.heading}>How to Use</h1>

          <p>
            This app is designed to track darts scores for games like{" "}
            <strong>301</strong> and <strong>501</strong>. It&apos;s mobile-friendly
            and touch-optimized.
          </p>

          <ul style={styles.list}>
            <li>
              <strong>Select a game mode</strong> (301 or 501) on the homepage.
            </li>
            <li>
              <strong>Add player names</strong> — minimum 2, up to 4.
            </li>
            <li>
              Start the game and take turns. The app will track scores per
              player.
            </li>
            <li>
              <strong>Tap a section on the dartboard</strong> to register a hit.
              The app auto-applies the multiplier (single, double, triple).
            </li>
            <li>
              <strong>Use the “Miss” button</strong> if a dart misses
              completely.
            </li>
            <li>
              Each turn allows <strong>3 dart throws</strong>.
            </li>
            <li>After 3 hits, confirm the turn to move to the next player.</li>
            <li>
              If you entered the wrong hit, just click on{" "}
              <strong> Reset Turn </strong> and you can add the hits again.
            </li>
            <li>The score auto-updates and tracks per turn and total.</li>
          </ul>

          <h2>Double Out Rule!</h2>
          <p>
            When playing 301 or 501, to finish the game you must reach exactly
            zero points, but your last dart must land on a{" "}
            <strong>double</strong> (outer ring) or the inner bullseye (50
            points, counted as double 25).
          </p>
          <p>
            If your score goes below zero, or you reach 1 point, or your last
            dart is not a double when hitting zero, your turn is a <em>bust</em>
            , and your score resets to what it was at the start of your turn.
          </p>

          <p>
            No login required. Everything runs locally in your browser. Enjoy a
            fast, focused Darts match with friends.
          </p>

          <p>
            To report any issues, please write to playdarts@ashwin.party.
          </p>

          <Link href="/" style={styles.link}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    fontFamily: '"JetBrains Mono", monospace',
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 5,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: 20,
    textAlign: "center",
    textDecoration: "underline",
  },
  list: {
    margin: "1rem 0",
    paddingLeft: "1.5rem",
    lineHeight: 1.6,
  },
  link: {
    display: "inline-block",
    marginTop: 20,
    color: "#0070f3",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
