import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
    const scene = await prisma.tour_scenes.findFirst({
        where: { id: 'scene2' },
        include: { hotspots: true }
    })
    console.log(JSON.stringify(scene, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
