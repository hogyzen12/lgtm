import React from "react";
import { HelioCheckout } from "@heliofi/checkout-react";

export type HelioPayMethod = "crypto" | "fiat";

export type HelioPayModalProps = {
  open: boolean;
  onClose: () => void;

  /** Which button the user clicked */
  method: HelioPayMethod;

  /** Cart subtotal (USD). Must be a positive number. */
  amountUsd: number;

  /** Optional line items for metadata */
  lines?: { sku?: string; name: string; qty: number; unitUsd: number }[];

  /** Client-side optimistic success callback (still set up webhooks server-side) */
  onSuccess: (payment: unknown) => void;

  /** Optional cancel */
  onCancel?: () => void;

  /** Dynamic-pricing paylink ID (dashboard) */
  paylinkId?: string; // default comes from env or fallback
};

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Card */}
      <div className="relative w-auto max-w-md max-h-[90vh] mx-auto overflow-y-auto scrollbar-hide">
        <div className="relative rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-1">
          {children}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function HelioPayModal({
  open,
  onClose,
  method,
  amountUsd,
  lines: _lines = [],
  onSuccess,
  onCancel,
  paylinkId,
}: HelioPayModalProps) {
  if (!open) return null;

  // Prefer explicit prop → env → fallback ID you provided
  const id =
    paylinkId ||
    (import.meta.env.VITE_HELIO_PAYLINK_ID as string | undefined) ||
    "6913f286a438059a7e340339"; // ensure this link has Dynamic Pricing enabled

  // Clamp & format amount to 2 decimals, as string
  const amount = String(Math.max(0, Math.round(amountUsd * 100) / 100));

  return (
    <ModalShell onClose={onClose}>
      <HelioCheckout
        config={{
          paylinkId: id,
          // Dynamic pricing — Helio will use this exact amount
          amount,
          // Theme from your dashboard snippet
          theme: { themeMode: "dark" },
          primaryColor: "#FA8500",
          neutralColor: "#5A6578",
          display: "inline",
          // Prefer method when link supports both
          primaryPaymentMethod: method,
          // Events
          onStartPayment: () => console.log("Starting payment"),
          onPending: (evt) => console.log("Payment pending", evt),
          onSuccess: (evt) => {
            console.log("Payment success", evt);
            try {
              onSuccess(evt);
            } finally {
              onClose();
            }
          },
          onCancel: () => {
            console.log("Cancelled payment");
            onCancel?.();
            onClose();
          },
          onError: (err) => {
            console.log("Helio error", err);
            // keep modal open so the user can retry/close
          },
        }}
      />
    </ModalShell>
  );
}
