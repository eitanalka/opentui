import { createSignal } from "solid-js"
import { StyleSheet } from "@opentui/core"
import { render } from "@opentui/solid"

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 2,
    backgroundColor: "#1a1a1a",
  },
  button: {
    backgroundColor: "white",
    borderColor: "gray",
    borderStyle: "single",
    paddingLeft: 2,
    paddingRight: 2,
    hover: {
      backgroundColor: "#e0e0e0",
    },
    focus: {
      borderColor: "cyan",
    },
  },
  primary: {
    backgroundColor: "#0066cc",
    hover: {
      backgroundColor: "#0052a3",
    },
  },
})

function StyleSheetDemo() {
  const [count, setCount] = createSignal(0)

  return (
    <box className={styles.container}>
      <text>Solid StyleSheet Example - Count: {count()}</text>

      <button className={styles.button} onClick={() => setCount(count() + 1)}>
        Default Button
      </button>

      <button className={[styles.button, styles.primary]} onClick={() => setCount(count() + 1)}>
        Primary Button
      </button>
    </box>
  )
}

render(() => <StyleSheetDemo />)
