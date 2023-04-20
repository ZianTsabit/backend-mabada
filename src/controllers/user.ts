import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

export const getUsers = async (req: any, res: any) => {
    const users = await prisma.users.findMany()

    return res.json({
        status: 200,
        message: "Users fetched successfully",
        data: users.map(user => {
            return {
                uuid: user.uuid,
                username: user.username,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        })
    })
}

export const addSeller = async (req: any, res: any) => {
    const { username, password, phone, address} = req.body

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