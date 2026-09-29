import { MiniEmitter } from "./miniEmitter";
import { isSignalPayload } from "./protocol/signalPayload";
import type { SignalPayload } from "./protocol/signalPayload";
import type { InputEvent } from "./protocol/inputEvent";
import { fileResponseSchema } from "./protocol/fileProtocol";
import type { FileRequest, FileResponse } from "./protocol/fileProtocol";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

interface WebRtcSessionEvents {
  remoteStream: [stream: MediaStream];
  connectionStateChange: [state: RTCPeerConnectionState];
  fileResponse: [response: FileResponse];
  fileChunk: [data: Uint8Array];
  error: [message: string];
}

export interface WebRtcSessionOptions {
  targetDeviceId: string;
  sendSignal: (target: string, payload: SignalPayload) => void;
}

/**
 * Mirrors mobile-app/src/lib/webrtcSession.ts, using the browser's native
 * WebRTC APIs directly (no react-native-webrtc packaging workarounds
 * needed here — same reasoning as agent/electron/renderer/capture.ts and
 * agent/electron/test/phone-simulator.html, which this file's shape closely
 * follows). The web app is always the *offerer*, same as the mobile app;
 * the agent is always the *answerer*.
 */
export class WebRtcSession extends MiniEmitter<WebRtcSessionEvents> {
  private pc: RTCPeerConnection;
  readonly inputChannel: RTCDataChannel;
  readonly filesChannel: RTCDataChannel;

  constructor(private readonly options: WebRtcSessionOptions) {
    super();
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.inputChannel = this.pc.createDataChannel("input");
    this.filesChannel = this.pc.createDataChannel("files");
    // Unified Plan only puts an m-line in the offer for transceivers that
    // actually exist — without this, the offer has no m=video section at
    // all, so the agent has nothing to attach its screen-share track to
    // even though it tries (found by testing against the real agent: ICE
    // connected, but ontrack never fired).
    this.pc.addTransceiver("video", { direction: "recvonly" });

    this.pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const c = event.candidate.toJSON();
      this.sendSignal({
        kind: "ice-candidate",
        candidate: { candidate: c.candidate ?? "", sdpMid: c.sdpMid ?? null, sdpMLineIndex: c.sdpMLineIndex ?? null },
      });
    };

    this.pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) this.emit("remoteStream", stream);
    };

    this.pc.onconnectionstatechange = () => {
      this.emit("connectionStateChange", this.pc.connectionState);
    };

    this.filesChannel.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.handleFileControlMessage(event.data);
      } else {
        this.emit("fileChunk", new Uint8Array(event.data as ArrayBuffer));
      }
    };
  }

  /** Starts the handshake: creates and sends an offer targeting the PC. */
  async connect(): Promise<void> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.sendSignal({ kind: "offer", sdp: offer.sdp ?? "" });
  }

  /** Feed this from the signaling client's `signal` event for this session's target. */
  async handleIncomingSignal(payload: unknown): Promise<void> {
    if (!isSignalPayload(payload)) {
      this.emit("error", "received a signal with an unrecognized payload");
      return;
    }
    if (payload.kind === "answer") {
      await this.pc.setRemoteDescription({ type: "answer", sdp: payload.sdp });
    } else if (payload.kind === "ice-candidate") {
      await this.pc.addIceCandidate(payload.candidate);
    }
    // "offer" is never expected here — the web app always initiates.
  }

  sendInput(event: InputEvent): void {
    if (this.inputChannel.readyState !== "open") return;
    this.inputChannel.send(JSON.stringify(event));
  }

  sendFileRequest(request: FileRequest): void {
    if (this.filesChannel.readyState !== "open") return;
    this.filesChannel.send(JSON.stringify(request));
  }

  close(): void {
    this.pc.close();
  }

  private sendSignal(payload: SignalPayload): void {
    this.options.sendSignal(this.options.targetDeviceId, payload);
  }

  private handleFileControlMessage(raw: string): void {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return void this.emit("error", "received malformed file-response JSON");
    }
    const result = fileResponseSchema.safeParse(json);
    if (!result.success) {
      return void this.emit("error", "received a file response that failed validation");
    }
    this.emit("fileResponse", result.data);
  }
}
