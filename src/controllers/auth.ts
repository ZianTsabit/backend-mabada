import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

export const login = async (req: any, res: any) => {
    const { username, password } = req.body
    
    const user = await prisma.users.findFirst({
        where: {
            username: username
        }
    })

    if (user === null) {
        return res.status(404).json({
            status: 404,
            message: "User not found",
            data: null
        })
    } else {

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({
                status: 400,
                message: "Invalid password",
                data: null
            })
        }

        const token = jwt.sign({ uuid: user.uuid, role: user.role }, process.env.ACCESS_TOKEN_SECRET as string)
        
        return res.json({
            status: 200,
            message: "User logged in successfully",
            data: {
                access_token: token,
                role: user.role,
                uuid: user.uuid
            },
        })
    }
}

export const logout = (req: any, res: any) => {
    //token dihapus dari postman environment, atau bisa dihapus di local storage browser
    const token = req.headers.authorization?.split(" ")[1];
    if (token === "null") {
      // Token null, proses logout berhasil
      // Lakukan proses logout seperti yang diinginkan
      // ...
      return res.status(200).json({
        message: "Logout successful",
      });
    } else {
      // Token tidak null, proses logout gagal
      return res.status(400).json({
        message: "Logout failed",
        error: "User still has an active token",
      });
    }
}