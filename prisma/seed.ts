import { PrismaClient, users } from '@prisma/client'
import bcrypt from 'bcrypt'
import faker from 'faker'
const prisma = new PrismaClient()

async function main() {
  await seed_admin();
  await seed_category();
  await seed_product();
  // await seed_productCategory();
  await seed_productuser();
  await seed_url();
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
      username: 'Zian'
    },
    update: {},
    create: {
      username: 'Zian',
      password: hashedPassword,
      phone: `087886250948`,
      address: `Cakung, Jakarta Timur`,
      role: `admin`
    },
  })
//   await prisma.users.create({
//     data : {
//       username : 'qowi',
//       password : hashedPassword,
//       phone : `087886250231`,
//       address : 'Bekasi',
//       role : 'user'
//     }
//   })

}

async function seed_category() {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home Decor'];

  const createdCategories = await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
    skipDuplicates: true,
  });
  
  console.log(`Seeded ${createdCategories.count} categories.`);
}

async function seed_product() {
  try {
    const categories = await prisma.category.findMany();
    const categoryIds = categories.map((category) => category.category_id);

    const products = Array.from({ length: 50 }).map(() => ({
      name: faker.commerce.productName(),
      price: faker.datatype.number({ min: 1000, max: 100000 }),
      quantity: faker.datatype.number({ min: 1, max: 200 }),
      desc: faker.lorem.sentence(),
    }));

    const createdProducts = await prisma.product.createMany({
      data: products.map((product) => ({
        ...product,
      })),
    });

    console.log(`Created products: ${createdProducts.count}`);

    // Generate random product-category associations
    const productIds = createdProducts.count;

    // Generate random product-category associations
    const productCategoryData = Array.from({ length: productIds}).map((productId) => ({
      productId : faker.datatype.number({min : 1, max: productIds}),
      categoryId: faker.random.arrayElement(categoryIds),
    }));

    const createdProductCategories = await prisma.productcategory.createMany({
      data: productCategoryData,
      skipDuplicates: false,
    });

    console.log(`Created product categories: ${createdProductCategories.count}`);
  } catch (error) {
    console.error('Error creating seed data:', error);
  }
}


// async function seed_productCategory() {
  
//   const ids = Array.from({length : 5 }).map((_,index)=>({
//     productId : index + 1,
//     categoryId : faker.datatype.number({min : 1, max :4}),
//   }));

//   const created = await prisma.productcategory.createMany({
//     data : ids,
//     skipDuplicates : true,
//   });
//   console.log(`Seeded ${created.count} product categories.`);


// };

async function seed_url() {
  const ids = Array.from({length : 50 }).map((_,index)=>({
    productId : index + 1,
    url : "images/e553328a-71ba-493a-9234-9e0926e22476.png",
  }));

  const urls = await prisma.media.createMany({
    data : ids,
    skipDuplicates : true,
  });
  console.log(`Seeded ${urls.count} url.`);

}

async function seed_productuser(){
  const ids = Array.from({length : 50 }).map((_,index)=>({
    userId : 1, 
    productId : faker.datatype.number({min : 1, max :50}),
  }));

  await prisma.userproduct.createMany({
    data : ids,
  })
};