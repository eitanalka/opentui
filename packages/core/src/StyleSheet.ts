import type { Style } from "./Renderable"

// Type-safe style ID
declare const StyleIdBrand: unique symbol
export type StyleId = symbol & { [StyleIdBrand]: true }

// className prop accepts multiple formats
export type ClassName =
  | StyleId
  | StyleId[]
  | string
  | string[]
  | (StyleId | string | false | null | undefined)[] // Allow falsy for conditionals

// Global registries
const styleRegistry = new Map<StyleId, Style>()
const stringRegistry = new Map<string, StyleId>()

export class StyleSheet {
  /**
   * Create a set of named styles
   * Returns object with same keys but StyleId values
   * Accepts any extended StyleProps (e.g., BoxStyleProps, TextStyleProps)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static create<T extends Record<string, Style<any>>>(
    styles: T
  ): { [K in keyof T]: StyleId } {
    const result = {} as { [K in keyof T]: StyleId }

    for (const key in styles) {
      // Create unique symbol
      const id = Symbol(key) as StyleId

      // Freeze to prevent mutations
      const frozenStyle = Object.freeze({ ...styles[key] })

      // Register by symbol
      styleRegistry.set(id, frozenStyle)

      // Also register by string key for optional string lookups
      stringRegistry.set(key, id)

      result[key] = id
    }

    return result
  }

  /**
   * Resolve className to merged Style object
   * Handles StyleId, string, arrays, and falsy values
   */
  static resolve(className: ClassName): Style | undefined {
    if (!className) return undefined

    // Normalize to array of StyleIds
    const ids = normalizeClassName(className)
    if (ids.length === 0) return undefined

    // Collect styles
    const styles: Style[] = []
    for (const id of ids) {
      const style = styleRegistry.get(id)
      if (style) styles.push(style)
    }

    if (styles.length === 0) return undefined

    // Merge styles (right-to-left, later overrides earlier)
    return mergeStyles(styles)
  }
}

/**
 * Normalize className to array of StyleIds
 */
function normalizeClassName(className: ClassName): StyleId[] {
  if (!className) return []

  if (Array.isArray(className)) {
    const result: StyleId[] = []
    for (const item of className) {
      if (item) {
        if (typeof item === 'string') {
          // Handle space-separated strings
          const ids = item
            .split(/\s+/)
            .filter(Boolean)
            .map(key => stringRegistry.get(key))
            .filter((id): id is StyleId => !!id)
          result.push(...ids)
        } else {
          result.push(item as StyleId)
        }
      }
    }
    return result
  }

  if (typeof className === 'string') {
    // Split space-separated string into individual classes
    return className
      .split(/\s+/)
      .filter(Boolean)
      .map(key => stringRegistry.get(key))
      .filter((id): id is StyleId => !!id)
  }

  return [className as StyleId]
}

/**
 * Deep merge multiple styles
 * State styles (hover/focus/active/disabled) are merged separately
 */
function mergeStyles(styles: Style[]): Style {
  const merged: Style = {}

  for (const style of styles) {
    const { hover, focus, active, disabled, ...base } = style

    // Merge base properties
    Object.assign(merged, base)

    // Merge state properties separately
    if (hover) {
      merged.hover = merged.hover
        ? { ...merged.hover, ...hover }
        : { ...hover }
    }
    if (focus) {
      merged.focus = merged.focus
        ? { ...merged.focus, ...focus }
        : { ...focus }
    }
    if (active) {
      merged.active = merged.active
        ? { ...merged.active, ...active }
        : { ...active }
    }
    if (disabled) {
      merged.disabled = merged.disabled
        ? { ...merged.disabled, ...disabled }
        : { ...disabled }
    }
  }

  return merged
}
