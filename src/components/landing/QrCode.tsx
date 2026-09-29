import QRCode from "qrcode";

/**
 * Server component: the QR code is rendered to an SVG at build time, so the
 * page ships no QR library to the browser. The SVG comes from our own
 * config value, not user input, so injecting it is safe.
 */
export async function QrCode({ value, size = 168, label }: { value: string; size?: number; label: string }) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#0c0d10", light: "#ffffff" },
  });
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-xl bg-white p-2 shadow-[0_0_0_1px_#262b35]"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg width="100%" height="100%" ') }}
    />
  );
}
