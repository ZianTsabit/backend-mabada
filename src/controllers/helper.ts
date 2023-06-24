import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

/**
 * Parse the access token from the request headers.
 * @param req The Express request object.
 * @returns The UUID parsed from the access token, or null if the token is invalid or not present.
 */
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

/**
 * Get the user ID based on the UUID.
 * @param uuid The UUID of the user.
 * @returns The user ID if found, or null if the user is not found or an error occurs.
 */
export const getUserId = async (uuid: string): Promise<number | null> => {
  try {
    const user = await prisma.users.findUnique({
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

/**
 * Generate the media URL based on the request and media URL.
 * @param req The Express request object.
 * @param mediaUrl The media URL.
 * @returns The generated media URL.
 */
export function generateMediaUrl(req: Request, mediaUrl: string) {
  const encodedUrl = encodeURIComponent(mediaUrl);
  return `${req.protocol}://${req.get('host')}/media?media_url=${encodedUrl}`;
}

module.exports = { parseAccessToken, getUserId, generateMediaUrl };
