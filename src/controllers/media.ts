import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

export const createMedia = async (req: any, res: any) => {
    const { name, product_id } = req.body
    const { url } = req.file.filename
    
    const media = await prisma.media.findFirst({
        where: {
            productId: product_id
        }
    })

    if (media !== null) {
        return res.status(400).json({
            status: 400,
            message: "Product has already Media",
            data: null
        })
    }

    const newMedia = await prisma.media.create({
        data: {
            name: name,
            productId: product_id,
            url: `fields/${url}`,
            
        }
    })

    return res.json({
        status: 200,
        message: "Media created successfully",
        data: newMedia
    })
}

export const getMedia = async (req: any, res: any) => {
    const { media_id } = req.params
    
    const media = await prisma.media.findFirst({
        where: {
            id: media_id
        }
    })

    return res.json({
        status: 200,
        message: "Media fetched successfully",
        data: media
    })
}

export const updateMedia = async (req: any, res: any) => {
    const { media_id } = req.params
    const { name, product_id } = req.body

    const media = await prisma.media.findFirst({
        where: {
            id: media_id
        }
    })

    if (media === null) {
        return res.status(400).json({
            status: 400,
            message: "Media not found",
            data: null
        })
    }

    const updatedMedia = await prisma.media.update({
        where: {
            id: media_id
        },
        data: {
            name: name,
            productId: product_id,
        }
    })

    return res.json({
        status: 200,
        message: "Media updated successfully",
        data: updatedMedia
    })
}

export const updateMediaFile = async (req: any, res: any) => {
    const { media_id } = req.params
    const { url } = req.file.filename

    const media = await prisma.media.findFirst({
        where: {
            id: media_id
        }
    })

    if (media === null) {
        return res.status(400).json({
            status: 400,
            message: "Media not found",
            data: null
        })
    } else {
        fs.unlink(`images/${media.url}`, (err) => {})

        const updatedMedia = await prisma.media.update({
            where: {
                id: media_id
            },
            data: {
                url: `images/${url}`
            }
        })
    
        return res.json({
            status: 200,
            message: "Media updated successfully",
            data: updatedMedia
        })
    }
}

export const deleteMedia = async (req: any, res: any) => {
    const { media_id } = req.params

    const media = await prisma.media.findFirst({
        where: {
            id: media_id
        }
    })

    if (media === null) {
        return res.status(400).json({
            status: 400,
            message: "Media not found",
            data: null
        })
    } else {
        fs.unlink(`images/${media.url}`, (err) => {})
    }

    const deletedMedia = await prisma.media.delete({
        where: {
            id: media_id
        }
    })

    return res.json({
        status: 200,
        message: "Media deleted successfully",
        data: deletedMedia
    })
}