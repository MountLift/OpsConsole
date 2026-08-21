import { NextResponse } from "next/server";

// Allow extra time for Render's free-tier cold start (can take 30–60s on first call)
export const maxDuration = 60;

export async function POST(req: Request) {
  const base = process.env.IG_SCRAPER_API_BASE;
  if (!base) {
    return NextResponse.json(
      { error: "IG_SCRAPER_API_BASE is not set in the environment." },
      { status: 500 }
    );
  }

  const body = await req.json();

  try {
    const upstream = await fetch(`${base}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error ?? "The scraper backend returned an error." },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Couldn't reach the scraper backend. If it's been idle, it may still be waking up (Render free tier) — try again in a moment.",
      },
      { status: 502 }
    );
  }
}
