import { BoxRenderable, type BoxOptions, type BoxStyleProps } from "./Box"
import { TextRenderable } from "./Text"
import { TextNodeRenderable } from "./TextNode"
import { type Style, type Renderable } from "../Renderable"
import { type RenderContext, TextAttributes } from "../types"
import type { VNode } from "./composition/vnode"
import type { KeyEvent } from "../lib/KeyHandler"
import { parseColor, type RGBA, type ColorInput } from "../lib/RGBA"

// Events
export enum ButtonRenderableEvents {
  CLICKED = "clicked",
}

// Style props (extends Box + includes text styling)
export interface ButtonStyleProps extends BoxStyleProps {
  color?: ColorInput
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  dim?: boolean
  blink?: boolean
  inverse?: boolean
  hidden?: boolean
}

// Options
export interface ButtonRenderableOptions extends Omit<BoxOptions, "style"> {
  color?: ColorInput
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  dim?: boolean
  disabled?: boolean
  style?: Style<ButtonStyleProps>
}

export class ButtonRenderable extends BoxRenderable {
  private _textContent: TextRenderable // Internal text renderable for unwrapped text
  private _color?: RGBA
  private _bold?: boolean
  private _italic?: boolean
  private _underline?: boolean
  private _strikethrough?: boolean
  private _dim?: boolean

  protected _defaultButtonOptions = {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingLeft: 1,
    paddingRight: 1,
  }

  constructor(ctx: RenderContext, options: ButtonRenderableOptions = {}) {
    // Merge defaults for centering
    super(ctx, {
      ...options,
      justifyContent: options.justifyContent ?? "center",
      alignItems: options.alignItems ?? "center",
      paddingLeft: options.paddingLeft ?? 1,
      paddingRight: options.paddingRight ?? 1,
    })

    this._focusable = true
    this._disabled = options.disabled ?? false

    // Create internal text renderable for unwrapped text support
    this._textContent = new TextRenderable(ctx, {
      id: `${this.id}-text`,
      selectable: false,
    })
    super.add(this._textContent) // Add as first child

    // Store text styling properties
    if (options.color) this._color = parseColor(options.color)
    this._bold = options.bold
    this._italic = options.italic
    this._underline = options.underline
    this._strikethrough = options.strikethrough
    this._dim = options.dim

    // Apply initial text styling to internal TextRenderable
    this.applyTextStylingToTextContent()

    this.initializeStyle()
  }

  // Keyboard handling - Enter/Space triggers click
  public handleKeyPress(key: KeyEvent): boolean {
    if (this._disabled) return false

    if (key.name === "return" || key.name === "space" || key.name === " ") {
      this.emit(ButtonRenderableEvents.CLICKED)
      return true
    }
    return false
  }

  // Override to handle text styling properties
  protected override applyMergedStyles(styles: ButtonStyleProps): void {
    super.applyMergedStyles(styles)

    // Apply text styling if specified
    if ("color" in styles && styles.color !== undefined) {
      this._color = parseColor(styles.color)
    }
    if ("bold" in styles) this._bold = styles.bold
    if ("italic" in styles) this._italic = styles.italic
    if ("underline" in styles) this._underline = styles.underline
    if ("strikethrough" in styles) this._strikethrough = styles.strikethrough
    if ("dim" in styles) this._dim = styles.dim

    this.applyTextStylingToTextContent()
  }

  private applyTextStylingToTextContent(): void {
    // Guard: only apply if _textContent is initialized
    if (!this._textContent) return

    // Apply text styling to internal TextRenderable's textNode
    const textNode = this._textContent.textNode

    if (this._color) {
      textNode.color = this._color
    }

    // Build attributes from scratch (no need to preserve previous state)
    let attributes = TextAttributes.NONE

    if (this._bold) attributes |= TextAttributes.BOLD
    if (this._italic) attributes |= TextAttributes.ITALIC
    if (this._underline) attributes |= TextAttributes.UNDERLINE
    if (this._strikethrough) attributes |= TextAttributes.STRIKETHROUGH
    if (this._dim) attributes |= TextAttributes.DIM

    textNode.attributes = attributes
  }

  // Override add to route TextNode children to internal TextRenderable
  public override add(obj: Renderable | VNode | TextNodeRenderable, index?: number): number {
    if (obj instanceof TextNodeRenderable) {
      // Route text nodes to the internal TextRenderable
      return this._textContent.textNode.add(obj)
    }
    // Other children (boxes, etc.) added normally
    return super.add(obj, index)
  }
}
