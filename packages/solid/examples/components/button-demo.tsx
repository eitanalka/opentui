import { useRenderer } from "@opentui/solid"
import { createSignal, onMount } from "solid-js"

const ButtonScene = () => {
  const renderer = useRenderer()
  const [count, setCount] = createSignal(0)

  onMount(() => {
    renderer.setBackgroundColor("#001122")
  })

  return (
    <box flexDirection="column" gap={1} padding={2} border borderColor="#444">
      <text color="#00FF00" bold>
        Button Example
      </text>
      <text>Count: {count()}</text>

      <button
        onClick={() => setCount(count() + 1)}
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

      <text color="#888" dim>
        Press Tab to focus, Enter/Space to click
      </text>
    </box>
  )
}

export default ButtonScene
