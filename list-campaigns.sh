npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const campaigns = await prisma.campaign.findMany();
  console.log(campaigns);
}
main().finally(() => prisma.\$disconnect());
"
