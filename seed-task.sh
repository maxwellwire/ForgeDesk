npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const task = await prisma.campaignTask.create({
    data: {
      campaignId: 'cmtuow9oq00279j0i6ra9ntb',
      type: 'POST',
      title: 'Post about the campaign',
      description: 'Share a post about this campaign',
      instructions: 'Post on X and include the campaign hashtag',
      required: true,
      sortOrder: 1,
    },
  });
  console.log('Task created:', task.id);
}
main().finally(() => prisma.\$disconnect());
"
