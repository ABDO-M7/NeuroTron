import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Connecting to database...");
    const updated = await prisma.attempt.updateMany({
        data: {
            aiAnalysis: null
        }
    });
    console.log(`Cleared aiAnalysis on ${updated.count} attempts.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
