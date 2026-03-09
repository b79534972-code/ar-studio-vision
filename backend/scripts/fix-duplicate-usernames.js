const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizeBaseName(name) {
  const trimmed = (name || '').trim();
  return trimmed || 'user';
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, createdAt: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  const usedNames = new Set(users.map((u) => (u.name || '').trim()).filter(Boolean));
  const seen = new Map();
  let updatedCount = 0;

  for (const user of users) {
    const currentName = normalizeBaseName(user.name);
    const currentSeen = seen.get(currentName) || 0;

    if (currentSeen === 0 && currentName === user.name) {
      seen.set(currentName, 1);
      continue;
    }

    if (currentSeen === 0 && currentName !== user.name) {
      let firstCandidate = currentName;
      if (usedNames.has(firstCandidate) && firstCandidate !== user.name) {
        firstCandidate = `${currentName}_${user.id.slice(0, 8)}`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { name: firstCandidate },
      });

      usedNames.delete((user.name || '').trim());
      usedNames.add(firstCandidate);
      seen.set(currentName, (seen.get(currentName) || 0) + 1);
      updatedCount += 1;
      continue;
    }

    let suffix = currentSeen + 1;
    let candidate = `${currentName}_${suffix}`;
    while (usedNames.has(candidate)) {
      suffix += 1;
      candidate = `${currentName}_${suffix}`;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name: candidate },
    });

    usedNames.delete((user.name || '').trim());
    usedNames.add(candidate);
    seen.set(currentName, currentSeen + 1);
    updatedCount += 1;
  }

  if (updatedCount > 0) {
    console.log(`[fix-duplicate-usernames] Updated ${updatedCount} user record(s).`);
  } else {
    console.log('[fix-duplicate-usernames] No duplicate usernames found.');
  }
}

main()
  .catch((error) => {
    console.error('[fix-duplicate-usernames] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
