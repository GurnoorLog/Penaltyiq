import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export function GET() {
  const filePath = path.join(process.cwd(), "public", "messi-dashboard.html");
  const html = readFileSync(filePath, "utf-8");
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
