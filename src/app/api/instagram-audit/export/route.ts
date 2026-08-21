export const maxDuration = 60;

export async function POST(req: Request) {
  const base = process.env.IG_SCRAPER_API_BASE;
  if (!base) {
    return new Response("IG_SCRAPER_API_BASE is not set in the environment.", { status: 500 });
  }

  const body = await req.json();

  const upstream = await fetch(`${base}/analyze/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(text || "Export failed.", { status: upstream.status });
  }

  const blob = await upstream.blob();

  return new Response(blob, {
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? 'attachment; filename="ig-audit.xlsx"',
    },
  });
}
