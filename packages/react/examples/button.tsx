import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState } from "react"

export const App = () => {
  const [count, setCount] = useState(0)

  return (
    <box flexDirection="column" gap={1} padding={2} border borderColor="#444">
      <text content="Button Example" color="#00FF00" bold />
      <text content={`Count: ${count}`} />

      <button
        onClick={() => setCount(count + 1)}
        color="#fff"
        bold
        style={{
          backgroundColor: "#444",
          borderColor: "#666",
          border: true,
          hover: { backgroundColor: "#666" },
          focus: { borderColor: "#0088FF" },
          active: { backgroundColor: "#222" },
        }}
      >
        Click me!
      </button>

      <button
        onClick={() => setCount(0)}
        color="#fff"
        style={{
          backgroundColor: "#884444",
          borderColor: "#aa6666",
          border: true,
          hover: { backgroundColor: "#aa6666" },
          focus: { borderColor: "#ff8888" },
        }}
      >
        Reset
      </button>

      <text content="Press Tab to focus, Enter/Space to click" color="#888" dim />
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
