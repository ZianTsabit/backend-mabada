import { Request, Response } from 'express';
import { PrismaClient, media } from '@prisma/client';
import multer from 'multer';
import faker from 'faker';
import { generateMediaUrl, getUserId } from './helper';

const prisma = new PrismaClient();
const upload = multer({ dest: 'images/' });
const path = require('path');
const fs = require('fs');
const { parseAccessToken } = require('./helper');

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
  
    // Menghitung offset berdasarkan halaman dan batasan item per halaman
    const offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

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
            productId: true,
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      skip: offset,
      take: parseInt(limit.toString())
    });

    //membuat link url dari helper
    const productsWithMediaUrl = products.map((product) => {
      const mediaUrls = product.Media.map((media) => media.url);
      const mediaLinks = mediaUrls.map((url) => generateMediaUrl(req, url));

      return {
        ...product,
        Media: mediaLinks,
      };
    });

    res.json({
      status: 200,
      message: 'Products fetched successfully',
      data: productsWithMediaUrl,
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch products',
      data: null
    });
  }
};

export const getProductByuser = async (req: any, res: any) => {
  try {
    const uuid = parseAccessToken(req);
    const userId = await getUserId(uuid)
    if (!userId) {
      return res.status(403).json({
        message: 'Unauthorized Access'
      });
    }
    const product = await prisma.userproduct.findMany({
      where: { userId },
      select: {
        product: {
          select: {
            uuid: true,
            name: true,
            price: true,
            desc: true,
            quantity: true,
          }
        }
      }
    })
    res.json({
      status: 200,
      message: 'User Products fetched successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch products',
      data: null
    });
  }
};

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

      const uuid = parseAccessToken(req);
      const userId = await getUserId(uuid)
      if (!userId) {
        return res.status(403).json({
          message: 'Unauthorized Access'
        });
      }

      const categoryIds = categoryId ? Array.isArray(categoryId) ? categoryId.map(id => parseInt(id)) : [parseInt(categoryId)] : [];
      const existingCategories = await prisma.category.findMany({
        where: {
          category_id: {
            in: categoryIds,
          },
        },
        select: {
          category_id: true,
        },
      });
      const existingCategoryIds = existingCategories.map(category => category.category_id);
      const missingCategoryIds = categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (missingCategoryIds.length > 0) {
        return res.status(404).json({
          status: 404,
          message: 'Category not found',
          missingCategoryIds,
        });
      }

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
              userId
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

      const mediaUrls = product.Media.map((media) => media.url);
      const mediaLinks = mediaUrls.map((url) => generateMediaUrl(req, url));

      const productWithMediaUrl = {
        ...product,
        Media: mediaLinks,
      };

      res.json({
        status: 200,
        message: 'Product by ID fetched successfully',
        data: productWithMediaUrl
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

      const { uuid } = req.params;

      const UserUuid = parseAccessToken(req);
      const userId = await getUserId(UserUuid)
      if (!userId) {
        return res.status(403).json({
          message: 'Unauthorized Access'
        });
      }
      const productId = await prisma.product.findUnique({
        where: { uuid },
        select: {
          product_id: true
        }
      })
      // make sure the product and userId are related in the userproduct
      const validUser = await prisma.userproduct.findFirst({
        where: {
          userId: userId,
          productId: productId.product_id
        }
      })

      if (!validUser) {
        return res.status(403).json({
          message: 'Unauthorized Access'
        });
      }

      const { name, price, quantity, desc, categoryId } = req.body;

      // Check if the product with the given ID exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          uuid
        },
        select: {
          product_id: true
        }
      });

      if (!existingProduct) {
        // Jika produk tidak ditemukan, beri respons dengan pesan bahwa produk tidak ditemukan
        return res.status(404).json({
          status: 404,
          message: 'Product not found',
        });
      }

      // Jika categoryId tidak null tetapi kategori tidak ditemukan, tangkap dan beri respons dengan pesan kesalahan
      const categoryIds = categoryId ? Array.isArray(categoryId) ? categoryId.map(id => parseInt(id)) : [parseInt(categoryId)] : [];
      const existingCategories = await prisma.category.findMany({
        where: {
          category_id: {
            in: categoryIds,
          },
        },
        select: {
          category_id: true,
        },
      });
      const existingCategoryIds = existingCategories.map(category => category.category_id);
      const missingCategoryIds = categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (missingCategoryIds.length > 0) {
        return res.status(404).json({
          status: 404,
          message: 'Category not found',
          missingCategoryIds,
        });
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
      // Menghapus gambar-gambar lama terkait produk yang akan diupdate, atau menghapus semua file yang ada di productId jika url kosong, jika file tidak ada tidak error
      if (url) {
        const oldImage = await prisma.media.findMany({
          where: { productId: existingProduct.product_id },
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
          uuid,
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
          ...(url && {
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
      const mediaUrls = updatedProduct.Media.map((media) => media.url);
      const mediaLinks = mediaUrls.map((url) => generateMediaUrl(req, url));

      const productWithMediaUrl = {
        ...updatedProduct,
        Media: mediaLinks,
      };

      res.json({
        status: 200,
        message: 'Product by ID fetched successfully',
        data: productWithMediaUrl
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
};

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
    const { uuid } = req.params
    const productId = await prisma.product.findUnique({
      where: { uuid },
      select: {
        product_id: true
      }
    });

    const oldImage = await prisma.media.findMany({
      where: { productId: productId.product_id },
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
        productId: productId.product_id
      },
    });

    await prisma.media.deleteMany({
      where: { productId: productId.product_id }
    });

    await prisma.userproduct.deleteMany({
      where: { productId: productId.product_id },
    })

    // Hapus produk dari tabel produk (Product)
    const deletedProduct = await prisma.product.delete({
      where: {
        product_id: productId.product_id
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

export const getProductById = async (req: any, res: any) => {
  try {
    const { uuid } = req.params;
    const products = await prisma.product.findUnique({
      where: {
        uuid
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

    if (!products) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found',
        data: null
      });
    }
    const mediaUrls = products.Media.map((media) => media.url);
    const mediaLinks = mediaUrls.map((url) => generateMediaUrl(req, url));

    const productWithMediaUrl = {
      ...products,
      Media: mediaLinks,
    };

    res.json({
      status: 200,
      message: 'Product by ID fetched successfully',
      data: productWithMediaUrl
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