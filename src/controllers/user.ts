import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import { productcategories } from "./product";

const prisma = new PrismaClient();
const fs = require("fs");

export const getUsers = async (req: any, res: any) => {
  const users = await prisma.users.findMany({
    select: {
      username: true,
      uuid: true,
      phone: true,
      address: true,
    },
  })

  return res.json({
    status: 200,
    message: "Users fetched successfully",
    data: users
  })
}

export const getUser = async (req: any, res: any) => {
  const { uuid } = req.params

  const user = await prisma.users.findFirst({
    where: {
      uuid: uuid
    }
  })

  return res.json({
    status: 200,
    message: "Sellers fetched successfully",
    data: user
  })
}

export const addSeller = async (req: any, res: any) => {
  const { username, password, phone, address } = req.body

  const user = await prisma.users.findFirst({
    where: {
      username: username
    }
  })

  if (user !== null) {
    return res.status(400).json({
      status: 400,
      message: "User already exists",
      data: null
    })
  } else {

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await prisma.users.create({
      data: {
        username: username,
        password: hashedPassword,
        phone: phone,
        address: address,
        role: "user"
      }
    })

    return res.json({
      status: 200,
      message: "User created successfully",
      data: newUser
    })
  }
}

export const editUser = async (req: any, res: any) => {
  const { uuid } = req.params
  const { username, password, phone, address } = req.body

  const updateData: any = {
    ...(username && { username }),
    ...(password && { password }),
    ...(address && { address }),
    ...(phone && { phone }),
  }

  const updateUser = await prisma.users.update({
    where: { uuid },
    data: updateData
  })

  return res.json({
    status: 200,
    message: 'Success',
    data: updateUser
  })

}


export const deleteUser = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // Hapus pengguna


    // Hapus semua relasi yang terkait dengan pengguna
    const productIDS = await prisma.userproduct.findMany({
      where: {
        userId: userId,
      },
      select: {
        productId: true,
      },
    });

    const productIdsToDelete = productIDS.map((item) => item.productId);

    const oldImage = await prisma.media.findMany({
      where: { productId : {
        in : productIdsToDelete
      } },
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

    await prisma.media.deleteMany({
      where: {
        productId: {
          in: productIdsToDelete
        }
      }
    })

    // Delete the products associated with the user
    await prisma.product.deleteMany({
      where: {
        product_id: {
          in: productIdsToDelete,
        },
      },
    });

    await prisma.users.delete({
      where: {
        user_id: userId,
      },
    });


    // Respon sukses
    res.json({
      status: 200,
      message: 'User deleted successfully',
      data: productIdsToDelete,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to delete user',
      data: null,
    });
  }
};
