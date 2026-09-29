"use client";

import { useSyncExternalStore } from "react";
import { downloads } from "@/config/downloads";

type DesktopOs = "windows" | "mac" | "other";

function detectOs(): DesktopOs {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) return "mac";
  return "other";
}

// Read once on the client; the server render (and first paint) uses null,
// so there's no hydration mismatch and no setState-in-effect.
const noop = () => () => {};
function useDesktopOs(): DesktopOs | null {
  return useSyncExternalStore(noop, detectOs, () => null);
}

/** Hero call-to-action: offers the installer for the visitor's own OS. */
export function AgentDownloadButton() {
  const os = useDesktopOs();
  const target = os === "mac" ? downloads.mac : downloads.windows;
  const name = os === "mac" ? "Mac" : "Windows";

  if (os === "other") {
    return (
      <a href="#download" className="btn-primary">
        Download the PC agent
      </a>
    );
  }
  if (!target.url) {
    return (
      <a href="#download" className="btn-primary">
        Get it for {os === null ? "your PC" : name}
      </a>
    );
  }
  return (
    <a href={target.url} className="btn-primary" download>
      Download for {name}
    </a>
  );
}
