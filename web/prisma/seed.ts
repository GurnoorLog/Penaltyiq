import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@penaltyiq.ai" },
    update: {},
    create: {
      email: "demo@penaltyiq.ai",
      name: "Demo User",
    },
  });

  const sessions = [
    { title: "Morning practice - right foot", techniqueScore: 78, status: "complete" },
    { title: "Evening session - plant focus", techniqueScore: 82, status: "complete" },
    { title: "Match simulation", techniqueScore: 71, status: "complete" },
    { title: "Recovery drill analysis", techniqueScore: 85, status: "complete" },
    { title: "Left foot practice", techniqueScore: 65, status: "complete" },
  ];

  for (const s of sessions) {
    await prisma.kickSession.create({
      data: {
        userId: user.id,
        title: s.title,
        techniqueScore: s.techniqueScore,
        status: s.status,
        subScoresJson: JSON.stringify({
          plant_leg_stability: 82,
          hip_rotation: 71,
          strike_leg_extension: 88,
          follow_through: 69,
          recovery_balance: 74,
        }),
        coachingJson: JSON.stringify({
          summary: "Strong hip rotation but the plant leg loses stability just after contact.",
          strengths: ["Excellent hip rotation generates strong power transfer."],
          tips: ["Add slightly more plant-knee flexion to improve post-contact stability."],
          drill: "Slow-motion plant-and-freeze drill: kick and hold your finishing position for 3 seconds, 10 reps.",
        }),
      },
    });
  }

  console.log("Seeded database with demo user and 5 sessions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
