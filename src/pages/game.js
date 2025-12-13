import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dartboard from "./dartboard";
import Link from "next/link";
import Head from "next/head";
import { Toaster, toast } from "react-hot-toast";
import styles from "../styles/Game.module.css";

export default function Game({ theme, toggleTheme }) {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hits, setHits] = useState([]);
  const [startingScore, setStartingScore] = useState(501);
  const [legsToWin, setLegsToWin] = useState(1);
  const [totalLegs, setTotalLegs] = useState(1);
  const isCricket = startingScore === "Cricket";

  useEffect(() => {
    if (!router.isReady) return;

    const { mode, players: rawPlayers, legs } = router.query;

    try {
      const parsedPlayers = JSON.parse(rawPlayers);
      const cricketMode = mode === "Cricket";
      const totalLegsFromParam = Number(legs) || 1;

      setTotalLegs(totalLegsFromParam);

      // For cricket mode, legsToWin = totalLegs (usually 1)
      // For 301/501 modes, legsToWin = majority of total legs (best of N)
      if (cricketMode) {
        setLegsToWin(totalLegsFromParam);
        setStartingScore("Cricket");
      } else {
        setStartingScore(Number(mode) || 501);
        setLegsToWin(Math.ceil(totalLegsFromParam / 2));
      }

      setPlayers(
        parsedPlayers.map((name) => ({
          name: name.slice(0, 10),
          score: cricketMode ? 0 : Number(mode) || 501,
          hits: [],
          legs: 0,
          marks: cricketMode
            ? {
                15: 0,
                16: 0,
                17: 0,
                18: 0,
                19: 0,
                20: 0,
                25: 0,
              }
            : undefined,
        }))
      );
    } catch (e) {
      console.error("Failed to parse query params", e);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleHit = (hit) => {
    if (hits.length >= 3) return;
    setHits([...hits, hit]);
  };

  const handleConfirmTurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    let updatedPlayers = [...players];

    if (isCricket) {
      const numbers = [15, 16, 17, 18, 19, 20, 25];
      let updatedMarks = { ...currentPlayer.marks };
      let scoreGain = 0;

      // Count hits per number in this turn
      const hitsCountThisTurn = {};
      hits.forEach(({ value, multiplier }) => {
        if (numbers.includes(value)) {
          hitsCountThisTurn[value] =
            (hitsCountThisTurn[value] || 0) + multiplier;
        }
      });

      for (const num of numbers) {
        const beforeMarks = currentPlayer.marks[num] || 0;
        const hitsThisTurnForNum = hitsCountThisTurn[num] || 0;
        const totalMarks = beforeMarks + hitsThisTurnForNum;

        // Update marks capped at 3
        updatedMarks[num] = Math.min(totalMarks, 3);

        // Calculate extra hits beyond 3 this turn
        const extraHits = totalMarks > 3 ? totalMarks - 3 : 0;

        // Points count only if opponent hasn't closed the number
        const opponentsClosed = players.every((p, idx) =>
          idx === currentPlayerIndex ? true : (p.marks[num] || 0) >= 3
        );

        if (extraHits > 0 && !opponentsClosed) {
          scoreGain += extraHits * num;
        }
      }

      updatedPlayers = players.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          return {
            ...p,
            marks: updatedMarks,
            score: p.score + scoreGain,
            hits: [...p.hits, hits],
          };
        }
        return p;
      });
    } else {
      // 301 or 501 mode logic
      const scoreBeforeTurn = currentPlayer.score;
      const scoreThisTurn = hits.reduce(
        (sum, hit) => sum + hit.value * hit.multiplier,
        0
      );
      const scoreAfterTurn = scoreBeforeTurn - scoreThisTurn;
      const lastHit = hits[hits.length - 1];

      let isBust = false;
      let wonLeg = false;

      if (scoreAfterTurn < 0 || scoreAfterTurn === 1) {
        isBust = true;
      } else if (scoreAfterTurn === 0) {
        const isDoubleOut =
          (lastHit.value === 25 && lastHit.multiplier === 2) ||
          lastHit.multiplier === 2;

        if (!isDoubleOut) {
          isBust = true;
        } else {
          wonLeg = true;
        }
      }

      updatedPlayers = players.map((player, idx) => {
        if (idx === currentPlayerIndex) {
          return {
            ...player,
            score: isBust
              ? scoreBeforeTurn
              : wonLeg
              ? startingScore
              : scoreAfterTurn,
            hits: [...player.hits, hits],
            legs: wonLeg ? player.legs + 1 : player.legs,
          };
        }
        return player;
      });

      if (wonLeg) {
        const newLegCount = updatedPlayers[currentPlayerIndex].legs;

        // Reset all players' scores for new leg
        updatedPlayers = updatedPlayers.map((p) => ({
          ...p,
          score: startingScore,
        }));

        if (newLegCount >= legsToWin) {
          toast.success(`${currentPlayer.name} wins the match!`, {
            duration: 4000,
          });
          setTimeout(() => router.push("/"), 4200);
        } else {
          toast(`${currentPlayer.name} wins leg ${currentLeg}!`, {
            duration: 4000,
            icon: "🎯",
          });
        }
      }
    }

    setPlayers(updatedPlayers);
    setHits([]);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const handleResetTurn = () => {
    setHits([]);
  };

  if (!players.length)
    return <div className={styles.loading}>Loading game...</div>;

  const currentPlayer = players[currentPlayerIndex];
  const legsPlayed = players.reduce((sum, p) => sum + p.legs, 0);
  const currentLeg = legsPlayed + 1;

  return (
    <>
      <Head>
        <title>Playdarts.app - Darts Score Counter</title>
      </Head>
      <Toaster position="top-center" />
      <div className={styles.container}>
        <Link href="/" className={styles.backButton} title="Back to home">
          ←
        </Link>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? "⏾" : "✹"}
        </button>

        <div className={styles.playersCard}>
          <div className={styles.gameInfo}>
            <span className={styles.gameMode}>Game Mode: {startingScore}</span>
            {!isCricket && (
              <span className={styles.legIndicator}>
                Leg {currentLeg}/{totalLegs}
              </span>
            )}
          </div>
          <ul className={styles.playersList}>
            {players.map((p, i) => {
              const isActive = i === currentPlayerIndex;
              const currentRemaining = isActive && !isCricket
                ? p.score - hits.reduce((sum, h) => sum + h.value * h.multiplier, 0)
                : p.score;

              return (
                <li
                  key={p.name}
                  className={`${styles.playerItem} ${isActive ? styles.activePlayer : ""}`}
                >
                  <span className={styles.playerName}>{p.name}</span>
                  <span className={styles.playerScore}>
                    {isCricket ? p.score : currentRemaining}
                  </span>
                  <span className={styles.playerStats}>
                    {isCricket ? 'pts' : `${p.legs} legs`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <h2 className={styles.turn}>🎯 {currentPlayer.name}&apos;s turn</h2>

        <Dartboard onHit={handleHit} disabled={hits.length >= 3} />

        {isCricket && (
          <div className={styles.cricketMarks}>
            <h3 className={styles.cricketHeading}>Cricket Marks</h3>
            <ul className={styles.marksList}>
              {Object.entries(currentPlayer.marks).map(([num, count]) => (
                <li
                  key={num}
                  className={`${styles.markItem} ${count >= 3 ? styles.markClosed : ""}`}
                >
                  <span>{num === "25" ? "Bull" : num}:</span>
                  <span>{count}</span>
                  {count >= 3 && <span className={styles.checkmark}>✓</span>}
                </li>
              ))}
            </ul>

            <p className={styles.cricketScore}>
              Score: {currentPlayer.score} (Points from hitting closed numbers)
            </p>
          </div>
        )}

        <div className={styles.buttons}>
          <button
            onClick={() => handleHit({ value: 0, multiplier: 1 })}
            disabled={hits.length >= 3}
            className={`${styles.button} ${styles.missButton}`}
          >
            🎯 Miss
          </button>
          <button
            onClick={handleConfirmTurn}
            disabled={hits.length !== 3}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            ✅ OK
          </button>
          <button
            onClick={handleResetTurn}
            disabled={hits.length === 0}
            className={`${styles.button} ${styles.resetButton}`}
          >
            🔄 Reset
          </button>
        </div>
                <p className={styles.hits}>
          This turn:{" "}
          {hits.length
            ? hits
                .map((h) =>
                  h.value === 0 ? "Miss" : `${h.value}×${h.multiplier}`
                )
                .join(", ")
            : "None"}
        </p>
      </div>
    </>
  );
}
