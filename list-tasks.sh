npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tasks = await prisma.campaignTask.findMany();
  console.log(tasks);
}
main().finally(() => prisma.\$disconnect());
"
