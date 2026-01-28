import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import { ButtonRenderable, ButtonRenderableEvents } from "../renderables/Button"
import { TextNodeRenderable } from "../renderables/TextNode"
import { BoxRenderable } from "../renderables/Box"
import { createTestRenderer, type TestRenderer } from "../testing/test-renderer"

describe("ButtonRenderable", () => {
  let testRenderer: TestRenderer

  beforeEach(async () => {
    const result = await createTestRenderer({ width: 80, height: 24 })
    testRenderer = result.renderer
  })

  afterEach(() => {
    testRenderer.destroy()
  })

  describe("rendering", () => {
    it("should render with unwrapped text (string children)", () => {
      const button = new ButtonRenderable(testRenderer, {})
      const textNode = TextNodeRenderable.fromString("Click me")
      button.add(textNode)

      expect(button).toBeDefined()
      // Text should be routed to internal TextRenderable
      expect(button.getChildren().length).toBeGreaterThan(0)
    })

    it("should render with explicit TextNode children", () => {
      const button = new ButtonRenderable(testRenderer, {})
      const boldText = new TextNodeRenderable({ bold: true })
      boldText.add("Bold")
      const normalText = TextNodeRenderable.fromString(" and normal text")

      button.add(boldText)
      button.add(normalText)

      expect(button).toBeDefined()
      expect(button.getChildren().length).toBeGreaterThan(0)
    })

    it("should render with non-text children (boxes)", () => {
      const button = new ButtonRenderable(testRenderer, {})
      const box = new BoxRenderable(testRenderer, { width: 10, height: 2 })
      button.add(box)

      const children = button.getChildren()
      // Should have internal TextRenderable + the box
      expect(children.length).toBeGreaterThan(1)
      expect(children.some((child) => child instanceof BoxRenderable)).toBe(true)
    })

    it("should accept layout options", () => {
      const button = new ButtonRenderable(testRenderer, {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingLeft: 2,
        paddingRight: 3,
      })

      // Button should be created successfully with custom layout options
      expect(button).toBeDefined()
      expect(button.getChildren().length).toBeGreaterThan(0)
    })
  })

  describe("focus and keyboard interaction", () => {
    it("should be focusable", () => {
      const button = new ButtonRenderable(testRenderer, {})
      expect(button.focusable).toBe(true)
    })

    it("should trigger CLICKED event on Enter key", () => {
      const button = new ButtonRenderable(testRenderer, {})
      const clickHandler = mock(() => {})
      button.on(ButtonRenderableEvents.CLICKED, clickHandler)

      const handled = button.handleKeyPress({ name: "return" } as any)

      expect(handled).toBe(true)
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    it("should trigger CLICKED event on Space key", () => {
      const button = new ButtonRenderable(testRenderer, {})
      const clickHandler = mock(() => {})
      button.on(ButtonRenderableEvents.CLICKED, clickHandler)

      const handled = button.handleKeyPress({ name: "space" } as any)

      expect(handled).toBe(true)
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    it("should ignore keyboard events when disabled", () => {
      const button = new ButtonRenderable(testRenderer, { disabled: true })
      const clickHandler = mock(() => {})
      button.on(ButtonRenderableEvents.CLICKED, clickHandler)

      const handled = button.handleKeyPress({ name: "return" } as any)

      expect(handled).toBe(false)
      expect(clickHandler).not.toHaveBeenCalled()
    })

    it("should not handle other keys", () => {
      const button = new ButtonRenderable(testRenderer, {})
      const clickHandler = mock(() => {})
      button.on(ButtonRenderableEvents.CLICKED, clickHandler)

      const handled = button.handleKeyPress({ name: "a" } as any)

      expect(handled).toBe(false)
      expect(clickHandler).not.toHaveBeenCalled()
    })
  })

  describe("text styling", () => {
    it("should apply text styling properties to internal TextRenderable", () => {
      const button = new ButtonRenderable(testRenderer, {
        color: "#ffffff",
        bold: true,
        italic: true,
        underline: true,
      })

      // @ts-expect-error accessing private property for testing
      const textContent = button._textContent
      const textNode = textContent.textNode

      expect(textNode.color).toBeDefined()
      expect(textNode.attributes & 1).toBe(1) // BOLD flag
      expect(textNode.attributes & 4).toBe(4) // ITALIC flag
      expect(textNode.attributes & 8).toBe(8) // UNDERLINE flag
    })

    it("should update text styling via style prop", () => {
      const button = new ButtonRenderable(testRenderer, {
        style: {
          color: "#ffffff",
          bold: true,
          hover: {
            color: "#cccccc",
            bold: false,
          },
        },
      })

      // @ts-expect-error accessing private property for testing
      const textContent = button._textContent
      const textNode = textContent.textNode

      expect(textNode.color).toBeDefined()
      expect(textNode.attributes & 1).toBe(1) // BOLD flag
    })
  })

  describe("disabled state", () => {
    it("should respect disabled option", () => {
      const button = new ButtonRenderable(testRenderer, { disabled: true })
      expect(button.disabled).toBe(true)
    })

    it("should not trigger events when disabled", () => {
      const button = new ButtonRenderable(testRenderer, { disabled: true })
      const clickHandler = mock(() => {})
      button.on(ButtonRenderableEvents.CLICKED, clickHandler)

      button.handleKeyPress({ name: "return" } as any)

      expect(clickHandler).not.toHaveBeenCalled()
    })
  })
})
