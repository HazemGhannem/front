// Mirrors agent/src/rtc/inputEvent.ts. The web app only ever sends these
// (the agent validates them — that's the real trust boundary), so this is a
// plain type, not a zod schema.
export type MouseButton = "left" | "right" | "middle";

export type InputEvent =
  | { type: "mousemove"; xRatio: number; yRatio: number }
  | { type: "mousedown"; button: MouseButton }
  | { type: "mouseup"; button: MouseButton }
  | { type: "wheel"; deltaX: number; deltaY: number }
  | { type: "keydown"; key: string }
  | { type: "keyup"; key: string };
