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
          name,
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

  // Redirect to homepage on match end
  const routerPush = router.push;

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
          alert(`${currentPlayer.name} wins the match!`);
          router.push("/"); // Redirect to homepage on match end
        } else {
          alert(`${currentPlayer.name} wins leg ${currentLeg}!`);
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

  if (!players.length) return <div style={styles.loading}>Loading game...</div>;

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
      <div style={styles.container}>
        <h1 style={styles.title}>Game Mode: {startingScore}</h1>
        {!isCricket && (
          <>
            <h3 style={styles.legInfo}>
              Leg {currentLeg} of {totalLegs}
            </h3>
            <h3 style={styles.legInfo}>Legs to Win: {legsToWin}</h3>
          </>
        )}
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

        {!isCricket && (
          <p style={styles.score}>Remaining Score: {remainingScore}</p>
        )}

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
                : `Score: ${p.score}, Legs: ${p.legs}`}
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
  legInfo: {
    fontSize: "1rem",
    color: "#555",
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
