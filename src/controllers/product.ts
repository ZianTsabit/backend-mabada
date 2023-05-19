import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductCategory: {
          select : {
            category : {
              select : {
                name : true
              }
            }
          }
        },
        Media: {
          select: {
            url: true
          }
        },
        UserProduct : {
          select: {
            user : {
              select : {
                username : true
              }
            }
          },
        }
      }
    });    
    
    res.json({
      status: 200,
      message: 'Products fetched successfully',
      data: products
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch products',
      data: null,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: {
        product_id: productId
      },
      include: {
        ProductCategory: {
          select : {
            category : {
              select : {
                name : true
              }
            }
          }
        },
        Media: {
          select: {
            url: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: null
      });
    }


    res.json({
      status: 200,
      message: 'Product fetched successfully',
      data: product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch product',
      data: null
    });
  }
};


export const createProduct = async (req: any, res: any) => {
  try {
    const { name, price, quantity, desc, categoryId ,url} = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        quantity: parseInt(quantity),
        desc,
      },
      
    })
    const categoryIdNumber = parseInt(categoryId)
    await prisma.productcategory.create({
      data: {
        category: {
          connect: {
            category_id: categoryIdNumber
          }
        },
        product: {
          connect: {
            product_id: product.product_id
          }
        },
      }
    });

    
    await prisma.media.create({
      data : {
        url,
        product: {
          connect: {
            product_id: product.product_id
          }
        },
        
      }
    });


    res.json({
      status: 201,
      message: 'Product created successfully',
      data: {
        ...product,
        category: categoryIdNumber,
        media : {
          url : url
        }
      },
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to create product',
      data: null,
    });
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product_id = Number(id); // Convert id to number

    const { name, price, quantity, desc ,categoryId,url} = req.body;

    // Check if the product with the given ID exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        product_id: product_id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
      });
    }

    

    // Build the data object for updating specific fields
    const updateData: any = {
      ...(name && { name }),
      ...(price && { price: parseInt(price) }),
      ...(quantity && { quantity: parseInt(quantity) }),
      ...(desc && { desc }),
    };

    const categoryData: any ={
      ...(categoryId &&{categoryId : parseInt(categoryId)}),
    }

    const urlProduct :any = {
      ...(url &&{ url }),
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        product_id :product_id,
      },
      data: updateData,
    });
    
    await prisma.productcategory.updateMany({
      where: {
        productId: product_id,
      },
      data: categoryData,
    }),

    await prisma.media.updateMany({
      where : {
        productId: product_id,
      },
      data : urlProduct
    });

    

    res.json({
      status: 200,
      message: 'Product updated successfully',
      data: {
        ...updatedProduct,
        category : {
          name : categoryData
        },
        url : urlProduct,
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

export const categories =async (req:any,res:any) => {
  try {
    const categories = await prisma.category.findMany();

    res.json({
      status: 200,
      message: 'Categories retrieved successfully',
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

export const productcategories = async (req:any, res:any) => {
  try {
    const categories = await prisma.productcategory.findMany();

    res.json({
      status: 200,
      message: ' Retrieved successfully',
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
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    // Hapus relasi produk dengan kategori di tabel bridge (ProductCategory)
    await prisma.productcategory.deleteMany({
      where: {
        productId: productId
      }
    });

    // Hapus produk dari tabel produk (Product)
    const deletedProduct = await prisma.product.delete({
      where: {
        product_id: productId
      },
      include: {
        ProductCategory: true,
        Media: true
      }
    });

    res.json({
      status: 200,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to delete product',
      data: null
    });
  }
};

