import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import { testRender } from "../index"
import { createSpy } from "@opentui/core/testing"
import { createSignal } from "solid-js"

let testSetup: Awaited<ReturnType<typeof testRender>>

describe("SolidJS onClick", () => {
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

  it("fires onClick when clicking on a box", async () => {
    const clickSpy = createSpy()

    testSetup = await testRender(
      () => (
        <box width={10} height={3} onClick={() => clickSpy()}>
          <text>Click me</text>
        </box>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()
    await testSetup.mockMouse.click(0, 0)

    expect(clickSpy.callCount()).toBe(1)
  })

  it("updates state when onClick is triggered on a box", async () => {
    const clickSpy = createSpy()

    const TestComponent = () => {
      const [count, setCount] = createSignal(0)

      return (
        <box
          width={20}
          height={5}
          onClick={() => {
            const newCount = count() + 1
            setCount(newCount)
            clickSpy(newCount)
          }}
        >
          <text>Click me</text>
        </box>
      )
    }

    testSetup = await testRender(TestComponent, { width: 30, height: 10 })

    await testSetup.renderOnce()
    expect(clickSpy.callCount()).toBe(0)

    await testSetup.mockMouse.click(0, 0)
    await testSetup.renderOnce()
    expect(clickSpy.callCount()).toBe(1)
    expect(clickSpy.calls[0]![0]).toBe(1)

    await testSetup.mockMouse.click(0, 0)
    await testSetup.renderOnce()
    expect(clickSpy.callCount()).toBe(2)
    expect(clickSpy.calls[1]![0]).toBe(2)
  })

  it("fires onClick when clicking on a text element", async () => {
    const clickSpy = createSpy()

    testSetup = await testRender(
      () => (
        <text width={10} height={1} onClick={() => clickSpy()}>
          Click me
        </text>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()
    await testSetup.mockMouse.click(0, 0)

    expect(clickSpy.callCount()).toBe(1)
  })

  it("fires onClick when clicking on a button", async () => {
    const clickSpy = createSpy()

    testSetup = await testRender(
      () => (
        <button width={10} height={3} onClick={() => clickSpy()}>
          Click me
        </button>
      ),
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()
    await testSetup.mockMouse.click(0, 0)

    expect(clickSpy.callCount()).toBe(1)
  })

  it("updates state when onClick is triggered on a button", async () => {
    const clickSpy = createSpy()

    const TestComponent = () => {
      const [count, setCount] = createSignal(0)

      return (
        <box width={30} height={10} flexDirection="column">
          <text>Clicks: {count()}</text>
          <button
            onClick={() => {
              const newCount = count() + 1
              setCount(newCount)
              clickSpy(newCount)
            }}
          >
            Increment
          </button>
        </box>
      )
    }

    testSetup = await testRender(TestComponent, { width: 30, height: 10 })

    await testSetup.renderOnce()
    expect(clickSpy.callCount()).toBe(0)

    // Find and click the button
    await testSetup.mockMouse.click(0, 1)
    await testSetup.renderOnce()
    expect(clickSpy.callCount()).toBe(1)
    expect(clickSpy.calls[0]![0]).toBe(1)

    await testSetup.mockMouse.click(0, 1)
    await testSetup.renderOnce()
    expect(clickSpy.callCount()).toBe(2)
    expect(clickSpy.calls[1]![0]).toBe(2)
  })
})
