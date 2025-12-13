import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home({ theme, toggleTheme }) {
  const router = useRouter();
  const [gameMode, setGameMode] = useState(null);
  const [players, setPlayers] = useState(["", ""]);
  const [legs, setLegs] = useState(1);
  const maxPlayers = 4;
  const maxLegs = 7;

  const handleAddPlayer = () => {
    if (players.length < maxPlayers) {
      setPlayers([...players, ""]);
    }
  };

  const handlePlayerNameChange = (index, name) => {
    const updated = [...players];
    updated[index] = name.slice(0, 10);
    setPlayers(updated);
  };

  const handleStartGame = () => {
    if (
      gameMode &&
      players.every((p) => p.trim() !== "") &&
      players.length >= 2
    ) {
      const query = {
        mode: gameMode,
        players: JSON.stringify(players),
      };

      if (typeof gameMode === "number") {
        query.legs = legs.toString();
      }

      router.push({ pathname: "/game", query });
    }
  };

  const startButtonEnabled =
    gameMode && players.every((p) => p.trim() !== "") && players.length >= 2;

  return (
    <>
      <Head>
        <title>Playdarts.app - Darts Score Counter</title>
      </Head>
      <div className={styles.container}>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? "⏾" : "✹"}
        </button>
        <div className={styles.card}>
          <h1 className={styles.heading}>playdarts.app</h1>
          <h2 className={styles.subheading}>
            A clean, ad-free darts score counter
          </h2>
          <p className={styles.description}>
            This is a simple ad-free score tracking app for Darts games. Select
            your game mode (501, 301 and Cricket), add players, and start
            keeping score. Supports up to 4 players.
          </p>

          <h2 className={styles.subheading}>Select Game Mode</h2>
          <div className={styles.radioGroup}>
            {[301, 501, "Cricket"].map((mode) => (
              <label key={mode} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setGameMode(isNaN(Number(value)) ? value : Number(value));
                  }}
                  checked={gameMode === mode}
                />{" "}
                {mode}
              </label>
            ))}
          </div>

          {typeof gameMode === "number" && (
            <>
              <h2 className={styles.subheading}>
                Number of Legs (1–{maxLegs})
              </h2>
              <div className={styles.legsControl}>
                <button
                  className={styles.legsButton}
                  onClick={() => setLegs((l) => Math.max(1, l - 2))}
                >
                  −
                </button>
                <span className={styles.legsDisplay}>{legs}</span>
                <button
                  className={styles.legsButton}
                  onClick={() => setLegs((l) => Math.min(maxLegs, l + 2))}
                >
                  +
                </button>
              </div>
            </>
          )}

          {gameMode && (
            <>
              <h2 className={styles.subheading}>
                Add Players (2–{maxPlayers})
              </h2>
              {players.map((player, idx) => (
                <div key={idx} className={styles.playerRow}>
                  <input
                    maxLength={10}
                    placeholder={`Player ${idx + 1}`}
                    value={player}
                    onChange={(e) =>
                      handlePlayerNameChange(idx, e.target.value)
                    }
                    className={styles.input}
                  />
                  {players.length > 2 && (
                    <button
                      onClick={() => {
                        const updated = players.filter((_, i) => i !== idx);
                        setPlayers(updated);
                      }}
                      className={styles.deleteButton}
                      title="Remove player"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              {players.length < maxPlayers && (
                <button className={styles.addButton} onClick={handleAddPlayer}>
                  + Add Player
                </button>
              )}
            </>
          )}

          <button
            onClick={handleStartGame}
            className={styles.startButton}
            disabled={!startButtonEnabled}
          >
            Start Game
          </button>

          <Link href="/how-to-use" className={styles.helpLink}>
            📘 How to use
          </Link>
        </div>
      </div>
    </>
  );
}
