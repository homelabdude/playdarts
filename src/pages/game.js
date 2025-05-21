import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dartboard from "./dartboard";
import Link from "next/link";
import Head from "next/head";
import { Toaster, toast } from "react-hot-toast";
import styles from "../styles/Game.module.css";

export default function Game() {
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
  const remainingScore = isCricket
    ? null
    : currentPlayer.score -
      hits.reduce((sum, h) => sum + h.value * h.multiplier, 0);

  const legsPlayed = players.reduce((sum, p) => sum + p.legs, 0);
  const currentLeg = legsPlayed + 1;

  return (
    <>
      <Head>
        <title>Playdarts.app - Darts Score Tracker</title>
      </Head>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: '"JetBrains Mono", monospace',
          },
        }}
      />
      <div className={styles.container}>
        <h1 className={styles.title}>Game Mode: {startingScore}</h1>
        {!isCricket && (
          <h3 className={styles.legInfo}>
            Leg {currentLeg} of {totalLegs} - Legs to Win: {legsToWin}
          </h3>
        )}
        <h2 className={styles.turn}>🎯 {currentPlayer.name}&apos;s turn</h2>

        <Dartboard onHit={handleHit} disabled={hits.length >= 3} />

        <button
          onClick={() => handleHit({ value: 0, multiplier: 1 })}
          disabled={hits.length >= 3}
          className={styles.button}
          style={{
            backgroundColor: "#264653",
            opacity: hits.length >= 3 ? 0.5 : 1,
            marginTop: "10px",
          }}
        >
          🎯 Miss
        </button>

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

        {!isCricket && (
          <p className={styles.score}>Remaining : {remainingScore}</p>
        )}

        {isCricket && (
          <div className={{ marginTop: 20, fontSize: "1.1rem" }}>
            <h3>Cricket Marks</h3>
            <ul
              style={{
                listStyle: "none",
                paddingLeft: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {Object.entries(currentPlayer.marks).map(([num, count]) => (
                <li
                  key={num}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: count >= 3 ? "bold" : "normal",
                    color: count >= 3 ? "#0070f3" : "inherit",
                  }}
                >
                  <span>{num === "25" ? "Bull" : num}:</span>
                  <span>{count}</span>
                  {count >= 3 && <span style={{ color: "green" }}>✓</span>}
                </li>
              ))}
            </ul>

            <p>
              Score: {currentPlayer.score} (Points from hitting closed numbers)
            </p>
          </div>
        )}

        <div className={styles.buttons}>
          <button
            onClick={handleConfirmTurn}
            disabled={hits.length !== 3}
            className={styles.button}
            style={{
              backgroundColor: "#28a745",
              opacity: hits.length === 3 ? 1 : 0.5,
            }}
          >
            ✅ OK
          </button>
          <button
            onClick={handleResetTurn}
            disabled={hits.length === 0}
            className={styles.button}
            style={{
              backgroundColor: "#dc3545",
              opacity: hits.length === 0 ? 0.5 : 1,
            }}
          >
            🔄 Reset
          </button>
        </div>

        <h3 style={{ marginTop: 30 }}>🏅 Player Scores</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {players.map((p, i) => (
            <li
              key={p.name}
              style={{
                fontWeight: i === currentPlayerIndex ? "bold" : "normal",
              }}
            >
              {p.name}:{" "}
              {isCricket
                ? `Score: ${p.score}, Marks: ${Object.entries(p.marks)
                    .map(([n, m]) => `${n === "25" ? "Bull" : n}:${m}`)
                    .join(" ")}`
                : `Score: ${p.score}, Legs: ${p.legs}`}
            </li>
          ))}
        </ul>

        <Link href="/" className={styles.link}>
          ← Reset Game and go to Homepage
        </Link>
      </div>
    </>
  );
}
