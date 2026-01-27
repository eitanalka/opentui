import { test, expect, beforeEach, afterEach, describe } from "bun:test"
import { createTestRenderer, type TestRenderer } from "../testing/test-renderer"
import { BoxRenderable } from "../renderables/Box"
import { TextRenderable } from "../renderables/Text"
import { SelectRenderable } from "../renderables/Select"
import { SliderRenderable } from "../renderables/Slider"
import { ASCIIFontRenderable } from "../renderables/ASCIIFont"
import { parseColor } from "../lib/RGBA"
import { MouseEvent } from "../renderer"

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
  test("focus changes color when style.focus.color is set", async () => {
    const text = new TextRenderable(renderer, {
      id: "test-text",
      content: "Hello",
      focusable: true,
      style: {
        color: "white",
        focus: {
          color: "yellow",
        },
      },
    })

    renderer.root.add(text)
    await renderOnce()

    // Initial state: should have base color
    expect(text.color).toEqual(parseColor("white"))

    // Focus the text
    text.focus()
    await renderOnce()

    // After focus: should have focus color
    expect(text.color).toEqual(parseColor("yellow"))

    // Blur the text
    text.blur()
    await renderOnce()

    // After blur: should return to base color
    expect(text.color).toEqual(parseColor("white"))
  })

  test("focus changes backgroundColor when style.focus.backgroundColor is set", async () => {
    const text = new TextRenderable(renderer, {
      id: "test-text",
      content: "Hello",
      focusable: true,
      style: {
        backgroundColor: "transparent",
        focus: {
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(text)
    await renderOnce()

    // Initial state: should have base backgroundColor
    expect(text.backgroundColor).toEqual(parseColor("transparent"))

    // Focus the text
    text.focus()
    await renderOnce()

    // After focus: should have focus backgroundColor
    expect(text.backgroundColor).toEqual(parseColor("blue"))
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

  test("focus changes color when style.focus.color is set", async () => {
    const select = new SelectRenderable(renderer, {
      id: "test-select",
      width: 20,
      height: 5,
      options: [
        { name: "Option 1", description: "First option" },
      ],
      style: {
        color: "white",
        focus: {
          color: "cyan",
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

  test("focus changes color when style.focus.color is set", async () => {
    const slider = new SliderRenderable(renderer, {
      id: "test-slider",
      orientation: "vertical",
      width: 1,
      height: 10,
      focusable: true,
      style: {
        color: "#9a9ea3",
        focus: {
          color: "#00ff00",
        },
      },
    })

    renderer.root.add(slider)
    await renderOnce()

    expect(slider.color).toEqual(parseColor("#9a9ea3"))

    slider.focus()
    await renderOnce()

    expect(slider.color).toEqual(parseColor("#00ff00"))
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

describe("State-based styles - Hover", () => {
  test("hover changes backgroundColor when style.hover.backgroundColor is set", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      style: {
        backgroundColor: "red",
        hover: {
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Initial state
    expect(box.backgroundColor).toEqual(parseColor("red"))

    // Simulate mouse over
    const mouseEvent = new MouseEvent(box, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } })
    box.processMouseEvent(mouseEvent)
    await renderOnce()

    // After hover
    expect(box.backgroundColor).toEqual(parseColor("blue"))
  })

  test("mouseout returns styles to base values", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      style: {
        backgroundColor: "red",
        hover: {
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Hover first
    const overEvent = new MouseEvent(box, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } })
    box.processMouseEvent(overEvent)
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("blue"))

    // Mouse out
    const outEvent = new MouseEvent(box, { type: "out", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } })
    box.processMouseEvent(outEvent)
    await renderOnce()

    // Should return to base
    expect(box.backgroundColor).toEqual(parseColor("red"))
  })

  test("focus takes precedence over hover", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      focusable: true,
      style: {
        backgroundColor: "red",
        hover: { backgroundColor: "blue" },
        focus: { backgroundColor: "green" },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Hover first
    box.processMouseEvent(new MouseEvent(box, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()
    expect(box.backgroundColor).toEqual(parseColor("blue"))

    // Then focus - should override hover
    box.focus()
    await renderOnce()
    expect(box.backgroundColor).toEqual(parseColor("green"))

    // Blur - should return to hover (still hovering)
    box.blur()
    await renderOnce()
    expect(box.backgroundColor).toEqual(parseColor("blue"))
  })

  test("hover works on TextRenderable", async () => {
    const text = new TextRenderable(renderer, {
      id: "test-text",
      content: "Hello",
      style: {
        color: "white",
        hover: {
          color: "yellow",
        },
      },
    })

    renderer.root.add(text)
    await renderOnce()

    // Initial state
    expect(text.color).toEqual(parseColor("white"))

    // Hover
    text.processMouseEvent(new MouseEvent(text, { type: "over", x: 0, y: 0, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    expect(text.color).toEqual(parseColor("yellow"))

    // Mouse out
    text.processMouseEvent(new MouseEvent(text, { type: "out", x: 0, y: 0, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    expect(text.color).toEqual(parseColor("white"))
  })

  test("hover works on SelectRenderable", async () => {
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
        hover: {
          backgroundColor: "#333333",
        },
      },
    })

    renderer.root.add(select)
    select.blur()
    await renderOnce()

    // Initial state
    // @ts-expect-error - accessing private property for testing
    expect(select._backgroundColor).toEqual(parseColor("#000000"))

    // Hover
    select.processMouseEvent(new MouseEvent(select, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // @ts-expect-error - accessing private property for testing
    expect(select._backgroundColor).toEqual(parseColor("#333333"))

    // Mouse out
    select.processMouseEvent(new MouseEvent(select, { type: "out", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // @ts-expect-error - accessing private property for testing
    expect(select._backgroundColor).toEqual(parseColor("#000000"))
  })

  test("hover-only backgroundColor resets to default on mouseout", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      style: {
        // No backgroundColor in base - only in hover
        hover: {
          backgroundColor: "blue",
        },
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Initial state: should have default backgroundColor (transparent)
    expect(box.backgroundColor).toEqual(parseColor("transparent"))

    // Hover
    box.processMouseEvent(new MouseEvent(box, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // After hover: should have hover backgroundColor
    expect(box.backgroundColor).toEqual(parseColor("blue"))

    // Mouse out
    box.processMouseEvent(new MouseEvent(box, { type: "out", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // After mouseout: should reset to default (transparent)
    expect(box.backgroundColor).toEqual(parseColor("transparent"))
  })

  test("preventDefault on mouseover prevents hover state change", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      style: {
        backgroundColor: "red",
        hover: {
          backgroundColor: "blue",
        },
      },
      onMouseOver: (event) => {
        event.preventDefault()
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Initial state
    expect(box.backgroundColor).toEqual(parseColor("red"))

    // Try to hover - but preventDefault is called
    box.processMouseEvent(new MouseEvent(box, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // Should still have base backgroundColor because preventDefault was called
    expect(box.backgroundColor).toEqual(parseColor("red"))
  })

  test("preventDefault on mouseout prevents hover state change", async () => {
    const box = new BoxRenderable(renderer, {
      id: "test-box",
      width: 10,
      height: 5,
      style: {
        backgroundColor: "red",
        hover: {
          backgroundColor: "blue",
        },
      },
      onMouseOut: (event) => {
        event.preventDefault()
      },
    })

    renderer.root.add(box)
    await renderOnce()

    // Hover normally (no preventDefault on over)
    box.processMouseEvent(new MouseEvent(box, { type: "over", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // Should have hover backgroundColor
    expect(box.backgroundColor).toEqual(parseColor("blue"))

    // Try to mouseout - but preventDefault is called
    box.processMouseEvent(new MouseEvent(box, { type: "out", x: 5, y: 2, button: 0, modifiers: { shift: false, alt: false, ctrl: false } }))
    await renderOnce()

    // Should still have hover backgroundColor because preventDefault was called
    expect(box.backgroundColor).toEqual(parseColor("blue"))
  })
})
