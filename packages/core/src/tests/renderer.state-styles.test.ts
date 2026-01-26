import { test, expect, beforeEach, afterEach, describe } from "bun:test"
import { createTestRenderer, type TestRenderer } from "../testing/test-renderer"
import { BoxRenderable } from "../renderables/Box"
import { parseColor } from "../lib/RGBA"

let renderer: TestRenderer
let renderOnce: () => Promise<void>

beforeEach(async () => {
  ;({ renderer, renderOnce } = await createTestRenderer({}))
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
