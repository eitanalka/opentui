import { describe, expect, it } from "bun:test"
import { StyleSheet } from "../StyleSheet"

describe("StyleSheet", () => {
  it("create() returns object with StyleId values", () => {
    const styles = StyleSheet.create({
      foo: { opacity: 0.5 },
    })
    expect(typeof styles.foo).toBe("symbol")
  })

  it("resolve() returns style for StyleId", () => {
    const styles = StyleSheet.create({
      box: { opacity: 0.5 },
    })
    const resolved = StyleSheet.resolve(styles.box)
    expect(resolved?.opacity).toBe(0.5)
  })

  it("resolve() merges multiple StyleIds (array)", () => {
    const styles = StyleSheet.create({
      a: { opacity: 0.5, width: 10 },
      b: { opacity: 0.8 }, // Should override opacity
    })
    const merged = StyleSheet.resolve([styles.a, styles.b])
    expect(merged?.opacity).toBe(0.8)
    expect(merged?.width).toBe(10)
  })

  it("state styles merge correctly", () => {
    const styles = StyleSheet.create({
      button: {
        opacity: 1,
        hover: { opacity: 0.8 },
      },
      primary: {
        hover: { width: 20 },
      },
    })
    const merged = StyleSheet.resolve([styles.button, styles.primary])
    expect(merged?.hover?.opacity).toBe(0.8)
    expect(merged?.hover?.width).toBe(20)
  })

  it("string className lookup works", () => {
    StyleSheet.create({
      myStyle: { opacity: 0.5 },
    })
    const resolved = StyleSheet.resolve("myStyle")
    expect(resolved?.opacity).toBe(0.5)
  })

  it("space-separated strings split into multiple classes", () => {
    const styles = StyleSheet.create({
      a: { opacity: 0.5 },
      b: { width: 10 },
    })
    const merged = StyleSheet.resolve("a b")
    expect(merged?.opacity).toBe(0.5)
    expect(merged?.width).toBe(10)
  })

  it("filters falsy values in arrays", () => {
    const styles = StyleSheet.create({
      a: { opacity: 0.5 },
    })
    const merged = StyleSheet.resolve([styles.a, false, null, undefined])
    expect(merged?.opacity).toBe(0.5)
  })
})
