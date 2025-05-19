import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dartboard from "./dartboard";
import Link from "next/link";

export default function Game() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hits, setHits] = useState([]);
  const [startingScore, setStartingScore] = useState(501);

  useEffect(() => {
    if (!router.isReady) return;

    const { mode, players: rawPlayers } = router.query;

    try {
      const parsedPlayers = JSON.parse(rawPlayers);
      const score = Number(mode) || 501;

      setStartingScore(score);
      setPlayers(
        parsedPlayers.map((name) => ({
          name,
          score,
          hits: [],
        }))
      );
    } catch (e) {
      console.error("Failed to parse query params", e);
    }
  }, [router.isReady, router.query]);

  const handleHit = (hit) => {
    if (hits.length >= 3) return;
    setHits([...hits, hit]);
  };

  const handleConfirmTurn = () => {
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

    const updatedPlayers = players.map((player, idx) => {
      if (idx === currentPlayerIndex) {
        return {
          ...player,
          score: isBust ? scoreBeforeTurn : scoreAfterTurn,
          hits: [...player.hits, hits],
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setHits([]);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const handleResetTurn = () => {
    setHits([]);
  };

  if (!players.length) return <div style={styles.loading}>Loading game...</div>;

  const currentPlayer = players[currentPlayerIndex];
  const remainingScore =
    currentPlayer.score -
    hits.reduce((sum, h) => sum + h.value * h.multiplier, 0);

  return (
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
      <p style={styles.score}>Remaining Score: {remainingScore}</p>

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
            {p.name}: {p.score}
          </li>
        ))}
      </ul>
      <Link href="/" style={styles.helpLink}>
        ← Reset Game and go to Homepage
      </Link>
    </div>
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
