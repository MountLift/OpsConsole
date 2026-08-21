"use client";

import { useState } from "react";

type Creator = { id: string; name: string; handle: string | null; platform: string | null };

type AuditResult = Record<string, any>;

function pct(n: unknown) {
  if (typeof n !== "number") return "—";
  return `${n.toFixed(1)}%`;
}

function num(n: unknown) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function consistencyColor(label: unknown) {
  const l = String(label ?? "").toLowerCase();
  if (l.includes("consistent") && !l.includes("in")) return "text-lift";
  if (l.includes("somewhat")) return "text-paper";
  if (l.includes("highly")) return "text-amber";
  return "text-muted";
}

export default function AuditPanel({ creators }: { creators: Creator[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [manualHandles, setManualHandles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AuditResult> | null>(null);
  const [exporting, setExporting] = useState(false);

  const igCreators = creators.filter(
    (c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))
  );

  function toggle(handle: string) {
    setSelected((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  }

  function allHandles() {
    const fromManual = manualHandles
      .split(/[\n,]/)
      .map((h) => h.trim().replace(/^@/, ""))
      .filter(Boolean);
    const fromSelected = selected.map((h) => h.replace(/^@/, ""));
    return Array.from(new Set([...fromSelected, ...fromManual]));
  }

  async function runAudit() {
    const handles = allHandles();
    if (handles.length === 0) {
      setError("Pick at least one creator or paste a handle.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/instagram-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResults(data.results ?? data);
    } catch {
      setError("Couldn't reach the scraper. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function exportXlsx() {
    const handles = allHandles();
    if (handles.length === 0) {
      setError("Pick at least one creator or paste a handle.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/instagram-audit/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      if (!res.ok) {
        setError("Export failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ig-audit-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {igCreators.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="text-xs text-muted uppercase tracking-wide mb-3">From your roster</div>
          <div className="grid grid-cols-3 gap-2">
            {igCreators.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-ink cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c.handle!)}
                  onChange={() => toggle(c.handle!)}
                  className="accent-lift"
                />
                <span>{c.name}</span>
                <span className="text-muted text-xs">{c.handle}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 mb-6">
        <div className="text-xs text-muted uppercase tracking-wide mb-2">Or paste handles</div>
        <textarea
          className="input"
          rows={2}
          placeholder="nasa, dysonusa (comma or newline separated)"
          value={manualHandles}
          onChange={(e) => setManualHandles(e.target.value)}
        />
        <div className="flex gap-3 mt-3">
          <button className="btn" onClick={runAudit} disabled={loading}>
            {loading ? "Running audit… (may take up to a minute)" : "Run audit"}
          </button>
          <button
            className="text-xs text-lift hover:underline"
            onClick={exportXlsx}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export .xlsx"}
          </button>
        </div>
        {error && <div className="text-xs text-amber mt-3">{error}</div>}
      </div>

      {results && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(results).map(([handle, r]) => (
            <div key={handle} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">@{handle}</div>
                {r?.consistency?.label && (
                  <div className={`text-xs font-mono ${consistencyColor(r.consistency.label)}`}>
                    {r.consistency.label}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm font-mono">
                <div className="text-muted text-xs">avg views</div>
                <div className="text-right">{num(r?.avgViews)}</div>
                <div className="text-muted text-xs">median views</div>
                <div className="text-right">{num(r?.medianViews)}</div>
                <div className="text-muted text-xs">avg likes</div>
                <div className="text-right">{num(r?.avgLikes)}</div>
                <div className="text-muted text-xs">avg comments</div>
                <div className="text-right">{num(r?.avgComments)}</div>
                <div className="text-muted text-xs">engagement rate</div>
                <div className="text-right text-lift">{pct(r?.engagementRate)}</div>
                <div className="text-muted text-xs">posting frequency</div>
                <div className="text-right">
                  {r?.postingFrequencyDays != null ? `${num(r.postingFrequencyDays)}d avg` : "—"}
                </div>
                {r?.viewToFollowerRatio != null && (
                  <>
                    <div className="text-muted text-xs">views / follower</div>
                    <div className="text-right">{pct(r.viewToFollowerRatio * 100)}</div>
                  </>
                )}
              </div>
              <details className="mt-3">
                <summary className="text-xs text-muted cursor-pointer hover:text-lift">
                  raw response
                </summary>
                <pre className="text-xs text-muted mt-2 overflow-x-auto">
                  {JSON.stringify(r, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
