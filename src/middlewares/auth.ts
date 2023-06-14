import { PrismaClient, role } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface role_query {
    role: role;
}

export const auth = (admin: boolean = false, user: boolean = false) => {
    let roles: role_query[] = []
    if (admin) {
        roles.push({ role: role.admin })
    }

    if (user) {
        roles.push({ role: role.user })
    }    
    
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = ((req.headers['Authorization'] || req.headers['authorization']) as string)?.replace('Bearer ', '')
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as jwt.Secret, async function (err, decoded) {
                if (err == null && decoded != undefined) {
                    decoded = decoded as jwt.JwtPayload
                    const user = await prisma.users.findFirst({
                        where: {
                            uuid: decoded.uuid,
                            OR: roles
                        },
                    });
                    if (user) {
                        req.body.token = user;
                        next();
                    } else {
                        return res.status(403).json({
                            message: 'Unauthorized Access'
                        });
                    }
                    
                } else {
                    return res.status(403).json({ message: 'invalid token' });
                }
            });

        } else {
            return res.status(403).json({
                message: 'invalid_access'
            });
        }    
    }
}