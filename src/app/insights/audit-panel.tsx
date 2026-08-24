"use client";

import { useState } from "react";
import { Search, Play, FileSpreadsheet, Loader2, Sparkles, AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { saveInsightSnapshot, extractInsightMetrics } from "./actions";

type Creator = { id: string; name: string; handle: string | null; platform: string | null };
type AuditResult = Record<string, any>;

function pct(n: unknown) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return `${n.toFixed(1)}%`;
}

function num(n: unknown) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function consistencyColor(label: unknown) {
  const l = String(label ?? "").toLowerCase();
  if (l.includes("consistent") && !l.includes("in")) return "bg-lift/10 text-lift border-lift/20";
  if (l.includes("somewhat")) return "bg-paper/10 text-paper border-paper/20";
  if (l.includes("highly")) return "bg-amber/10 text-amber border-amber/20";
  return "bg-panel text-muted border-line";
}

export default function AuditPanel({ creators }: { creators: Creator[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [manualHandles, setManualHandles] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AuditResult> | null>(null);
  const [extractedMetricsMap, setExtractedMetricsMap] = useState<Record<string, any>>({});
  const [savedHandles, setSavedHandles] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const igCreators = creators.filter(
    (c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))
  );

  const filteredRoster = igCreators.filter(
    (c) =>
      c.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      (c.handle && c.handle.toLowerCase().includes(rosterSearch.toLowerCase()))
  );

  function toggle(handle: string) {
    setSelected((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  }

  function toggleSelectAll() {
    if (selected.length === filteredRoster.length) {
      setSelected([]);
    } else {
      setSelected(filteredRoster.map((c) => c.handle!).filter(Boolean));
    }
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
      setError("Pick at least one creator from your roster or paste a handle below.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    setSavedHandles([]);
    setExtractedMetricsMap({});

    try {
      const res = await fetch("/api/instagram-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "The scraper backend returned an error.");
        return;
      }

      const resObj: Record<string, AuditResult> = data.results ?? data;
      setResults(resObj);

      // Extract metrics and auto-save snapshots for roster matches
      const saved: string[] = [];
      const metricsMap: Record<string, any> = {};

      for (const [handle, rawData] of Object.entries(resObj)) {
        if (rawData && !rawData.error) {
          const metrics = await extractInsightMetrics(rawData);
          metricsMap[handle] = metrics;

          const savedInsight = await saveInsightSnapshot(handle, rawData);
          if (savedInsight) {
            saved.push(handle.toLowerCase());
          }
        }
      }
      setExtractedMetricsMap(metricsMap);
      setSavedHandles(saved);
    } catch {
      setError("Couldn't reach the scraper backend. If it's been idle, it may still be waking up — try again in a moment.");
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
    <div className="space-y-6">
      {/* Selection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roster Select Card */}
        {igCreators.length > 0 && (
          <div className="card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
                  Select From Roster ({selected.length} selected)
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-lift hover:underline font-mono"
                >
                  {selected.length === filteredRoster.length ? "Deselect all" : "Select all"}
                </button>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Filter roster creators..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="input pl-8 py-1.5 text-xs w-full"
                />
                <Search size={14} className="text-muted absolute left-2.5 top-2.5" />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-line rounded-lg p-2 bg-ink/40">
                {filteredRoster.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md hover:bg-ink cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.handle!)}
                        onChange={() => toggle(c.handle!)}
                        className="accent-lift"
                      />
                      <span className="font-medium text-paper">{c.name}</span>
                    </div>
                    <span className="text-muted font-mono text-[11px]">@{c.handle?.replace(/^@/, "")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Handles Card */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted block mb-3">
              Or Paste Handles Directly
            </span>
            <textarea
              className="input text-xs font-mono w-full"
              rows={4}
              placeholder="nasa, dysonusa, marquesbrownlee (comma or line separated)"
              value={manualHandles}
              onChange={(e) => setManualHandles(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-line">
            <button
              className="btn flex items-center gap-2"
              onClick={runAudit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Auditing... (up to 60s)</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Run Audit</span>
                </>
              )}
            </button>

            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-lift/10 text-lift border border-lift/20 hover:bg-lift/20 transition-colors"
              onClick={exportXlsx}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={14} />
                  <span>Export .xlsx</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="card p-4 bg-amber/10 border-amber/30 text-amber flex items-center gap-2 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Results Grid */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-semibold text-paper flex items-center gap-2">
              <Sparkles size={16} className="text-lift" />
              <span>Audit Results ({Object.keys(results).length} profiles)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results).map(([handle, rawObj]) => {
              const metrics = extractedMetricsMap[handle] ?? {};
              const isSaved = savedHandles.includes(handle.toLowerCase());

              return (
                <div key={handle} className="card p-5 space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-line">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-lift/10 border border-lift/20 text-lift flex items-center justify-center font-display font-bold text-xs">
                        @
                      </div>
                      <div>
                        <div className="font-display font-semibold text-paper text-sm flex items-center gap-2">
                          <span>@{handle}</span>
                          {isSaved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-lift/10 text-lift border border-lift/20">
                              <CheckCircle2 size={10} />
                              Auto-Saved
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted font-mono">Instagram Profile</div>
                      </div>
                    </div>

                    {metrics.consistencyLabel && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${consistencyColor(metrics.consistencyLabel)}`}>
                        {metrics.consistencyLabel}
                      </span>
                    )}
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-ink border border-line">
                      <div className="text-muted text-[10px] uppercase">Engagement Rate</div>
                      <div className="text-base font-semibold text-lift mt-0.5">{pct(metrics.engagementRate)}</div>
                    </div>

                    <div className="p-2.5 rounded bg-ink border border-line">
                      <div className="text-muted text-[10px] uppercase">Avg Views</div>
                      <div className="text-base font-semibold text-paper mt-0.5">{num(metrics.avgViews)}</div>
                    </div>

                    <div className="p-2.5 rounded bg-ink border border-line">
                      <div className="text-muted text-[10px] uppercase">Median Views</div>
                      <div className="text-sm font-medium text-paper mt-0.5">{num(metrics.medianViews)}</div>
                    </div>

                    <div className="p-2.5 rounded bg-ink border border-line">
                      <div className="text-muted text-[10px] uppercase">Avg Likes</div>
                      <div className="text-sm font-medium text-paper mt-0.5">{num(metrics.avgLikes)}</div>
                    </div>

                    <div className="p-2.5 rounded bg-ink border border-line">
                      <div className="text-muted text-[10px] uppercase">Avg Comments</div>
                      <div className="text-sm font-medium text-paper mt-0.5">{num(metrics.avgComments)}</div>
                    </div>

                    <div className="p-2.5 rounded bg-ink border border-line">
                      <div className="text-muted text-[10px] uppercase">Post Frequency</div>
                      <div className="text-sm font-medium text-paper mt-0.5">
                        {metrics.postingFrequencyDays != null ? `${num(metrics.postingFrequencyDays)}d avg` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Raw Inspector */}
                  <details className="group pt-2">
                    <summary className="text-xs text-muted cursor-pointer hover:text-lift flex items-center gap-1 font-mono">
                      <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                      <span>Raw JSON Response</span>
                    </summary>
                    <pre className="text-[11px] font-mono text-muted bg-ink p-3 rounded-lg border border-line mt-2 overflow-x-auto max-h-48">
                      {JSON.stringify(rawObj, null, 2)}
                    </pre>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
