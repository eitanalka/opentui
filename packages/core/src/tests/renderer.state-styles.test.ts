import { test, expect, beforeEach, afterEach, describe } from "bun:test"
import { createTestRenderer, type TestRenderer } from "../testing/test-renderer"
import { BoxRenderable } from "../renderables/Box"
import { TextRenderable } from "../renderables/Text"
import { SelectRenderable } from "../renderables/Select"
import { SliderRenderable } from "../renderables/Slider"
import { ASCIIFontRenderable } from "../renderables/ASCIIFont"
import { parseColor } from "../lib/RGBA"

let renderer: TestRenderer
let renderOnce: () => Promise<void>

beforeEach(async () => {
  ; ({ renderer, renderOnce } = await createTestRenderer({}))
})

afterEach(() => {
  renderer.destroy()
})

describe("State-based styles - Focus", () => {
  test("focus changes backgroundColor when style.focus.backgroundColor is set", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
      style: {
        backgroundColor: "red",
        focus: {
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Initial state: should have base backgroundColor
    expect(box.backgroundColor).toEqual(parseColor("red"))

    // Focus the box
    box.focus()
    await renderOnce()

    // After focus: should have focus backgroundColor
    expect(box.backgroundColor).toEqual(parseColor("blue"))
  })

  test("focus changes borderColor when style.focus.borderColor is set", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
      border: true,
      style: {
        borderColor: "white",
        focus: {
          borderColor: "cyan",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Initial state: should have base borderColor
    expect(box.borderColor).toEqual(parseColor("white"))

    // Focus the box
    box.focus()
    await renderOnce()

    // After focus: should have focus borderColor
    expect(box.borderColor).toEqual(parseColor("cyan"))
  })

  test("blur returns styles to base values", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
      style: {
        backgroundColor: "red",
        borderColor: "white",
        focus: {
          backgroundColor: "blue",
          borderColor: "cyan",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Focus the box
    box.focus()
    await renderOnce()

    // Verify focus styles applied
    expect(box.backgroundColor).toEqual(parseColor("blue"))
    expect(box.borderColor).toEqual(parseColor("cyan"))

    // Blur the box
    box.blur()
    await renderOnce()

    // After blur: should return to base styles
    expect(box.backgroundColor).toEqual(parseColor("red"))
    expect(box.borderColor).toEqual(parseColor("white"))
  })

  test("backward compatibility - existing props work without style prop", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      backgroundColor: "green",
      borderColor: "yellow",
      border: true,
      focusable: true,
    })

    renderer.root.add(box)
    await renderOnce()

    // Should have the colors set via direct props
    expect(box.backgroundColor).toEqual(parseColor("green"))
    expect(box.borderColor).toEqual(parseColor("yellow"))

    // Focus should not change colors (no style prop)
    box.focus()
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("green"))
    expect(box.borderColor).toEqual(parseColor("yellow"))
  })

  test("style prop can be set after construction", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
    })

    renderer.root.add(box)
    await renderOnce()

    // Set style after construction
    box.style = {
      backgroundColor: "purple",
      focus: {
        backgroundColor: "orange",
      },
    }
    await renderOnce()

    // Should have base style applied
    expect(box.backgroundColor).toEqual(parseColor("purple"))

    // Focus should apply focus style
    box.focus()
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("orange"))
  })

  test("style prop merges focus styles with base styles", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
      style: {
        backgroundColor: "red",
        borderColor: "white",
        focus: {
          // Only override backgroundColor, borderColor should stay as base
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    box.focus()
    await renderOnce()

    // backgroundColor should be from focus
    expect(box.backgroundColor).toEqual(parseColor("blue"))
    // borderColor should still be from base (not overridden in focus)
    expect(box.borderColor).toEqual(parseColor("white"))
  })

  test("focus-only backgroundColor resets to default on blur", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
      style: {
        // No backgroundColor in base - only in focus
        focus: {
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Initial state: should have default backgroundColor (transparent)
    expect(box.backgroundColor).toEqual(parseColor("transparent"))

    // Focus the box
    box.focus()
    await renderOnce()

    // After focus: should have focus backgroundColor
    expect(box.backgroundColor).toEqual(parseColor("blue"))

    // Blur the box
    box.blur()
    await renderOnce()

    // After blur: should reset to default (transparent)
    expect(box.backgroundColor).toEqual(parseColor("transparent"))
  })
})

describe("State-based styles - TextRenderable", () => {
  test("focus changes fg color when style.focus.fg is set", async () => {
    const text = new TextRenderable(renderer, {
      id: "test-text",
      content: "Hello",
      focusable: true,
      style: {
        fg: "white",
        focus: {
          fg: "yellow",
        },
      },
    })

    renderer.root.add(text)
    await renderOnce()

    // Initial state: should have base fg
    expect(text.fg).toEqual(parseColor("white"))

    // Focus the text
    text.focus()
    await renderOnce()

    // After focus: should have focus fg
    expect(text.fg).toEqual(parseColor("yellow"))

    // Blur the text
    text.blur()
    await renderOnce()

    // After blur: should return to base fg
    expect(text.fg).toEqual(parseColor("white"))
  })

  test("focus changes bg color when style.focus.bg is set", async () => {
    const text = new TextRenderable(renderer, {
      id: "test-text",
      content: "Hello",
      focusable: true,
      style: {
        bg: "transparent",
        focus: {
          bg: "blue",
        },
      },
    })

    renderer.root.add(text)
    await renderOnce()

    // Initial state: should have base bg
    expect(text.bg).toEqual(parseColor("transparent"))

    // Focus the text
    text.focus()
    await renderOnce()

    // After focus: should have focus bg
    expect(text.bg).toEqual(parseColor("blue"))
  })
})

describe("State-based styles - SelectRenderable", () => {
  test("focus changes backgroundColor when style.focus.backgroundColor is set", async () => {
    const select = new SelectRenderable(renderer, {
      id: "test-select",
      width: 20,
      height: 5,
      options: [
        { name: "Option 1", description: "First option" },
        { name: "Option 2", description: "Second option" },
      ],
      style: {
        backgroundColor: "#000000",
        focus: {
          backgroundColor: "#00008B",
        },
      },
    })

    renderer.root.add(select)
    await renderOnce()

    // Initial state - select is focusable by default, but not focused
    // Note: SelectRenderable has _focusable = true by default
    select.blur()
    await renderOnce()

    // @ts-expect-error - accessing private property for testing
    expect(select._backgroundColor).toEqual(parseColor("#000000"))

    // Focus the select
    select.focus()
    await renderOnce()

    // After focus: should have focus backgroundColor
    // @ts-expect-error - accessing private property for testing
    expect(select._backgroundColor).toEqual(parseColor("#00008B"))
  })

  test("focus changes textColor when style.focus.textColor is set", async () => {
    const select = new SelectRenderable(renderer, {
      id: "test-select",
      width: 20,
      height: 5,
      options: [
        { name: "Option 1", description: "First option" },
      ],
      style: {
        textColor: "white",
        focus: {
          textColor: "cyan",
        },
      },
    })

    renderer.root.add(select)
    await renderOnce()

    select.blur()
    await renderOnce()

    // @ts-expect-error - accessing private property for testing
    expect(select._textColor).toEqual(parseColor("white"))

    select.focus()
    await renderOnce()

    // @ts-expect-error - accessing private property for testing
    expect(select._textColor).toEqual(parseColor("cyan"))
  })
})

describe("State-based styles - SliderRenderable", () => {
  test("focus changes backgroundColor when style.focus.backgroundColor is set", async () => {
    const slider = new SliderRenderable(renderer, {
      id: "test-slider",
      orientation: "horizontal",
      width: 20,
      height: 1,
      focusable: true,
      style: {
        backgroundColor: "#252527",
        focus: {
          backgroundColor: "#404040",
        },
      },
    })

    renderer.root.add(slider)
    await renderOnce()

    // Initial state
    expect(slider.backgroundColor).toEqual(parseColor("#252527"))

    // Focus the slider
    slider.focus()
    await renderOnce()

    // After focus: should have focus backgroundColor
    expect(slider.backgroundColor).toEqual(parseColor("#404040"))

    // Blur the slider
    slider.blur()
    await renderOnce()

    // After blur: should return to base backgroundColor
    expect(slider.backgroundColor).toEqual(parseColor("#252527"))
  })

  test("focus changes foregroundColor when style.focus.foregroundColor is set", async () => {
    const slider = new SliderRenderable(renderer, {
      id: "test-slider",
      orientation: "vertical",
      width: 1,
      height: 10,
      focusable: true,
      style: {
        foregroundColor: "#9a9ea3",
        focus: {
          foregroundColor: "#00ff00",
        },
      },
    })

    renderer.root.add(slider)
    await renderOnce()

    expect(slider.foregroundColor).toEqual(parseColor("#9a9ea3"))

    slider.focus()
    await renderOnce()

    expect(slider.foregroundColor).toEqual(parseColor("#00ff00"))
  })
})

describe("State-based styles - ASCIIFontRenderable", () => {
  test("focus changes color when style.focus.color is set", async () => {
    const asciiFont = new ASCIIFontRenderable(renderer, {
      id: "test-ascii",
      text: "Hello",
      font: "tiny",
      focusable: true,
      style: {
        color: "#FFFFFF",
        focus: {
          color: "#00FF00",
        },
      },
    })

    renderer.root.add(asciiFont)
    await renderOnce()

    // Initial state
    expect(asciiFont.color).toEqual("#FFFFFF")

    // Focus
    asciiFont.focus()
    await renderOnce()

    expect(asciiFont.color).toEqual("#00FF00")

    // Blur
    asciiFont.blur()
    await renderOnce()

    expect(asciiFont.color).toEqual("#FFFFFF")
  })

  test("focus changes backgroundColor when style.focus.backgroundColor is set", async () => {
    const asciiFont = new ASCIIFontRenderable(renderer, {
      id: "test-ascii",
      text: "World",
      font: "tiny",
      focusable: true,
      style: {
        backgroundColor: "transparent",
        focus: {
          backgroundColor: "#333333",
        },
      },
    })

    renderer.root.add(asciiFont)
    await renderOnce()

    expect(asciiFont.backgroundColor).toEqual("transparent")

    asciiFont.focus()
    await renderOnce()

    expect(asciiFont.backgroundColor).toEqual("#333333")
  })
})
