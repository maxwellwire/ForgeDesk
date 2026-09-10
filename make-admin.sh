npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.update({
    where: { email: 'benjamincyril2005@gmail.com' },
    data: { isAdmin: true },
  });
  console.log('Now admin:', user.email, user.isAdmin);
}
main().finally(() => prisma.\$disconnect());
"
