# Home Relay — Web App

The browser (Next.js) frontend: same three capabilities as the
[mobile app](../mobile-app) — devices list, live remote screen with mouse
control, file browsing/download — talking to the same [backend](../backend)
and [agent](../agent) with zero server-side changes. Because it's a browser,
WebRTC is native (no `react-native-webrtc` packaging workarounds needed
here), and it gets real mouse + keyboard input instead of the mobile app's
touch-only surface.

## What's built

- **Connection gate** (`src/components/ConnectionGate.tsx`) — a one-time
  form for the backend URL and auth token, kept in `localStorage`. See
  "Why the settings aren't baked into the build" below.
- **Devices page** (`src/app/page.tsx`) — the device registry, same as the
  mobile app's.
- **Remote screen** (`src/app/remote/[deviceId]/page.tsx`) — a `<video>`
  element renders the agent's screen share. Real mouse move/down/up/wheel
  and keyboard down/up are all forwarded over the `input` data channel —
  richer than the mobile app's touch-only surface, since a desktop browser
  actually has these.
- **File browser** (`src/app/files/[deviceId]/page.tsx`) — same drill-down
  browsing as the mobile app; download assembles the file in memory and
  triggers the browser's normal save-file flow.

## Architecture

```
src/
  app/
    layout.tsx                 wraps every page in RelayProvider + ConnectionGate
    page.tsx                    devices list
    remote/[deviceId]/page.tsx   video + real mouse/keyboard control
    files/[deviceId]/page.tsx    file browser + download

  components/
    ConnectionGate.tsx           renders a connect form until settings exist,
                                 otherwise renders its children

  lib/
    connectionSettings.ts        localStorage-backed backend URL + token —
                                 see "Why" below
    miniEmitter.ts                same tiny typed pub-sub as agent/mobile-app
    signalingClient.ts            mirrors agent's and mobile-app's — same auth
                                 handshake, same schema-validated inbound
                                 messages, same reconnect-with-backoff
    webrtcSession.ts               owns one RTCPeerConnection plus the "input"
                                 and "files" data channels, using the
                                 browser's native WebRTC APIs directly (no
                                 workarounds needed, unlike the mobile app)
    fileDownloader.ts              accumulates a download's chunks into a
                                 Blob and triggers the browser's save-file
                                 flow
    protocol/                     hand-mirrored wire shapes, same as
                                 mobile-app/src/lib/protocol/ — see that
                                 README for why they're mirrored rather than
                                 shared as a package
```

### Sign-in

The app shows a sign-in / create-account screen (`components/AuthGate.tsx`).
Signing in returns a per-browser session token from the backend, kept in
`localStorage` (`lib/authStorage.ts`) — never the password. "Sign out" revokes
it on the server. The server address defaults to `NEXT_PUBLIC_SERVER_URL`
(not a secret) and can be changed under "Server settings". PCs are added with
"Link a PC" and the 6-digit code the agent shows.

### Why this file exists separately from mobile-app's version

`webrtcSession.ts` here is structurally the same as
`mobile-app/src/lib/webrtcSession.ts`, but uses `RTCPeerConnection` directly
from the browser instead of `react-native-webrtc`. No `RtcAny` casts, no
missing-type workarounds — the browser's own WebRTC types are complete.
Keeping it as its own file (not a shared abstraction over both) means
neither side carries workaround code the other doesn't need.

## Two real bugs found and fixed while verifying this against the real
## backend and agent (not while writing the code — while actually running it)

**1. ICE candidates arriving before the agent's remote description was set.**
The agent's `handleOffer` (`agent/electron/renderer/capture.ts`) awaits
`getCaptureStream()` — an IPC round-trip plus `getUserMedia` — *before*
calling `setRemoteDescription`. But `peerConnection` is assigned
immediately, so `handleIceCandidate` would see a non-null peer connection
and call `addIceCandidate` on it before there was a remote description to
add candidates to, throwing `InvalidStateError: The remote description was
null`. Reproduced by connecting from this web app; the mobile app has the
exact same code path and would have hit it too, just not yet been tested
on-device. **Fixed** in the agent by queuing ICE candidates that arrive
before `setRemoteDescription` resolves, then flushing the queue right after
— the standard pattern for this well-known WebRTC race.

**2. The offer never requested video.** `webrtcSession.ts`'s `connect()`
called `createOffer()` with no options and no transceivers added — under
Unified Plan (the only mode modern browsers support), that produces an SDP
offer with **no `m=video` section at all**. The agent's answer therefore
had nothing to attach its screen-share track to, even though it tried. The
connection still reached `connectionState: "connected"` (the data channels'
SCTP association is enough for that), which is what made this sneaky: no
errors anywhere, ICE succeeded, just no video ever arrived. Confirmed by
adding a temporary log to `ontrack` and seeing it simply never fire.
**Fixed** by calling `pc.addTransceiver("video", { direction: "recvonly" })`
before creating the offer. Applied the identical fix to
`mobile-app/src/lib/webrtcSession.ts`, which had the exact same bug and
would have failed identically on a real device.

Both bugs were invisible from `tsc`/lint/build — they only showed up by
actually running the full stack together, which is why "Verified so far"
below matters more than the type-checks.

## Verified so far

Ran the real backend, the real Electron agent, and this app's dev server
together, driven through the browser pane (not a mock):

1. **Devices page** showed the real agent (`Hazem-Desktop`), online, with
   its real LAN device count.
2. **Remote screen**: clicked into it, saw the actual live desktop render
   in the `<video>` element (screenshot-confirmed) — after fixing bug #2
   above, which was caught by this exact test.
3. **Mouse control**: clicked at two different points in the video surface
   and independently checked the real OS cursor position via PowerShell
   before/after (outside the app, not trusting its own state) —
   `(40,40)` in a 280×360 surface landed the cursor at `(274,121)` on the
   1920×1080 screen, matching the ratio math (`40/280 × 1920 ≈ 274`,
   `40/360 × 1080 ≈ 121`) almost exactly.
4. **File browser**: listed real quick-access folders and drives, drilled
   into the real Desktop folder, and downloaded a real file
   (`notes.txt`) — the app logged an exact byte count (44 bytes) that
   matches `wc -c` on the actual file on disk.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create an account, then press "Link a PC" and
enter the code shown by the agent. When testing from another device, open
"Server settings" and use your PC's LAN IP (e.g. `http://192.168.1.50:8080`).

Type-check: `npx tsc --noEmit` · Lint: `npx eslint` · Production build:
`npm run build`

## What's next

- Full keyboard key-name mapping on the agent side (see
  `agent/README.md`'s "What's next" — this app already sends real
  `KeyboardEvent.key` values, same open item as the mobile app).
- Streaming downloads to disk instead of buffering in memory
  (`fileDownloader.ts`'s doc comment covers the File System Access API path
  for Chromium browsers specifically).

## Home page and downloads

`/` is a public landing page (`src/app/page.tsx`) that explains the product
and offers the downloads. The signed-in app lives under `src/app/(app)/`:
`/devices`, `/remote/[id]` and `/files/[id]`.

All download links are in **`src/config/downloads.ts`** — put the real URLs
there when you publish. Empty URLs show "Coming soon". The Android QR code is
generated at build time from the Play Store URL, and `android.published`
switches on the "Get it on Google Play" button.
