import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const parseAccessToken = (req: Request): string | null => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as jwt.Secret) as jwt.JwtPayload;
      
      if (decoded && decoded.uuid) {
        return decoded.uuid;
      }
    }
  } catch (error) {
    console.error('Error parsing access token:', error);
  }
  
  return null;
};

export const getUserId = async (uuid: string): Promise<number | null> => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        uuid: uuid,
      },
      select: {
        user_id: true,
      },
    });

    if (user) {
      return user.user_id
    }
  } catch (error) {
    console.error('Error finding user ID:', error);
  }

  return null;
};

module.exports = { parseAccessToken,getUserId};
