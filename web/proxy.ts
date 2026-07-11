import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const path = request.nextUrl.pathname;

  if (path.startsWith("/start") || path.startsWith("/dashboard") || path.startsWith("/history")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/start/:path*", "/dashboard/:path*", "/history/:path*"],
};
