import React from "react"
import { createCliRenderer, StyleSheet } from "@opentui/core"
import { createRoot } from "@opentui/react"

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 2,
    backgroundColor: "#1a1a1a"
  },
  button: {
    backgroundColor: "white",
    borderColor: "gray",
    borderStyle: "single",
    paddingLeft: 2,
    paddingRight: 2,
    hover: {
      backgroundColor: "#e0e0e0"
    },
    focus: {
      borderColor: "cyan"
    },
    active: {
      backgroundColor: "#c0c0c0"
    }
  },
  primary: {
    backgroundColor: "#0066cc",
    hover: {
      backgroundColor: "#0052a3"
    }
  },
  danger: {
    backgroundColor: "#cc0000",
    hover: {
      backgroundColor: "#a30000"
    }
  }
})

function App() {
  const [count, setCount] = React.useState(0)

  return (
    <box className={styles.container}>
      <text>StyleSheet Example - Count: {count}</text>

      <button
        className={styles.button}
        onClick={() => setCount(count + 1)}
      >
        Default Button
      </button>

      <button
        className={[styles.button, styles.primary]}
        onClick={() => setCount(count + 1)}
      >
        Primary Button
      </button>

      <button
        className={[styles.button, styles.danger]}
        onClick={() => setCount(count - 1)}
      >
        Danger Button
      </button>

      {/* Inline style overrides className */}
      <button
        className={styles.button}
        style={{ backgroundColor: "purple" }}
        onClick={() => setCount(0)}
      >
        Custom Color (inline override)
      </button>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
