import { PrismaClient, users } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
    await seed_admin();
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

var admin: users

async function seed_admin() {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash('Admin123', salt)
  
    admin = await prisma.users.upsert({
      where: {
        username: 'admin'
      },
      update: {},
      create: {
        username: 'admin',
        password: hashedPassword,
        phone: `087886250948`,
        address: `Cakung, Jakarta Timur`,
        role: `admin`
      }
    })
  }
  
  