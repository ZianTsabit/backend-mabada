import { PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';

const prisma = new PrismaClient

export const getProdCat = async (req: any, res: any) => {
    try {
        const categories = await prisma.productcategory.findMany({
          select: {
            id: true,
            product: {
              select: {
                product_id: true,
                name: true,
              },
            },
            category: {
              select: {
                category_id: true,
                name: true,
              },
            }
          }
        });
        res.json({
          status: 200,
          message: 'Categories fetched successfully',
          data: categories,
        });
      } catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({
          status: 500,
          message: 'Failed to retrieve categories',
          error: error.message,
        });
      }
  };

  