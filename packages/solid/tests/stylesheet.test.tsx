import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import { testRender } from "../index"
import { StyleSheet, BoxRenderable, ButtonRenderable, parseColor } from "@opentui/core"
import { createSignal } from "solid-js"

let testSetup: Awaited<ReturnType<typeof testRender>>

describe("SolidJS StyleSheet", () => {
  beforeEach(async () => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  afterEach(() => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  it("renders box with className", async () => {
    const styles = StyleSheet.create({
      box: {
        backgroundColor: "#ff0000",
        borderColor: "#0000ff",
      },
    })

    testSetup = await testRender(
      () => (
        <box className={styles.box} width={10} height={3}>
          <text>Test</text>
        </box>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()

    const box = testSetup.renderer.root.getChildren()[0] as BoxRenderable
    expect(box.backgroundColor).toBeDefined()
  })

  it("merges multiple className styles", async () => {
    const styles = StyleSheet.create({
      base: {
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
      },
      primary: {
        backgroundColor: "#0066cc", // Overrides base
      },
    })

    testSetup = await testRender(
      () => (
        <box className={[styles.base, styles.primary]} width={10} height={3}>
          <text>Primary</text>
        </box>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()

    const box = testSetup.renderer.root.getChildren()[0] as BoxRenderable
    expect(box.backgroundColor).toBeDefined()
  })

  it("updates when className changes reactively", async () => {
    const styles = StyleSheet.create({
      default: {
        backgroundColor: "#ffffff",
      },
      active: {
        backgroundColor: "#0066cc",
      },
    })

    const TestComponent = () => {
      const [isActive, setIsActive] = createSignal(false)

      return (
        <box width={20} height={5}>
          <button className={isActive() ? styles.active : styles.default} onClick={() => setIsActive(!isActive())}>
            Toggle
          </button>
        </box>
      )
    }

    testSetup = await testRender(TestComponent, { width: 30, height: 10 })

    await testSetup.renderOnce()

    // Click to toggle className
    await testSetup.mockMouse.click(0, 0)
    await testSetup.renderOnce()

    // Verify style changed
    const button = testSetup.renderer.root.getChildren()[0]!.getChildren()[0] as ButtonRenderable
    expect(button.backgroundColor).toBeDefined()
  })

  it("inline style overrides className", async () => {
    const styles = StyleSheet.create({
      box: {
        backgroundColor: "#ff0000",
      },
    })

    testSetup = await testRender(
      () => (
        <box
          className={styles.box}
          style={{ backgroundColor: "#0000ff" }} // Inline wins
          width={10}
          height={3}
        >
          <text>Override</text>
        </box>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()

    const box = testSetup.renderer.root.getChildren()[0] as BoxRenderable
    // Inline style should override className
    expect(box.backgroundColor).toBeDefined()
  })

  it("state styles work with className (hover)", async () => {
    const styles = StyleSheet.create({
      button: {
        backgroundColor: "#ffffff",
        hover: {
          backgroundColor: "#0066cc",
        },
      },
    })

    testSetup = await testRender(
      () => (
        <button className={styles.button} width={10} height={3}>
          Hover me
        </button>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()

    const button = testSetup.renderer.root.getChildren()[0] as ButtonRenderable

    // Initial state
    expect(button.backgroundColor).toEqual(parseColor("#ffffff"))

    // Simulate hover via mockMouse
    await testSetup.mockMouse.moveTo(1, 1)
    await testSetup.renderOnce()

    // Should have different background when hovered
    expect(button.backgroundColor).toEqual(parseColor("#0066cc"))
  })
})

describe("SolidJS StyleSheet - all states with multiple components", () => {
  afterEach(() => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  it("multiple components with merged classNames and all state transitions", async () => {
    const styles = StyleSheet.create({
      base: {
        backgroundColor: "white",
        borderColor: "gray",
      },
      primary: {
        backgroundColor: "blue",
        hover: { backgroundColor: "#00008b" },
        focus: { backgroundColor: "#000080" },
        active: { backgroundColor: "cyan" },
        disabled: { backgroundColor: "gray" },
      },
      danger: {
        backgroundColor: "red",
        hover: { backgroundColor: "#8b0000" },
        focus: { borderColor: "yellow" },
        active: { backgroundColor: "orange" },
        disabled: { backgroundColor: "gray", borderColor: "#a9a9a9" },
      },
    })

    testSetup = await testRender(
      () => (
        <box width={40} height={20}>
          <button
            id="primary-btn"
            className={[styles.base, styles.primary]}
            width={10}
            height={3}
            position="absolute"
            left={0}
            top={0}
            focusable
          >
            Primary
          </button>
          <button
            id="danger-btn"
            className={[styles.base, styles.danger]}
            width={10}
            height={3}
            position="absolute"
            left={15}
            top={0}
            focusable
          >
            Danger
          </button>
        </box>
      ),
      { width: 40, height: 20 },
    )

    await testSetup.renderOnce()

    const root = testSetup.renderer.root.getChildren()[0]!
    const primaryBtn = root.getChildren()[0] as ButtonRenderable
    const dangerBtn = root.getChildren()[1] as ButtonRenderable

    // Base state: primary overrides base backgroundColor
    expect(primaryBtn.backgroundColor).toEqual(parseColor("blue"))
    expect(primaryBtn.borderColor).toEqual(parseColor("gray"))

    // Base state: danger overrides base backgroundColor
    expect(dangerBtn.backgroundColor).toEqual(parseColor("red"))
    expect(dangerBtn.borderColor).toEqual(parseColor("gray"))

    // Hover primary button
    await testSetup.mockMouse.moveTo(5, 1)
    await testSetup.renderOnce()
    expect(primaryBtn.backgroundColor).toEqual(parseColor("#00008b"))
    // Danger should remain base
    expect(dangerBtn.backgroundColor).toEqual(parseColor("red"))

    // Focus primary button
    primaryBtn.focus()
    await testSetup.renderOnce()
    // Focus takes precedence over hover
    expect(primaryBtn.backgroundColor).toEqual(parseColor("#000080"))

    // Active primary button (mousedown)
    await testSetup.mockMouse.pressDown(5, 1)
    await testSetup.renderOnce()
    // Active takes precedence over focus and hover
    expect(primaryBtn.backgroundColor).toEqual(parseColor("cyan"))

    // Release mouse - should return to focus state
    await testSetup.mockMouse.release(5, 1)
    await testSetup.renderOnce()
    expect(primaryBtn.backgroundColor).toEqual(parseColor("#000080"))

    // Move to danger button - primary loses hover, danger gains hover
    await testSetup.mockMouse.moveTo(20, 1)
    await testSetup.renderOnce()
    expect(dangerBtn.backgroundColor).toEqual(parseColor("#8b0000"))
    // Danger hover also merges focus borderColor from className
    expect(dangerBtn.borderColor).toEqual(parseColor("gray"))

    // Focus danger button
    dangerBtn.focus()
    await testSetup.renderOnce()
    // Danger focus sets borderColor to yellow
    expect(dangerBtn.borderColor).toEqual(parseColor("yellow"))
    // backgroundColor still from hover (focus doesn't set backgroundColor for danger)
    expect(dangerBtn.backgroundColor).toEqual(parseColor("#8b0000"))

    // Active danger button
    await testSetup.mockMouse.pressDown(20, 1)
    await testSetup.renderOnce()
    expect(dangerBtn.backgroundColor).toEqual(parseColor("orange"))

    // Release
    await testSetup.mockMouse.release(20, 1)
    await testSetup.renderOnce()
    expect(dangerBtn.backgroundColor).toEqual(parseColor("#8b0000"))
  })

  it("disabled overrides all other states for multiple components", async () => {
    const styles = StyleSheet.create({
      base: {
        backgroundColor: "white",
      },
      interactive: {
        hover: { backgroundColor: "#add8e6" },
        focus: { backgroundColor: "blue" },
        active: { backgroundColor: "#00008b" },
        disabled: { backgroundColor: "gray" },
      },
    })

    const TestComponent = () => {
      const [disabledBtn, setDisabledBtn] = createSignal<"none" | "first" | "second">("none")

      return (
        <box width={40} height={20}>
          <button
            id="btn1"
            className={[styles.base, styles.interactive]}
            width={10}
            height={3}
            position="absolute"
            left={0}
            top={0}
            focusable
            disabled={disabledBtn() === "first"}
          >
            Button 1
          </button>
          <button
            id="btn2"
            className={[styles.base, styles.interactive]}
            width={10}
            height={3}
            position="absolute"
            left={15}
            top={0}
            focusable
            disabled={disabledBtn() === "second"}
          >
            Button 2
          </button>
          <button
            id="disable-toggle"
            width={10}
            height={3}
            position="absolute"
            left={0}
            top={5}
            onClick={() => setDisabledBtn((prev) => (prev === "none" ? "first" : prev === "first" ? "second" : "none"))}
          >
            Toggle
          </button>
        </box>
      )
    }

    testSetup = await testRender(TestComponent, { width: 40, height: 20 })
    await testSetup.renderOnce()

    const root = testSetup.renderer.root.getChildren()[0]!
    const btn1 = root.getChildren()[0] as ButtonRenderable
    const btn2 = root.getChildren()[1] as ButtonRenderable

    // Both start enabled with base styles
    expect(btn1.backgroundColor).toEqual(parseColor("white"))
    expect(btn2.backgroundColor).toEqual(parseColor("white"))

    // Hover btn1 and focus it
    await testSetup.mockMouse.moveTo(5, 1)
    btn1.focus()
    await testSetup.renderOnce()
    expect(btn1.backgroundColor).toEqual(parseColor("blue"))

    // Click toggle to disable btn1
    await testSetup.mockMouse.click(5, 6)
    await testSetup.renderOnce()

    // btn1 should show disabled style, overriding focus
    expect(btn1.backgroundColor).toEqual(parseColor("gray"))

    // btn2 should still be interactive
    await testSetup.mockMouse.moveTo(20, 1)
    await testSetup.renderOnce()
    expect(btn2.backgroundColor).toEqual(parseColor("#add8e6"))

    // Click toggle again to disable btn2 instead
    await testSetup.mockMouse.click(5, 6)
    await testSetup.renderOnce()

    // btn1 re-enabled, btn2 now disabled
    expect(btn2.backgroundColor).toEqual(parseColor("gray"))
  })

  it("conditional className with falsy values", async () => {
    const styles = StyleSheet.create({
      base: {
        backgroundColor: "white",
      },
      highlight: {
        backgroundColor: "yellow",
      },
      bordered: {
        borderColor: "blue",
      },
    })

    const TestComponent = () => {
      const [highlighted, setHighlighted] = createSignal(false)
      const [bordered, setBordered] = createSignal(true)

      return (
        <box width={30} height={10}>
          <box
            id="target"
            className={[styles.base, highlighted() && styles.highlight, bordered() && styles.bordered]}
            width={10}
            height={3}
            position="absolute"
            left={0}
            top={0}
          >
            <text>Target</text>
          </box>
          <button
            id="toggle-highlight"
            width={10}
            height={3}
            position="absolute"
            left={0}
            top={5}
            onClick={() => {
              setHighlighted(!highlighted())
              setBordered(!bordered())
            }}
          >
            Toggle
          </button>
        </box>
      )
    }

    testSetup = await testRender(TestComponent, { width: 30, height: 10 })
    await testSetup.renderOnce()

    const root = testSetup.renderer.root.getChildren()[0]!
    const target = root.getChildren()[0] as BoxRenderable

    // Initial: base + bordered (highlight is false)
    expect(target.backgroundColor).toEqual(parseColor("white"))
    expect(target.borderColor).toEqual(parseColor("blue"))

    // Click toggle: highlight on, bordered off
    await testSetup.mockMouse.click(5, 6)
    await testSetup.renderOnce()

    expect(target.backgroundColor).toEqual(parseColor("yellow"))
  })

  it("inline style overrides className state styles", async () => {
    const styles = StyleSheet.create({
      btn: {
        backgroundColor: "white",
        hover: { backgroundColor: "#add8e6" },
        focus: { backgroundColor: "blue" },
      },
    })

    testSetup = await testRender(
      () => (
        <button
          className={styles.btn}
          style={{ backgroundColor: "purple" }}
          width={10}
          height={3}
          position="absolute"
          left={0}
          top={0}
          focusable
        >
          Styled
        </button>
      ),
      { width: 20, height: 10 },
    )

    await testSetup.renderOnce()

    const btn = testSetup.renderer.root.getChildren()[0] as ButtonRenderable

    // Inline style overrides className base
    expect(btn.backgroundColor).toEqual(parseColor("purple"))

    // Hover - className hover should NOT override inline style
    // because inline style sets backgroundColor directly on the base
    await testSetup.mockMouse.moveTo(5, 1)
    await testSetup.renderOnce()

    // hover overrides base (including inline), since state styles layer on top
    expect(btn.backgroundColor).toEqual(parseColor("#add8e6"))

    // Focus takes precedence over hover
    btn.focus()
    await testSetup.renderOnce()
    expect(btn.backgroundColor).toEqual(parseColor("blue"))

    // Blur and move away - should return to inline override
    btn.blur()
    await testSetup.mockMouse.moveTo(15, 5)
    await testSetup.renderOnce()
    expect(btn.backgroundColor).toEqual(parseColor("purple"))
  })
})
