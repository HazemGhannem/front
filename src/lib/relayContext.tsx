"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SignalingClient } from "./signalingClient";
import { WebRtcSession } from "./webrtcSession";
import { ActiveDownload } from "./fileDownloader";
import { loadAuth, saveAuth, clearAuth, toWebSocketUrl } from "./authStorage";
import type { StoredAuth } from "./authStorage";
import { api } from "./api";
import type { PcSummary } from "./protocol/messages";
import type { InputEvent } from "./protocol/inputEvent";
import type { FileEntry } from "./protocol/fileProtocol";

function makeRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type SessionState = "idle" | "connecting" | "connected" | "failed" | "closed";

export interface DownloadProgress {
  name: string;
  receivedBytes: number;
  totalBytes: number;
}

interface RelayContextValue {
  /** null = not signed in. `undefined` only during the first client render. */
  auth: StoredAuth | null | undefined;
  signIn: (auth: StoredAuth) => void;
  signOut: () => Promise<void>;
  refreshDevices: () => void;
  devices: PcSummary[];
  sessionState: SessionState;
  connectedDeviceId: string | null;
  remoteStream: MediaStream | null;
  lastError: string | null;
  connect: (deviceId: string) => void;
  disconnect: () => void;
  sendInput: (event: InputEvent) => void;
  listFiles: (path: string | null) => Promise<FileEntry[]>;
  downloadFile: (path: string, onProgress?: (p: DownloadProgress) => void) => Promise<{ blob: Blob; name: string }>;
  cancelDownload: () => void;
}

const RelayContext = createContext<RelayContextValue | null>(null);

interface PendingList {
  resolve: (entries: FileEntry[]) => void;
  reject: (err: Error) => void;
}

export function RelayProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<StoredAuth | null | undefined>(undefined);
  const [devices, setDevices] = useState<PcSummary[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const signalingRef = useRef<SignalingClient | null>(null);
  const sessionRef = useRef<WebRtcSession | null>(null);
  const connectedDeviceIdRef = useRef<string | null>(null);
  const pendingListsRef = useRef<Map<string, PendingList>>(new Map());
  const activeDownloadRef = useRef<{
    download: ActiveDownload;
    onProgress?: (p: DownloadProgress) => void;
    resolve: (result: { blob: Blob; name: string }) => void;
    reject: (err: Error) => void;
  } | null>(null);

  useEffect(() => {
    // Intentional: localStorage isn't available during the server render,
    // so this has to happen post-mount rather than as a lazy useState
    // initializer, or the client's first render would mismatch the SSR'd
    // one instead of just rendering the gate once and settling.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthState(loadAuth());
  }, []);

  useEffect(() => {
    connectedDeviceIdRef.current = connectedDeviceId;
  }, [connectedDeviceId]);

  useEffect(() => {
    if (!auth) return;

    const signaling = new SignalingClient({
      url: toWebSocketUrl(auth.serverUrl),
      sessionToken: auth.sessionToken,
    });
    signaling.on("devices", (pcs) => setDevices(pcs));
    signaling.on("unauthorized", () => {
      // Signed out elsewhere, or the session expired.
      clearAuth();
      setAuthState(null);
      setDevices([]);
    });
    signaling.on("error", (message) => setLastError(message));
    signaling.on("signal", (from, payload) => {
      if (sessionRef.current && from === connectedDeviceIdRef.current) {
        void sessionRef.current.handleIncomingSignal(payload);
      }
    });
    signaling.connect();
    signalingRef.current = signaling;

    const interval = setInterval(() => signaling.requestDevices(), 5000);
    return () => {
      clearInterval(interval);
      signaling.close();
      signalingRef.current = null;
    };
  }, [auth]);

  const signIn = useCallback((next: StoredAuth) => {
    saveAuth(next);
    setLastError(null);
    setAuthState(next);
  }, []);

  const signOut = useCallback(async () => {
    const current = auth;
    sessionRef.current?.close();
    sessionRef.current = null;
    clearAuth();
    setAuthState(null);
    setDevices([]);
    setConnectedDeviceId(null);
    setRemoteStream(null);
    // Revoke the token on the server too, so it's useless even if copied.
    if (current) await api.logout(current.serverUrl, current.sessionToken).catch(() => {});
  }, [auth]);

  const refreshDevices = useCallback(() => signalingRef.current?.requestDevices(), []);

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setConnectedDeviceId(null);
    setRemoteStream(null);
    setSessionState("closed");
  }, []);

  const connect = useCallback((deviceId: string) => {
    const signaling = signalingRef.current;
    if (!signaling) return;

    sessionRef.current?.close();
    setRemoteStream(null);
    setSessionState("connecting");
    setConnectedDeviceId(deviceId);

    const session = new WebRtcSession({
      targetDeviceId: deviceId,
      sendSignal: (target, payload) => signaling.send({ type: "signal", target, payload }),
    });

    session.on("remoteStream", (stream) => setRemoteStream(stream));
    session.on("error", (message) => setLastError(message));
    session.on("connectionStateChange", (state) => {
      if (state === "connected") setSessionState("connected");
      else if (state === "failed" || state === "disconnected") setSessionState("failed");
    });

    session.on("fileResponse", (response) => {
      if (response.type === "list-result") {
        pendingListsRef.current.get(response.requestId)?.resolve(response.entries);
        pendingListsRef.current.delete(response.requestId);
      } else if (response.type === "list-error") {
        pendingListsRef.current.get(response.requestId)?.reject(new Error(response.message));
        pendingListsRef.current.delete(response.requestId);
      } else if (response.type === "download-error") {
        const pending = activeDownloadRef.current;
        if (!pending || pending.download.requestId !== response.requestId) return;
        activeDownloadRef.current = null;
        pending.reject(new Error(response.message));
      } else if (response.type === "download-complete") {
        const pending = activeDownloadRef.current;
        if (!pending || pending.download.requestId !== response.requestId) return;
        activeDownloadRef.current = null;
        pending.resolve({ blob: pending.download.finish(), name: pending.download.name });
      }
    });

    session.on("fileChunk", (data) => {
      const pending = activeDownloadRef.current;
      if (!pending) return;
      pending.download.writeChunk(data);
      pending.onProgress?.({
        name: pending.download.name,
        receivedBytes: pending.download.receivedBytes,
        totalBytes: pending.download.totalBytes,
      });
    });

    sessionRef.current = session;
    void session.connect();
  }, []);

  const sendInput = useCallback((event: InputEvent) => {
    sessionRef.current?.sendInput(event);
  }, []);

  const listFiles = useCallback((path: string | null): Promise<FileEntry[]> => {
    return new Promise((resolve, reject) => {
      const session = sessionRef.current;
      if (!session) return reject(new Error("not connected to a PC"));
      const requestId = makeRequestId();
      pendingListsRef.current.set(requestId, { resolve, reject });
      session.sendFileRequest({ type: "list", requestId, path });
    });
  }, []);

  const downloadFile = useCallback(
    (path: string, onProgress?: (p: DownloadProgress) => void): Promise<{ blob: Blob; name: string }> => {
      return new Promise((resolve, reject) => {
        const session = sessionRef.current;
        if (!session) return reject(new Error("not connected to a PC"));
        if (activeDownloadRef.current) return reject(new Error("another download is already in progress"));

        const requestId = makeRequestId();
        const fallbackName = path.split(/[\\/]/).pop() ?? "download";

        const onceStarted = (response: { type: string; requestId: string; name?: string; size?: number }) => {
          if (response.type !== "download-start" || response.requestId !== requestId) return;
          session.off("fileResponse", onceStarted as never);
          const download = ActiveDownload.begin(requestId, response.name ?? fallbackName, response.size ?? 0);
          activeDownloadRef.current = { download, onProgress, resolve, reject };
        };
        session.on("fileResponse", onceStarted as never);
        session.sendFileRequest({ type: "download", requestId, path });
      });
    },
    []
  );

  const cancelDownload = useCallback(() => {
    const pending = activeDownloadRef.current;
    if (!pending) return;
    sessionRef.current?.sendFileRequest({ type: "cancel-download", requestId: pending.download.requestId });
    activeDownloadRef.current = null;
  }, []);

  const value: RelayContextValue = {
    auth,
    signIn,
    signOut,
    refreshDevices,
    devices,
    sessionState,
    connectedDeviceId,
    remoteStream,
    lastError,
    connect,
    disconnect,
    sendInput,
    listFiles,
    downloadFile,
    cancelDownload,
  };

  return <RelayContext.Provider value={value}>{children}</RelayContext.Provider>;
}

export function useRelay(): RelayContextValue {
  const ctx = useContext(RelayContext);
  if (!ctx) throw new Error("useRelay must be used within a RelayProvider");
  return ctx;
}
