import { createCliRenderer } from "@opentui/core"
import { createRoot } from "../src"

function App() {
  return (
    <text>
      Color Showcase{"\n"}
      <span color="red">Red text</span> <span color="green">Green text</span> <span color="blue">Blue text</span>{" "}
      <span color="yellow">Yellow text</span>
      {"\n"}
      <span color="magenta">Magenta</span> <span color="cyan">Cyan</span> <span color="white">White</span>
      {"\n"}
      Background colors:{"\n"}
      <span color="red" backgroundColor="yellow">
        Red on Yellow
      </span>{" "}
      <span color="blue" backgroundColor="green">
        Blue on Green
      </span>{" "}
      <span color="white" backgroundColor="magenta">
        White on Magenta
      </span>
      {"\n"}
      <span color="yellow" backgroundColor="blue">
        Yellow on Blue
      </span>{" "}
      <span color="green" backgroundColor="red">
        Green on Red
      </span>{" "}
      <span color="cyan" backgroundColor="black">
        Cyan on Black
      </span>
      {"\n"}
      Hyperlinks:{"\n"}
      <u>
        <a href="https://opentui.com" color="blue">
          opentui.com
        </a>
      </u>{" "}
      - Click if your terminal supports OSC 8{"\n"}
      Bright colors:{"\n"}
      <span color="brightRed">Bright Red</span> <span color="brightGreen">Bright Green</span>{" "}
      <span color="brightBlue">Bright Blue</span>
      {"\n"}
      <span color="brightYellow">Bright Yellow</span> <span color="brightMagenta">Bright Magenta</span>{" "}
      <span color="brightCyan">Bright Cyan</span>
      {"\n"}
      Text Formatting:{"\n"}
      <strong>Strong/Bold text</strong> - <em>Emphasized/Italic text</em> - <u>Underlined text</u>
      {"\n"}
      <b color="yellow">Bold yellow</b> - <i color="green">Italic green</i> - <u color="magenta">Underlined magenta</u>
      {"\n"}
      Complex nesting:{"\n"}
      <strong color="red">
        Bold red with <em color="blue">italic blue nested</em> inside
      </strong>
      {"\n"}
      <em>
        Italic with <u color="cyan">underlined cyan</u> and <strong color="yellow">bold yellow</strong>
      </em>
      {"\n"}
      <span backgroundColor="black" color="white">
        Background with <strong color="brightRed">bold bright red</strong> and{" "}
        <u color="brightGreen">underlined bright green</u>
      </span>
      {"\n"}
    </text>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
