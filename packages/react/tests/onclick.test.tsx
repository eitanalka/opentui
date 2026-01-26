import { describe, expect, it, beforeEach, afterEach } from "bun:test"
import { testRender } from "../src/test-utils"
import { createSpy } from "@opentui/core/testing"

let testSetup: Awaited<ReturnType<typeof testRender>>

describe("React onClick", () => {
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
      <box width={10} height={3} onClick={() => clickSpy()}>
        <text>Click me</text>
      </box>,
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()
    await testSetup.mockMouse.click(0, 0)

    expect(clickSpy.callCount()).toBe(1)
  })

  it("fires onClick when clicking on a text element", async () => {
    const clickSpy = createSpy()

    testSetup = await testRender(
      <text width={10} height={1} onClick={() => clickSpy()}>
        Click me
      </text>,
      { width: 20, height: 5 },
    )

    await testSetup.renderOnce()
    await testSetup.mockMouse.click(0, 0)

    expect(clickSpy.callCount()).toBe(1)
  })
})
