import { test, expect, beforeEach, afterEach } from "bun:test"
import { createTestRenderer, type TestRenderer, type MockMouse } from "../testing/test-renderer"
import { BoxRenderable } from "../renderables/Box"

let renderer: TestRenderer
let mockMouse: MockMouse
let renderOnce: () => Promise<void>

beforeEach(async () => {
  ; ({ renderer, mockMouse, renderOnce } = await createTestRenderer({
    width: 40,
    height: 10,
  }))
})

afterEach(() => {
  renderer.destroy()
})

test("onClick fires when mousedown and mouseup on same element", async () => {
  let clicked = false
  const box = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      clicked = true
    },
  })
  renderer.root.add(box)
  await renderOnce()

  await mockMouse.click(0, 0)
  expect(clicked).toBe(true)
})

test("onClick fires on common ancestor when mouseup on different sibling", async () => {
  let parentClicked = false
  let child1Clicked = false
  let child2Clicked = false

  const parent = new BoxRenderable(renderer, {
    width: 20,
    height: 10,
    flexDirection: "column",
    onClick: () => {
      parentClicked = true
    },
  })
  const child1 = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      child1Clicked = true
    },
  })
  const child2 = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      child2Clicked = true
    },
  })

  parent.add(child1)
  parent.add(child2)
  renderer.root.add(parent)
  await renderOnce()

  // Mousedown on child1 (y=0), mouseup on child2 (y=3)
  await mockMouse.pressDown(0, 0)
  await mockMouse.release(0, 3)

  // Neither child should get click (they weren't the common ancestor)
  expect(child1Clicked).toBe(false)
  expect(child2Clicked).toBe(false)
  // Parent (common ancestor) SHOULD get click
  expect(parentClicked).toBe(true)
})

test("onClick fires on parent when mousedown on child and mouseup on parent", async () => {
  let parentClicked = false
  let childClicked = false

  const parent = new BoxRenderable(renderer, {
    width: 20,
    height: 10,
    onClick: () => {
      parentClicked = true
    },
  })
  const child = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      childClicked = true
    },
  })

  parent.add(child)
  renderer.root.add(parent)
  await renderOnce()

  // Mousedown on child (y=0), mouseup on parent area outside child (y=5)
  await mockMouse.pressDown(0, 0)
  await mockMouse.release(0, 5)

  // Child should not get click
  expect(childClicked).toBe(false)
  // Parent (common ancestor) SHOULD get click
  expect(parentClicked).toBe(true)
})

test("onClick fires on parent when mousedown on parent and mouseup on child", async () => {
  let parentClicked = false
  let childClicked = false

  const parent = new BoxRenderable(renderer, {
    width: 20,
    height: 10,
    onClick: () => {
      parentClicked = true
    },
  })
  const child = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      childClicked = true
    },
  })

  parent.add(child)
  renderer.root.add(parent)
  await renderOnce()

  // Mousedown on parent area outside child (y=5), mouseup on child (y=0)
  await mockMouse.pressDown(0, 5)
  await mockMouse.release(0, 0)

  // Child should not get click (it wasn't the common ancestor)
  expect(childClicked).toBe(false)
  // Parent (common ancestor) SHOULD get click
  expect(parentClicked).toBe(true)
})

test("onClick receives correct event properties", async () => {
  let receivedEvent: any = null
  const box = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: (event) => {
      receivedEvent = event
    },
  })
  renderer.root.add(box)
  await renderOnce()

  await mockMouse.click(5, 1)

  expect(receivedEvent).not.toBeNull()
  expect(receivedEvent.type).toBe("click")
  expect(receivedEvent.target).toBe(box)
  expect(receivedEvent.x).toBe(5)
  expect(receivedEvent.y).toBe(1)
})

test("onClick fires alongside onMouseDown and onMouseUp", async () => {
  let mouseDownFired = false
  let mouseUpFired = false
  let clickFired = false

  const box = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onMouseDown: () => {
      mouseDownFired = true
    },
    onMouseUp: () => {
      mouseUpFired = true
    },
    onClick: () => {
      clickFired = true
    },
  })
  renderer.root.add(box)
  await renderOnce()

  await mockMouse.click(0, 0)

  expect(mouseDownFired).toBe(true)
  expect(mouseUpFired).toBe(true)
  expect(clickFired).toBe(true)
})

test("onClick only fires for left button", async () => {
  let clicked = false
  const box = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      clicked = true
    },
  })
  renderer.root.add(box)
  await renderOnce()

  // Right-click (button 2)
  await mockMouse.emitMouseEvent("down", 0, 0, 2)
  await mockMouse.emitMouseEvent("up", 0, 0, 2)

  expect(clicked).toBe(false)
})

test("onClick bubbles to parent if not stopped", async () => {
  let parentClicked = false
  let childClicked = false

  const parent = new BoxRenderable(renderer, {
    width: 20,
    height: 10,
    onClick: () => {
      parentClicked = true
    },
  })
  const child = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: () => {
      childClicked = true
    },
  })

  parent.add(child)
  renderer.root.add(parent)
  await renderOnce()

  await mockMouse.click(0, 0)

  expect(childClicked).toBe(true)
  expect(parentClicked).toBe(true)
})

test("onClick stopPropagation prevents bubbling", async () => {
  let parentClicked = false
  let childClicked = false

  const parent = new BoxRenderable(renderer, {
    width: 20,
    height: 10,
    onClick: () => {
      parentClicked = true
    },
  })
  const child = new BoxRenderable(renderer, {
    width: 10,
    height: 3,
    onClick: (event) => {
      childClicked = true
      event.stopPropagation()
    },
  })

  parent.add(child)
  renderer.root.add(parent)
  await renderOnce()

  await mockMouse.click(0, 0)

  expect(childClicked).toBe(true)
  expect(parentClicked).toBe(false)
})
