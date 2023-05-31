import { Request, Response } from 'express';
import { PrismaClient, media } from '@prisma/client';
import { getProductCategoryId } from './helper';
import multer from 'multer';
import faker from 'faker';

const prisma = new PrismaClient();
const upload = multer({ dest: 'images/' });
const path = require('path');
const fs = require('fs');

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductCategory: {
          select: {
            category: {
              select: {
                name: true
              }
            }
          }
        },
        Media: {
          select: {
            url: true
          }
        },
        UserProduct: {
          select: {
            user: {
              select: {
                username: true
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
          select: {
            category: {
              select: {
                name: true
              }
            }
          }
        },
        Media: {
          select: {
            url: true
          }
        },
        UserProduct: {
          select: {
            user: {
              select: {
                uuid: true,
                username: true,
              }
            }
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
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

export const getProductByuser = async (req: any, res: any) => {
  try {
    const { uuid } = req.params

    const usergetId = await prisma.users.findFirst(
      {
        where: { uuid },
        //dapat userid????
        select: {
          user_id: true
        }
      });

    const product = await prisma.userproduct.findMany({
      where: {
        userId: usergetId.user_id
      },
      select: {
        id: true,
        productId: true,
        user: {
          select: {
            uuid: true,
            username: true,
          }
        },
        product: {
          select: {
            name: true,
            price: true,
            quantity: true,
            desc: true,
            ProductCategory: {
              select: {
                category: {
                  select: {
                    name: true,
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
        }
      }
    })
    res.json({
      status: 200,
      message: 'Getting Product by user_id',
      data: product
    })

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

export const createProduct = async (req: any, res: any) => {
  try {
    upload.any()(req, res, async (err: any) => {
      if (err) {
        console.error('Error uploading files:', err);
        return res.status(500).json({
          status: 500,
          message: 'Failed to upload files',
          data: err.message,
        });
      }


      const { name, price, quantity, desc, categoryId } = req.body;
      const { uuid } = req.params;

      const usergetId = await prisma.users.findFirst({
        where: { uuid },
        select: {
          user_id: true
        }
      });

      if (!usergetId) {
        return res.status(404).json({
          status: 404,
          message: 'User not found',
          data: null,
        });
      }

      const url = req.files.map((file: any) => {
        const fileExtension = path.extname(file.originalname);
        const randomName = faker.datatype.uuid();
        const destinationPath = path.join('images', `${randomName}${fileExtension}`);

        fs.renameSync(file.path, destinationPath);

        // Menghasilkan URL akses ke file yang di-upload

        return destinationPath;
      });

      const product = await prisma.product.create({
        data: {
          name,
          price: parseInt(price),
          quantity: parseInt(quantity),
          desc,
          Media: {
            createMany: {
              data: url.map((url: string) => ({ url }))
            }
          },
          ProductCategory: {
            createMany: {
              data: categoryId.map((categoryId: string) => ({
                categoryId: parseInt(categoryId),
              })),
            }
          },
          UserProduct: {
            create: {
              userId: usergetId.user_id
            }
          }
        },
        include: {
          ProductCategory: {
            select: {
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          Media: {
            select: {
              url: true
            }
          },
          UserProduct: {
            select: {
              user: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      });

      res.json({
        status: 201,
        message: 'Product created successfully',
        data: {
          ...product,
        },
      });
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to create product',
      data: error.message,
    });
  }
};



export const editProduct = async (req: any, res: any) => {
  try {
    // Menggunakan multer untuk mengunggah file-file dalam permintaan
    upload.any()(req, res, async (err: any) => {
      if (err) {
        // Jika terjadi kesalahan dalam mengunggah file, tangkap dan beri respons dengan pesan kesalahan
        console.error('Error uploading files:', err);
        return res.status(500).json({
          status: 500,
          message: 'Failed to upload files',
          error: err.message,
        });
      }

      const { id } = req.params;
      const product_id = Number(id); // Convert id to number

      const uuid = req.params.uuid;
      console.log(uuid);

      const usergetId = await prisma.users.findFirst({
        where: { uuid },
        select: {
          user_id: true
        }
      });
      const validUser = await prisma.userproduct.findFirst({
        where: {
          productId: product_id,
          userId: usergetId.user_id
        },
      })

      if (!validUser) {
        return res.status(404).json({
          status: 404,
          message: 'Invalid user',
        });
      }

      const { name, price, quantity, desc, categoryId } = req.body;

      // Check if the product with the given ID exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          product_id: product_id,
        },
      });

      if (!existingProduct) {
        // Jika produk tidak ditemukan, beri respons dengan pesan bahwa produk tidak ditemukan
        return res.status(404).json({
          status: 404,
          message: 'Product not found',
        });
      }

      // Jika categoryId tidak null tetapi kategori tidak ditemukan, tangkap dan beri respons dengan pesan kesalahan
      if (categoryId) {
        const existingCategory = await prisma.category.findUnique({
          where: {
            category_id: parseInt(categoryId),
          },
        });
        if (!existingCategory) {
          return res.status(404).json({
            status: 404,
            message: 'Category not found',
          });
        }
      }

      // Build the data object for updating specific fields
      const updateData: any = {
        ...(name && { name }),
        ...(price && { price: parseInt(price) }),
        ...(quantity && { quantity: parseInt(quantity) }),
        ...(desc && { desc }),
      };

      const categoryData: any = {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
      };

      const url = req.files.map((file: any) => {
        if (file) {
          const fileExtension = path.extname(file.originalname);
          const randomName = faker.datatype.uuid();
          const destinationPath = path.join('images', `${randomName}${fileExtension}`);

          fs.renameSync(file.path, destinationPath);

          // Menghasilkan URL akses ke file yang di-upload

          return destinationPath;
        }

        return null;
      });
      // Menghapus gambar-gambar lama terkait produk yang akan diupdate
      if (url.length > 0) {
        const oldImage = await prisma.media.findMany({
          where: { productId: product_id },
          select: {
            url: true,
          },
        });

        const oldImageUrls = oldImage.map((media) => media.url);

        oldImageUrls.forEach((url) => {
          if (url && fs.existsSync(url)) {
            fs.unlinkSync(url);
            console.log(`Deleted file: ${url}`);
          } else if (url) {
            console.log(`File not found: ${url}. Skipping deletion.`);
          }
        });
      }


      // Update the product
      const updatedProduct = await prisma.product.update({
        where: {
          product_id: product_id,
        },
        data: {
          ...(categoryId && {
            ProductCategory: {
              deleteMany: {},
              createMany: {
                data: categoryId.map((categoryId: string) => ({ categoryId: parseInt(categoryId) })),
              },
            },
          }),
          ...(url.length > 0 && {
            Media: {
              deleteMany: {},
              createMany: {
                data: url.map((url: string) => ({ url })),
              },
            },
          }),
          ...updateData,
        },
        include: {
          ProductCategory: {
            select: {
              id: true,
              category: {
                select: {
                  category_id: true,
                  name: true,
                },
              },
            },
          },
          Media: {
            select: {
              url: true,
            },
          },
          UserProduct: {
            select: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      });

      // Beri respons dengan produk yang telah diperbarui
      res.json({
        status: 200,
        message: 'Product updated successfully',
        data: {
          ...updatedProduct,
        },
      });
    });
  } catch (error) {
    console.error('Error updating product:', error);
    // Jika terjadi kesalahan saat memperbarui produk, beri respons dengan pesan kesalahan
    res.status(500).json({
      status: 500,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};



export const categories = async (req: any, res: any) => {
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

export const productcategories = async (req: any, res: any) => {
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
}

export const getMedia = async (req: any, res: any) => {
  try {
    const categories = await prisma.media.findMany();

    res.json({
      status: 200,
      message: 'media retrieved successfully',
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

export const userprod = async (req: any, res: any) => {
  try {
    const categories = await prisma.userproduct.findMany();

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

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    const oldImage = await prisma.media.findMany({
      where: { productId: productId },
      select: {
        url: true,
      },
    })

    const oldImageUrls = oldImage.map((media) => media.url);

        oldImageUrls.forEach((url) => {
          if (url && fs.existsSync(url)) {
            fs.unlinkSync(url);
            console.log(`Deleted file: ${url}`);
          } else if (url) {
            console.log(`File not found: ${url}. Skipping deletion.`);
          }
        });


      // Hapus relasi produk dengan kategori di tabel bridge (ProductCategory)
      await prisma.productcategory.deleteMany({
        where: {
          productId: productId
        },
      });

    await prisma.media.deleteMany({
      where: { productId: productId }
    });

    await prisma.userproduct.deleteMany({
      where: { productId: productId },
    })

    // Hapus produk dari tabel produk (Product)
    const deletedProduct = await prisma.product.delete({
      where: {
        product_id: productId
      },
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

// export const deleteDetail = async (req: Request, res: Response) => {
//   try {
//     const productId = parseInt(req.params.id);

//     // Hapus relasi produk dengan kategori di tabel bridge (ProductCategory)
//     await prisma.productcategory.deleteMany({
//       where: {
//         productId: productId,
//       },
//     });

//     await prisma.media.delete({
//       where: { id: productId },
//     });

//     await prisma.userproduct.deleteMany({
//       where: { productId: productId },
//     })

//     // Hapus produk dari tabel produk (Product)
//     const deletedProduct = await prisma.product.delete({
//       where: {
//         product_id: productId
//       },
//     });

//     res.json({
//       status: 200,
//       message: 'Product deleted successfully',
//       data: deletedProduct
//     });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({
//       status: 500,
//       message: 'Failed to delete product',
//       data: null
//     });
//   }
// };
