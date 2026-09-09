npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const project = await prisma.project.create({
    data: { name: 'Test Project' },
  });
  const campaign = await prisma.campaign.create({
    data: {
      projectId: project.id,
      title: 'Test Campaign',
      slug: 'test-campaign',
      description: 'A test campaign for participation testing',
      status: 'LIVE',
      winnerCount: 1,
      rewardDescription: '100 USDC',
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Campaign created:', campaign.id);
}
main().finally(() => prisma.\$disconnect());
"
