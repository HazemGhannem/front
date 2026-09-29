/**
 * Everything the home page links to. Edit this file when you publish
 * something — nothing else needs to change.
 *
 * - Leave `url` empty ("") and the button shows "Coming soon" instead of a
 *   broken link.
 * - The Android QR code is generated from `android.url` at build time, so it
 *   is correct as soon as the Play Store listing goes live.
 */
export const downloads = {
  /** Shown next to the desktop download buttons. */
  agentVersion: "0.1.0",

  windows: {
    // e.g. "https://github.com/<you>/home-relay/releases/latest/download/Home-Relay-Agent-Setup.exe"
    url: "",
    fileLabel: "Windows 10 / 11 · 64-bit installer (.exe)",
  },

  mac: {
    // e.g. "https://github.com/<you>/home-relay/releases/latest/download/Home-Relay-Agent.dmg"
    url: "",
    fileLabel: "macOS 12+ · Apple Silicon & Intel (.dmg)",
  },

  android: {
    // Built from the package name in mobile-app/app.json ("com.homerelay.app").
    url: "https://play.google.com/store/apps/details?id=com.homerelay.app",
    /** Flip to true once the Play Store listing is public. */
    published: false,
  },

  ios: {
    // e.g. "https://apps.apple.com/app/id0000000000"
    url: "",
  },

  /**
   * Set to true while the desktop installers aren't code-signed, so the page
   * tells people how to get past the "unknown publisher" warning.
   */
  agentUnsigned: true,
} as const;
