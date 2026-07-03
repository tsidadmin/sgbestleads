"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import type { Lead } from "@/lib/sample-leads";
import { fmtDate } from "@/lib/format";

export default function LeadsTable({
  leads,
  feedCode,
  feedName,
}: {
  leads: Lead[];
  feedCode: string;
  feedName: string;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) =>
      [l.company, l.contact, l.industry, l.district, l.signal, l.role].some(
        (v) => v.toLowerCase().includes(s)
      )
    );
  }, [q, leads]);

  function exportCsv() {
    const headers = [
      "Company",
      "UEN",
      "Industry",
      "District",
      "Contact",
      "Role",
      "Email",
      "Phone",
      "Signal",
      "Added",
    ];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filtered.map((l) =>
      [
        l.company,
        l.uen,
        l.industry,
        l.district,
        l.contact,
        l.role,
        l.email,
        l.phone,
        l.signal,
        fmtDate(l.added),
      ]
        .map(esc)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sg-best-leads_${feedCode.toLowerCase()}_${new Date()
      .toISOString()
      .slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-[4px] border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest">
            {feedName}
          </span>
          <span className="font-mono text-[11px] text-soft">
            {filtered.length} records
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter records"
              className="h-8 w-44 rounded-[3px] border border-line bg-paper pl-8 pr-3 text-xs focus:border-ink focus:outline-none sm:w-56"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="btn btn-dark h-8 px-3 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-widest text-soft">
              <th className="border-b border-line px-4 py-2.5 font-medium">Company</th>
              <th className="border-b border-line px-4 py-2.5 font-medium">Contact</th>
              <th className="border-b border-line px-4 py-2.5 font-medium">Email</th>
              <th className="border-b border-line px-4 py-2.5 font-medium">Phone</th>
              <th className="border-b border-line px-4 py-2.5 font-medium">District</th>
              <th className="border-b border-line px-4 py-2.5 font-medium">Signal</th>
              <th className="border-b border-line px-4 py-2.5 font-medium">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((l) => (
              <tr key={l.id} className="align-top hover:bg-wash/60">
                <td className="px-4 py-3">
                  <p className="font-semibold">{l.company}</p>
                  <p className="font-mono text-[11px] text-soft">
                    UEN {l.uen} · {l.industry}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p>{l.contact}</p>
                  <p className="text-xs text-soft">{l.role}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{l.email}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                  {l.phone}
                </td>
                <td className="px-4 py-3 text-xs">{l.district}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-[3px] bg-wash px-2 py-1 font-mono text-[11px]">
                    {l.signal}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-soft">
                  {fmtDate(l.added)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-soft">
                  No records match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
