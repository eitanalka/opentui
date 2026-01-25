import { test, expect, beforeEach, afterEach } from "bun:test"
import { createTestRenderer, type TestRenderer, type MockMouse } from "../testing/test-renderer"
import { TextRenderable } from "../renderables/Text"
import { BoxRenderable } from "../renderables/Box"

let renderer: TestRenderer
let mockMouse: MockMouse
let renderOnce: () => Promise<void>

beforeEach(async () => {
  ;({ renderer, mockMouse, renderOnce } = await createTestRenderer({
    width: 40,
    height: 10,
  }))
})

afterEach(() => {
  renderer.destroy()
})

test("preventDefault on mousedown prevents selection start", async () => {
  const text = new TextRenderable(renderer, {
    content: "Select me please",
    width: 20,
    height: 1,
    selectable: true,
    onMouseDown: (e) => e.preventDefault(),
  })

  renderer.root.add(text)
  await renderOnce()

  // Try to start selection by clicking and dragging
  await mockMouse.pressDown(0, 0)
  await mockMouse.emitMouseEvent("drag", 10, 0)
  await mockMouse.release(10, 0)

  // Selection should NOT have started because preventDefault was called
  expect(renderer.getSelection()).toBeNull()
})

test("preventDefault on mousedown prevents clear selection", async () => {
  const text1 = new TextRenderable(renderer, {
    content: "First text",
    width: 20,
    height: 1,
    selectable: true,
  })

  const text2 = new TextRenderable(renderer, {
    content: "Second text",
    width: 20,
    height: 1,
    selectable: false,
    onMouseDown: (e) => e.preventDefault(),
  })

  const box = new BoxRenderable(renderer, {
    width: 40,
    height: 10,
    flexDirection: "column",
  })
  box.add(text1)
  box.add(text2)
  renderer.root.add(box)
  await renderOnce()

  // Start selection on text1
  renderer.startSelection(text1, 0, 0)
  renderer.updateSelection(text1, 5, 0)
  expect(renderer.getSelection()).not.toBeNull()

  // Click on text2 which has preventDefault - selection should remain
  await mockMouse.click(0, 1)

  // Selection should still exist because preventDefault was called
  expect(renderer.getSelection()).not.toBeNull()
})

test("selection works normally without preventDefault", async () => {
  const text = new TextRenderable(renderer, {
    content: "Select me please",
    width: 20,
    height: 1,
    selectable: true,
  })

  renderer.root.add(text)
  await renderOnce()

  // Start selection by clicking and dragging
  await mockMouse.pressDown(0, 0)
  await mockMouse.emitMouseEvent("drag", 10, 0)
  await mockMouse.release(10, 0)

  // Selection should have started
  expect(renderer.getSelection()).not.toBeNull()
})

test("clear selection works normally without preventDefault", async () => {
  const text1 = new TextRenderable(renderer, {
    content: "First text",
    width: 20,
    height: 1,
    selectable: true,
  })

  const text2 = new TextRenderable(renderer, {
    content: "Second text",
    width: 20,
    height: 1,
    selectable: false,
  })

  const box = new BoxRenderable(renderer, {
    width: 40,
    height: 10,
    flexDirection: "column",
  })
  box.add(text1)
  box.add(text2)
  renderer.root.add(box)
  await renderOnce()

  // Start selection on text1
  renderer.startSelection(text1, 0, 0)
  renderer.updateSelection(text1, 5, 0)
  expect(renderer.getSelection()).not.toBeNull()

  // Click on text2 - should clear selection
  await mockMouse.click(0, 1)

  // Selection should be cleared
  expect(renderer.getSelection()).toBeNull()
})

test("mouse events still fire when preventDefault is called", async () => {
  let mouseDownFired = false
  let mouseUpFired = false

  const text = new TextRenderable(renderer, {
    content: "Click me",
    width: 20,
    height: 1,
    onMouseDown: (e) => {
      mouseDownFired = true
      e.preventDefault()
    },
    onMouseUp: () => {
      mouseUpFired = true
    },
  })

  renderer.root.add(text)
  await renderOnce()

  await mockMouse.click(0, 0)

  expect(mouseDownFired).toBe(true)
  expect(mouseUpFired).toBe(true)
})

test("drag events work correctly with selection", async () => {
  let dragEventCount = 0

  const text = new TextRenderable(renderer, {
    content: "Drag over me",
    width: 20,
    height: 1,
    selectable: true,
    onMouseDrag: () => {
      dragEventCount++
    },
  })

  renderer.root.add(text)
  await renderOnce()

  // Start selection
  await mockMouse.pressDown(0, 0)
  await mockMouse.emitMouseEvent("drag", 5, 0)
  await mockMouse.emitMouseEvent("drag", 10, 0)
  await mockMouse.release(10, 0)

  // Drag events should have been fired
  expect(dragEventCount).toBeGreaterThan(0)

  // Selection should have been created
  expect(renderer.getSelection()).not.toBeNull()
})
