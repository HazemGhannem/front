/**
 * Accumulates one in-flight download's chunks in memory and turns them into
 * a downloadable Blob on completion.
 *
 * Known limitation: unlike the agent's own chunked streaming (writes
 * straight to disk, see agent/electron/downloadManager.ts) or the mobile
 * app's FileHandle-based writer (mobile-app/src/lib/fileDownloader.ts),
 * this buffers the whole file in browser memory before it can be saved —
 * there's no widely-supported "stream straight to disk" API from a plain
 * `<a download>` flow. Fine for the file sizes this MVP targets; the File
 * System Access API's `showSaveFilePicker` + a writable stream would remove
 * this limit in Chromium browsers specifically, as a future improvement.
 */
export class ActiveDownload {
  private chunks: Uint8Array[] = [];
  receivedBytes = 0;

  private constructor(
    readonly requestId: string,
    readonly name: string,
    readonly totalBytes: number
  ) {}

  static begin(requestId: string, name: string, totalBytes: number): ActiveDownload {
    return new ActiveDownload(requestId, name, totalBytes);
  }

  writeChunk(chunk: Uint8Array): void {
    this.chunks.push(chunk);
    this.receivedBytes += chunk.byteLength;
  }

  finish(): Blob {
    return new Blob(this.chunks.map((c) => new Uint8Array(c)) as BlobPart[]);
  }
}

/** Triggers the browser's normal "save file" flow for a completed download. */
export function saveBlobAs(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
