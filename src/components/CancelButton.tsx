"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({
  id,
  planName,
}: {
  id: string;
  planName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function cancel() {
    const ok = window.confirm(
      `Cancel ${planName}? You keep access until the end of the current billing period.`
    );
    if (!ok) return;
    setLoading(true);
    await fetch("/api/subscriptions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={loading}
      className="btn btn-ghost h-9 shrink-0 px-4 text-xs"
    >
      {loading ? "Cancelling…" : "Cancel subscription"}
    </button>
  );
}
