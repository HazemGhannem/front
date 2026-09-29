"use client";

import React, { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRelay } from "@/lib/relayContext";

const MOUSE_BUTTON_NAMES = ["left", "middle", "right"] as const;

/**
 * Real mouse/keyboard input, unlike the mobile app's touch-only surface —
 * this is the one client with a real pointer and keyboard, so it sends the
 * full InputEvent surface (including wheel and key events) the protocol
 * already supports.
 */
export default function RemoteScreenPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const router = useRouter();
  const { remoteStream, sessionState, sendInput, disconnect } = useRelay();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => sendInput({ type: "keydown", key: event.key });
    const handleKeyUp = (event: KeyboardEvent) => sendInput({ type: "keyup", key: event.key });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sendInput]);

  const ratioFromEvent = (event: React.MouseEvent): { xRatio: number; yRatio: number } | null => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      xRatio: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      yRatio: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  };

  const onMouseMove = (event: React.MouseEvent) => {
    const ratio = ratioFromEvent(event);
    if (ratio) sendInput({ type: "mousemove", ...ratio });
  };

  const onMouseDown = (event: React.MouseEvent) => {
    const ratio = ratioFromEvent(event);
    if (ratio) sendInput({ type: "mousemove", ...ratio });
    sendInput({ type: "mousedown", button: MOUSE_BUTTON_NAMES[event.button] ?? "left" });
  };

  const onMouseUp = (event: React.MouseEvent) => {
    sendInput({ type: "mouseup", button: MOUSE_BUTTON_NAMES[event.button] ?? "left" });
  };

  const onWheel = (event: React.WheelEvent) => {
    sendInput({ type: "wheel", deltaX: event.deltaX, deltaY: event.deltaY });
  };

  const goBack = () => {
    disconnect();
    router.push("/devices");
  };

  return (
    <main className="flex-1 flex flex-col bg-black">
      <div
        ref={surfaceRef}
        className="flex-1 flex items-center justify-center overflow-hidden select-none"
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        onContextMenu={(event) => event.preventDefault()}
      >
        {remoteStream ? (
          <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full" />
        ) : (
          <p className="text-sm text-[#8a93a3]">
            {sessionState === "connecting" ? "Connecting…" : "Waiting for video…"}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-[#12141a]">
        <button
          onClick={goBack}
          className="text-sm font-semibold rounded-lg bg-[#262b35] px-3.5 py-2 hover:bg-[#333a47] transition-colors"
        >
          Disconnect
        </button>
        <span className="text-xs text-[#8a93a3] capitalize">{sessionState}</span>
        <Link
          href={`/files/${deviceId}`}
          className="text-sm font-semibold rounded-lg bg-[#2f6fed] px-3.5 py-2 hover:bg-[#4b82f0] transition-colors"
        >
          Files
        </Link>
      </div>
    </main>
  );
}
