import { PrismaClient, productcategory } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProductCategoryId(productId: number, categoryId: number): Promise<number | null> {
  const productCategory: productcategory | null = await prisma.productcategory.findFirst({
    where: {
      productId: productId,
      categoryId: categoryId,
    },
  });

  return productCategory?.id || null;
}
