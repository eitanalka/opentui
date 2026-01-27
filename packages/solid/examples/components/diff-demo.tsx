import { createSignal } from "solid-js"
import { SyntaxStyle } from "@opentui/core"
import { useKeyboard } from "@opentui/solid"

export default function DiffDemo() {
  const [currentView, setCurrentView] = createSignal<"unified" | "split">("unified")
  const [showLineNumbers, setShowLineNumbers] = createSignal(true)

  const exampleDiff = `--- a/calculator.ts
+++ b/calculator.ts
@@ -1,15 +1,20 @@
 class Calculator {
   add(a: number, b: number): number {
     return a + b;
   }
 
-  subtract(a: number, b: number): number {
-    return a - b;
+  subtract(a: number, b: number, c: number = 0): number {
+    return a - b - c;
   }
 
   multiply(a: number, b: number): number {
     return a * b;
   }
+
+  divide(a: number, b: number): number {
+    if (b === 0) {
+      throw new Error("Division by zero");
+    }
+    return a / b;
+  }
 }`

  const syntaxStyle = SyntaxStyle.fromStyles({
    keyword: { color: "#C792EA" } as any,
    "keyword.import": { color: "#C792EA" } as any,
    string: { color: "#C3E88D" } as any,
    comment: { color: "#546E7A" } as any,
    number: { color: "#F78C6C" } as any,
    boolean: { color: "#F78C6C" } as any,
    constant: { color: "#F78C6C" } as any,
    function: { color: "#82AAFF" } as any,
    "function.call": { color: "#82AAFF" } as any,
    constructor: { color: "#FFCB6B" } as any,
    type: { color: "#FFCB6B" } as any,
    operator: { color: "#89DDFF" } as any,
    variable: { color: "#EEFFFF" } as any,
    property: { color: "#89DDFF" } as any,
    bracket: { color: "#FFFFFF" } as any,
    punctuation: { color: "#FFFFFF" } as any,
    default: { color: "#A6ACCD" } as any,
  })

  useKeyboard((key) => {
    if (key.name === "v" && !key.ctrl && !key.meta) {
      toggleView()
    } else if (key.name === "l" && !key.ctrl && !key.meta) {
      toggleLineNumbers()
    }
  })

  const toggleView = () => {
    setCurrentView(currentView() === "unified" ? "split" : "unified")
  }

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers())
  }

  return (
    <box flexDirection="column" width="100%" height="100%" gap={1}>
      <box flexDirection="column" backgroundColor="#0D1117" padding={1} border borderColor="#30363D">
        <text color="#4ECDC4">Diff Demo - Unified & Split View</text>
        <text color="#888888">Keybindings:</text>
        <text color="#AAAAAA"> V - Toggle view ({currentView().toUpperCase()})</text>
        <text color="#AAAAAA"> L - Toggle line numbers ({showLineNumbers() ? "ON" : "OFF"})</text>
      </box>

      <box flexGrow={1} border borderStyle="single" borderColor="#4ECDC4" backgroundColor="#0D1117">
        <diff
          diff={exampleDiff}
          view={currentView()}
          filetype="typescript"
          syntaxStyle={syntaxStyle}
          showLineNumbers={showLineNumbers()}
          addedBg="#1a4d1a"
          removedBg="#4d1a1a"
          addedSignColor="#22c55e"
          removedSignColor="#ef4444"
          lineNumberFg="#6b7280"
          lineNumberBg="#161b22"
          width="100%"
          height="100%"
        />
      </box>
    </box>
  )
}
