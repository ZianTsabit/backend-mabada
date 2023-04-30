-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'user');
CREATE EXTENSION "uuid-ossp" SCHEMA public;
-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(255) NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "password" VARCHAR(255) NOT NULL,
    "role" "role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "product" (
    "product_id" SERIAL NOT NULL,
    "name" TEXT,
    "price" INTEGER,
    "quantity" INTEGER,
    "desc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "category" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productcategory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userproduct" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userproduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uuid" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productcategory" ADD CONSTRAINT "productcategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productcategory" ADD CONSTRAINT "productcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userproduct" ADD CONSTRAINT "userproduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userproduct" ADD CONSTRAINT "userproduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
