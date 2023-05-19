import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCategory = async (req: any, res: any) => {
    const { name } = req.body
    
    const category = await prisma.category.findFirst({
        where: {
            name: name
        }
    })

    if (category !== null) {
        return res.status(400).json({
            status: 400,
            message: "Category already exists",
            data: null
        })
    }
    
    const newCategory = await prisma.category.create({
        data: {
            name: name,
        }
    })

    return res.json({
        status: 200,
        message: "Category created successfully",
        data: newCategory
    })
}

export const getCategories = async (req: any, res: any) => {
    const categories = await prisma.category.findMany()

    return res.json({
        status: 200,
        message: "Categories fetched successfully",
        data: categories
    })
}

export const getCategory = async (req: any, res: any) => {
    const { uuid } = req.params
    
    const category = await prisma.category.findFirst({
        where: {
            category_id: uuid
        }
    })

    return res.json({
        status: 200,
        message: "Category fetched successfully",
        data: category
    })
}

export const updateCategory = async (req: any, res: any) => {
    const { uuid } = req.params
    const { newName } = req.body

    const category = await prisma.category.findFirst({
        where: {
            category_id: uuid
        }
    })

    if (category === null) {
        return res.status(400).json({
            status: 400,
            message: "Category not found",
            data: null
        })
    }

    const updatedCategory = await prisma.category.update({
        where: {
            category_id: uuid
        },
        data: {
            name: newName
        }
    })

    return res.json({
        status: 200,
        message: "Category updated successfully",
        data: updatedCategory
    })
}

export const deleteCategory = async (req: any, res: any) => {
    const { uuid } = req.params

    const category = await prisma.category.findFirst({
        where: {
            category_id: uuid
        }
    })

    if (category === null) {
        return res.status(400).json({
            status: 400,
            message: "Category not found",
            data: null
        })
    }

    const deletedCategory = await prisma.category.delete({
        where: {
            category_id: uuid
        }
    })

    return res.json({
        status: 200,
        message: "Category deleted successfully",
        data: deletedCategory
    })
}