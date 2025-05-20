import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState(null);
  const [players, setPlayers] = useState(["", ""]);
  const maxPlayers = 4;

  const handleAddPlayer = () => {
    if (players.length < maxPlayers) {
      setPlayers([...players, ""]);
    }
  };

  const handlePlayerNameChange = (index, name) => {
    const updated = [...players];
    updated[index] = name;
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
      router.push({ pathname: "/game", query });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>playdarts.app</h1>
        <h2 style={styles.subheading}>A clean, ad-free darts score tracker</h2>
        <p style={styles.description}>
          This is a simple ad-free score tracking app for Darts games. Select
          your game mode (501, 301 and Cricket), add players, and start keeping
          score. Supports up to 4 players in a classic darts match.
        </p>

        <h2 style={styles.subheading}>Select Game Mode</h2>
        <div style={styles.radioGroup}>
          {[301, 501, "Cricket"].map((mode) => (
            <label key={mode} style={styles.radioLabel}>
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

        {gameMode && (
          <>
            <h2 style={styles.subheading}>Add Players (2–{maxPlayers})</h2>
            {players.map((player, idx) => (
              <div key={idx} style={styles.playerRow}>
                <input
                  placeholder={`Player ${idx + 1}`}
                  value={player}
                  onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                />
                {players.length > 2 && (
                  <button
                    onClick={() => {
                      const updated = players.filter((_, i) => i !== idx);
                      setPlayers(updated);
                    }}
                    style={styles.deleteButton}
                    title="Remove player"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            {players.length < maxPlayers && (
              <button style={styles.addButton} onClick={handleAddPlayer}>
                + Add Player
              </button>
            )}
          </>
        )}

        <button
          onClick={handleStartGame}
          style={{
            ...styles.startButton,
            opacity:
              gameMode &&
              players.every((p) => p.trim() !== "") &&
              players.length >= 2
                ? 1
                : 0.5,
            pointerEvents:
              gameMode &&
              players.every((p) => p.trim() !== "") &&
              players.length >= 2
                ? "auto"
                : "none",
          }}
        >
          Start Game
        </button>

        <Link href="/how-to-use" style={styles.helpLink}>
          📘 How to Use
        </Link>
      </div>
    </div>
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
  helpLink: {
    display: "inline-block",
    marginTop: 15,
    color: "#0070f3",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 5,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  heading: {
    fontWeight: "10",
    fontSize: "1.5rem",
    marginBottom: 10,
  },
  description: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: 20,
    textAlign: "left",
  },
  subheading: {
    fontSize: "1.25rem",
    marginTop: 20,
    marginBottom: 10,
  },
  radioGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  radioLabel: {
    fontSize: "1rem",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: 10,
    fontSize: "1rem",
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  addButton: {
    padding: "8px 14px",
    fontSize: "0.9rem",
    border: "1px solid #0070f3",
    backgroundColor: "#fff",
    color: "#0070f3",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 20,
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  deleteButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#e00",
  },
  startButton: {
    width: "100%",
    padding: 12,
    fontSize: "1rem",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
