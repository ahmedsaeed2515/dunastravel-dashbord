import QRCode from "qrcode";

/**
 * Encodes a Tag-Length-Value (TLV) field according to ETA (Egyptian Tax Authority) / ZATCA standard.
 */
export function encodeTlvTag(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(String(value ?? ""));
  const length = valueBytes.length;
  const result = new Uint8Array(2 + length);
  result[0] = tag;
  result[1] = length;
  result.set(valueBytes, 2);
  return result;
}

export interface EtaInvoiceTlvInput {
  sellerName?: string;
  taxId?: string;
  timestamp?: string | Date;
  total: number | string;
  tax: number | string;
}

/**
 * Generates the Base64-encoded TLV payload for an Egyptian Tax Authority compliant e-invoice.
 */
export function generateEtaTlvPayload({
  sellerName = "Dunas Travel (DMC Lic. #1882)",
  taxId = "692-481-209",
  timestamp,
  total,
  tax,
}: EtaInvoiceTlvInput): string {
  const ts = timestamp
    ? typeof timestamp === "string"
      ? timestamp
      : new Date(timestamp).toISOString()
    : new Date().toISOString();
  const totalStr = Number(total || 0).toFixed(2);
  const taxStr = Number(tax || 0).toFixed(2);

  const t1 = encodeTlvTag(1, sellerName);
  const t2 = encodeTlvTag(2, taxId);
  const t3 = encodeTlvTag(3, ts);
  const t4 = encodeTlvTag(4, totalStr);
  const t5 = encodeTlvTag(5, taxStr);

  const totalLength = t1.length + t2.length + t3.length + t4.length + t5.length;
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const tagBytes of [t1, t2, t3, t4, t5]) {
    combined.set(tagBytes, offset);
    offset += tagBytes.length;
  }

  let binary = "";
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Generates a data URL containing the QR code image for the ETA invoice.
 */
export async function generateEtaQrDataUrl(input: EtaInvoiceTlvInput): Promise<string> {
  const payload = generateEtaTlvPayload(input);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
