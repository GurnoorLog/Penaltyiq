import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (!backendUrl) {
    return NextResponse.json(
      { detail: "The analysis backend is not configured. Set NEXT_PUBLIC_API_BASE in Vercel environment variables." },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  const target = new URL(`/api/${path.join("/")}`, backendUrl);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "The analysis backend is unavailable." }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
