import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

export const createProduct = async (req: any, res: any) => {
    const { name, price, description, image, quantity} = req.body
        
    const newProduct = await prisma.product.create({
        data: {
            name: name,
            price: price,
            quantity: quantity,
            desc: description,
            Media: image,
        }
    })

    return res.json({
        status: 200,
        message: "Product created successfully",
        data: newProduct
    })
}

export const getProducts = async (req: any, res: any) => {
    const products = await prisma.product.findMany()

    return res.json({
        status: 200,
        message: "Products fetched successfully",
        data: products
    })
}

export const getProduct = async (req: any, res: any) => {
    const { uuid } = req.params
    
    const product = await prisma.product.findFirst({
        where: {
            product_id: uuid
        }
    })

    return res.json({
        status: 200,
        message: "Product fetched successfully",
        data: product
    })
}

export const updateProduct = async (req: any, res: any) => {
    const { uuid } = req.params
    const { name, price, description, image, quantity} = req.body

    const product = await prisma.product.findFirst({
        where: {
            product_id: uuid
        }
    })

    if (product === null) {
        return res.status(400).json({
            status: 400,
            message: "Product does not exist",
            data: null
        })
    } else {
        const updatedProduct = await prisma.product.update({
            where: {
                product_id: uuid
            },
            data: {
                name: name,
                price: price,
                quantity: quantity,
                desc: description,
                Media: image,
            }
        })

        return res.json({
            status: 200,
            message: "Product updated successfully",
            data: updatedProduct
        })
    }
}

export const deleteProduct = async (req: any, res: any) => {
    const { uuid } = req.params

    const product = await prisma.product.findFirst({
        where: {
            product_id: uuid
        }
    })

    if (product === null) {
        return res.status(400).json({
            status: 400,
            message: "Product does not exist",
            data: null
        })
    } else {
        const deletedProduct = await prisma.product.delete({
            where: {
                product_id: uuid
            }
        })

        return res.json({
            status: 200,
            message: "Product deleted successfully",
            data: deletedProduct
        })
    }
}



