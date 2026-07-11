import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, thumbnailUrl, techniqueScore, subScores, rawMeasurements, coaching } = body;

  const kickSession = await prisma.kickSession.create({
    data: {
      userId: session.user.id,
      title: title ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      status: "complete",
      techniqueScore: techniqueScore ?? null,
      subScoresJson: subScores ? JSON.stringify(subScores) : null,
      rawMeasurementsJson: rawMeasurements ? JSON.stringify(rawMeasurements) : null,
      coachingJson: coaching ? JSON.stringify(coaching) : null,
    },
  });

  return NextResponse.json(kickSession);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.kickSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      title: true,
      thumbnailUrl: true,
      status: true,
      techniqueScore: true,
      subScoresJson: true,
      coachingJson: true,
      rawMeasurementsJson: true,
    },
  });

  return NextResponse.json(sessions);
}
