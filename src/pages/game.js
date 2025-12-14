import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dartboard from "./dartboard";
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

  const STORAGE_KEY = "playdarts_game_state";

  // Validation functions
  const VALID_GAME_MODES = ["301", "501", "Cricket"];
  const MAX_LEGS = 7;
  const MAX_PLAYERS = 8;
  const MAX_NAME_LENGTH = 10;

  const validateGameMode = (mode) => {
    return VALID_GAME_MODES.includes(String(mode)) ? String(mode) : "501";
  };

  const validateLegs = (legs) => {
    const numLegs = Number(legs);
    if (isNaN(numLegs) || numLegs < 1 || numLegs > MAX_LEGS) {
      return 1;
    }
    return Math.floor(numLegs);
  };

  const validatePlayers = (players) => {
    if (!Array.isArray(players)) return null;
    if (players.length < 1 || players.length > MAX_PLAYERS) return null;

    const validPlayers = players.filter(
      (name) => typeof name === "string" && name.trim().length > 0
    );

    if (validPlayers.length === 0) return null;
    return validPlayers.map((name) => String(name).slice(0, MAX_NAME_LENGTH));
  };

  const validateGameState = (state) => {
    if (!state || typeof state !== "object") return null;

    const { players, currentPlayerIndex, hits, startingScore, legsToWin, totalLegs } = state;

    // Validate players array
    if (!Array.isArray(players) || players.length === 0) return null;

    // Validate each player object structure
    const validPlayers = players.every((p) => {
      if (!p || typeof p !== "object") return false;
      if (typeof p.name !== "string" || p.name.length === 0) return false;
      if (typeof p.score !== "number" || p.score < 0) return false;
      if (!Array.isArray(p.hits)) return false;
      if (typeof p.legs !== "number" || p.legs < 0) return false;
      return true;
    });

    if (!validPlayers) return null;

    // Validate numeric values
    if (typeof currentPlayerIndex !== "number" || currentPlayerIndex < 0 || currentPlayerIndex >= players.length) return null;
    if (!Array.isArray(hits)) return null;
    if (typeof legsToWin !== "number" || legsToWin < 1) return null;
    if (typeof totalLegs !== "number" || totalLegs < 1) return null;

    // Validate startingScore is either a number or "Cricket"
    if (startingScore !== "Cricket" && (typeof startingScore !== "number" || startingScore <= 0)) return null;

    return state;
  };

  // Save game state to sessionStorage
  useEffect(() => {
    if (players.length > 0) {
      const gameState = {
        players,
        currentPlayerIndex,
        hits,
        startingScore,
        legsToWin,
        totalLegs,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [players, currentPlayerIndex, hits, startingScore, legsToWin, totalLegs]);

  // Initialize game state from sessionStorage or URL params
  useEffect(() => {
    if (!router.isReady) return;

    // Try to restore from sessionStorage first
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        const validatedState = validateGameState(gameState);

        if (validatedState) {
          setPlayers(validatedState.players);
          setCurrentPlayerIndex(validatedState.currentPlayerIndex);
          setHits(validatedState.hits);
          setStartingScore(validatedState.startingScore);
          setLegsToWin(validatedState.legsToWin);
          setTotalLegs(validatedState.totalLegs);
          return;
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    // If no saved state, initialize from URL params
    const { mode, players: rawPlayers, legs } = router.query;

    if (!mode || !rawPlayers || !legs) {
      router.push("/");
      return;
    }

    try {
      const parsedPlayers = JSON.parse(rawPlayers);
      const validatedPlayers = validatePlayers(parsedPlayers);

      if (!validatedPlayers) {
        router.push("/");
        return;
      }

      const validatedMode = validateGameMode(mode);
      const validatedLegs = validateLegs(legs);
      const cricketMode = validatedMode === "Cricket";

      setTotalLegs(validatedLegs);

      // For cricket mode, legsToWin = totalLegs (usually 1)
      // For 301/501 modes, legsToWin = majority of total legs (best of N)
      if (cricketMode) {
        setLegsToWin(validatedLegs);
        setStartingScore("Cricket");
      } else {
        setStartingScore(Number(validatedMode));
        setLegsToWin(Math.ceil(validatedLegs / 2));
      }

      setPlayers(
        validatedPlayers.map((name) => ({
          name: name,
          score: cricketMode ? 0 : Number(validatedMode),
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
      router.push("/");
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

      // Check for Cricket win: all numbers closed AND highest score
      const currentPlayerUpdated = updatedPlayers[currentPlayerIndex];
      const allNumbersClosed = Object.values(currentPlayerUpdated.marks).every(
        (count) => count >= 3
      );

      if (allNumbersClosed) {
        const maxScore = Math.max(...updatedPlayers.map((p) => p.score));
        const playersWithMaxScore = updatedPlayers.filter(
          (p) => p.score === maxScore
        );

        // Win if this player has the highest score (and it's unique)
        if (
          currentPlayerUpdated.score === maxScore &&
          playersWithMaxScore.length === 1
        ) {
          toast.success(`${currentPlayer.name} wins!`, {
            duration: 4000,
          });
          setTimeout(() => {
            sessionStorage.removeItem(STORAGE_KEY);
            router.push("/");
          }, 4200);
        }
      }
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
        const isDoubleOut = lastHit.multiplier === 2;

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
          setTimeout(() => {
            sessionStorage.removeItem(STORAGE_KEY);
            router.push("/");
          }, 4200);
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

  const handleBackButton = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/");
  };

  const handleNewGame = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/");
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Toaster position="top-center" />
      <div className={styles.container}>
        <button onClick={handleBackButton} className={styles.backButton} title="Back to home">
          ←
        </button>
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
            <button onClick={handleNewGame} className={styles.newGameButton} title="Start a new game">
              New Game
            </button>
          </div>
          <ul className={styles.playersList}>
            {players.map((p, i) => {
              const isActive = i === currentPlayerIndex;
              const currentRemaining = isActive && !isCricket
                ? p.score - hits.reduce((sum, h) => sum + h.value * h.multiplier, 0)
                : p.score;

              return (
                <li
                  key={i}
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
