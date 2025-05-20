import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dartboard from "./dartboard";
import Link from "next/link";
import Head from "next/head";

export default function Game() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hits, setHits] = useState([]);
  const [startingScore, setStartingScore] = useState(501);
  const isCricket = startingScore === "Cricket";

  useEffect(() => {
    if (!router.isReady) return;

    const { mode, players: rawPlayers } = router.query;

    try {
      const parsedPlayers = JSON.parse(rawPlayers);
      const cricketMode = mode === "Cricket";

      setStartingScore(cricketMode ? "Cricket" : Number(mode) || 501);

      setPlayers(
        parsedPlayers.map((name) => ({
          name,
          score: cricketMode ? 0 : Number(mode) || 501,
          hits: [],
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

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleHit = (hit) => {
    if (hits.length >= 3) return;
    setHits([...hits, hit]);
  };

  const handleConfirmTurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    let updatedPlayers = [...players];

    if (isCricket) {
      const marks = { ...currentPlayer.marks };
      let scoreGain = 0;

      hits.forEach(({ value, multiplier }) => {
        if ((value >= 15 && value <= 20) || value === 25) {
          const currentMarks = marks[value] ?? 0;
          const newMarks = Math.min(3, currentMarks + multiplier);
          const excess = Math.max(0, currentMarks + multiplier - 3);

          marks[value] = newMarks;

          // Check if other players have closed this number
          const othersClosed = players.every(
            (p, i) => i === currentPlayerIndex || (p.marks?.[value] ?? 0) >= 3
          );

          if (!othersClosed) {
            scoreGain += value * excess;
          }
        }
      });

      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        hits: [...currentPlayer.hits, hits],
        score: currentPlayer.score + scoreGain,
        marks,
      };
    } else {
      const scoreBeforeTurn = currentPlayer.score;
      const scoreThisTurn = hits.reduce(
        (sum, hit) => sum + hit.value * hit.multiplier,
        0
      );
      const scoreAfterTurn = scoreBeforeTurn - scoreThisTurn;
      const lastHit = hits[hits.length - 1];

      let isBust = false;

      if (scoreAfterTurn < 0 || scoreAfterTurn === 1) {
        isBust = true;
      } else if (scoreAfterTurn === 0) {
        const isDoubleOut =
          (lastHit.value === 25 && lastHit.multiplier === 2) || // Inner bullseye
          lastHit.multiplier === 2;

        if (!isDoubleOut) {
          isBust = true;
        }
      }

      updatedPlayers = players.map((player, idx) => {
        if (idx === currentPlayerIndex) {
          return {
            ...player,
            score: isBust ? scoreBeforeTurn : scoreAfterTurn,
            hits: [...player.hits, hits],
          };
        }
        return player;
      });
    }

    setPlayers(updatedPlayers);
    setHits([]);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const handleResetTurn = () => {
    setHits([]);
  };

  if (!players.length) return <div style={styles.loading}>Loading game...</div>;

  const currentPlayer = players[currentPlayerIndex];
  const remainingScore = isCricket
    ? null
    : currentPlayer.score -
      hits.reduce((sum, h) => sum + h.value * h.multiplier, 0);

  return (
    <>
      <Head>
        <title>Playdarts.app - Darts Score Tracker</title>
      </Head>
      <div style={styles.container}>
        <h1 style={styles.title}>Game Mode: {startingScore}</h1>
        <h2 style={styles.turn}>🎯 {currentPlayer.name}&apos;s turn</h2>

        <Dartboard onHit={handleHit} disabled={hits.length >= 3} />

        <button
          onClick={() => handleHit({ value: 0, multiplier: 1 })}
          disabled={hits.length >= 3}
          style={{
            ...styles.button,
            backgroundColor: "#264653",
            opacity: hits.length >= 3 ? 0.5 : 1,
            marginTop: 10,
          }}
        >
          🎯 Miss
        </button>

        <p style={styles.hits}>
          This turn:{" "}
          {hits.length
            ? hits
                .map((h) =>
                  h.value === 0 ? "Miss" : `${h.value}×${h.multiplier}`
                )
                .join(", ")
            : "None"}
        </p>

        {/* Show remaining score only if not cricket */}
        {!isCricket && (
          <p style={styles.score}>Remaining Score: {remainingScore}</p>
        )}

        {/* Show Cricket marks if cricket */}
        {isCricket && (
          <div style={{ marginTop: 20, fontSize: "1.1rem" }}>
            <h3>Cricket Marks:</h3>
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {Object.entries(currentPlayer.marks).map(([num, count]) => (
                <li key={num}>
                  {num === "25" ? "Bull" : num}: {count} {count >= 3 ? "✓" : ""}
                </li>
              ))}
            </ul>
            <p>
              Score: {currentPlayer.score} (Points from hitting closed numbers)
            </p>
          </div>
        )}

        <div style={styles.buttons}>
          <button
            onClick={handleConfirmTurn}
            disabled={hits.length !== 3}
            style={{
              ...styles.button,
              backgroundColor: "#2a9d8f",
              opacity: hits.length === 3 ? 1 : 0.5,
            }}
          >
            ✅ OK
          </button>
          <button
            onClick={handleResetTurn}
            disabled={hits.length === 0}
            style={{
              ...styles.button,
              backgroundColor: "#e76f51",
              opacity: hits.length === 0 ? 0.5 : 1,
            }}
          >
            🔄 Reset Turn
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
                : `Score: ${p.score}`}
            </li>
          ))}
        </ul>
        <Link href="/" style={styles.link}>
          ← Reset Game and go to Homepage
        </Link>
      </div>
    </>
  );
}

const styles = {
  container: {
    fontFamily: '"JetBrains Mono", monospace',
    padding: 20,
    textAlign: "center",
  },
  loading: {
    padding: 50,
    fontSize: 18,
  },
  title: {
    fontWeight: 10,
    textDecoration: "underline",
    fontSize: "1.4rem",
    marginBottom: 10,
  },
  turn: {
    fontSize: "1.2rem",
    margin: "10px 0 20px",
  },
  hits: {
    marginTop: 20,
    fontSize: "1.1rem",
  },
  score: {
    fontSize: "1.1rem",

    marginTop: 8,
    fontWeight: "bold",
  },
  buttons: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 20,
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  link: {
    display: "inline-block",
    marginTop: 20,
    color: "#0070f3",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
