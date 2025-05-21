import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Help.module.css";

export default function HowToUse() {
  return (
    <>
      <Head>
        <title>Playdarts.app - Darts Score Counter</title>
        <meta
          name="description"
          content="Learn how to use Playdarts.app Darts score tracker app. Mobile friendly, supports 301/501 games, interactive hit tracking, and more."
        />
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>How to Use</h1>

          <p>
            This app is designed to track darts scores for games like{" "}
            <strong>501</strong>, <strong>301</strong> and{" "}
            <strong>Cricket</strong>. It&apos;s mobile-friendly and
            touch-optimized.
          </p>

          <ul className={styles.list}>
            <li>
              <strong>Select a game mode</strong> (501, 301 or Cricket) on the
              homepage.
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
              The app auto-applies the multiplier/marks (single, double, triple)
              in all modes.
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
              <strong> Reset </strong> and you can add the hits again.
            </li>
            <li>The score auto-updates and tracks per turn and total.</li>
          </ul>

          <h2>Double Out Rule! (501 and 301 modes only)</h2>
          <p>
            When playing 501 or 301, to finish the game you must reach exactly
            zero points, but your last dart must land on a{" "}
            <strong>double</strong> (outer ring) or the inner bullseye (50
            points, counted as double 25).
          </p>
          <p>
            If your score goes below zero, or you reach 1 point, or your last
            dart is not a double when hitting zero, your turn is a <em>bust</em>
            , and your score resets to what it was at the start of your turn.
          </p>

          <h2>Cricket Rules (Cricket mode only)</h2>
          <p>
            In <strong>Cricket</strong>, the goal is to <strong>close</strong>{" "}
            all the following numbers:{" "}
            <strong>15, 16, 17, 18, 19, 20, and bullseye (25)</strong>. A number
            is closed when a player hits it <strong>three times</strong>. Hits
            count based on multiplier:
          </p>
          <ul>
            <li>Single hit = 1 mark</li>
            <li>Double hit = 2 marks</li>
            <li>Triple hit = 3 marks</li>
          </ul>
          <p>
            Once a number is closed, the player can{" "}
            <strong>score points</strong> on that number{" "}
            <strong>only if opponents haven&apos;t closed it yet</strong>.
          </p>
          <p>
            The game ends when <strong>one player closes all numbers</strong>{" "}
            and also has the <strong>highest score</strong>. If they&apos;ve closed
            all numbers first but another player still has a higher score, the
            game continues until the leading scorer either catches up or that
            leader also closes all numbers.
          </p>

          <p>
            Playdarts.app requires no login. Everything runs locally in your
            browser. Enjoy a fast, focused Darts match with friends.
          </p>

          <p>
            To report any issues, please write to{" "}
            <a href="mailto:admin@playdarts.app">admin@playdarts.app</a>
          </p>

          <Link href="/" className={styles.link}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
