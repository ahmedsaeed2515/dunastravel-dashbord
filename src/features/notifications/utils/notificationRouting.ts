import { InAppNotificationItem } from "../api/notificationsApi";

export interface NotificationHighlightEventDetail {
  referenceCode?: string;
  highlightId: string;
  category?: string;
}

/**
 * Extracts a booking reference code (e.g., BKG-C08YQ0) from notification fields.
 */
export function extractNotificationReference(item: InAppNotificationItem): string | null {
  // 1. Direct entityId if it looks like a booking reference
  if (item.entityId && /^BKG-[A-Z0-9_-]+/i.test(item.entityId.trim())) {
    return item.entityId.trim().toUpperCase();
  }

  // 2. Metadata reviewId or referenceCode
  const meta = item.metadata as Record<string, unknown> | null;
  if (meta) {
    if (typeof meta.reviewId === "string" && meta.reviewId.trim()) {
      return meta.reviewId.trim();
    }
    const fromMeta = meta.referenceCode || meta.bookingReferenceCode || meta.bookingId;
    if (typeof fromMeta === "string" && /^BKG-[A-Z0-9_-]+/i.test(fromMeta.trim())) {
      return fromMeta.trim().toUpperCase();
    }
  }

  // 3. Scan title and message for #BKG-... or BKG-...
  const combined = `${item.title || ""} ${item.message || ""}`;
  const match = combined.match(/#?(BKG-[A-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // 4. If entityId is set (even if not BKG), return it
  if (item.entityId && item.entityId.trim()) {
    return item.entityId.trim();
  }

  return null;
}

/**
 * Determines the target route and query parameters for an in-app notification.
 */
export function resolveNotificationTarget(item: InAppNotificationItem, currentLocale: string = "ar"): string {
  const validLocale = ["en", "ar", "es", "pt", "it"].includes(currentLocale) ? currentLocale : "ar";
  const refCode = extractNotificationReference(item);

  const cat = (item.category || "").toUpperCase();
  const titleAndMsg = `${item.title || ""} ${item.message || ""}`.toLowerCase();
  const meta = item.metadata as Record<string, unknown> | null;

  // Check for Reviews first to avoid collision with general TOUR category
  const isReview =
    item.entityType === "TOUR_REVIEW" ||
    item.entityType === "REVIEW" ||
    item.deepLink?.includes("/admin/reviews") ||
    titleAndMsg.includes("review") ||
    titleAndMsg.includes("تقييم") ||
    Boolean(meta?.reviewId);

  if (isReview) {
    const reviewId = (meta?.reviewId as string) || item.entityId || refCode;
    const params = new URLSearchParams();
    if (reviewId) {
      params.set("reviewId", reviewId);
      params.set("highlight", reviewId);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return `/${validLocale}/admin/reviews${queryString}`;
  }

  const isPaymentOrRefund =
    cat === "PAYMENT" ||
    titleAndMsg.includes("refund") ||
    titleAndMsg.includes("payment") ||
    titleAndMsg.includes("دفع") ||
    titleAndMsg.includes("استرداد");

  const isBooking =
    cat === "BOOKING" ||
    titleAndMsg.includes("booking") ||
    titleAndMsg.includes("حجز");

  const isInquiry =
    cat === "INQUIRY" ||
    titleAndMsg.includes("inquiry") ||
    titleAndMsg.includes("استفسار");

  const isTour =
    cat === "TOUR" ||
    titleAndMsg.includes("tour") ||
    titleAndMsg.includes("جولة") ||
    titleAndMsg.includes("رحلة");

  let basePath = "";
  let hash = "";

  if (isPaymentOrRefund) {
    basePath = "/admin/finance";
    hash = "#payments";
  } else if (isBooking) {
    basePath = "/admin/bookings";
  } else if (isInquiry) {
    basePath = "/admin/inquiries";
  } else if (isTour) {
    basePath = "/admin/tours";
  } else if (item.deepLink) {
    let rawLink = item.deepLink.trim();
    if (rawLink.includes("/admin/crm/inquiries")) {
      rawLink = rawLink.replace("/admin/crm/inquiries", "/admin/inquiries");
    }
    basePath = rawLink.split("?")[0].split("#")[0];
  } else {
    basePath = "/admin/notifications";
  }

  const cleanPath = basePath.startsWith("/") ? basePath : `/${basePath}`;

  const params = new URLSearchParams();
  if (refCode) {
    params.set("search", refCode);
    params.set("highlight", refCode);
  } else if (item.entityId) {
    params.set("search", item.entityId);
    params.set("highlight", item.entityId);
  } else {
    params.set("highlight", item.id);
  }

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return `/${validLocale}${cleanPath}${queryString}${hash}`;
}

/**
 * Dispatches a client-side event so components already mounted can immediately react and highlight.
 */
export function emitNotificationHighlight(
  detailOrItem: NotificationHighlightEventDetail | InAppNotificationItem
): void {
  if (typeof window === "undefined") return;
  try {
    const detail: NotificationHighlightEventDetail =
      "highlightId" in detailOrItem
        ? detailOrItem
        : {
            highlightId:
              extractNotificationReference(detailOrItem) ||
              detailOrItem.entityId ||
              detailOrItem.id,
            referenceCode: extractNotificationReference(detailOrItem) || undefined,
            category: detailOrItem.category,
          };

    const event = new CustomEvent<NotificationHighlightEventDetail>(
      "dunas:notification-highlight",
      {
        detail,
        bubbles: true,
        cancelable: true,
      }
    );
    window.dispatchEvent(event);
  } catch (err) {
    console.error("Failed to emit notification highlight event:", err);
  }
}
