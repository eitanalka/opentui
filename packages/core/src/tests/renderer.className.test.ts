import { describe, expect, it, afterEach, beforeEach } from "bun:test"
import { createTestRenderer, type TestRenderer } from "../testing/test-renderer"
import { BoxRenderable } from "../renderables/Box"
import { StyleSheet } from "../StyleSheet"
import { parseColor } from "../lib/RGBA"
import { MouseEvent } from "../renderer"

let testRenderer: TestRenderer
let renderOnce: () => Promise<void>

beforeEach(async () => {
  ;({ renderer: testRenderer, renderOnce } = await createTestRenderer({
    width: 20,
    height: 10,
  }))
})

afterEach(() => {
  testRenderer?.destroy()
})

describe("Renderable className integration", () => {
  it("applies className styles to Box", async () => {
    const styles = StyleSheet.create({
      box: {
        backgroundColor: parseColor("red"),
        borderColor: parseColor("blue"),
      },
    })

    const box = new BoxRenderable(testRenderer, {
      id: "test",
      width: 10,
      height: 5,
      className: styles.box,
    })

    testRenderer.root.add(box)
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("red"))
    expect(box.borderColor).toEqual(parseColor("blue"))
  })

  it("inline style overrides className", async () => {
    const styles = StyleSheet.create({
      box: { backgroundColor: parseColor("red") },
    })

    const box = new BoxRenderable(testRenderer, {
      id: "test",
      width: 10,
      height: 5,
      className: styles.box,
      style: { backgroundColor: parseColor("blue") },
    })

    testRenderer.root.add(box)
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("blue"))
  })

  it("className with state styles (hover)", async () => {
    const styles = StyleSheet.create({
      box: {
        backgroundColor: "white",
        hover: { backgroundColor: "blue" },
      },
    })

    const box = new BoxRenderable(testRenderer, {
      id: "test",
      width: 10,
      height: 5,
      className: styles.box,
    })

    testRenderer.root.add(box)
    await renderOnce()

    // Base state
    expect(box.backgroundColor).toEqual(parseColor("white"))

    // Hover state
    box.processMouseEvent(
      new MouseEvent(box, {
        type: "over",
        x: 5,
        y: 2,
        button: 0,
        modifiers: { shift: false, alt: false, ctrl: false },
      }),
    )
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("blue"))
  })

  it("merges multiple className styles", async () => {
    const styles = StyleSheet.create({
      base: {
        backgroundColor: parseColor("white"),
        borderColor: parseColor("gray"),
      },
      primary: {
        backgroundColor: parseColor("blue"), // Overrides base
      },
    })

    const box = new BoxRenderable(testRenderer, {
      id: "test",
      width: 10,
      height: 5,
      className: [styles.base, styles.primary],
    })

    testRenderer.root.add(box)
    await renderOnce()

    expect(box.backgroundColor).toEqual(parseColor("blue"))
    expect(box.borderColor).toEqual(parseColor("gray"))
  })
})
