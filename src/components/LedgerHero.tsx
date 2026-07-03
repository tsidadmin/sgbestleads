"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

type Row = { company: string; district: string; feed: string };

/** Fictional sample rows for the marketing ledger. */
const ROWS: Row[] = [
  { company: "Tembusu Logistics Pte Ltd", district: "Jurong East", feed: "NC" },
  { company: "Katong Bakes Pte Ltd", district: "Paya Lebar", feed: "FB" },
  { company: "Meridian Systems Pte Ltd", district: "Tanjong Pagar", feed: "HR" },
  { company: "Redhill Interiors LLP", district: "Bukit Merah", feed: "DG" },
  { company: "Straits Marine Holdings Pte Ltd", district: "Kallang", feed: "FS" },
  { company: "Novena Wellness Pte Ltd", district: "Toa Payoh", feed: "NC" },
  { company: "Harbourline Trading Pte Ltd", district: "Raffles Place", feed: "NC" },
  { company: "Bedok Rise Tea House Pte Ltd", district: "Ubi", feed: "FB" },
  { company: "Alexandra Engineering Pte Ltd", district: "Clementi", feed: "HR" },
  { company: "Gardenia Motors LLP", district: "Ang Mo Kio", feed: "DG" },
];

type Entry = { key: number; row: Row };

export default function LedgerHero() {
  const [entries, setEntries] = useState<Entry[]>(() =>
    ROWS.slice(0, 5).map((row, i) => ({ key: i, row }))
  );
  const counter = useRef(5);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = setInterval(() => {
      setEntries((prev) => {
        const key = counter.current;
        const row = ROWS[key % ROWS.length];
        counter.current += 1;
        return [{ key, row }, ...prev].slice(0, 5);
      });
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-[4px] border border-line bg-card shadow-[0_1px_0_rgba(20,27,34,0.05)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink">
          Live feed — this week
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-verify">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-verify" />
          Verifying
        </span>
      </div>
      <ul className="divide-y divide-line">
        {entries.map((e, i) => (
          <li key={e.key} className={i === 0 ? "row-in" : ""}>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="code-chip">{e.row.feed}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.row.company}</p>
                <p className="font-mono text-[11px] text-soft">{e.row.district}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] font-semibold text-verify">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                VERIFIED
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-line px-4 py-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-soft">
          Sample rows — fictional records
        </p>
      </div>
    </div>
  );
}
