import { PrismaClient, users } from '@prisma/client'
import bcrypt from 'bcrypt'
import faker from 'faker'
const prisma = new PrismaClient()

async function main() {
  await seed_admin();
  await seed_product();
  await seed_category();
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
  const hashedPassword = await bcrypt.hash('admin', salt)

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

async function seed_product() {
  const products = Array.from({ length: 50 }).map(() => ({
    name: faker.commerce.productName(),
    price: faker.datatype.number({ min: 1000, max: 100000 }),
    quantity: faker.datatype.number({ min: 1, max: 200 }),
    desc: faker.lorem.sentence(),
  }));

  const createdProducts = await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });
  
}

async function seed_category() {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home Decor'];

  const createdCategories = await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
    skipDuplicates: true,
  });
  
  console.log(`Seeded ${createdCategories.count} categories.`);
}