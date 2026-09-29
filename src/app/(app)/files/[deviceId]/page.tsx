"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRelay, type DownloadProgress } from "@/lib/relayContext";
import { saveBlobAs } from "@/lib/fileDownloader";
import type { FileEntry } from "@/lib/protocol/fileProtocol";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function FilesPage() {
  const router = useRouter();
  const { listFiles, downloadFile, cancelDownload } = useRelay();

  const [pathStack, setPathStack] = useState<Array<string | null>>([null]);
  const currentPath = pathStack[pathStack.length - 1] ?? null;

  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [download, setDownload] = useState<DownloadProgress | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(
    (path: string | null) => {
      setLoading(true);
      setError(null);
      listFiles(path)
        .then(setEntries)
        .catch((err) => setError(err instanceof Error ? err.message : "failed to list directory"))
        .finally(() => setLoading(false));
    },
    [listFiles]
  );

  useEffect(() => {
    // Intentional: this is the standard "fetch when the path changes"
    // effect — load() kicks off the request and its own .then/.catch
    // update state asynchronously; the synchronous setLoading(true) at its
    // start is what the request/response UI actually needs to render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(currentPath);
  }, [currentPath, load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const openEntry = (entry: FileEntry) => {
    if (entry.isDirectory) {
      setPathStack((stack) => [...stack, entry.path]);
      return;
    }
    setDownload({ name: entry.name, receivedBytes: 0, totalBytes: entry.size });
    downloadFile(entry.path, setDownload)
      .then(({ blob, name }) => {
        setDownload(null);
        saveBlobAs(blob, name);
        setToast(`Downloaded ${name}`);
      })
      .catch((err) => {
        setDownload(null);
        setToast(`Download failed: ${err instanceof Error ? err.message : String(err)}`);
      });
  };

  const goUp = () => {
    if (pathStack.length > 1) setPathStack((stack) => stack.slice(0, -1));
    else router.back();
  };

  return (
    <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={goUp} className="text-sm font-semibold rounded-lg bg-[#262b35] px-3 py-1.5">
          ← Back
        </button>
        <p className="text-sm text-[#8a93a3] truncate">{currentPath ?? "Quick access"}</p>
      </div>

      {download && (
        <div className="flex items-center justify-between gap-3 bg-[#1c2740] rounded-xl px-3 py-2.5 mb-3">
          <p className="text-xs text-[#d7dbe3] truncate">
            Downloading {download.name} — {formatBytes(download.receivedBytes)}
            {download.totalBytes > 0 ? ` / ${formatBytes(download.totalBytes)}` : ""}
          </p>
          <button
            onClick={() => {
              cancelDownload();
              setDownload(null);
            }}
            className="text-xs font-semibold text-[#ff9a5c] whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}

      {toast && <div className="text-xs text-[#b7bec9] bg-[#171b22] rounded-lg px-3 py-2 mb-3">{toast}</div>}

      {loading ? (
        <p className="text-sm text-[#6b7280] text-center mt-10">Loading…</p>
      ) : error ? (
        <p className="text-sm text-[#ff9a5c] text-center mt-10">{error}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-[#6b7280] text-center mt-10">This folder is empty.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[#1c2029]">
          {entries.map((entry) => (
            <li key={entry.path}>
              <button
                onClick={() => openEntry(entry)}
                className="w-full flex items-center gap-3 py-3 text-left hover:bg-[#12141a] transition-colors"
              >
                <span className="text-xl">{entry.isDirectory ? "📁" : "📄"}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-sm">{entry.name}</span>
                  {!entry.isDirectory && (
                    <span className="block text-xs text-[#6b7280] mt-0.5">{formatBytes(entry.size)}</span>
                  )}
                </span>
                {!entry.isDirectory && <span className="text-xs font-semibold text-[#5b8def]">Download</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
